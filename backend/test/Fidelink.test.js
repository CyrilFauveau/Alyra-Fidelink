const { expect } = require("chai");
const hre = require("hardhat");
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Fidelink contract", function () {
    let owner, merchant1, merchant2, consumer;
    let expirationDuration = 180 * 24 * 60 * 60; // 180 days

    before(async function () {
        [owner, merchant1, merchant2, consumer] = await ethers.getSigners();
    });

    beforeEach(async function () {
        fidelink = await ethers.deployContract("Fidelink");
    });


    // -------------------- Default functions -------------------- //
    describe("transfer(address, uint256)", function () {
        it("Should not be allowed", async function () {
            await expect(fidelink.transfer(owner, 1)).to.be.revertedWith("Transfer is disabled");
        });
    });

    describe("transferFrom(address, address, uint256)", function () {
        it("Should not be allowed", async function () {
            await expect(fidelink.transferFrom(owner, merchant1, 1)).to.be.revertedWith("Transfer is disabled");
        });
    });

    describe("approve(address, uint256)", function () {
        it("Should not be allowed", async function () {
            await expect(fidelink.approve(owner, 1)).to.be.revertedWith("Approve is disabled");
        });
    });


    // -------------------- Token functions -------------------- //
    describe("mintTokens(address consumerAddress, uint256 amount)", function () {
        beforeEach(async function () {
            await fidelink.addMerchant(merchant1, "Merchant 1");
            await fidelink.connect(merchant1).addConsumer(consumer);
        });

        it("Should fail minting tokens without being a merchant", async function () {
            await expect(fidelink.connect(consumer).mintTokens(consumer, 100)).to.be.revertedWith("Only active merchants can call this function");
        });

        it("Should fail minting tokens if consumer does not exists", async function () {
            await expect(fidelink.connect(merchant1).mintTokens(merchant2, 100)).to.be.revertedWith("Consumer does not exist or is disabled");
        });

        it("Should fail minting tokens if amount is not greater than 0", async function () {
            await expect(fidelink.connect(merchant1).mintTokens(consumer, 0)).to.be.revertedWith("Amount must be greater than 0");
        });

        it("Should mint 100 tokens to consumer", async function () {
            await fidelink.connect(merchant1).mintTokens(consumer, 100);

            const balance = await fidelink.connect(consumer).getBalance();
            expect(balance).to.equal(100);
        });
    });

    describe("spendTokens(address merchantAddress, uint256 amount)", function () {
        beforeEach(async function () {
            await fidelink.addMerchant(merchant1, "Merchant 1");
            await fidelink.connect(merchant1).addConsumer(consumer);
            await fidelink.connect(merchant1).mintTokens(consumer, 100);
        });

        it("Should fail spending tokens without being a consumer", async function () {
            await expect(fidelink.connect(merchant2).spendTokens(merchant1, 100)).to.be.revertedWith("Only active consumers can call this function");
        });

        it("Should fail spending tokens if merchant does not exist", async function () {
            await expect(fidelink.connect(consumer).spendTokens(merchant2, 100)).to.be.revertedWith("Merchant does not exist or is disabled");
        });

        it("Should fail spending tokens if amount is not greater than 0", async function () {
            await expect(fidelink.connect(consumer).spendTokens(merchant1, 0)).to.be.revertedWith("Amount must be greater than 0");
        });

        it("Should fail spending tokens if amount is greater than consumer balance", async function () {
            await expect(fidelink.connect(consumer).spendTokens(merchant1, 200)).to.be.revertedWith("You don't have enough tokens");
        });

        it("Should spend 10 tokens to merchant 1", async function () {
            await fidelink.connect(consumer).spendTokens(merchant1, 100);

            const balanceMerchant = await fidelink.connect(merchant1).getBalance();
            const balanceConsumer = await fidelink.connect(consumer).getBalance();

            expect(balanceMerchant).to.equal(100);
            expect(balanceConsumer).to.equal(0);
        });
    });

    describe("updateConsumerTokens(address consumerAddress)", function () {
        beforeEach(async function () {
            await fidelink.addMerchant(merchant1, "Merchant 1");
            await fidelink.connect(merchant1).addConsumer(consumer);
            await fidelink.connect(merchant1).mintTokens(consumer, 100);
        });

        it("Should fail updating tokens without being the owner", async function () {
            await expect(fidelink.connect(merchant1).updateConsumerTokens(consumer)).to.be.revertedWithCustomError(fidelink, "OwnableUnauthorizedAccount");
        });

        it("Should divide consumer's tokens", async function () {
            await time.increase(expirationDuration);
            await fidelink.connect(owner).updateConsumerTokens(consumer);

            const balanceConsumer = await fidelink.connect(consumer).getBalance();
            expect(balanceConsumer).to.equal(50);
        });

        it("Should divide 2 times consumer's tokens", async function () {
            await time.increase(expirationDuration * 2);
            await fidelink.connect(owner).updateConsumerTokens(consumer);

            const balanceConsumer = await fidelink.connect(consumer).getBalance();
            expect(balanceConsumer).to.equal(25);
        });
    });


    // -------------------- Scenarios -------------------- //
    describe("Spend tokens to another merchant", function () {
        beforeEach(async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
            await fidelink.connect(owner).addMerchant(merchant2, "Merchant 2");
            await fidelink.connect(merchant1).addConsumer(consumer);
            await fidelink.connect(merchant1).mintTokens(consumer, 100);
        });

        it("Should redistribute tokens when spent", async function () {
            await fidelink.connect(consumer).spendTokens(merchant2, 100);

            const balanceOwner = await fidelink.connect(owner).getBalance();
            const balanceMerchant1 = await fidelink.connect(merchant1).getBalance();
            const balanceMerchant2 = await fidelink.connect(merchant2).getBalance();
            const balanceConsumer = await fidelink.connect(consumer).getBalance();

            expect(balanceOwner).to.equal(18);
            expect(balanceMerchant1).to.equal(12);
            expect(balanceMerchant2).to.equal(70);
            expect(balanceConsumer).to.equal(0);
        });

        it("Should expire tokens then redistribute when spent", async function () {
            await time.increase(expirationDuration);
            await fidelink.connect(consumer).spendTokens(merchant2, 50);

            const balanceOwner = await fidelink.connect(owner).getBalance();
            const balanceMerchant1 = await fidelink.connect(merchant1).getBalance();
            const balanceMerchant2 = await fidelink.connect(merchant2).getBalance();
            const balanceConsumer = await fidelink.connect(consumer).getBalance();

            expect(balanceOwner).to.equal(39);
            expect(balanceMerchant1).to.equal(26);
            expect(balanceMerchant2).to.equal(35);
            expect(balanceConsumer).to.equal(0);
        });
    });
});