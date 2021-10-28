//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SionLand is ERC721, Ownable{
    
    uint256 totalLastTokenId;
    mapping(address => uint256) userLastTokenId;
    // mapping(address => mapping(uint256 => string)) totalLandsList;
    mapping(address => mapping(uint256 => string)) userLandsList;
    
    event LandMintBatchFinished(address to, uint256 _mount);

    /**
     * @dev Sets the values for {name} and {symbol}.    
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor() ERC721("Land", "SION") {
    }

    /**
     * @notice A method to allow for only owner to mintbatch lands list to anyone.
     * @param _to the address of receiver to get mintbatched.
     * @param _landIds the string array of SionLand ids list to mintbatch.
     */
    function landMintBatch(address _to, string[] memory _landIds) public {
        for (uint256 _i = 0; _i < _landIds.length; _i++){
            totalLastTokenId ++;
            uint256 _id = nextTokenId(_to);
            _safeMint(_to, totalLastTokenId, "");
            // _mint(_to, totalLastTokenId);
            userLandsList[_to][_id] = _landIds[_i];
            incrementTokenId(_to);
        }

        emit LandMintBatchFinished(_to, _landIds.length);
    }

    /**
     * @notice A method to get the list of all lands owned by any user.
     * @param _account the user address.
     * @return landsList owned by any user.
     */
    function getLandsBatch(address _account) public view returns(string[] memory landsList) {
        // require(balanceOf(_account) > 0, "no land owned");
        landsList = new string[](balanceOf(_account));
        for (uint256 _i = 0; _i < userLastTokenId[_account]; _i++){
            landsList[_i] =  userLandsList[_account][_i+1];
        }
        return landsList;
    }
    function nextTokenId(address account) public view returns(uint256) {
        return userLastTokenId[account] + 1;
    }
    function incrementTokenId(address account) internal {
        userLastTokenId[account] ++;
    }

    /* ============== TEST FUNCTION ============= */

    /**
     * @notice A method to get landsId corresponding to user and token id.
     * @param _account the user address.
     * @param _id token id.
     * @return landsId corresponding to user and token id.
     */
    function getLand(address _account, uint256 _id) public view returns(string memory) {
        require(balanceOf(_account) > 0, "no land owned");        
        return userLandsList[_account][_id];
    }

    /**
     * @notice get the Last token id of user.
     */
    function getLastTokenId(address _account) public view returns(uint256) {
        return userLastTokenId[_account];
    }
}