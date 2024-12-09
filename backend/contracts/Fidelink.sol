// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Fidelink - A web3 loyalty card system
/// @author Cyril Fauveau
/// @notice This is a basic version of a loyalty card system
/// @custom:experimental This is a proof of concept
contract Fidelink is ERC20, Ownable {

    uint256 private constant EXPIRATION_DURATION = 180 days;

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

    // ---------- Events ---------- //
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
    event TokenTransferred(address indexed from, address indexed to, uint256 amount);


    // ---------- CONSTRUCTOR ---------- //
    constructor() ERC20("Fidelink", "FDL") Ownable(msg.sender) {}


    // ---------- MODIFIERS ---------- //
    modifier onlyMerchant() {
        require(merchants[msg.sender].isActive, "Only active merchants can call this function");
        _;
    }

    modifier onlyConsumer() {
        require(consumers[msg.sender].isActive, "Only active consumers can call this function");
        _;
    }

    /// @notice Override and disable default function
    function transfer(address, uint256) public pure override returns (bool) {
        revert("Direct transfers are disabled");
    }

    /// @notice Override and disable default function
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("Direct transfers are disabled");
    }


    // ---------- MERCHANT FUNCTIONS ---------- //
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


    // ---------- CONSUMER FUNCTIONS ---------- //
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


    // ---------- TOKEN FUNCTIONS ---------- //
    /// @notice This function allow only merchants to mint tokens for consumers
    function mint(address _to, uint256 _amount) external onlyMerchant {
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

    /// @notice This function allows only consumers to spend tokens only to merchants
    /// @dev updateTokenBatches is called before spending tokens
    function spendTokens(address _to, uint256 _amount) external onlyConsumer {
        require(merchants[_to].isActive, "Merchant does not exist or is disabled");
        require(_amount > 0, "Amount must be greater than 0");

        updateTokenBatches(msg.sender);

        uint256 remainingAmount = _amount;
        TokenBatch[] storage batches = tokenBatches[msg.sender];

        for (uint256 i = 0; i < batches.length && remainingAmount > 0; i++) {
            TokenBatch storage batch = batches[i];

            if (batch.merchant == _to && batch.amount > 0) {
                uint256 amountToSpend = (batch.amount >= remainingAmount) ? remainingAmount : batch.amount;
                batch.amount -= amountToSpend;
                remainingAmount -= amountToSpend;
            }

            if (batch.amount == 0) {
                batches[i] = batches[batches.length - 1];
                batches.pop();
                i--;
            }
        }

        require(remainingAmount == 0, "Not enough valid tokens from this merchant");

        _transfer(msg.sender, _to, _amount);

        emit TokenTransferred(msg.sender, _to, _amount);
    }

    /// @notice This function updates customer token batches if expired
    /// @dev Currently dividing by 2 the number of token when expired
    function updateTokenBatches(address _consumer) internal {
        TokenBatch[] storage batches = tokenBatches[_consumer];
        uint256 currentTime = block.timestamp;

        for (uint256 i = 0; i < batches.length; i++) {
            TokenBatch storage batch = batches[i];
            uint256 elapsed = currentTime - batch.timestamp;

            if (elapsed > EXPIRATION_DURATION) {
                uint256 periodsElapsed = elapsed / EXPIRATION_DURATION;
                batch.amount = batch.amount / (2 ** periodsElapsed);
                batch.timestamp += periodsElapsed * EXPIRATION_DURATION;

                if (batch.amount == 0) {
                    batches[i] = batches[batches.length - 1];
                    batches.pop();
                    i--;
                }
            }
        }
    }

    /// @notice Update consumer tokens if they have expired
    function updateConsumerTokens(address _consumer) external onlyOwner {
        updateTokenBatches(_consumer);
    }
}