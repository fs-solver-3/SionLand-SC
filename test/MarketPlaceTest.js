const {
    constants,
    expectEvent,
    expectRevert,
    time,
} = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = constants;
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

let sionLandInstance;
let sionLandContract;
let sionTokenInstance;
let sionTokenContract;
let marketPlaceInstance;
let marketPlaceContract;
let owner;
let account1;
let rateToLand = 100;
let tokenDecimals = 18;

const landLists1 = [
    "8c2836855a339fc"
];
const landLists3 = [
    "8c2836855a339fd",
    "8c2836855a339fe",
    "8c2836855a339ff"
];
const landLists4 = [
    "8c2836855a339fc",
    "8c2836855a339fd",
    "8c2836855a339fe",
    "8c2836855a339ff"
];
const landLists16 = [
    "8c2836855a339f0",
    "8c2836855a339f1",
    "8c2836855a339f2",
    "8c2836855a339f3",
    "8c2836855a339f4",
    "8c2836855a339f5",
    "8c2836855a339f6",
    "8c2836855a339f7",
    "8c2836855a339f8",
    "8c2836855a339f9",
    "8c2836855a339fa",
    "8c2836855a339fb",
    "8c2836855a339fc",
    "8c2836855a339fd",
    "8c2836855a339fe",
    "8c2836855a339ff"
];
describe("MarketPlace", function() {
    beforeEach(async function() {
        [owner, account1] = await ethers.getSigners();
        sionTokenInstance = await ethers.getContractFactory("SionToken");
        sionTokenContract = await sionTokenInstance.deploy();
        await sionTokenContract.deployed();
        sionLandInstance = await ethers.getContractFactory("SionLand");
        sionLandContract = await sionLandInstance.deploy();
        await sionLandContract.deployed();
        marketPlaceInstance = await ethers.getContractFactory("MarketPlace");
        marketPlaceContract = await marketPlaceInstance.deploy(sionTokenContract.address, sionLandContract.address);
        await marketPlaceContract.deployed();
        await sionTokenContract.mintSionTokens(
            account1.address,
            350
        );
    });
    describe("when buy lands", function() {
        it("revert when purchasing 11 or more lands", async function() {
            await expectRevert(
                marketPlaceContract.connect(account1)
                .buyLands(owner.address, rateToLand, landLists16),
                "revert when purchasing 11 or more lands at the same time."
            );
            expect(await sionLandContract.balanceOf(account1.address))
                .to.be.equal(0);
            expect(await sionLandContract.getLastTokenId(account1.address))
                .to.be.equal(0);
        });
        it("revert with insufficiant tokens", async function() {
            await expectRevert(
                marketPlaceContract.connect(account1)
                .buyLands(owner.address, rateToLand, landLists4),
                "ERC20: transfer amount exceeds balance"
            );
            expect(await sionLandContract.balanceOf(account1.address))
                .to.be.equal(0);
            expect(await sionLandContract.getLastTokenId(account1.address))
                .to.be.equal(0);
        });
        it("check all the balances on success with buyLands", async function() {
            await sionTokenContract.connect(account1)
                .approve(marketPlaceContract.address, rateToLand * landLists3.length);
            await marketPlaceContract.connect(account1)
                .buyLands(owner.address, rateToLand, landLists3);
            // await sionLandContract
            //     .landMintBatch(account1.address, landLists3);
            expect(await sionLandContract.getLandsBatch(account1.address))
                .to.be.eql(landLists3);
            expect(await sionLandContract.balanceOf(account1.address))
                .to.be.equal(3);
            expect(await sionLandContract.getLastTokenId(account1.address))
                .to.be.equal(3);
            expect(await sionTokenContract.balanceOf(owner.address))
                .to.be.equal(300);
            expect(await sionTokenContract.balanceOf(account1.address))
                .to.be.equal(50);
        });
    });
});