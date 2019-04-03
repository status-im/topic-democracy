pragma solidity >=0.5.0 <0.6.0;

import "./DelegationAbstract.sol";

/**
 * @title DelegationInit
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 * @notice Initialization Model for Delegation. Is library of functions to initialize instance as Delegation.
 */
contract DelegationInit is DelegationAbstract {

    modifier notInModel { //avoids control of Init contract
        require(address(parentDelegation) == address(0), "Bad call"); 
        _;
    }

    modifier notImplemented {
        if(address(base) == address(0)) revert("Wrong model");
        _;
    }

    /**
     * @notice Constructor of the model
     */
    constructor() public {
        parentDelegation = Delegation(address(-1)); //avoids calling create delegation within the Init contract.
    }

    /**
     * @notice Creates a new Delegation with parent as `_parentDelegation` 
     * @param _parentDelegation lookup delegation of unset users
     */
    function createDelegation(Delegation _parentDelegation) external notInModel { 
        parentDelegation = _parentDelegation;
    }

    /**
     * @notice Creates a new Delegation with `_parentDelegation` as default delegation.
     */
    function createDelegation(
        Delegation _parentDelegation, 
        address payable _controller, 
        address _defaultDelegate
    ) external notInModel {
        controller = _controller; 
        parentDelegation = _parentDelegation;
        updateDelegate(address(0), _defaultDelegate);
    }
    
    function delegate(address) external notImplemented {}
    function delegatedTo(address) external view notImplemented returns (address) {}  
    function delegatedToAt(address,uint) external view notImplemented returns (address) {}
    
}