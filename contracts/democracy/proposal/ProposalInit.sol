// SPDX-License-Identifier: CC0-1.0
pragma solidity >=0.6.0 <0.8.0;

import "./ProposalAbstract.sol";

/**
 * @title Proposal
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 * @dev Initialization of Proposal, used in Instance construtor. 
 */
contract ProposalInit is ProposalAbstract {

    constructor() {
        token = MiniMeToken(address(-1));
    }

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
    {
        require(address(token) == address(0), "Already initialized");
        delegation = _delegation;
        token = _token;
        tabulationBlockDelay = _tabulationBlockDelay;
        dataHash = _dataHash;
        blockStart = _blockStart;
        voteBlockEnd = blockStart + _blockEndDelay;
        quorum = _quorum;
        controller = msg.sender;
    }

    function createProposal(
        MiniMeToken _token,
        Delegation _delegation,
        bytes32 _dataHash,
        uint256 _tabulationBlockDelay,
        uint256 _blockStart,
        uint256 _blockEndDelay,
        Proposal.QuorumType _quorum,
        address payable _controller
    )
        external
    {
        require(address(token) == address(0), "Already initialized");
        delegation = _delegation;
        token = _token;
        tabulationBlockDelay = _tabulationBlockDelay;
        dataHash = _dataHash;
        blockStart = _blockStart;
        voteBlockEnd = blockStart + _blockEndDelay;
        quorum = _quorum;
        controller = _controller;
    }

    function voteSigned(bytes32) override external{}
    function voteDirect(Vote) override external{}
    function tabulateDirect(address ) override external{}
    function tabulateSigned(Vote, uint256, bytes32[] calldata, bytes calldata) override external{}
    function tabulateDelegated(address,bool) override external{}
    function precomputeDelegation(address, bool) override external{}
    function finalize() override external{}
    function clear() override external{}
    function isApproved() override external view returns (bool){}
    function isFinalized() override external view returns (bool){}
    function getVoteHash(Vote) override external view returns (bytes32){}


}