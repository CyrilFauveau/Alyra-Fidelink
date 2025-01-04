const { expect } = require("chai");
const { setupFidelinkFixture, loadFixture } = require("./Setup.test");

describe("Users management", function () {
    let owner, merchant1, merchant2, consumer, fidelink;

    beforeEach(async function () {
        ({ owner, merchant1, merchant2, consumer, fidelink } = await loadFixture(setupFidelinkFixture));
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

        it("Should fail adding a merchant if merchant already exists", async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
            await expect(fidelink.connect(owner).addMerchant(merchant1, "Merchant 1")).to.be.revertedWith("Merchant already exists");
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

        it("Should fail disabling a merchant if merchant does not exist", async function () {
            await expect(fidelink.connect(owner).disableMerchant(merchant2)).to.be.revertedWith("Merchant does not exist");
        });

        it("Should fail disabling a merchant if merchant is already disabled", async function () {
            await fidelink.connect(owner).disableMerchant(merchant1);
            await expect(fidelink.connect(owner).disableMerchant(merchant1)).to.be.revertedWith("Merchant already disabled");
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

        it("Should fail enabling a merchant if merchant does not exist", async function () {
            await expect(fidelink.connect(owner).enableMerchant(merchant2)).to.be.revertedWith("Merchant does not exist");
        });

        it("Should fail enabling a merchant if merchant is already enabled", async function () {
            await fidelink.connect(owner).enableMerchant(merchant1);
            await expect(fidelink.connect(owner).enableMerchant(merchant1)).to.be.revertedWith("Merchant already active");
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

        it("Should fail adding a consumer if consumer already exists", async function () {
            await fidelink.connect(merchant1).addConsumer(consumer);
            await expect(fidelink.connect(merchant1).addConsumer(consumer)).to.be.revertedWith("Consumer already exists");
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

        it("Should fail disabling a consumer if consumer does not exist", async function () {
            await expect(fidelink.connect(merchant1).disableConsumer(merchant2)).to.be.revertedWith("Consumer does not exist");
        });

        it("Should fail disabling a consumer if consumer is already disabled", async function () {
            await fidelink.connect(merchant1).disableConsumer(consumer);
            await expect(fidelink.connect(merchant1).disableConsumer(consumer)).to.be.revertedWith("Consumer already disabled");
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

        it("Should fail enabling a consumer if consumer does not exist", async function () {
            await expect(fidelink.connect(merchant1).enableConsumer(merchant2)).to.be.revertedWith("Consumer does not exist");
        });

        it("Should fail enabling a consumer if consumer is already enabled", async function () {
            await fidelink.connect(merchant1).enableConsumer(consumer);
            await expect(fidelink.connect(merchant1).enableConsumer(consumer)).to.be.revertedWith("Consumer already active");
        });
    });
});