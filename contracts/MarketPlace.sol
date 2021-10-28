//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./SionToken.sol";
import "./SionLand.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MarketPlace {

    using SafeMath for uint256;
    SionToken public _sionToken;
    SionLand public _sionLand;

    event BuyLandsFinished(address buyer, uint256 _mount);
    
    /**
    * @dev Creates a market place contract that handles the features for the buy lands, buy nft
    * based on SionToken.
    * @param _sionTokenAddr SionToken addresss that is already deployed
    * @param _sionLandAddr SionLand addresss that is already deployed
    */    
    constructor (SionToken _sionTokenAddr, SionLand _sionLandAddr) {
        _sionToken = _sionTokenAddr;
        _sionLand = _sionLandAddr;
    }

    /**
     * @notice A method to buy land from current owner with SionToken.
     * @param _currentOwner the current owner address of SionLands.
     * @param _landIds the string array of SionLand ids list that buyer is going to purchase.
     */
    function buyLands(address _currentOwner,  uint256 _rateToLand,  string[] memory _landIds) public {        
        require(_landIds.length < 11, "revert when purchasing 11 or more lands at the same time.");

        _sionToken.transferFrom(msg.sender, _currentOwner, _rateToLand * _landIds.length);
        _sionLand.landMintBatch(msg.sender, _landIds);       
        
        emit BuyLandsFinished(msg.sender, _landIds.length);
    }
}