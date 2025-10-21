// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DividendDistributor
 * @notice Manages dividend distribution to token holders
 * @dev Supports both claim-based and batch distribution
 */
contract DividendDistributor {
    struct Distribution {
        bytes32 distributionId;
        address tokenContract;
        uint256 totalAmount;
        uint256 perTokenAmount;
        uint256 snapshotBlock;
        uint256 totalClaimed;
        uint256 expiryDate;
        bool active;
    }

    mapping(bytes32 => Distribution) public distributions;
    mapping(bytes32 => mapping(address => bool)) public hasClaimed;
    mapping(bytes32 => mapping(address => uint256)) public claimableAmounts;
    
    mapping(address => bool) public authorizedCallers;
    address public owner;

    event DistributionCreated(
        bytes32 indexed distributionId,
        uint256 totalAmount,
        uint256 perTokenAmount,
        uint256 snapshotBlock
    );
    event DividendClaimed(
        bytes32 indexed distributionId,
        address indexed recipient,
        uint256 amount
    );
    event BatchDistributed(
        bytes32 indexed distributionId,
        uint256 recipientCount,
        uint256 totalAmount
    );
    event DistributionExpired(bytes32 indexed distributionId, uint256 unclaimedAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedCallers[msg.sender] = true;
    }

    /**
     * @notice Create a new dividend distribution
     * @param distributionId Unique identifier for the distribution
     * @param tokenContract Address of the token contract
     * @param totalAmount Total amount to distribute
     * @param perTokenAmount Amount per token
     * @param snapshotBlock Block number for token holder snapshot
     * @param expiryDays Days until unclaimed dividends expire
     */
    function createDistribution(
        bytes32 distributionId,
        address tokenContract,
        uint256 totalAmount,
        uint256 perTokenAmount,
        uint256 snapshotBlock,
        uint256 expiryDays
    ) external payable onlyAuthorized {
        require(distributions[distributionId].distributionId == bytes32(0), "Distribution exists");
        require(msg.value >= totalAmount, "Insufficient funds");
        require(snapshotBlock <= block.number, "Invalid snapshot block");

        uint256 expiryDate = block.timestamp + (expiryDays * 1 days);

        distributions[distributionId] = Distribution({
            distributionId: distributionId,
            tokenContract: tokenContract,
            totalAmount: totalAmount,
            perTokenAmount: perTokenAmount,
            snapshotBlock: snapshotBlock,
            totalClaimed: 0,
            expiryDate: expiryDate,
            active: true
        });

        emit DistributionCreated(distributionId, totalAmount, perTokenAmount, snapshotBlock);
    }

    /**
     * @notice Set claimable amount for a holder (called by backend after snapshot)
     * @param distributionId The distribution ID
     * @param holder Address of the token holder
     * @param amount Amount they can claim
     */
    function setClaimableAmount(
        bytes32 distributionId,
        address holder,
        uint256 amount
    ) external onlyAuthorized {
        Distribution storage dist = distributions[distributionId];
        require(dist.active, "Distribution not active");
        require(!hasClaimed[distributionId][holder], "Already claimed");
        
        claimableAmounts[distributionId][holder] = amount;
    }

    /**
     * @notice Batch set claimable amounts
     * @param distributionId The distribution ID
     * @param holders Array of token holder addresses
     * @param amounts Array of claimable amounts
     */
    function batchSetClaimableAmounts(
        bytes32 distributionId,
        address[] calldata holders,
        uint256[] calldata amounts
    ) external onlyAuthorized {
        require(holders.length == amounts.length, "Length mismatch");
        Distribution storage dist = distributions[distributionId];
        require(dist.active, "Distribution not active");

        for (uint256 i = 0; i < holders.length; i++) {
            if (!hasClaimed[distributionId][holders[i]]) {
                claimableAmounts[distributionId][holders[i]] = amounts[i];
            }
        }
    }

    /**
     * @notice Token holders claim their dividends
     * @param distributionId The distribution to claim from
     */
    function claimDividend(bytes32 distributionId) external {
        Distribution storage dist = distributions[distributionId];
        require(dist.active, "Distribution not active");
        require(block.timestamp < dist.expiryDate, "Distribution expired");
        require(!hasClaimed[distributionId][msg.sender], "Already claimed");

        uint256 amount = claimableAmounts[distributionId][msg.sender];
        require(amount > 0, "No claimable amount");

        hasClaimed[distributionId][msg.sender] = true;
        dist.totalClaimed += amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit DividendClaimed(distributionId, msg.sender, amount);
    }

    /**
     * @notice Batch distribute dividends (platform pays gas)
     * @param distributionId The distribution ID
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to distribute
     */
    function batchDistribute(
        bytes32 distributionId,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyAuthorized {
        require(recipients.length == amounts.length, "Length mismatch");
        Distribution storage dist = distributions[distributionId];
        require(dist.active, "Distribution not active");

        uint256 totalDistributed = 0;

        for (uint256 i = 0; i < recipients.length; i++) {
            if (!hasClaimed[distributionId][recipients[i]]) {
                hasClaimed[distributionId][recipients[i]] = true;
                dist.totalClaimed += amounts[i];
                totalDistributed += amounts[i];

                (bool success, ) = recipients[i].call{value: amounts[i]}("");
                require(success, "Transfer failed");

                emit DividendClaimed(distributionId, recipients[i], amounts[i]);
            }
        }

        emit BatchDistributed(distributionId, recipients.length, totalDistributed);
    }

    /**
     * @notice Get claimable amount for a holder
     * @param distributionId The distribution ID
     * @param holder Address of the token holder
     */
    function getClaimableAmount(
        bytes32 distributionId,
        address holder
    ) external view returns (uint256) {
        if (hasClaimed[distributionId][holder]) {
            return 0;
        }
        return claimableAmounts[distributionId][holder];
    }

    /**
     * @notice Check if holder has claimed
     * @param distributionId The distribution ID
     * @param holder Address of the token holder
     */
    function hasClaimedDividend(
        bytes32 distributionId,
        address holder
    ) external view returns (bool) {
        return hasClaimed[distributionId][holder];
    }

    /**
     * @notice Withdraw unclaimed funds after expiry
     * @param distributionId The distribution ID
     */
    function withdrawUnclaimed(bytes32 distributionId) external onlyAuthorized {
        Distribution storage dist = distributions[distributionId];
        require(dist.active, "Distribution not active");
        require(block.timestamp >= dist.expiryDate, "Not expired yet");

        uint256 unclaimedAmount = dist.totalAmount - dist.totalClaimed;
        dist.active = false;

        if (unclaimedAmount > 0) {
            (bool success, ) = owner.call{value: unclaimedAmount}("");
            require(success, "Transfer failed");
        }

        emit DistributionExpired(distributionId, unclaimedAmount);
    }

    /**
     * @notice Add authorized caller
     * @param caller Address to authorize
     */
    function addAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = true;
    }

    /**
     * @notice Remove authorized caller
     * @param caller Address to remove
     */
    function removeAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = false;
    }

    /**
     * @notice Get distribution details
     * @param distributionId The distribution to query
     */
    function getDistribution(bytes32 distributionId) external view returns (Distribution memory) {
        return distributions[distributionId];
    }

    receive() external payable {}
}
