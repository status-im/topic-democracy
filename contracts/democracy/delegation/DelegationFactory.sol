// SPDX-License-Identifier: CC0-1.0
pragma solidity >=0.6.0 <0.8.0;

import "../../deploy/InstanceFactory.sol";
import "../../deploy/Instance.sol";
import "./DelegationAbstract.sol";

/**
 * @title DelegationFactory
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 * @dev Upgradable delegation proxy factory
 */
contract DelegationFactory is InstanceFactory {

    constructor(DelegationAbstract _base, DelegationAbstract _init, DelegationAbstract _emergency) 
        InstanceFactory(_base, _init, _emergency)
    { }

    function createDelegation(
        Delegation /*_parent*/
    ) 
        external 
        returns (DelegationAbstract instance)
    {
        return DelegationAbstract(address(defaultCreate()));
    }

    function createDelegation(
        Delegation /*_parent*/,
        address /*_controller*/,
        address /*_defaultDelegate*/
    ) 
        external 
        returns (DelegationAbstract instance)
    {
        return DelegationAbstract(address(defaultCreate()));
    }
    

}