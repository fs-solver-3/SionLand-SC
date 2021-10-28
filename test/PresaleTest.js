// const {
//     constants,
//     expectEvent,
//     expectRevert,
//     time,
// } = require("@openzeppelin/test-helpers");
// const { ZERO_ADDRESS } = constants;
// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { BigNumber } = require("ethers");

// let sionTokenInstance;
// let sionTokenContract;
// let presaleInstance;
// let presaleContract;
// let owner;
// let account1;
// let rate = 2;
// let tokenDecimals = 18;

// describe("Presale", function() {
//     beforeEach(async function() {
//         [owner, account1] = await ethers.getSigners();

//         sionTokenInstance = await ethers.getContractFactory("SionToken");
//         sionTokenContract = await sionTokenInstance.deploy();
//         await sionTokenContract.deployed();
//     });
//     describe("when deploy", function() {
//         it("reverts with the zero rate", async function() {
//             rate = 0;
//             presaleInstance = await ethers.getContractFactory("Presale");
//             await expectRevert(
//                 presaleInstance.deploy(rate, owner.address, sionTokenContract.address),
//                 "zero rate!"
//             );
//         });
//     });
//     describe("once deployed, when buy tokens", function() {
//         beforeEach(async function() {
//             rate = 2;
//             presaleInstance = await ethers.getContractFactory("Presale");
//             presaleContract = await presaleInstance.deploy(
//                 rate,
//                 owner.address,
//                 sionTokenContract.address
//             );
//             await presaleContract.deployed();
//             //mint to all users and presaleContract for testing presale features
//             await sionTokenContract.mintSionTokens(
//                 presaleContract.address,
//                 ethers.utils.parseEther("500")
//             );
//             await sionTokenContract.mintSionTokens(
//                 owner.address,
//                 ethers.utils.parseEther("200")
//             );
//             await sionTokenContract.mintSionTokens(
//                 account1.address,
//                 ethers.utils.parseEther("200")
//             );
//         });
//         it("sucess initial mint to basecontract, owner, user", async function() {
//             expect(await sionTokenContract.balanceOf(presaleContract.address))
//                 .to.be.equal(ethers.utils.parseEther("500"));
//             expect(await sionTokenContract.balanceOf(owner.address))
//                 .to.be.equal(ethers.utils.parseEther("200"));
//             expect(await sionTokenContract.balanceOf(account1.address))
//                 .to.be.equal(ethers.utils.parseEther("200"));
//         });
//         it("Buy action sucess", async function() {
//             const provider = ethers.getDefaultProvider("http://127.0.0.1:8545/");
//             // display the initial balances for owner
//             ownerInitBalance = await ethers.provider.getBalance(owner.address);
//             ownerInitBalanceDecimal =
//                 ownerInitBalance.toString(10) / Math.pow(10, tokenDecimals);
//             console.log("owner initial balance is --------", ownerInitBalanceDecimal);
//             // transfer
//             getPriceResult = await presaleContract.getPrice(
//                 ethers.utils.parseEther("20")
//             );
//             buyTokensResult = await presaleContract.connect(account1)
//                 .buyTokens(account1.address, {
//                     from: account1.address,
//                     value: getPriceResult,
//                 });
//             expect(buyTokensResult).to.emit(presaleContract, "BuyTokensFinished")
//                 .withArgs(account1.address, ethers.utils.parseEther("20"));
//             ownerBalance = await ethers.provider.getBalance(owner.address);
//             ownerBalanceDecimal =
//                 ownerBalance.toString(10) / Math.pow(10, tokenDecimals);
//             console.log("owner current balance is --------", ownerBalanceDecimal);
//             // expect values
//             expect(
//                 await sionTokenContract.balanceOf(presaleContract.address)
//             ).to.be.equal(ethers.utils.parseEther("480"));
//             expect(await sionTokenContract.balanceOf(account1.address)).to.be.equal(
//                 ethers.utils.parseEther("220")
//             );
//             expect(await ethers.provider.getBalance(owner.address)).to.be.equal(
//                 BigNumber.from(ownerInitBalance.add(ethers.utils.parseEther("10")))
//             );
//             expect(await ethers.provider.getBalance(account1.address)).to.be.within(
//                 ethers.utils.parseEther("9989.9"),
//                 ethers.utils.parseEther("9990")
//             );
//             expect(await presaleContract.getTotalEarned()).to.be.equal(
//                 getPriceResult
//             );
//         });
//     });
// });