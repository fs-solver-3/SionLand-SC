const { expect } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert } = require("@openzeppelin/test-helpers");

let sionTokenInstance;
let sionTokenContract;
let stakingInstance;
let stakingContract;
let owner, account1, account2;
let tokenDecimals = 18;

describe("StakingRewards", () => {
    beforeEach(async() => {
        [owner, account1, account2] = await ethers.getSigners();
        sionTokenInstance = await ethers.getContractFactory("SionToken");
        sionTokenContract = await sionTokenInstance.deploy();
        await sionTokenContract.deployed();
        stakingInstance = await ethers.getContractFactory("StakingRewards");
        stakingContract = await stakingInstance.deploy(sionTokenContract.address);
        await stakingContract.deployed();
        //mint to all users and stakingContract for testing stake features
        await sionTokenContract.mintSionTokens(
            account1.address,
            ethers.utils.parseEther("100")
        );
        await sionTokenContract.mintSionTokens(
            account2.address,
            ethers.utils.parseEther("200")
        );
        await sionTokenContract.mintSionTokens(
            stakingContract.address,
            ethers.utils.parseEther("500")
        );
    });
    describe("when mint", function() {
        it("not approve to mint for common users", async() => {
            await expectRevert(
                sionTokenContract
                .connect(account1)
                .mintSionTokens(account1.address, ethers.utils.parseEther("100")),
                "Ownable: caller is not the owner"
            );
        });
        it("mint to test stake features for users", async() => {
            await sionTokenContract.mintSionTokens(
                account1.address,
                ethers.utils.parseEther("100")
            );
            await sionTokenContract.mintSionTokens(
                account2.address,
                ethers.utils.parseEther("100")
            );

            expect(await sionTokenContract.balanceOf(account1.address)).to.be.equal(
                ethers.utils.parseEther("200")
            );
            expect(await sionTokenContract.balanceOf(account2.address)).to.be.equal(
                ethers.utils.parseEther("300")
            );
            expect(
                await sionTokenContract.balanceOf(stakingContract.address)
            ).to.be.equal(ethers.utils.parseEther("500"));
            expect(await sionTokenContract.totalSupply()).to.be.equal(
                ethers.utils.parseEther("1000")
            );
        });
    });
    describe("when stake", function() {
        it("stake fail when balance < amount or amount = 0 ", async() => {
            await expectRevert(
                stakingContract.connect(account1).stake(ethers.utils.parseEther("300")),
                "Please deposite more in your card!"
            );
            await expectRevert(
                stakingContract.connect(account1).stake(ethers.utils.parseEther("0")),
                "The amount to be transferred should be larger than 0"
            );
            expect(await sionTokenContract.balanceOf(account1.address)).to.be.equal(
                ethers.utils.parseEther("100")
            );
        });
        it("stake success", async() => {
            // account1 staking
            await sionTokenContract
                .connect(account1)
                .approve(stakingContract.address, ethers.utils.parseEther("30"));
            await stakingContract
                .connect(account1)
                .stake(ethers.utils.parseEther("30"));
            expect(await stakingContract.stakeOf(account1.address)).to.be.equal(
                ethers.utils.parseEther("30")
            );
            expect(await sionTokenContract.balanceOf(account1.address)).to.be.equal(
                ethers.utils.parseEther("70")
            );
            expect(
                await sionTokenContract.balanceOf(stakingContract.address)
            ).to.be.equal(ethers.utils.parseEther("530"));
            expect(await sionTokenContract.totalSupply()).to.be.equal(
                ethers.utils.parseEther("800")
            );
            // account2 staking
            await sionTokenContract
                .connect(account2)
                .approve(stakingContract.address, ethers.utils.parseEther("50"));
            await stakingContract
                .connect(account2)
                .stake(ethers.utils.parseEther("50"));
            expect(await stakingContract.stakeOf(account2.address)).to.be.equal(
                ethers.utils.parseEther("50")
            );
            expect(await sionTokenContract.balanceOf(account2.address)).to.be.equal(
                ethers.utils.parseEther("150")
            );
            expect(
                await sionTokenContract.balanceOf(stakingContract.address)
            ).to.be.equal(ethers.utils.parseEther("580"));
            expect(await sionTokenContract.totalSupply()).to.be.equal(
                ethers.utils.parseEther("800")
            );
        });
    });
    describe("when unstake", function() {
        describe("cases of unstake fail", function() {
            it("unstake fail when didn't stake yet", async() => {
                await expectRevert(
                    stakingContract
                    .connect(account1)
                    .unStake(ethers.utils.parseEther("10")),
                    "No stake"
                );
            });
            it("unstake fail when the amount of unstake is 0", async() => {
                // account1 staking
                await sionTokenContract
                    .connect(account1)
                    .approve(stakingContract.address, ethers.utils.parseEther("30"));
                await stakingContract
                    .connect(account1)
                    .stake(ethers.utils.parseEther("30"));
                await expectRevert(
                    stakingContract
                    .connect(account1)
                    .unStake(ethers.utils.parseEther("0")),
                    "The amount to be transferred should be larger than 0"
                );
            });
            it("unstake fail when the amount of unstake < the amount of stake", async() => {
                // account1 staking
                await sionTokenContract
                    .connect(account1)
                    .approve(stakingContract.address, ethers.utils.parseEther("30"));
                await stakingContract
                    .connect(account1)
                    .stake(ethers.utils.parseEther("30"));
                await expectRevert(
                    stakingContract
                    .connect(account1)
                    .unStake(ethers.utils.parseEther("50")),
                    "The amount to be transferred should be less than Deposit"
                );
            });
        });

        it("unstake success", async() => {
            // account1 unstaking
            await sionTokenContract
                .connect(account1)
                .approve(stakingContract.address, ethers.utils.parseEther("60"));
            await stakingContract
                .connect(account1)
                .stake(ethers.utils.parseEther("60"));
            await stakingContract
                .connect(account1)
                .unStake(ethers.utils.parseEther("25"));
            expect(await stakingContract.stakeOf(account1.address)).to.be.equal(
                ethers.utils.parseEther("35")
            );
            expect(await sionTokenContract.balanceOf(account1.address)).to.be.equal(
                ethers.utils.parseEther("65")
            );
            expect(await sionTokenContract.totalSupply()).to.be.equal(
                ethers.utils.parseEther("800")
            );
            // account2 unstaking
            await sionTokenContract
                .connect(account2)
                .approve(stakingContract.address, ethers.utils.parseEther("150"));
            await stakingContract
                .connect(account2)
                .stake(ethers.utils.parseEther("150"));
            await stakingContract
                .connect(account2)
                .unStake(ethers.utils.parseEther("70"));
            expect(await stakingContract.stakeOf(account2.address)).to.be.equal(
                ethers.utils.parseEther("80")
            );
            expect(await sionTokenContract.balanceOf(account2.address)).to.be.equal(
                ethers.utils.parseEther("120")
            );
            expect(await sionTokenContract.totalSupply()).to.be.equal(
                ethers.utils.parseEther("800")
            );
        });
    });
    describe("when reward", function() {
        describe("cases of getreward fail", function() {
            it("getreward fail when no rewards", async() => {
                await expectRevert(
                    stakingContract.connect(account1).getReward(),
                    "No rewards"
                );
            });
        });
        describe("cases of getreward success", function() {
            beforeEach((done) => setTimeout(done, 500));
            it("success when unstake right away of stake, i.e stakeAmounts is 0", async() => {
                // account1 staking
                await sionTokenContract
                    .connect(account1)
                    .approve(stakingContract.address, ethers.utils.parseEther("150"));
                await stakingContract
                    .connect(account1)
                    .stake(ethers.utils.parseEther("60"));
                // account1 unstaking
                await stakingContract
                    .connect(account1)
                    .unStake(ethers.utils.parseEther("60"));

                rewardAmount = await stakingContract.rewardOf(account1.address);
                rewardAmountDecimal =
                    rewardAmount.toNumber() / Math.pow(10, tokenDecimals);
                console.log("the amount of rewards is ", rewardAmountDecimal);
                getRewardsResult = await stakingContract.connect(account1).getReward();

                expect(getRewardsResult)
                    .to.emit(stakingContract, "RewardPaid")
                    .withArgs(account1.address, rewardAmount);
                expect(await stakingContract.rewardOf(account1.address)).to.be.equal(0);
                expect(await sionTokenContract.balanceOf(account1.address)).to.be.equal(
                    ethers.utils.parseEther("100.0000075")
                );
                expect(
                    await sionTokenContract.balanceOf(stakingContract.address)
                ).to.be.equal(ethers.utils.parseEther("499.9999925"));
                expect(await sionTokenContract.totalSupply()).to.be.equal(
                    ethers.utils.parseEther("800")
                );
            });
        });
    });
});