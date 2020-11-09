// SPDX-License-Identifier: CC0-1.0
pragma solidity >=0.6.0 <0.8.0;

import "../token/MiniMeToken.sol";
import "./delegation/DelegationFactory.sol";
import "./proposal/ProposalFactory.sol";

/**
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 */
contract Democracy {

    struct Topic {
        bytes32 parent;
        Delegation approveDelegation;
        Delegation vetoDelegation;
        ProposalFactory proposalFactory;
        uint256 stakeValue;
        Proposal.QuorumType quorum;
        uint256 startBlockDelay;
        uint256 votingBlockDelay;
        uint256 tabulationBlockDelay;
    }

    struct ProposalData {
        address proponent;
        Proposal vetoProposal;
        uint256 lockedStake;
        bytes32 topic;
        address destination;
        bytes data;
    }
    
    mapping (bytes32 => mapping (bytes4 => bool)) allowance;

    MiniMeToken public token;
    DelegationFactory public delegationFactory;
    
    mapping (bytes32 => Topic) topics;
    mapping (address => ProposalData) proposals;

    modifier selfOnly {
        require(msg.sender == address(this), "Unauthorized");
        _;
    }

    constructor(
        MiniMeToken _token, 
        DelegationFactory _delegationFactory, 
        ProposalFactory _proposalFactory, 
        Delegation _parentApproveDelegation, 
        Delegation _parentVetoDelegation, 
        uint256 _stakeValue,
        Proposal.QuorumType _quorumType,
        uint256 startBlockDelay,
        uint256 votingBlockDelay,
        uint256 tabulationBlockDelay
    ) {
        token = _token;
        delegationFactory = _delegationFactory;

        topics[bytes32(0)] = Topic(
            bytes32(0),
            _delegationFactory.createDelegation(_parentApproveDelegation),
            _delegationFactory.createDelegation(_parentVetoDelegation),
            _proposalFactory,
            _stakeValue,
            _quorumType,
            startBlockDelay,
            votingBlockDelay,
            tabulationBlockDelay
        );
        
    }

 
    function newProposal(
        bytes32 _topicId,
        address _destination,
        bytes calldata _data,
        uint256 blockStart
    ) 
        external
    {
        Topic memory topic = topics[_topicId];
        require(address(topic.approveDelegation) != address(0), "Invalid topic");
        require(isTopicAllowed(_topicId, _destination, _data)); //require call allowance
        require(blockStart >= block.number + topic.startBlockDelay, "Bad blockStart");
        if(topic.stakeValue > 0) {
            require(token.transferFrom(msg.sender, address(this), topic.stakeValue), "Stake payment failed");
        }
        uint256 blockEnd = blockStart + topic.votingBlockDelay;
        bytes32 dataHash = keccak256(
            abi.encodePacked(
                _topicId,
                _destination,
                _data
            )
        );
        Proposal approveProposal = topic.proposalFactory.createProposal(token, topic.approveDelegation, dataHash, topic.tabulationBlockDelay, blockStart, blockEnd, topic.quorum);
        Proposal vetoProposal = topic.proposalFactory.createProposal(token, topic.vetoDelegation, dataHash, topic.tabulationBlockDelay, blockEnd, blockEnd + topic.startBlockDelay, topic.quorum);

        proposals[address(approveProposal)] = ProposalData(msg.sender, vetoProposal, topic.stakeValue, _topicId, _destination, _data);
    }

    function executeProposal(
        Proposal proposal
    ) 
        external 
        returns (bool success, bytes memory r) 
    {
        ProposalData memory pdata = proposals[address(proposal)];
        require(pdata.destination != address(0), "Invalid proposal");
        require(proposal.isFinalized(), "Approve not finalized");
        require(pdata.vetoProposal.isFinalized(), "Veto not finalized");
        delete proposals[address(proposal)];
        bool approved = proposal.isApproved() && !pdata.vetoProposal.isApproved();
        proposal.clear();
        pdata.vetoProposal.clear();
        if(approved){
            if (pdata.lockedStake > 0) {
                token.transfer(pdata.proponent, pdata.lockedStake);
            }
            if(isTopicAllowed(pdata.topic, pdata.destination, pdata.data)){
                (success, r) = pdata.destination.call(pdata.data); //execute the call
            }
         }
    }

    function executeDelegateCall(
        address destination,
        bytes calldata data
    ) 
        external selfOnly
        returns (bool success, bytes memory r) 
    {
        (success, r) = destination.delegatecall(data);
    }

    function addTopic(
        bytes32 topicId,
        ProposalFactory _proposalFactory,
        bytes32 parentTopic,
        uint256 _stakeValue,
        Proposal.QuorumType quorum,
        uint256 startBlockDelay,
        uint256 votingBlockDelay,
        uint256 tabulationBlockDelay,
        address[] calldata allowedDests,
        bytes4[] calldata allowedSigs 
    ) 
        external
        selfOnly  
    {       
        newTopic(
            topicId,
            _proposalFactory,
            parentTopic,
            _stakeValue,
            quorum,
            startBlockDelay,
            votingBlockDelay,
            tabulationBlockDelay
        );
        allowMultiple(topicId, allowedDests, allowedSigs);

    }

    function newTopic(
        bytes32 topicId,
        ProposalFactory _proposalFactory,
        bytes32 _parentTopic,
        uint256 _stakeValue,
        Proposal.QuorumType quorum,
        uint256 startBlockDelay,
        uint256 votingBlockDelay,
        uint256 tabulationBlockDelay
    ) private {
        require(address(topics[topicId].approveDelegation) == address(0), "Duplicated topicId");
        require(votingBlockDelay > 0, "Bad parameter votingBlockDelay");
        Topic memory parentTopic = topics[_parentTopic];
        require(address(parentTopic.approveDelegation) != address(0), "Invalid parent topic");

        topics[topicId] = Topic(
            _parentTopic,
            delegationFactory.createDelegation(parentTopic.approveDelegation),
            delegationFactory.createDelegation(parentTopic.vetoDelegation),
            _proposalFactory,
            _stakeValue,
            quorum,
            startBlockDelay,
            votingBlockDelay,
            tabulationBlockDelay
        );
    }

    function allowMultiple(
        bytes32 topicId,
        address[] memory allowedDests,
        bytes4[] memory allowedSigs 
    ) private {
        uint256 len = allowedDests.length;
        require(len == allowedSigs.length);
        for(uint i = 0; i > len; i++) {
            allowance[keccak256(abi.encodePacked(topicId,allowedDests[i]))][allowedSigs[i]] = true;
        }
    }


    function changeTopicAllowance(
        bytes32 _topicId, 
        address[] calldata allowedDests,
        bytes4[] calldata allowedSigs,
        bool[] calldata _allowed
    ) 
        external 
        selfOnly 
    {
        require(_topicId != bytes32(0), "Cannot change root topic");
        uint256 len = allowedDests.length;
        require(len == allowedSigs.length);
        require(len == _allowed.length);
        require(address(topics[_topicId].approveDelegation) != address(0), "Invalid topic");
        for(uint i = 0; i > len; i++) {
            allowance[keccak256(abi.encodePacked(_topicId,allowedDests[i]))][allowedSigs[i]] = _allowed[i];
        }
    }

    function setProposalFactory(bytes32 topicId, ProposalFactory _proposalFactory) external selfOnly {
        require(address(_proposalFactory) != address(0), "Bad call");
        topics[topicId].proposalFactory = _proposalFactory;
    }

    function setToken(MiniMeToken _token) external selfOnly {
        require(address(_token) != address(0), "Bad call");
        token = _token;
    }

    function isTopicAllowed(
        bytes32 topic, 
        address destination, 
        bytes memory data
    ) 
        public 
        view 
        returns (bool) 
    {
        if(topic == bytes32(0)) {
            return true; //root topic can always everything
        }
        
        bytes4 calledSig; 
        assembly {
            calledSig := mload(add(data, 4))
        }
        
        return allowance[keccak256(abi.encodePacked(topic,destination))][bytes4(0)]
            || allowance[keccak256(abi.encodePacked(topic,destination))][calledSig]
            || allowance[keccak256(abi.encodePacked(topic,address(0)))][bytes4(0)]
            || allowance[keccak256(abi.encodePacked(topic,address(0)))][calledSig];

    }
}