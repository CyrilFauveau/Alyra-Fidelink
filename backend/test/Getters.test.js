const { expect } = require("chai");
const { setupFidelinkFixture, loadFixture } = require("./Setup.test");

describe("Getters", function () {
    let owner, merchant1, merchant2, consumer, fidelink;

    beforeEach(async function () {
        ({ owner, merchant1, merchant2, consumer, fidelink } = await loadFixture(setupFidelinkFixture));
        
        await fidelink.connect(owner).addMerchant(merchant1, "Merchant 1");
        await fidelink.connect(merchant1).addConsumer(consumer);
    });

    // -------------------- Getters -------------------- //
    describe("getBalance()", function () {
        it("Should return 0 for a new consumer", async function () {
            const balance = await fidelink.connect(consumer).getBalance();
            expect(balance).to.equal(0);
        });
    });

    describe("getBalanceByMerchant()", function () {
        it("Should only allow consumers to call getBalanceByMerchant", async function () {
            await expect(fidelink.connect(merchant1).getBalanceByMerchant()).to.be.revertedWith("Only active consumers can call this function");
        });
        
        it("Should return 2 empty arrays for a new consumer with no tokens from merchants", async function () {
            const [merchants, balances] = await fidelink.connect(consumer).getBalanceByMerchant();
        
            expect(merchants).to.be.an("array").that.is.empty;
            expect(balances).to.be.an("array").that.is.empty;
        });
    });

    describe("getMerchant(address merchantAddress)", function () {
        it("Should fail getting merchant without being the owner", async function () {
            await expect(fidelink.connect(merchant1).getMerchant(merchant1)).to.be.revertedWithCustomError(fidelink, "OwnableUnauthorizedAccount");
        });
        
        it("Should fail if merchant does not exist", async function () {
            await expect(fidelink.connect(owner).getMerchant(merchant2)).to.be.revertedWith("Merchant does not exist");
        });

        it("Should return merchant", async function () {
            const merchantData = await fidelink.connect(owner).getMerchant(merchant1);

            expect(merchantData).to.be.an("array");
            expect(merchantData.name).to.equal("Merchant 1");
            expect(merchantData.isActive).to.equal(true);
            expect(merchantData.hasBeenRegistered).to.equal(true);
        });
    });

    describe("getConsumer(address consumerAddress)", function () {
        it("Should fail getting consumer without being the owner or a merchant", async function () {
            await expect(fidelink.connect(consumer).getConsumer(consumer)).to.be.revertedWith("Only owner or active merchants can call this function");
        });

        it("Should fail if consumer does not exist", async function () {
            await expect(fidelink.connect(merchant1).getConsumer(merchant1)).to.be.revertedWith("Consumer does not exist");
        });

        it("Should return consumer", async function () {
            const consumerData = await fidelink.connect(merchant1).getConsumer(consumer);

            expect(consumerData).to.be.an("array");
            expect(consumerData.isActive).to.equal(true);
            expect(consumerData.hasBeenRegistered).to.equal(true);
        });
    });
});