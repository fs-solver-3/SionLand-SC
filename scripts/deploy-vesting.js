const { ethers, upgrades } = require("hardhat");

async function main() {
    const sionVestingInstance = await ethers.getContractFactory("SionVesting");
    const sionVestingContract = await sionVestingInstance.deploy();
    console.log("SionVesting Contract is deployed to:", sionVestingContract.address);
}

main();