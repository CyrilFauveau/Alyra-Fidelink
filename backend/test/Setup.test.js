const { ethers } = require("hardhat");
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

async function setupFidelinkFixture() {
    const [owner, merchant1, merchant2, consumer] = await ethers.getSigners();
    const fidelink = await ethers.deployContract("Fidelink");
    const expirationDuration = 180 * 24 * 60 * 60; // 180 days

    return { owner, merchant1, merchant2, consumer, fidelink, expirationDuration };
}

module.exports = {
    PANIC_CODES,
    loadFixture,
    time,
    setupFidelinkFixture,
};