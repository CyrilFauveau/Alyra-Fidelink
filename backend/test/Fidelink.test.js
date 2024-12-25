const { expect } = require("chai");
const hre = require("hardhat");
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Fidelink contract", function () {
    let owner, merchant1, merchant2, consumer;
    let defaultMerchantName = "Merchant name";

    before(async function () {
        [owner, merchant1, merchant2, consumer] = await ethers.getSigners();
    });

    beforeEach(async function () {
        // Reset fidelink instance before each test
        fidelink = await ethers.deployContract("Fidelink");
    });


    // -------------------- Add merchant -------------------- //
    describe("addMerchant(address merchantAddress)", function () {
        it("Should add a merchant", async function () {
            await fidelink.addMerchant(merchant1, defaultMerchantName);
        });

        it("Should fail adding a merchant without being the owner", async function () {
            await expect(fidelink.connect(consumer).addMerchant(merchant1, defaultMerchantName)).to.be.revertedWithCustomError(fidelink, "OwnableUnauthorizedAccount");
        });
    });

    // -------------------- Add consumer -------------------- //
    describe("addMerchant(address merchantAddress)", function () {
        it("Should add a consumer", async function () {

        });

        it("Should fail adding a consumer without being a merchant", async function () {
            await expect(fidelink.addConsumer(consumer)).to.be.revertedWith("Only active merchants can call this function");
        });
    });

});