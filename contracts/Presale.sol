//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./SionToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Presale {
    using SafeMath for uint256;

    SionToken public _sionToken;

    event BuyTokensFinished(address indexed buyer, uint256 amount);

    address payable ownerWallet;
    uint256 public rate;
    uint256 public totalEarned;
    uint256 public sentEther; //TEST VARIABLE

    /**
     * @dev Creates a presale contract that allows all users to buy SionTokens.
     * @param _rate the currency of SionToken with ether
     * @param _ownerWallet wallet address of owner to receive ethers
     * @param _sionTokenAddr SionToken addresss that is already deployed
     */
    constructor(
        uint256 _rate,
        address payable _ownerWallet,
        SionToken _sionTokenAddr
    ) {
        require(_rate > 0, "zero rate!");
        require(address(_ownerWallet) != address(0), "zero wallet address");
        // require(address(_sionTokenAddr) != address(0), "Zero token address");

        rate = _rate;
        ownerWallet = _ownerWallet;
        _sionToken = _sionTokenAddr;
    }

    /**
     * @return the amount of the total ethers that is pre-saled so far.
     */
    function _getTotalEarned() private view returns (uint256) {
        return totalEarned;
    }

    /**
     * @return the price according of the amount of the tokens.
     * @param amount the amount of the tokens
     */
    function getPrice(uint256 amount) public view returns (uint256) {
        return amount.div(rate);
    }

    /**
     * @notice A method to transfer the number of sionTokenAddrs respect to the paid wei.
     * Calculates the number of tokens with rate , and the total presale wei.
     * Get paid and transfer tokens to the buyer.
     * @param _buyer the buyer wallet address.
     */
    function buyTokens(address _buyer) external payable {
        require(_buyer != address(0));
        require(msg.value != 0);

        uint256 tokens = msg.value.mul(rate);
        totalEarned = totalEarned.add(msg.value);

        _sionToken.transfer(_buyer, tokens);
        ownerWallet.transfer(msg.value);
        sentEther = msg.value;

        emit BuyTokensFinished(msg.sender, tokens);
    }

    /* ========== TEST FUNCTIONS ========== */

    /**
     * pubic function for TEST
     * @return the msg.vaule
     */
    function getSentEther() public view returns (uint256) {
        return sentEther;
    }

    /**
     * pubic function for TEST
     * @return the amount of the total ethers that is pre-saled so far.
     */
    function getTotalEarned() public view returns (uint256) {
        return _getTotalEarned();
    }
}
