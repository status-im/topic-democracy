// SPDX-License-Identifier: CC0-1.0
pragma solidity >=0.6.0 <0.8.0;

import "../../common/MessageSigned.sol";
import "../../common/MerkleProof.sol";
import "./ProposalAbstract.sol";

/**
 * @title ProposalBase
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 * Store votes and tabulate results for Democracy. Cannot be used stand alone, only as base of Instance.
 */
contract ProposalBase is ProposalAbstract, MessageSigned {
    
    /**
     * @notice constructs a "ProposalAbstract Library Contract" for Instance and ProposalFactory
     */
    constructor() {
        blockStart =  uint256(-1);
        voteBlockEnd = uint256(-1);
    }

    /** 
     * @notice include a merkle root of vote signatures 
     * @dev votes can be included as bytes32 hash(signature), in a merkle tree format, 
     * makes possible:
     * - include multiple signatures by the same cost 
     * - voters don't have to pay anything to vote 
     * - the cost of ballot processing can be subsided to the party interested in the outcome
     * @param _signatures merkle root of keccak256(address(this),uint8(vote))` leaf
     */
    function voteSigned(bytes32 _signatures)
        override
        external
        votingPeriod
    {
        emit VoteSignatures(
            signatures.length, 
            _signatures
        );
        signatures.push(_signatures);
    } 

    /**
     * @notice include `msg.sender` vote
     * @dev votes can be included by a direct call for contracts to vote directly
     * contracts can also delegate to a externally owned account and submit by voteSigned method
     * still important that contracts are able to vote directly is to allow a multisig to take a decision
     * this is important because the safest delegates would be a Multisig
     * @param _vote vote 
     */
    function voteDirect(Vote _vote)
        override
        external
        votingPeriod
    {
        require(_vote != Vote.Null, "Bad _vote parameter");
        voteMap[msg.sender] = _vote;
        emit Voted(_vote, msg.sender);
    } 

    /**
     * @notice tabulates influence of a direct vote
     * @param _voter address which called voteDirect
     */
    function tabulateDirect(address _voter) 
        override
        external
        tabulationPeriod
    {
        Vote vote = voteMap[_voter];
        require(vote != Vote.Null, "Not voted");
        setTabulation(_voter, _voter, vote );
    }

    /**
     * @notice tabulate influence of signed vote
     * @param _vote vote used in signature
     * @param _position position where the signature is sealed
     * @param _proof merkle proof
     * @param _signature plain signature used to produce the merkle leaf
     */
    function tabulateSigned(Vote _vote, uint256 _position, bytes32[] calldata _proof, bytes calldata _signature)
        override
        external
        tabulationPeriod
    {
        require(MerkleProof.verifyProof(_proof, signatures[_position], keccak256(_signature)), "Invalid proof");
        address _voter = recoverAddress(getSignHash(voteHash(_vote)), _signature);
        require(voteMap[_voter] == Vote.Null, "Already voted");
        voteMap[_voter] = _vote;
        emit Voted(_vote, _voter);
        setTabulation(_voter, _voter, _vote);
    }

    /**
     * @notice tabulates influence of non voter to his nearest delegate that voted
     * @dev might run out of gas, to prevent this, precompute the delegation
     * Should be called every time a nearer delegate tabulate their vote
     * @param _source holder which not voted but have a delegate that voted
     * @param _cached true if should use lookup values from precomputed
     */
    function tabulateDelegated(address _source, bool _cached)
        override 
        external
        tabulationPeriod
    {
        address claimer = _cached ? cachedDelegateOfAt(_source, voteBlockEnd): delegateOfAt(_source, voteBlockEnd);
        setTabulation(_source, claimer, voteMap[claimer]);
    } 

    /** 
     * @notice precomputes a delegate vote based on current votes tabulated
     * @dev to precompute a very long delegate chain, go from the end to start with _clean false. 
     * @param _start who will have delegate precomputed
     * @param _revalidate if true dont use precomputed results 
     * TODO: fix long delegate chain recompute in case new votes
     */
    function precomputeDelegation(
        address _start,
        bool _revalidate
    )
        override
        external 
        tabulationPeriod
    {
        precomputeDelegateOf(_start, voteBlockEnd, _revalidate);
    }
    
    /**
     * TODO:
     * cannot have votes claimed for votes: accumulators(hold more than 1%) and burned SNT (held by TokenController address).  
     * when informed to contract, these accounts reduces totalSupply used for Qualified and Absolute quorums. 
     * if someone rich wants to use their influence, they will have to devide their balance in multiple addresses and delegate them to one address
     * the objective is to make one rule for all on how to remove "out of circulation" in addresses like "Dev Reserve" 
     * this enhances the democracy, otherwise this locked accounts will end up influence of defaultDelegate
     * function invalidate(address _accumulator) external;
     */
     
    /**
     * @notice finalizes and set result
     */
    function finalize()
        override
        external
        tabulationFinished
    {
        require(result == Vote.Null, "Already finalized");
        Vote finalResult = calculateResult();
        emit FinalResult(finalResult);
        result = finalResult;
    }

    /**
     * @notice wipes all from state
     * @dev once the proposal result was read, it might be cleared up to free up state
     */
    function clear()
        override
        external
        onlyController 
    {
        require(result != Vote.Null, "Not finalized");
        selfdestruct(controller);
    }

    function isApproved() override external view returns (bool) {
        require(result != Vote.Null, "Not finalized");
        return result == Vote.Approve;
    }

    function isFinalized() override external view returns (bool) {
        return result != Vote.Null;
    }  

    function checkSignedVote(
        Vote _vote,
        uint256 _position,
        bytes32[] calldata _proof,
        bytes calldata _signature
    ) 
        external 
        view 
        returns (address) 
    {
        require(MerkleProof.verifyProof(_proof, signatures[_position], keccak256(_signature)), "Invalid proof");
        return recoverAddress(getSignHash(voteHash(_vote)), _signature);
    }

    function getVoteHash(Vote _vote) override external view returns (bytes32) { 
        return voteHash(_vote);
    }

    function getVotePrefixedHash(Vote _vote) external view returns (bytes32) { 
        return getSignHash(voteHash(_vote));
    }

    function delegateOf(address _who) external view returns(address) {
        return delegateOfAt(_who, voteBlockEnd);
    }

    function cachedDelegateOf(address _who) external view returns(address) {
        return cachedDelegateOfAt(_who, voteBlockEnd);
    }
    
    /**
     * @notice get result
     */
    function calculateResult()
        public
        view
        returns(Vote finalResult)
    {
        uint256 approvals = results[uint8(Vote.Approve)];
        bool approved;

        if(quorum == QuorumType.Simple){
            uint256 rejects = results[uint8(Vote.Reject)];
            approved = approvals > rejects;
        } else {
            uint256 totalTokens = token.totalSupplyAt(voteBlockEnd);
            if(quorum == QuorumType.Absolute) {
                approved = approvals > (totalTokens / 2);
            } else if(quorum == QuorumType.Qualified) {
                approved = approvals > (totalTokens * 3) / 5;
            }
        }
        finalResult = approved ? Vote.Approve : Vote.Reject;
    }
    
    function setTabulation(address _source, address _claimer, Vote _vote) internal {
        require(_vote != Vote.Null, "Cannot be Vote.Null");
        uint256 voterBalance = token.balanceOfAt(_source, voteBlockEnd);
        if(voterBalance == 0) {
            return;
        }
        address currentClaimer = tabulated[_source];
        tabulated[_source] = _claimer;
        emit Claimed(_vote, _claimer, _source);
        if(currentClaimer != address(0))
        {
            require(currentClaimer != _source, "Voter already tabulated");
            require(currentClaimer != _claimer, "Claimer already tabulated");
            Vote oldVote = voteMap[currentClaimer];
            if(oldVote == _vote) {
                return;
            }
            emit PartialResult(oldVote, results[uint8(oldVote)] -= voterBalance);
        } 
        emit PartialResult(_vote, results[uint8(_vote)] += voterBalance);
        lastTabulationBlock = block.number;
    }

    function voteHash(Vote _vote) internal view returns (bytes32) { 
        require(_vote != Vote.Null, "Bad _vote parameter");
        return keccak256(abi.encodePacked(address(this), _vote));
    }

    function findNearestDelegatable(address _source) internal view returns (address claimer, Vote vote){
        vote = voteMap[_source];
        require(vote == Vote.Null, "Not delegatable");
        claimer = _source; // try finding first delegate from chain which voted
        while(vote == Vote.Null) {
            address claimerDelegate = delegation.delegatedToAt(claimer, voteBlockEnd);  
            claimer = claimerDelegate; 
            vote = voteMap[claimer]; //loads delegate vote.
        }
    }

    function cachedFindNearestDelegatable(address _source) internal view returns (address claimer, Vote vote){
        vote = voteMap[_source];
        require(vote == Vote.Null, "Not delegatable");
        claimer = _source; // try finding first delegate from chain which voted
        while(vote == Vote.Null) {
            address claimerDelegate = delegationOf[claimer];
            if(claimerDelegate == address(0)){
                claimerDelegate = delegation.delegatedToAt(claimer, voteBlockEnd);  
            }
            claimer = claimerDelegate; 
            vote = voteMap[claimer]; //loads delegate vote.
        }
    }


}