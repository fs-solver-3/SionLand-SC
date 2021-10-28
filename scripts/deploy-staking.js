const { ethers, upgrades } = require("hardhat");

async function main() {
    const stakingRewardsInstance = await ethers.getContractFactory("StakingRewards");
    const stakingRewardsContract = await stakingRewardsInstance.deploy();
    console.log("StakingRewards Contract is deployed to:", stakingRewardsContract.address);
}

main();