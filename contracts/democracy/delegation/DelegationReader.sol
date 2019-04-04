pragma solidity >=0.5.0 <0.6.0;

import "./Delegation.sol";

contract DelegationReader {
    Delegation delegation;
    mapping(address => address) delegationOf;

    function validDelegate(
        address _who
    )        
        internal
        view
        returns(bool);


    function precomputeDelegateOf(
        address _who,
        uint _block, 
        bool _revalidate
    )
        internal
    {
        delegationOf[_who] = _revalidate ? delegateOfAt(_who, _block) : cachedDelegateOfAt(_who, _block);
    }

    function delegateOfAt(
        address _who,
        uint _block
    )
        internal
        view
        returns(address delegate)
    {
        delegate = _who;  
        do {
            delegate = delegation.delegatedToAt(delegate, _block);
        } while (!validDelegate(delegate));
    }

    function cachedDelegateOfAt(
        address _who,
        uint _block
    )
        internal
        view
        returns(address delegate)
    {
        delegate = _who;  
        do {
            address delegationOfd = delegationOf[delegate];
            if(delegationOfd != address(0)){
                return delegationOfd;
            }else {
                delegate = delegation.delegatedToAt(delegate, _block);
            }             
        } while (!validDelegate(delegate));

    }


    
     
}