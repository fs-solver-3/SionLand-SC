const { ethers, upgrades } = require("hardhat");

async function main() {
    const marketPlaceInstance = await ethers.getContractFactory("MarketPlace");
    const marketPlaceContract = await marketPlaceInstance.deploy("0x364Dd53daC7f3F9dAC00C0609311Ca8c1B2258e5", "0x683D872e44A31f3d25082222D43e8213A2602613");
    console.log("MarketPlace Contract is deployed to:", marketPlaceContract.address);
}

main();