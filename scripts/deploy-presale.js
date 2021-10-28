const { ethers, upgrades } = require("hardhat");

async function main() {
    const presaleInstance = await ethers.getContractFactory("Presale");
    const presaleContract = await presaleInstance.deploy();
    console.log("Presale Contract is deployed to:", presaleContract.address);
}

main();