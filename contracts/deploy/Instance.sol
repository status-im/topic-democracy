// SPDX-License-Identifier: CC0-1.0
pragma solidity >=0.6.0 <0.8.0;

import "./InstanceAbstract.sol";
import "./DelegatedCall.sol";

/**
 * @title Instance
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH) 
 * @dev Contract that forward everything through delegatecall to defined base
 */
contract Instance is InstanceAbstract, DelegatedCall {

    /**
     * @notice delegatecall `_init` with `_initMsg` and set base as `_base` 
     * @param _base base for delegatecall 
     * @param _init constructor contract 
     * @param _initMsg arguments to be passed for the single delegatecall on `_init` 
     */
    constructor(
        InstanceAbstract _base,
        InstanceAbstract _init,
        bytes memory _initMsg
    )
        payable
        DelegatedCall(address(_init), _initMsg)
    {
        base = _base;
    }

    /**
     * @dev delegatecall everything (but declared functions) to `_target()`
     * @notice Verify `base()` code to predict behavior
     */
    fallback()  
        external 
        payable 
        delegateAndReturn(address(base)) 
    { }

}