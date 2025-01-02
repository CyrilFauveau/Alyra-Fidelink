// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Fidelink - A web3 loyalty card system
/// @author Cyril Fauveau
/// @notice This is a basic version of a loyalty card system
/// @custom:experimental This is a proof of concept
contract Fidelink is ERC20, Ownable {

    uint256 private EXPIRATION_DURATION = 180 days;
    uint256 private EXPIRATION_OWNER_PERCENTAGE = 30;
    uint256 private EXPIRATION_MERCHANT_PERCENTAGE = 20;
    uint256 private REDISTRIBUTION_OWNER_PERCENTAGE = 18;
    uint256 private REDISTRIBUTION_MERCHANT_PERCENTAGE = 12;

    struct Merchant {
        string name;
        bool isActive;
        bool hasBeenRegistered;
    }

    struct Consumer {
        bool isActive;
        bool hasBeenRegistered;
    }
    
    struct TokenBatch {
        address merchant;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Merchant) public merchants;
    mapping(address => Consumer) public consumers;
    /// @notice Mapping to help access token informations (merchant and mint time)
    mapping(address => TokenBatch[]) private tokenBatches;

    // -------------------- EVENTS -------------------- //

    /// @notice Events about merchants
    event MerchantAdded(address indexed merchantAddress, string name, address indexed owner);
    event MerchantDisabled(address indexed merchantAddress, address indexed owner);
    event MerchantEnabled(address indexed merchantAddress, address indexed owner);

    /// @notice Events about consumers
    event ConsumerAdded(address indexed consumerAddress, address indexed merchantAddress);
    event ConsumerDisabled(address indexed consumerAddress, address indexed merchantAddress);
    event ConsumerEnabled(address indexed consumerAddress, address indexed merchantAddress);

    /// @notice Events about token operations
    event TokenMinted(address indexed merchant, address indexed consumer, uint256 amount);
    event TokenSpent(address indexed consumer, address indexed merchant, uint256 amount);


    // -------------------- CONSTRUCTOR -------------------- //

    constructor() ERC20("Fidelink", "FDL") Ownable(msg.sender) {}


    // -------------------- MODIFIERS -------------------- //

    modifier onlyOwnerOrMerchant() {
        require(msg.sender == owner() || merchants[msg.sender].isActive, "Only owner or active merchants can call this function");
        _;
    }

    modifier onlyMerchant() {
        require(merchants[msg.sender].isActive, "Only active merchants can call this function");
        _;
    }

    modifier onlyConsumer() {
        require(consumers[msg.sender].isActive, "Only active consumers can call this function");
        _;
    }


    // -------------------- DEFAULT FUNCTIONS -------------------- //

    /// @notice Override and disable default function
    function transfer(address, uint256) public pure override returns (bool) {
        revert("Transfer is disabled");
    }

    /// @notice Override and disable default function
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("Transfer is disabled");
    }

    /// @notice Override and disable default function
    function approve(address, uint256) public pure override returns (bool) {
        revert("Approve is disabled");
    }


    // -------------------- CONFIGURATION FUNCTIONS -------------------- //

    /// @notice Expiration Duration
    function getExpirationDuration() external view returns (uint256) {
        return EXPIRATION_DURATION;
    }

    function setExpirationDuration(uint256 newExpirationDuration) external onlyOwner {
        require(newExpirationDuration > 0, "Expiration duration must be greater than zero");
        EXPIRATION_DURATION = newExpirationDuration;
    }

    /// @notice Expiration owner percentage
    function getExpirationOwnerPercentage() external view returns (uint256) {
        return EXPIRATION_OWNER_PERCENTAGE;
    }

    function setExpirationOwnerPercentage(uint256 newExpirationDuration) external onlyOwner {
        EXPIRATION_OWNER_PERCENTAGE = newExpirationDuration;
    }

    /// @notice Expiration merchant percentage
    function getExpirationMerchantPercentage() external view returns (uint256) {
        return EXPIRATION_MERCHANT_PERCENTAGE;
    }

    function setExpirationMerchantPercentage(uint256 newExpirationDuration) external onlyOwner {
        EXPIRATION_MERCHANT_PERCENTAGE = newExpirationDuration;
    }

    /// @notice Redistribution owner percentage
    function getRedistributionOwnerPercentage() external view returns (uint256) {
        return REDISTRIBUTION_OWNER_PERCENTAGE;
    }

    function setRedistributionOwnerPercentage(uint256 newExpirationDuration) external onlyOwner {
        REDISTRIBUTION_OWNER_PERCENTAGE = newExpirationDuration;
    }

    /// @notice Redistribution merchant percentage
    function getRedistributionMerchantPercentage() external view returns (uint256) {
        return REDISTRIBUTION_MERCHANT_PERCENTAGE;
    }

    function setRedistributionMerchantPercentage(uint256 newExpirationDuration) external onlyOwner {
        REDISTRIBUTION_MERCHANT_PERCENTAGE = newExpirationDuration;
    }


    // -------------------- GETTERS -------------------- //
    function getBalance() external view returns (uint256 balance) {
        return balanceOf(msg.sender);
    }

    function getBalanceByMerchant() external view onlyConsumer returns (address[] memory merchantsArray, uint256[] memory balancesArray) {
        TokenBatch[] storage batches = tokenBatches[msg.sender];
        address[] memory tempMerchants = new address[](batches.length);
        uint256[] memory tempBalances = new uint256[](batches.length);

        uint256 uniqueCount = 0;

        for (uint256 i = 0; i < batches.length; i++) {
            address merchant = batches[i].merchant;
            uint256 amount = batches[i].amount;

            // Check if merchant has already been added
            bool isNewMerchant = true;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (tempMerchants[j] == merchant) {
                    tempBalances[j] += amount;
                    isNewMerchant = false;
                    break;
                }
            }

            // Add if new merchant
            if (isNewMerchant) {
                tempMerchants[uniqueCount] = merchant;
                tempBalances[uniqueCount] = amount;
                uniqueCount++;
            }
        }

        // Create final arrays with unique merchants
        merchantsArray = new address[](uniqueCount);
        balancesArray = new uint256[](uniqueCount);

        for (uint256 i = 0; i < uniqueCount; i++) {
            merchantsArray[i] = tempMerchants[i];
            balancesArray[i] = tempBalances[i];
        }

        return (merchantsArray, balancesArray);
    }

    function getMerchant(address _merchant) external view onlyOwner returns (Merchant memory) {
        require(merchants[_merchant].hasBeenRegistered, "Merchant does not exist");
        return merchants[_merchant];
    }

    function getConsumer(address _consumer) external view onlyOwnerOrMerchant returns (Consumer memory) {
        require(consumers[_consumer].hasBeenRegistered, "Consumer does not exist");
        return consumers[_consumer];
    }


    // -------------------- MERCHANT FUNCTIONS -------------------- //

    function addMerchant(address _merchant, string calldata _name) external onlyOwner {
        require(!merchants[_merchant].hasBeenRegistered, "Merchant already exists");

        merchants[_merchant] = Merchant({
            name: _name,
            isActive: true,
            hasBeenRegistered: true
        });

        emit MerchantAdded(_merchant, _name, msg.sender);
    }

    function disableMerchant(address _merchant) external onlyOwner {
        require(merchants[_merchant].hasBeenRegistered, "Merchant does not exist");
        require(merchants[_merchant].isActive, "Merchant already disabled");

        merchants[_merchant].isActive = false;

        emit MerchantDisabled(_merchant, msg.sender);
    }

    function enableMerchant(address _merchant) external onlyOwner {
        require(merchants[_merchant].hasBeenRegistered, "Merchant does not exist");
        require(!merchants[_merchant].isActive, "Merchant already active");

        merchants[_merchant].isActive = true;

        emit MerchantEnabled(_merchant, msg.sender);
    }


    // -------------------- CONSUMER FUNCTIONS -------------------- //

    function addConsumer(address _consumer) external onlyMerchant {
        require(!consumers[_consumer].hasBeenRegistered, "Consumer already exists");

        consumers[_consumer] = Consumer({
            isActive: true,
            hasBeenRegistered: true
        });

        emit ConsumerAdded(_consumer, msg.sender);
    }

    function disableConsumer(address _consumer) external onlyMerchant {
        require(consumers[_consumer].hasBeenRegistered, "Consumer does not exist");
        require(consumers[_consumer].isActive, "Consumer already disabled");

        consumers[_consumer].isActive = false;

        emit ConsumerDisabled(_consumer, msg.sender);
    }

    function enableConsumer(address _consumer) external onlyMerchant {
        require(consumers[_consumer].hasBeenRegistered, "Consumer does not exist");
        require(!consumers[_consumer].isActive, "Consumer already active");

        consumers[_consumer].isActive = true;

        emit ConsumerEnabled(_consumer, msg.sender);
    }


    // -------------------- TOKEN FUNCTIONS -------------------- //

    /// @notice This function allows only merchants to mint tokens for consumers
    function mintTokens(address _to, uint256 _amount) external onlyMerchant {
        require(consumers[_to].isActive, "Consumer does not exist or is disabled");
        require(_amount > 0, "Amount must be greater than 0");

        _mint(_to, _amount);

        tokenBatches[_to].push(TokenBatch({
            merchant: msg.sender,
            amount: _amount,
            timestamp: block.timestamp
        }));

        emit TokenMinted(msg.sender, _to, _amount);
    }

    /// @notice This function allows only consumers to spend tokens to merchants
    /// @dev updateTokenBatches is called before spending tokens
    function spendTokens(address _to, uint256 _amount) external onlyConsumer {
        require(merchants[_to].isActive, "Merchant does not exist or is disabled");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= balanceOf(msg.sender), "You don't have enough tokens");

        updateTokenBatches(msg.sender);

        uint256 remainingAmount = _amount;
        uint256 transferAmount = 0;
        uint256 ownerRedistribute = 0;
        uint256 merchantRedistribute = 0;
        TokenBatch[] storage batches = tokenBatches[msg.sender];

        for (uint256 i = 0; i < batches.length && remainingAmount > 0; i++) {
            TokenBatch storage batch = batches[i];

            uint256 amountToProcess = (batch.amount >= remainingAmount) ? remainingAmount : batch.amount;

            if (batch.merchant == _to) {
                // All tokens from the merchant target go to the merchant
                transferAmount += amountToProcess;
            } else {
                // Redistribute tokens: 30% to owner, 20% to merchant who minted them
                uint256 ownerShare = (amountToProcess * REDISTRIBUTION_OWNER_PERCENTAGE) / 100;
                uint256 merchantShare = (amountToProcess * REDISTRIBUTION_MERCHANT_PERCENTAGE) / 100;

                ownerRedistribute += ownerShare;
                merchantRedistribute += merchantShare;

                // Redistribute tokens
                if (ownerRedistribute > 0) {
                    _transfer(msg.sender, owner(), ownerRedistribute);
                }
                if (merchantRedistribute > 0) {
                    _transfer(msg.sender, batch.merchant, merchantRedistribute);
                }

                transferAmount += amountToProcess - ownerShare - merchantShare;
            }

            batch.amount -= amountToProcess;
            remainingAmount -= amountToProcess;
        }

        require(remainingAmount == 0, "Not enough valid tokens");

        // Transfer remaining tokens to the target merchant
        if (transferAmount > 0) {
            _transfer(msg.sender, _to, transferAmount);
        }

        emit TokenSpent(msg.sender, _to, _amount);
    }

    /// @notice This function updates customer token batches if expired
    /// @dev Currently dividing by 2 the number of token when expired
    function updateTokenBatches(address _consumer) internal {
        require(consumers[_consumer].hasBeenRegistered, "Consumer does not exist");

        TokenBatch[] storage batches = tokenBatches[_consumer];
        uint256 currentTime = block.timestamp;

        for (uint256 i = 0; i < batches.length; i++) {
            TokenBatch storage batch = batches[i];
            uint256 elapsed = currentTime - batch.timestamp;

            if (elapsed > EXPIRATION_DURATION) {
                uint256 periodsElapsed = elapsed / EXPIRATION_DURATION;
                uint256 tokensToRedistribute = batch.amount - (batch.amount / (2 ** periodsElapsed));
                batch.amount = batch.amount / (2 ** periodsElapsed);

                if (tokensToRedistribute > 0) {
                    uint256 ownerShare = (tokensToRedistribute * EXPIRATION_OWNER_PERCENTAGE * 2) / 100;
                    uint256 merchantShare = (tokensToRedistribute * EXPIRATION_MERCHANT_PERCENTAGE * 2) / 100;

                    _transfer(_consumer, owner(), ownerShare);
                    _transfer(_consumer, batch.merchant, merchantShare);
                }

                batch.timestamp += periodsElapsed * EXPIRATION_DURATION;
            }
        }
    }

    /// @notice Update consumer tokens if they have expired
    function updateConsumerTokens(address _consumer) external onlyOwner {
        updateTokenBatches(_consumer);
    }
}