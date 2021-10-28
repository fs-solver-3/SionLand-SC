const { ethers, upgrades } = require("hardhat");

async function main() {
    const sionLandInstance = await ethers.getContractFactory("SionLand");
    const sionLandContract = await sionLandInstance.deploy();
    console.log("SionLand Contract is deployed to:", sionLandContract.address);
}

main();