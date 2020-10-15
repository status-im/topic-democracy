// SPDX-License-Identifier: CC0-1.0
pragma solidity >=0.6.0 <0.8.0;

import "../../deploy/InstanceFactory.sol";
import "../../deploy/Instance.sol";
import "./ProposalAbstract.sol";

/**
 * @title ProposalFactory
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 * @dev Creates Proposal instances. 
 */
contract ProposalFactory is InstanceFactory {

    constructor(InstanceAbstract _base, InstanceAbstract _init, InstanceAbstract _emergency) 
        InstanceFactory(_base, _init, _emergency)
    { }

    function createProposal(
        MiniMeToken _token,
        Delegation _delegation,
        bytes32 _dataHash,
        uint256 _tabulationBlockDelay,
        uint256 _blockStart,
        uint256 _blockEndDelay,
        Proposal.QuorumType _quorum
    ) 
        external
        returns (ProposalAbstract instance)
    {
        instance = this.createProposal(
            _token,
            _delegation,
            _dataHash,
            _tabulationBlockDelay,
            _blockStart,
            _blockEndDelay,
            _quorum,
            msg.sender
        );
    }

    function createProposal(
        MiniMeToken /*_token*/,
        Delegation /*_delegation*/,
        bytes32 /*_dataHash*/,
        uint256 /*_tabulationBlockDelay*/,
        uint256 /*_blockStart*/,
        uint256 /*_blockEndDelay*/,
        Proposal.QuorumType /*_quorum*/,
        address payable /*_controller*/
    ) 
        external
        returns (ProposalAbstract instance)
    {
        instance = ProposalAbstract(address(new Instance(base, prototypes[address(base)].init, msg.data)));
        emit InstanceCreated(instance);
    }

}