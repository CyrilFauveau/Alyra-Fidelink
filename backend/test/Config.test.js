const { expect } = require("chai");
const hre = require("hardhat");
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Config", function () {
    let owner, merchant1, merchant2, consumer;

    before(async function () {
        [owner, merchant1, merchant2, consumer] = await ethers.getSigners();
    });

    beforeEach(async function () {
        fidelink = await ethers.deployContract("Fidelink");
    });

    // -------------------- Add merchant -------------------- //
    describe("Expiration duration", function () {
        it("Should get expiration duration variable", async function () {
            const expirationDuration = await fidelink.getExpirationDuration();
            expect(expirationDuration).to.equal(15552000);
        });
        
        it("Should fail editing without being the owner", async function () {
            await expect(fidelink.connect(merchant1).setExpirationDuration(10)).to.be.revertedWithCustomError(fidelink, "OwnableUnauthorizedAccount");
        });

        it("Should fail editing with value 0", async function () {
            await expect(fidelink.connect(owner).setExpirationDuration(0)).to.be.revertedWith("Expiration duration must be greater than zero");
        });

        it("Should edit expiration duration value", async function () {
            await fidelink.connect(owner).setExpirationDuration(3600);
            const newExpirationDuration = await fidelink.getExpirationDuration();
            expect(newExpirationDuration).to.equal(3600);
        });
    });

    describe("Expiration owner percentage", function () {
        it("Should get expiration owner percentage variable", async function () {
            const expirationOwnerPercentage = await fidelink.getExpirationOwnerPercentage();
            expect(expirationOwnerPercentage).to.equal(30);
        });
        
        it("Should fail editing without being the owner", async function () {
            await expect(fidelink.connect(merchant1).setExpirationOwnerPercentage(10)).to.be.revertedWithCustomError(fidelink, "OwnableUnauthorizedAccount");
        });

        it("Should edit expiration owner percentage", async function () {
            await fidelink.connect(owner).setExpirationOwnerPercentage(10);
            const newExpirationOwnerPercentage = await fidelink.getExpirationOwnerPercentage();
            expect(newExpirationOwnerPercentage).to.equal(10);
        });
    });

    describe("Expiration merchant percentage", function () {
        it("Should get expiration merchant percentage variable", async function () {
            const expirationMerchantPercentage = await fidelink.getExpirationMerchantPercentage();
            expect(expirationMerchantPercentage).to.equal(20);
        });

        it("Should fail editing without being the owner", async function () {
            await expect(fidelink.connect(merchant1).setExpirationMerchantPercentage(10)).to.be.revertedWithCustomError(fidelink, "OwnableUnauthorizedAccount");
        });

        it("Should edit expiration merchant percentage", async function () {
            await fidelink.connect(owner).setExpirationMerchantPercentage(10);
            const newExpirationMerchantPercentage = await fidelink.getExpirationMerchantPercentage();
            expect(newExpirationMerchantPercentage).to.equal(10);
        });
    });

    describe("Redistribution owner percentage", function () {
        it("Should get redistribution owner percentage variable", async function () {
            const redistributionOwnerPercentage = await fidelink.getRedistributionOwnerPercentage();
            expect(redistributionOwnerPercentage).to.equal(18);
        });

        it("Should fail editing without being the owner", async function () {
            await expect(fidelink.connect(merchant1).setRedistributionOwnerPercentage(10)).to.be.revertedWithCustomError(fidelink, "OwnableUnauthorizedAccount");
        });

        it("Should edit redistribution owner percentage", async function () {
            await fidelink.connect(owner).setRedistributionOwnerPercentage(10);
            const newRedistributionOwnerPercentage = await fidelink.getRedistributionOwnerPercentage();
            expect(newRedistributionOwnerPercentage).to.equal(10);
        });
    });

    describe("Redistribution merchant percentage", function () {
        it("Should get redistribution merchant percentage variable", async function () {
            const redistributionMerchantPercentage = await fidelink.getRedistributionMerchantPercentage();
            expect(redistributionMerchantPercentage).to.equal(12);
        });

        it("Should fail editing without being the owner", async function () {
            await expect(fidelink.connect(merchant1).setRedistributionMerchantPercentage(10)).to.be.revertedWithCustomError(fidelink, "OwnableUnauthorizedAccount");
        });

        it("Should edit redistribution owner percentage", async function () {
            await fidelink.connect(owner).setRedistributionMerchantPercentage(10);
            const newRedistributionMerchantPercentage = await fidelink.getRedistributionMerchantPercentage();
            expect(newRedistributionMerchantPercentage).to.equal(10);
        });
    });
});