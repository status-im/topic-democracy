// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.6.0 <0.8.0;

import "./SNTController.sol";

/**
 * @dev Status Network is implemented here
 */
contract StatusNetwork is SNTController {

    /**
     * @notice Constructor
     * @param _owner Authority address
     * @param _snt SNT token
     */
    constructor(
        address payable _owner,
        MiniMeToken _snt
    )
        SNTController(_owner, _snt)    
    { }

}