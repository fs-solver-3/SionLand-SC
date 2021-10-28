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
let owner;
let account1;
let rate = 2;
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

describe("SionLand", function() {
    beforeEach(async function() {
        [owner, account1, account2, account3] = await ethers.getSigners();

        sionLandInstance = await ethers.getContractFactory("SionLand");
        sionLandContract = await sionLandInstance.deploy();
        await sionLandContract.deployed();
    });
    describe("when buy lands", function() {
        it("check the initial owned land", async function() {
            expect(await sionLandContract.balanceOf(account1.address))
                .to.be.equal(0);
            // await expectRevert(
            //     sionLandContract.getLandsBatch(account1.address),
            //     "no land owned"
            // );
            expect(await sionLandContract.getLastTokenId(account1.address))
                .to.be.equal(0);
        });
        it("when buy only one land", async function() {
            await sionLandContract.landMintBatch(account1.address, landLists1);
            expect(await sionLandContract.getLandsBatch(account1.address))
                .to.be.eql(landLists1);
            expect(await sionLandContract.getLand(account1.address, 1))
                .to.be.equal("8c2836855a339fc");
            expect(await sionLandContract.balanceOf(account1.address))
                .to.be.equal(1);
            expect(await sionLandContract.getLastTokenId(account1.address))
                .to.be.equal(1);
        });
        it("when buy over one lands", async function() {
            await sionLandContract.landMintBatch(account1.address, landLists3);
            expect(await sionLandContract.getLandsBatch(account1.address))
                .to.be.eql(landLists3);
            expect(await sionLandContract.getLand(account1.address, 1))
                .to.be.equal("8c2836855a339fd");
            expect(await sionLandContract.balanceOf(account1.address))
                .to.be.equal(3);
            expect(await sionLandContract.getLastTokenId(account1.address))
                .to.be.equal(3);
        });
        it("when multi buy over one lands", async function() {
            await sionLandContract.landMintBatch(account1.address, landLists1);
            expect(await sionLandContract.getLandsBatch(account1.address))
                .to.be.eql(landLists1);
            await sionLandContract.landMintBatch(account1.address, landLists3);
            expect(await sionLandContract.getLandsBatch(account1.address))
                .to.be.eql(landLists4);
            expect(await sionLandContract.getLand(account1.address, 2))
                .to.be.equal("8c2836855a339fd");
            expect(await sionLandContract.balanceOf(account1.address))
                .to.be.equal(4);
            expect(await sionLandContract.getLastTokenId(account1.address))
                .to.be.equal(4);
            await sionLandContract.landMintBatch(account2.address, landLists4);
            expect(await sionLandContract.getLandsBatch(account2.address))
                .to.be.eql(landLists4);
            await sionLandContract.landMintBatch(account3.address, landLists4);
            expect(await sionLandContract.getLandsBatch(account3.address))
                .to.be.eql(landLists4);
        });
    });
});