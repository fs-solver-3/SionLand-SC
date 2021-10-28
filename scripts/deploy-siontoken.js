const { ethers, upgrades } = require("hardhat");

async function main() {
    const sionTokenInstance = await ethers.getContractFactory("SionToken");
    const sionTokenContract = await sionTokenInstance.deploy();
    console.log("SionToken Contract is deployed to:", sionTokenContract.address);
}

main();