// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MultiSigTreasury
 * @notice Multi-signature treasury for property fund management
 * @dev Requires multiple approvals for withdrawals
 */
contract MultiSigTreasury {
    struct WithdrawalRequest {
        uint256 requestId;
        uint256 amount;
        address payable recipient;
        string reason;
        address requester;
        uint256 approvalCount;
        uint256 createdAt;
        bool executed;
        bool cancelled;
        mapping(address => bool) approvals;
    }

    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    mapping(address => bool) public signers;
    address[] public signerList;
    
    uint256 public requiredApprovals;
    uint256 public nextRequestId;
    address public propertyOwner;

    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    event WithdrawalSubmitted(
        uint256 indexed requestId,
        address indexed recipient,
        uint256 amount,
        string reason
    );
    event WithdrawalApproved(uint256 indexed requestId, address indexed approver);
    event WithdrawalExecuted(uint256 indexed requestId, uint256 amount);
    event WithdrawalCancelled(uint256 indexed requestId);
    event FundsDeposited(address indexed sender, uint256 amount);
    event ThresholdUpdated(uint256 newThreshold);

    modifier onlySigner() {
        require(signers[msg.sender], "Not a signer");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == propertyOwner, "Not owner");
        _;
    }

    constructor(address[] memory _signers, uint256 _requiredApprovals, address _propertyOwner) {
        require(_signers.length >= _requiredApprovals, "Invalid threshold");
        require(_requiredApprovals > 0, "Threshold must be > 0");

        propertyOwner = _propertyOwner;
        requiredApprovals = _requiredApprovals;

        for (uint256 i = 0; i < _signers.length; i++) {
            address signer = _signers[i];
            require(signer != address(0), "Invalid signer");
            require(!signers[signer], "Duplicate signer");

            signers[signer] = true;
            signerList.push(signer);
            emit SignerAdded(signer);
        }

        nextRequestId = 1;
    }

    /**
     * @notice Submit a withdrawal request
     * @param amount Amount to withdraw
     * @param recipient Address to receive funds
     * @param reason Reason for withdrawal
     */
    function submitWithdrawal(
        uint256 amount,
        address payable recipient,
        string memory reason
    ) external onlySigner returns (uint256 requestId) {
        require(amount > 0, "Amount must be > 0");
        require(recipient != address(0), "Invalid recipient");
        require(address(this).balance >= amount, "Insufficient balance");

        requestId = nextRequestId++;
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        
        request.requestId = requestId;
        request.amount = amount;
        request.recipient = recipient;
        request.reason = reason;
        request.requester = msg.sender;
        request.approvalCount = 0;
        request.createdAt = block.timestamp;
        request.executed = false;
        request.cancelled = false;

        emit WithdrawalSubmitted(requestId, recipient, amount, reason);

        return requestId;
    }

    /**
     * @notice Approve a withdrawal request
     * @param requestId The request to approve
     */
    function approveWithdrawal(uint256 requestId) external onlySigner {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.requestId != 0, "Request not found");
        require(!request.executed, "Already executed");
        require(!request.cancelled, "Request cancelled");
        require(!request.approvals[msg.sender], "Already approved");

        request.approvals[msg.sender] = true;
        request.approvalCount++;

        emit WithdrawalApproved(requestId, msg.sender);

        // Auto-execute if threshold met
        if (request.approvalCount >= requiredApprovals) {
            _executeWithdrawal(requestId);
        }
    }

    /**
     * @notice Execute an approved withdrawal
     * @param requestId The request to execute
     */
    function executeWithdrawal(uint256 requestId) external onlySigner {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.approvalCount >= requiredApprovals, "Insufficient approvals");
        _executeWithdrawal(requestId);
    }

    /**
     * @notice Internal execution function
     * @param requestId The request to execute
     */
    function _executeWithdrawal(uint256 requestId) internal {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(!request.executed, "Already executed");
        require(!request.cancelled, "Request cancelled");
        require(address(this).balance >= request.amount, "Insufficient balance");

        request.executed = true;

        (bool success, ) = request.recipient.call{value: request.amount}("");
        require(success, "Transfer failed");

        emit WithdrawalExecuted(requestId, request.amount);
    }

    /**
     * @notice Cancel a withdrawal request
     * @param requestId The request to cancel
     */
    function cancelWithdrawal(uint256 requestId) external onlySigner {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.requestId != 0, "Request not found");
        require(!request.executed, "Already executed");
        require(!request.cancelled, "Already cancelled");
        require(
            msg.sender == request.requester || msg.sender == propertyOwner,
            "Not authorized"
        );

        request.cancelled = true;
        emit WithdrawalCancelled(requestId);
    }

    /**
     * @notice Add a new signer
     * @param signer Address to add
     */
    function addSigner(address signer) external onlyOwner {
        require(signer != address(0), "Invalid signer");
        require(!signers[signer], "Already a signer");

        signers[signer] = true;
        signerList.push(signer);
        emit SignerAdded(signer);
    }

    /**
     * @notice Remove a signer
     * @param signer Address to remove
     */
    function removeSigner(address signer) external onlyOwner {
        require(signers[signer], "Not a signer");
        require(signerList.length > requiredApprovals, "Cannot remove, would break threshold");

        signers[signer] = false;
        
        // Remove from array
        for (uint256 i = 0; i < signerList.length; i++) {
            if (signerList[i] == signer) {
                signerList[i] = signerList[signerList.length - 1];
                signerList.pop();
                break;
            }
        }

        emit SignerRemoved(signer);
    }

    /**
     * @notice Update approval threshold
     * @param newThreshold New required approval count
     */
    function updateThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Threshold must be > 0");
        require(newThreshold <= signerList.length, "Threshold > signer count");
        
        requiredApprovals = newThreshold;
        emit ThresholdUpdated(newThreshold);
    }

    /**
     * @notice Check if address has approved request
     * @param requestId The request ID
     * @param signer Address to check
     */
    function hasApproved(uint256 requestId, address signer) external view returns (bool) {
        return withdrawalRequests[requestId].approvals[signer];
    }

    /**
     * @notice Get current treasury balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get list of all signers
     */
    function getSigners() external view returns (address[] memory) {
        return signerList;
    }

    /**
     * @notice Get withdrawal request details
     * @param requestId The request to query
     */
    function getWithdrawalRequest(uint256 requestId) external view returns (
        uint256 amount,
        address recipient,
        string memory reason,
        address requester,
        uint256 approvalCount,
        uint256 createdAt,
        bool executed,
        bool cancelled
    ) {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        return (
            request.amount,
            request.recipient,
            request.reason,
            request.requester,
            request.approvalCount,
            request.createdAt,
            request.executed,
            request.cancelled
        );
    }

    /**
     * @notice Deposit funds to treasury
     */
    function deposit() external payable {
        require(msg.value > 0, "No value sent");
        emit FundsDeposited(msg.sender, msg.value);
    }

    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}
