//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./SionToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SionVesting is Ownable {    

    using SafeMath for uint256;
    SionToken public  _sionToken;

    event TokensReleased(address tokenAddr, uint256 amount);
    event SionVestingRevoked(address tokenAddr);

    // beneficiary of tokens after they are released
    address private _beneficiary;

    // Durations and timestamps are expressed in UNIX time, the same units as block.timestamp.
    uint256 private _cliff;
    uint256 private _start;
    uint256 private _duration;

    // Total balance for vesting
    uint256 public totalBalance;

    bool private _revocable;

    mapping (address => uint256) private _released;
    mapping (address => bool) private _revoked;

    /** @dev Creates a vesting contract that vests its balance of any SionTokens to the
     * beneficiary, gradually in a linear fashion until start + duration. By then all
     * of the balance will have vested.
     * @param sionTokenAddr_ SionToken addresss that is already deployed
     * @param start_ the time (as Unix time) at which point vesting starts
     * @param cliffDuration_ duration in seconds of the cliff in which tokens will begin to vest
     * @param duration_ duration in seconds of the period in which the tokens will vest
     * @param revocable_ whether the vesting is revocable or not
     */     
    constructor (SionToken sionTokenAddr_, address beneficiary_, uint256 start_, uint256 cliffDuration_, uint256 duration_, bool revocable_) {
        require(address(beneficiary_) != address(0), "SionVesting: beneficiary is the zero address");
        require(cliffDuration_ <= duration_, "SionVesting: cliff is longer than duration");
        require(duration_ > 0, "SionVesting: duration is 0");
        require(start_.add(duration_) > block.timestamp, "SionVesting: final time is before current time");
        
        _sionToken = sionTokenAddr_;
        _beneficiary = beneficiary_;
        _start = start_;
        _cliff = start_.add(cliffDuration_);
        _duration = duration_;
        _revocable = revocable_;
    }
    /**
     * @dev A method to set the total amount of SionToken tokens for vesting feature.
     * @notice It needs to run this method as soon as an owner mint SionToken tokens for this contract.
     * @param _amount the amount of vesting tokens.
     * uint256 The amount of wei.
     */
    function setTotaltokens(uint256 _amount) public {
        totalBalance = _amount;
    }

    /**
     * @return the beneficiary of the tokens.
     */
    function beneficiary() public view returns (address) {
        return _beneficiary;
    }

    /**
     * @return the cliff time of the token vesting.
     */
    function cliff() public view returns (uint256) {
        return _cliff;
    }

    /**
     * @return the start time of the token vesting.
     */
    function start() public view returns (uint256) {
        return _start;
    }

    /**
     * @return the duration of the token vesting.
     */
    function duration() public view returns (uint256) {
        return _duration;
    }

    /**
     * @return true if the vesting is revocable.
     */
    function revocable() public view returns (bool) {
        return _revocable;
    }

    /**
     * @return the amount of the token released.
     */
    function released(address tokenAddr) public view returns (uint256) {
        return _released[tokenAddr];
    }

    /**
     * @return true if the token is revoked.
     */
    function revoked(address tokenAddr) public view returns (bool) {
        return _revoked[tokenAddr];
    }

    /**
     * @notice Allows the owner to transfers vested tokens to beneficiary.
     */
    function release() public onlyOwner returns(bool) {
        uint256 unreleased = _releasableAmount();

        require(unreleased > 0, "SionVesting: no tokens are due");

        _released[_beneficiary] = _released[_beneficiary].add(unreleased);
         _sionToken.transfer(_beneficiary, unreleased);

        emit TokensReleased(_beneficiary, unreleased);
        
        return true;
    }

    /**
     * @notice Allows the owner to revoke the vesting. Tokens already vested
     * remain in the contract, the rest are returned to the owner.
     */
    function revoke() public onlyOwner returns(bool) {
        require(_revocable, "SionVesting: cannot revoke");
        require(!_revoked[_beneficiary], "SionVesting: token already revoked");
        require(_released[_beneficiary] < totalBalance, "SionVesting: no tokens to vest");

        _revoked[_beneficiary] = true;
        uint256 unreleased = _releasableAmount();
        _released[_beneficiary] = _released[_beneficiary].add(unreleased);

        emit SionVestingRevoked(_beneficiary);

        return true;
    }

    /**
     * @dev Calculates the amount that has already vested but hasn't been released yet.
     */
    function _releasableAmount() private view returns (uint256) {
        return _vestedAmount().sub(_released[_beneficiary]);
    }

    /**
     * @dev Calculates the amount that has already vested.
     */
    function _vestedAmount() private view returns (uint256) {               
        if (block.timestamp < _cliff) {
            return 0;
        } else if (block.timestamp >= _start.add(_duration) || _revoked[_beneficiary]) {
            return totalBalance;
        } else {
            return totalBalance.mul(block.timestamp.sub(_start)).div(_duration);
        }
    }

    /**
    * @notice A method to retrieve the balance of _sionToken for a stakeholder.
    * @return uint256 The amount of wei.
    */
    function balanceOf() public view returns(uint256) {
        return _sionToken.balanceOf(address(this));
    }
    /**
    * @notice A method to retrieve the the current time of block or this contract.
    * @return the unit of second.
    */
    function nowTime() public view returns(uint256) {
        return block.timestamp;
    }    
}