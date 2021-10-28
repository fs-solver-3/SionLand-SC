//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./SionToken.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract StakingRewards {

    using SafeMath for uint256;
    SionToken public _sionToken;

    event RewardPaid(address indexed user, uint256 reward);

    uint256 rewardRate = 1;
    uint256 fixedTotalSupply = 800;
    struct StakeList{
        uint256 stakesAmount; 
        uint256 rewardsAmount;
        uint256 lastUpdateTime;
    }

    /**
    * @notice The accumulated stake status for each stakeholder.
    */
    mapping(address => StakeList) public stakeLists;
    
    /**
    * @dev Creates a staking contract that handles the staking, unstaking, getReward features
    * for SionTokens.
    * @param _tokenAddress SionToken addresss that is already deployed
    */    
    constructor (SionToken _tokenAddress) {
        _sionToken = _tokenAddress;
    }

    /**
    * @notice A method for the stakeholder to stake.
    * @param _amount The amount of SionTokens to be staked.
    */
    function stake(uint256 _amount) public returns(bool) {              
        require(_sionToken.balanceOf(msg.sender) >= _amount, "Please deposite more in your card!");
        require(_amount > 0, "The amount to be transferred should be larger than 0");

        _sionToken.transferFrom(msg.sender, address(this), _amount);
        StakeList storage _personStakeSatus = stakeLists[msg.sender];
        _personStakeSatus.rewardsAmount = updateReward(msg.sender);
        _personStakeSatus.stakesAmount += _amount;
        _personStakeSatus.lastUpdateTime = block.timestamp;

        return true;
    }

    /**
    * @notice A method for the stakeholder to unstake.
    * @param _amount The amount of SionTokens to be unstaked.
    */
    function unStake(uint256 _amount) public returns(bool) {
        StakeList storage _personStakeSatus = stakeLists[msg.sender];

        require (_personStakeSatus.stakesAmount != 0, "No stake");
        require(_amount > 0, "The amount to be transferred should be larger than 0");
        require(_amount <= _personStakeSatus.stakesAmount, "The amount to be transferred should be less than Deposit");

        _sionToken.transfer(msg.sender, _amount);
        _personStakeSatus.rewardsAmount = updateReward(msg.sender);
        _personStakeSatus.stakesAmount -= _amount;
        _personStakeSatus.lastUpdateTime = block.timestamp;

        return true;
    }

    /**
    * @notice A method to allow the stakeholder to check his rewards.
    */
    function getReward() public returns(bool) {
        StakeList storage _personStakeSatus = stakeLists[msg.sender];

        _personStakeSatus.rewardsAmount = updateReward(msg.sender);
        require (_personStakeSatus.rewardsAmount != 0, "No rewards");

        uint256 getRewardAmount = _personStakeSatus.rewardsAmount;
        _sionToken.transfer(msg.sender, _personStakeSatus.rewardsAmount);
        _personStakeSatus.rewardsAmount = 0;
        _personStakeSatus.lastUpdateTime = block.timestamp;

        emit RewardPaid(msg.sender, getRewardAmount); 

        return true;
    }

    /**
    * @notice A method to calcaulate the stake rewards whenever any transaction happens.
    * @param _account The stakeholder to retrieve the stake rewards for.
    */
    function updateReward(address _account) public view returns (uint256) {
        StakeList storage _personStakeSatus = stakeLists[_account];

        if (_personStakeSatus.stakesAmount == 0) {
            return _personStakeSatus.rewardsAmount;
        }
        return _personStakeSatus.rewardsAmount
            .add(block.timestamp
            .sub(_personStakeSatus.lastUpdateTime)
            .mul(_personStakeSatus.stakesAmount)
            .mul(rewardRate)
            .div(fixedTotalSupply)
            .div(10000));   // it means that rewardRate is 0.001%
    }

    /**
    * @notice A method to retrieve the stake for a stakeholder.
    * @param _stakeholder The stakeholder to retrieve the stake for.
    * @return uint256 The amount of ethers.
    */
    function stakeOf(address _stakeholder) public view returns(uint256) {
        StakeList storage _personStakeSatus = stakeLists[_stakeholder];        
        return _personStakeSatus.stakesAmount;
    }

    /**
    * @notice A method to retrieve the rewards for a stakeholder.
    * @param _stakeholder The stakeholder to retrieve the rewards for.
    * @return uint256 The amount of ethers.
    */
    function rewardOf(address _stakeholder) public view returns(uint256) {
        StakeList storage _personStakeSatus = stakeLists[_stakeholder];        
        return _personStakeSatus.rewardsAmount;
    }
}