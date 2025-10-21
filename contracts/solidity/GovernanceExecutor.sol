// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title GovernanceExecutor
 * @notice Executes approved governance proposals with escrow functionality
 * @dev Handles proposal registration, fund locking, and execution
 */
contract GovernanceExecutor {
    enum ProposalType { MAINTENANCE, RENOVATION, EMERGENCY, OTHER }
    enum ProposalStatus { REGISTERED, FUNDS_LOCKED, EXECUTED, CANCELLED }

    struct Proposal {
        bytes32 proposalId;
        address propertyTreasury;
        uint256 budget;
        ProposalType proposalType;
        uint256 votingEndTime;
        ProposalStatus status;
        uint256 lockedAmount;
        address recipient;
        uint256 executedAt;
    }

    mapping(bytes32 => Proposal) public proposals;
    mapping(address => bool) public authorizedCallers;
    address public owner;

    event ProposalRegistered(
        bytes32 indexed proposalId,
        address propertyTreasury,
        uint256 budget,
        ProposalType proposalType
    );
    event FundsLocked(bytes32 indexed proposalId, uint256 amount);
    event FundsReleased(bytes32 indexed proposalId, address recipient, uint256 amount);
    event ProposalExecuted(bytes32 indexed proposalId, uint256 amountReleased);
    event ProposalCancelled(bytes32 indexed proposalId, uint256 amountRefunded);

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
     * @notice Register a proposal on-chain after off-chain creation
     * @param proposalId Unique identifier for the proposal
     * @param propertyTreasury Address of the property's treasury
     * @param budget Amount of funds required
     * @param proposalType Type of proposal
     * @param votingEndTime Timestamp when voting ends
     */
    function registerProposal(
        bytes32 proposalId,
        address propertyTreasury,
        uint256 budget,
        ProposalType proposalType,
        uint256 votingEndTime
    ) external onlyAuthorized {
        require(proposals[proposalId].proposalId == bytes32(0), "Proposal already exists");
        require(votingEndTime > block.timestamp, "Invalid voting end time");

        proposals[proposalId] = Proposal({
            proposalId: proposalId,
            propertyTreasury: propertyTreasury,
            budget: budget,
            proposalType: proposalType,
            votingEndTime: votingEndTime,
            status: ProposalStatus.REGISTERED,
            lockedAmount: 0,
            recipient: address(0),
            executedAt: 0
        });

        emit ProposalRegistered(proposalId, propertyTreasury, budget, proposalType);
    }

    /**
     * @notice Lock funds in escrow when proposal passes
     * @param proposalId The proposal to lock funds for
     */
    function lockFundsForProposal(bytes32 proposalId) external payable onlyAuthorized {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposalId != bytes32(0), "Proposal not found");
        require(proposal.status == ProposalStatus.REGISTERED, "Invalid status");
        require(block.timestamp >= proposal.votingEndTime, "Voting not ended");
        require(msg.value >= proposal.budget, "Insufficient funds");

        proposal.lockedAmount = msg.value;
        proposal.status = ProposalStatus.FUNDS_LOCKED;

        emit FundsLocked(proposalId, msg.value);
    }

    /**
     * @notice Release funds to contractor/recipient after work completion
     * @param proposalId The proposal to release funds for
     * @param recipient Address to receive the funds
     */
    function releaseFunds(bytes32 proposalId, address payable recipient) external onlyAuthorized {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.FUNDS_LOCKED, "Funds not locked");
        require(proposal.lockedAmount > 0, "No funds to release");

        uint256 amount = proposal.lockedAmount;
        proposal.lockedAmount = 0;
        proposal.recipient = recipient;
        proposal.status = ProposalStatus.EXECUTED;
        proposal.executedAt = block.timestamp;

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(proposalId, recipient, amount);
        emit ProposalExecuted(proposalId, amount);
    }

    /**
     * @notice Cancel proposal and return funds to treasury
     * @param proposalId The proposal to cancel
     */
    function cancelProposal(bytes32 proposalId) external onlyAuthorized {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status != ProposalStatus.EXECUTED, "Already executed");

        uint256 refundAmount = proposal.lockedAmount;
        proposal.lockedAmount = 0;
        proposal.status = ProposalStatus.CANCELLED;

        if (refundAmount > 0) {
            (bool success, ) = proposal.propertyTreasury.call{value: refundAmount}("");
            require(success, "Refund failed");
        }

        emit ProposalCancelled(proposalId, refundAmount);
    }

    /**
     * @notice Execute proposal (combined lock and release)
     * @param proposalId The proposal to execute
     */
    function executeProposal(bytes32 proposalId) external payable onlyAuthorized {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposalId != bytes32(0), "Proposal not found");
        require(proposal.status == ProposalStatus.REGISTERED, "Invalid status");
        require(block.timestamp >= proposal.votingEndTime, "Voting not ended");

        proposal.lockedAmount = msg.value;
        proposal.status = ProposalStatus.FUNDS_LOCKED;

        emit FundsLocked(proposalId, msg.value);
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
     * @notice Get proposal details
     * @param proposalId The proposal to query
     */
    function getProposal(bytes32 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    receive() external payable {}
}
