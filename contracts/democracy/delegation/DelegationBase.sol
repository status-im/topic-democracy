// SPDX-License-Identifier: CC0-1.0
pragma solidity >=0.6.0 <0.8.0;

import "./DelegationAbstract.sol";

/**
 * @title DelegationBase
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 * @dev Creates a delegation proxy killable model for cheap redeploy and upgradability. 
 */
contract DelegationBase is DelegationAbstract {
    
    /**
     * @notice Calls Constructor
     */
    constructor(Delegation _parentDelegation) {
        parentDelegation = _parentDelegation;
    }

    /** 
     * @notice Changes the delegation of `msg.sender` to `_to`. 
     *         In case of having a parent proxy, if never defined, fall back to parent proxy. 
     *         If once defined and want to delegate to parent proxy, set `_to` as parent address. 
     * @param _to To what address the caller address will delegate to.
     */
    function delegate(address _to) override external {
        updateDelegate(msg.sender, _to);
    }

    /** 
     * @notice Changes the delegation of `address(0)` to `_to`.
     *         By default accounts delegate to `address(0)`. 
     *         Therefore the delegate of `address(0)` is the default delegate of all accounts.
     * @param _defaultDelegate default delegate address
     */
    function setDefaultDelegate(address _defaultDelegate) external onlyController {
        updateDelegate(address(0), _defaultDelegate);
    }

    /**
     * @notice Reads `_who` configured delegation in this level, 
     *         or from parent level if `_who` never defined/defined to parent address.
     * @param _who What address to lookup.
     * @return The address `_who` choosen delegate to.
     */
    function delegatedTo(address _who)
        override
        external
        view 
        returns (address) 
    {
        return findDelegatedToAt(_who, block.number);
    }

    /**
     * @notice Reads `_who` configured delegation at block number `_block` in this level, 
     *         or from parent level if `_who` never defined/defined to parent address.
     * @param _who What address to lookup.
     * @param _block Block number of what height in history.
     * @return directDelegate The address `_who` choosen delegate to.
     */
    function delegatedToAt(
        address _who,
        uint _block
    )
        override
        external
        view
        returns (address directDelegate)
    {
        return findDelegatedToAt(_who, _block);
    }

}