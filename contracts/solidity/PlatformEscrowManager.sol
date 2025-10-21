// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PlatformEscrowManager
 * @notice Manages investment escrow for tokenizations
 * @dev Holds funds until target is met or refunds if failed
 */
contract PlatformEscrowManager {
    enum EscrowStatus { ACTIVE, FINALIZED, REFUNDED, CANCELLED }

    struct Escrow {
        bytes32 tokenizationId;
        uint256 targetRaise;
        uint256 minimumRaise;
        uint256 currentRaise;
        uint256 deadline;
        EscrowStatus status;
        uint256 investorCount;
        address propertyOwner;
    }

    struct Investment {
        bytes32 investmentId;
        bytes32 tokenizationId;
        address investor;
        uint256 amount;
        bool refunded;
        uint256 timestamp;
    }

    mapping(bytes32 => Escrow) public escrows;
    mapping(bytes32 => Investment) public investments;
    mapping(bytes32 => bytes32[]) public escrowInvestments;
    mapping(address => bool) public authorizedCallers;
    address public owner;

    event EscrowCreated(
        bytes32 indexed tokenizationId,
        uint256 targetRaise,
        uint256 minimumRaise,
        uint256 deadline
    );
    event InvestmentDeposited(
        bytes32 indexed investmentId,
        bytes32 indexed tokenizationId,
        address indexed investor,
        uint256 amount
    );
    event EscrowFinalized(bytes32 indexed tokenizationId, uint256 totalRaised);
    event RefundIssued(
        bytes32 indexed investmentId,
        address indexed investor,
        uint256 amount
    );
    event EscrowCancelled(bytes32 indexed tokenizationId);

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
     * @notice Create escrow for tokenization
     * @param tokenizationId Unique identifier for tokenization
     * @param targetRaise Target fundraising amount
     * @param minimumRaise Minimum amount to close
     * @param deadline Timestamp when fundraising ends
     * @param propertyOwner Address of property owner
     */
    function createEscrow(
        bytes32 tokenizationId,
        uint256 targetRaise,
        uint256 minimumRaise,
        uint256 deadline,
        address propertyOwner
    ) external onlyAuthorized {
        require(escrows[tokenizationId].tokenizationId == bytes32(0), "Escrow exists");
        require(targetRaise >= minimumRaise, "Invalid raise amounts");
        require(deadline > block.timestamp, "Invalid deadline");

        escrows[tokenizationId] = Escrow({
            tokenizationId: tokenizationId,
            targetRaise: targetRaise,
            minimumRaise: minimumRaise,
            currentRaise: 0,
            deadline: deadline,
            status: EscrowStatus.ACTIVE,
            investorCount: 0,
            propertyOwner: propertyOwner
        });

        emit EscrowCreated(tokenizationId, targetRaise, minimumRaise, deadline);
    }

    /**
     * @notice Deposit investment into escrow
     * @param tokenizationId The tokenization to invest in
     * @param investmentId Unique investment identifier
     * @param investor Address of the investor
     */
    function depositInvestment(
        bytes32 tokenizationId,
        bytes32 investmentId,
        address investor
    ) external payable onlyAuthorized {
        Escrow storage escrow = escrows[tokenizationId];
        require(escrow.status == EscrowStatus.ACTIVE, "Escrow not active");
        require(block.timestamp < escrow.deadline, "Deadline passed");
        require(investments[investmentId].investmentId == bytes32(0), "Investment exists");
        require(msg.value > 0, "No value sent");

        investments[investmentId] = Investment({
            investmentId: investmentId,
            tokenizationId: tokenizationId,
            investor: investor,
            amount: msg.value,
            refunded: false,
            timestamp: block.timestamp
        });

        escrow.currentRaise += msg.value;
        escrow.investorCount++;
        escrowInvestments[tokenizationId].push(investmentId);

        emit InvestmentDeposited(investmentId, tokenizationId, investor, msg.value);
    }

    /**
     * @notice Finalize escrow when target is met
     * @param tokenizationId The escrow to finalize
     */
    function finalizeEscrow(bytes32 tokenizationId) external onlyAuthorized {
        Escrow storage escrow = escrows[tokenizationId];
        require(escrow.status == EscrowStatus.ACTIVE, "Escrow not active");
        require(
            escrow.currentRaise >= escrow.minimumRaise || block.timestamp >= escrow.deadline,
            "Cannot finalize yet"
        );

        if (escrow.currentRaise >= escrow.minimumRaise) {
            escrow.status = EscrowStatus.FINALIZED;

            // Transfer funds to property owner
            (bool success, ) = escrow.propertyOwner.call{value: escrow.currentRaise}("");
            require(success, "Transfer failed");

            emit EscrowFinalized(tokenizationId, escrow.currentRaise);
        } else {
            // Minimum not met, trigger refunds
            _refundAllInvestors(tokenizationId);
        }
    }

    /**
     * @notice Refund all investors if raise failed
     * @param tokenizationId The escrow to refund
     */
    function refundInvestors(bytes32 tokenizationId) external onlyAuthorized {
        Escrow storage escrow = escrows[tokenizationId];
        require(escrow.status == EscrowStatus.ACTIVE, "Escrow not active");
        require(
            block.timestamp >= escrow.deadline && escrow.currentRaise < escrow.minimumRaise,
            "Cannot refund yet"
        );

        _refundAllInvestors(tokenizationId);
    }

    /**
     * @notice Internal refund function
     * @param tokenizationId The escrow to refund
     */
    function _refundAllInvestors(bytes32 tokenizationId) internal {
        Escrow storage escrow = escrows[tokenizationId];
        escrow.status = EscrowStatus.REFUNDED;

        bytes32[] memory investmentIds = escrowInvestments[tokenizationId];

        for (uint256 i = 0; i < investmentIds.length; i++) {
            Investment storage investment = investments[investmentIds[i]];
            if (!investment.refunded) {
                investment.refunded = true;

                (bool success, ) = investment.investor.call{value: investment.amount}("");
                require(success, "Refund failed");

                emit RefundIssued(investment.investmentId, investment.investor, investment.amount);
            }
        }
    }

    /**
     * @notice Individual investor claims refund
     * @param investmentId The investment to refund
     */
    function claimRefund(bytes32 investmentId) external {
        Investment storage investment = investments[investmentId];
        require(investment.investmentId != bytes32(0), "Investment not found");
        require(investment.investor == msg.sender, "Not your investment");
        require(!investment.refunded, "Already refunded");

        Escrow storage escrow = escrows[investment.tokenizationId];
        require(
            escrow.status == EscrowStatus.REFUNDED ||
            (block.timestamp >= escrow.deadline && escrow.currentRaise < escrow.minimumRaise),
            "Not eligible for refund"
        );

        investment.refunded = true;

        (bool success, ) = investment.investor.call{value: investment.amount}("");
        require(success, "Refund failed");

        emit RefundIssued(investmentId, investment.investor, investment.amount);
    }

    /**
     * @notice Cancel escrow and refund all
     * @param tokenizationId The escrow to cancel
     */
    function cancelEscrow(bytes32 tokenizationId) external onlyAuthorized {
        Escrow storage escrow = escrows[tokenizationId];
        require(escrow.status == EscrowStatus.ACTIVE, "Escrow not active");

        escrow.status = EscrowStatus.CANCELLED;
        _refundAllInvestors(tokenizationId);

        emit EscrowCancelled(tokenizationId);
    }

    /**
     * @notice Get escrow details
     * @param tokenizationId The escrow to query
     */
    function getEscrow(bytes32 tokenizationId) external view returns (Escrow memory) {
        return escrows[tokenizationId];
    }

    /**
     * @notice Get investment details
     * @param investmentId The investment to query
     */
    function getInvestment(bytes32 investmentId) external view returns (Investment memory) {
        return investments[investmentId];
    }

    /**
     * @notice Check if investment can be refunded
     * @param investmentId The investment to check
     */
    function canClaimRefund(bytes32 investmentId) external view returns (bool) {
        Investment storage investment = investments[investmentId];
        if (investment.refunded) return false;

        Escrow storage escrow = escrows[investment.tokenizationId];
        return escrow.status == EscrowStatus.REFUNDED ||
               (block.timestamp >= escrow.deadline && escrow.currentRaise < escrow.minimumRaise);
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

    receive() external payable {}
}
