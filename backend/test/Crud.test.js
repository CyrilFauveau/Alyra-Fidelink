const { expect } = require("chai");
const hre = require("hardhat");
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CRUD", function () {
    let owner, merchant1, merchant2, consumer;

    before(async function () {
        [owner, merchant1, merchant2, consumer] = await ethers.getSigners();
    });

    beforeEach(async function () {
        fidelink = await ethers.deployContract("Fidelink");
    });

    // -------------------- Add merchant -------------------- //
    describe("addMerchant(address merchantAddress, string merchantName)", function () {
        it("Should fail adding a merchant without being the owner", async function () {
            await expect(fidelink.connect(consumer).addMerchant(merchant1, "Merchant 1")).to.be.revertedWithCustomError(fidelink, "OwnableUnauthorizedAccount");
        });
        
        it("Should add a merchant", async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");

            const merchantData = await fidelink.connect(owner).getMerchant(merchant1);

            expect(merchantData.name).to.equal("Merchant 1");
            expect(merchantData.isActive).to.equal(true);
            expect(merchantData.hasBeenRegistered).to.equal(true);
        });
    });

    // -------------------- Disable merchant -------------------- //
    describe("disableMerchant(address merchantAddress)", function () {
        beforeEach(async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
        });

        it("Should fail disabling a merchant without being the owner", async function () {
            await expect(fidelink.connect(consumer).disableMerchant(merchant1)).to.be.revertedWithCustomError(fidelink, "OwnableUnauthorizedAccount");
        });

        it("Should disable a merchant", async function () {
            await fidelink.connect(owner).disableMerchant(merchant1);

            const merchantData = await fidelink.connect(owner).getMerchant(merchant1);

            expect(merchantData.name).to.equal("Merchant 1");
            expect(merchantData.isActive).to.equal(false);
            expect(merchantData.hasBeenRegistered).to.equal(true);
        });
    });

    // -------------------- Enable merchant -------------------- //
    describe("enableMerchant(address merchantAddress)", function () {
        beforeEach(async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
            await fidelink.connect(owner).disableMerchant(merchant1);
        });

        it("Should fail enabling a merchant without being the owner", async function () {
            await expect(fidelink.connect(consumer).enableMerchant(merchant1)).to.be.revertedWithCustomError(fidelink, "OwnableUnauthorizedAccount");
        });

        it("Should enable a merchant", async function () {
            await fidelink.connect(owner).enableMerchant(merchant1);

            const merchantData = await fidelink.connect(owner).getMerchant(merchant1);

            expect(merchantData.name).to.equal("Merchant 1");
            expect(merchantData.isActive).to.equal(true);
            expect(merchantData.hasBeenRegistered).to.equal(true);
        });
    });

    // -------------------- Add consumer -------------------- //
    describe("addMerchant(address consumerAddress)", function () {
        beforeEach(async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
        });
        
        it("Should fail adding a consumer without being a merchant", async function () {
            await expect(fidelink.connect(owner).addConsumer(consumer)).to.be.revertedWith("Only active merchants can call this function");
        });

        it("Should add a consumer", async function () {
            await fidelink.connect(merchant1).addConsumer(consumer);

            const consumerData = await fidelink.connect(merchant1).getConsumer(consumer);
    
            expect(consumerData.isActive).to.equal(true);
            expect(consumerData.hasBeenRegistered).to.equal(true);
        });
    });

    // -------------------- Disable consumer -------------------- //
    describe("disableConsumer(address consumerAddress)", function () {
        beforeEach(async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
            await fidelink.connect(owner).connect(merchant1).addConsumer(consumer);
        });

        it("Should fail disabling a consumer without being a merchant", async function () {
            await expect(fidelink.connect(consumer).disableConsumer(consumer)).to.be.revertedWith("Only active merchants can call this function");
        });

        it("Should disable a consumer", async function () {
            await fidelink.connect(merchant1).disableConsumer(consumer);

            const consumerData = await fidelink.connect(merchant1).getConsumer(consumer);
    
            expect(consumerData.isActive).to.equal(false);
            expect(consumerData.hasBeenRegistered).to.equal(true);
        });
    });

    // -------------------- Enable merchant -------------------- //
    describe("enableConsumer(address consumerAddress)", function () {
        beforeEach(async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
            await fidelink.connect(merchant1).addConsumer(consumer);
            await fidelink.connect(merchant1).disableConsumer(consumer);
        });

        it("Should fail enabling a consumer without being a merchant", async function () {
            await expect(fidelink.connect(consumer).enableConsumer(consumer)).to.be.revertedWith("Only active merchants can call this function");
        });

        it("Should enable a consumer", async function () {
            await fidelink.connect(merchant1).enableConsumer(consumer);

            const consumerData = await fidelink.connect(merchant1).getConsumer(consumer);
    
            expect(consumerData.isActive).to.equal(true);
            expect(consumerData.hasBeenRegistered).to.equal(true);
        });
    });
});