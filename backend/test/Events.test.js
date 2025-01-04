const { expect } = require("chai");
const { setupFidelinkFixture, loadFixture } = require("./Setup.test");

describe("Fidelink contract", function () {
    let owner, merchant1, consumer, fidelink;

    beforeEach(async function () {
        ({ owner, merchant1, consumer, fidelink } = await loadFixture(setupFidelinkFixture));
    });

    describe("Merchant events", function () {
        it("Should emit MerchantAdded event", async function () {
            await expect(fidelink.connect(owner).addMerchant(merchant1, "Merchant 1")).to.emit(fidelink, "MerchantAdded").withArgs(merchant1, "Merchant 1", owner);
        });

        it("Should emit MerchantDisabled event", async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
            await expect(fidelink.connect(owner).disableMerchant(merchant1)).to.emit(fidelink, "MerchantDisabled").withArgs(merchant1, owner);
        });

        it("Should emit MerchantEnabled event", async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
            await fidelink.connect(owner).disableMerchant(merchant1);
            await expect(fidelink.connect(owner).enableMerchant(merchant1)).to.emit(fidelink, "MerchantEnabled").withArgs(merchant1, owner);
        });
    });

    describe("Consumer events", function () {
        beforeEach(async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
        });

        it("Should emit ConsumerAdded event", async function () {
            await expect(fidelink.connect(merchant1).addConsumer(consumer)).to.emit(fidelink, "ConsumerAdded").withArgs(consumer, merchant1);
        });

        it("Should emit ConsumerDisabled event", async function () {
            await fidelink.connect(merchant1).addConsumer(consumer);
            await expect(fidelink.connect(merchant1).disableConsumer(consumer)).to.emit(fidelink, "ConsumerDisabled").withArgs(consumer, merchant1);
        });
        
        it("Should emit ConsumerEnabled event", async function () {
            await fidelink.connect(merchant1).addConsumer(consumer);
            await fidelink.connect(merchant1).disableConsumer(consumer);
            await expect(fidelink.connect(merchant1).enableConsumer(consumer)).to.emit(fidelink, "ConsumerEnabled").withArgs(consumer, merchant1);
        });
    });

    describe("Transfer events", function () {
        beforeEach(async function () {
            await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
            await fidelink.connect(merchant1).addConsumer(consumer);
        });
        
        it("Should emit TokenMinted event", async function () {
            await expect(fidelink.connect(merchant1).mintTokens(consumer, 100)).to.emit(fidelink, "TokenMinted").withArgs(merchant1, consumer, 100);
        });
        
        it("Should emit TokenSpent event", async function () {
            await fidelink.connect(merchant1).mintTokens(consumer, 100);
            await expect(fidelink.connect(consumer).spendTokens(merchant1, 100)).to.emit(fidelink, "TokenSpent").withArgs(consumer, merchant1, 100);
        });
    });
});