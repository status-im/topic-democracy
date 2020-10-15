const {
    BN,
    time,
    constants,
    expectEvent, 
    expectRevert,
  } = require('@openzeppelin/test-helpers');
const { MerkleTree } = require('../utils/merkleTree.js');

const DelegationFactory = artifacts.require('DelegationFactory');
const MiniMeToken = artifacts.require('MiniMeToken');
const Delegation = artifacts.require('Delegation');
const ProposalFactory = artifacts.require('ProposalFactory');
const ProposalBase = artifacts.require('ProposalBase');

var pTest;

config({
    contracts: {deploy:{
        "MiniMeTokenFactory": {
        },
        "MiniMeToken": {
            "args": [
                "$MiniMeTokenFactory",
                constants.ZERO_ADDRESS,
                0,
                "TestMiniMeToken",
                18,
                "TST",
                true
            ]
        },
        "DelegationBase": {
            "args": [ constants.ZERO_ADDRESS ]
        },
        "DelegationInit": {},
        "DelegationFactory": {
            "args": ["$DelegationBase", "$DelegationInit", constants.ZERO_ADDRESS]
        },
        "ProposalBase": {},
        "ProposalInit": {},
        "ProposalFactory": {
            "args": ["$ProposalBase", "$ProposalInit", constants.ZERO_ADDRESS]
        }

      }}
  }, (_err, web3_accounts) => {
    accounts = web3_accounts;
    defaultDelegate = accounts[5];
    pTest = new ProposalTest(web3_accounts,  web3_accounts[5], '1000000')
  });

class ProposalTest{

    constructor(accounts, defaultDelegate, initialBalance){
        this.accounts = accounts;
        this.defaultDelegate = defaultDelegate;
        this.initialBalance = initialBalance;
    }

    async init(){
        await this.mintTokens();
        this.RootDelegation = await this.newDelegation(constants.ZERO_ADDRESS, this.defaultDelegate);
        this.ChildDelegation = await this.newDelegation(this.RootDelegation._address, this.defaultDelegate);
        await this.RootDelegation.methods.delegate(this.accounts[1]).send({from: this.accounts[0]});
        await this.RootDelegation.methods.delegate(this.accounts[2]).send({from: this.accounts[1]});
        await this.RootDelegation.methods.delegate(this.accounts[3]).send({from: this.accounts[2]});
        // root: 4 -> 4
        await this.RootDelegation.methods.delegate(this.accounts[4]).send({from: this.accounts[4]});
    
        // root: 6 -> 7 -> 8 -> 9 -> 6 (circular)
        await this.RootDelegation.methods.delegate(this.accounts[7]).send({from: this.accounts[6]});
        await this.RootDelegation.methods.delegate(this.accounts[8]).send({from: this.accounts[7]});
        await this.RootDelegation.methods.delegate(this.accounts[9]).send({from: this.accounts[8]});
        await this.RootDelegation.methods.delegate(this.accounts[6]).send({from: this.accounts[9]});
        // child: 5 -> 6
        await this.ChildDelegation.methods.delegate(this.accounts[6]).send({from: this.accounts[5]})
      }
    
      async delegationOf(contract, influenceSrc) {
        let delegation = [];
        var curDelegate = influenceSrc;
        do {
            delegation.push(curDelegate)
            curDelegate = await contract.methods.delegatedTo(curDelegate).call();
        }while(!delegation.includes(curDelegate));
        return delegation;
    }
    
    mintTokens() {
        return Promise.all(
            this.accounts.map((account) => {
                return MiniMeToken.methods.generateTokens(account, this.initialBalance).send({from: this.accounts[0]});
            })
        );
    }
    
    async newDelegation(topDelegation, defaultDelegate) {
        const receipt = await DelegationFactory.methods.createDelegation(topDelegation, defaultDelegate, defaultDelegate).send({from: accounts[0]});
        return new web3.eth.Contract(Delegation._jsonInterface,receipt.events.InstanceCreated.returnValues.instance);
    }
    
    async newProposal(MiniMeToken, Delegation, dataHash, tabulationBlockDelay, blockStart, blockEndDelay, quorumType) {
        const receipt = await ProposalFactory.methods.createProposal(
            MiniMeToken._address, 
            Delegation._address, 
            dataHash, 
            tabulationBlockDelay, 
            blockStart, 
            blockEndDelay, 
            quorumType
        ).send({from: accounts[0]}) 
        return new web3.eth.Contract(ProposalBase._jsonInterface, receipt.events.InstanceCreated.returnValues.instance);
    }
    
    async addGas(call, from, amount=21000) {
        return call.send({
            gas: await call.estimateGas({gas: 8000000})+amount,
            from: from
        });
    }
    
    async tabulateDirect(proposal, account) {
        return this.addGas(proposal.methods.tabulateDirect(account), web3.eth.defaultAccount);
    }
    
    async tabulateDelegated(proposal, account) {
        let nc = proposal.methods.tabulateDelegated(account, false);
        let yc = proposal.methods.tabulateDelegated(account, true);
        let ng = await nc.estimateGas();
        let yg = await yc.estimateGas();
        var call = nc;
        if(yg < ng && await proposal.methods.delegateOf(account).call() == await proposal.methods.cachedDelegateOf(account).call()){
            call = yc;
        }
        return this.addGas(call, web3.eth.defaultAccount);
    }
    
    async tabulateSigned(proposal, sig) {
        return this.addGas(
            proposal.methods.tabulateSigned(
                sig.vote,
                sig.position,
                sig.proof,
                sig.signature
            ),
            web3.eth.defaultAccount
        );
    }
    
}
  

contract("Proposal", function() {
    this.timeout(0);

    const QUORUM_QUALIFIED = '0';
    const QUORUM_MAJORITY = '1';
    const QUORUM_SIMPLE = '2';

    const VOTE_NULL = 0;
    const VOTE_REJECT = '1';
    const VOTE_APPROVE = '2';
    const blockEndDelay = '10';
    const tabulationBlockDelay = 5;

    describe("detailed test", function () {  
                
        var sigs = [];
        var testProposal;
        var blockStart;
        var voteBlockEnd;
        it("inits test", async function () {
            await pTest.init() 
        });
        
        it("create proposal by factory", async function () {
            blockStart = +await web3.eth.getBlockNumber() + 10;
            testProposal = await pTest.newProposal(
                MiniMeToken,  
                pTest.RootDelegation, 
                "0xDA0", 
                tabulationBlockDelay, 
                blockStart, 
                blockEndDelay, 
                QUORUM_QUALIFIED
            );
        });
        
        it("rejects signed votes while not voting period ", async function () { 
            assert(await web3.eth.getBlockNumber() < blockStart, "Wrong block number")
            await expectRevert(
                testProposal.methods.voteSigned(constants.ZERO_BYTES32).send({from: accounts[0]}),
                "Voting not started"
            )
        });

        it("rejects direct votes while not voting period ", async function () { 
            assert(await web3.eth.getBlockNumber() < blockStart, "Wrong block number")
            await expectRevert(
                testProposal.methods.voteDirect(VOTE_APPROVE).send({from: accounts[0]}),
                "Voting not started"
            )
        });


        it("increases block number to vote block start", async function () {
            await time.advanceBlockTo(blockStart);
            assert(await web3.eth.getBlockNumber() >= blockStart, "Wrong block number")
        }); 


        it("direct vote", async function () { 
            let receipt = await testProposal.methods.voteDirect(VOTE_REJECT).send({from: accounts[5]});
            expectEvent(receipt, 'Voted', {
                vote: VOTE_REJECT,
                voter: accounts[5]
            });
        });   

  

        it("signed vote at voting period", async function () { 
            let vote = VOTE_APPROVE;
            let approveHash = await testProposal.methods.getVoteHash(vote).call();
            let signatures = await Promise.all(accounts.map((address) => {
                //in web app should web3.eth.personal.sign(approveHash, address)
                return web3.eth.sign(approveHash, address);    
            }))
            let merkleTree = new MerkleTree(signatures);    
            let merkleRoot = merkleTree.getHexRoot();
            
            let receipt = await testProposal.methods.voteSigned(merkleRoot).send({from: accounts[0]})
            let position = '0';
            expectEvent(receipt, "VoteSignatures", {position, merkleTree: merkleRoot})
            for(var i = 0; i < signatures.length; i++) {
                sigs.push ({ 
                    position: position, 
                    vote: vote,
                    signature: signatures[i],
                    proof: merkleTree.getHexProof(signatures[i]),
                    signer: accounts[i]
                })
                
            }
        });    

        it("tests under block end", async function () {
            voteBlockEnd = +await testProposal.methods.voteBlockEnd().call();
            assert(await web3.eth.getBlockNumber() <= voteBlockEnd, "Current block number is too low for testing");
        })

        it("reject tabulateDirect when voting not ended", async function () {
            await expectRevert(
                testProposal.methods.tabulateDirect(accounts[5]).send({from: accounts[0]}),
                "Voting not ended"
            )
        }); 

        it("reject tabulateDelegated when voting not ended", async function () {
            await expectRevert(
                testProposal.methods.tabulateDelegated(accounts[0], false).send({from: accounts[0]}),
                "Voting not ended"
            )
        }); 

        it("reject tabulateSigned when voting not ended", async function () {
            sig = sigs[0];
            await expectRevert(
                testProposal.methods.tabulateSigned(sig.vote, sig.position, sig.proof, sig.signature).send({from: accounts[0]}),
                "Voting not ended"
            )
        }); 
        
        it("increases block number to vote block end", async function () {
            await time.advanceBlockTo(+voteBlockEnd+1);
            assert(await web3.eth.getBlockNumber() > voteBlockEnd, "Wrong block number")
        }); 

        it("rejects direct votes when voting period ended", async function () { 
            await expectRevert(
                testProposal.methods.voteDirect(VOTE_APPROVE).send({from: accounts[0]}),
                "Voting ended"
            )
        });

        it("rejects signed votes when voting period ended", async function () { 
            await expectRevert(
                testProposal.methods.voteSigned(constants.ZERO_BYTES32).send({from: accounts[0]}),
                "Voting ended"
            )
        });

        it("reject tabulates when no delegate voted", async function () {;
            await expectRevert(
                testProposal.methods.tabulateDelegated(accounts[4], false).send({from: accounts[0]}),
                "revert"
            )
        }); 

        it("should not have a lastTabulationBlock", async function () {
            assert.equal(await testProposal.methods.lastTabulationBlock().call(), '0'); 
        })

        it("rejects finalization when never tabulated", async function () { 
            await expectRevert(
                testProposal.methods.finalize().send({from: accounts[0]}),
                "Tabulation not started"
            )
        });  

        it("tabulates reject influence from default delegate", async function () { 
            receipt = await pTest.tabulateDelegated(testProposal, accounts[3]);
            assert.equal(await web3.eth.getBlockNumber()+'', await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Claimed", {
                vote: VOTE_REJECT,
                claimer: accounts[5],
                source: accounts[3]
            })
            expectEvent(receipt, "PartialResult", {
                vote: VOTE_REJECT,
                total: ''+pTest.initialBalance * 1
            })
        }); 

        it("tabulates reject influence from self voter", async function () {
            let receipt = await pTest.tabulateDirect(testProposal, accounts[5]);
            assert.equal(await web3.eth.getBlockNumber()+'', await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Claimed", {
                vote: VOTE_REJECT,
                claimer: accounts[5],
                source: accounts[5]
            })
            expectEvent(receipt, "PartialResult", {
                vote: VOTE_REJECT,
                total: ''+pTest.initialBalance * 2
            })
        });   

        it("tabulates approve influence from voteSigned ", async function () { 
            let sig = sigs[2];
            let receipt = await pTest.tabulateSigned(testProposal, sig);
            assert.equal(await web3.eth.getBlockNumber()+'', await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Voted", {
                vote: sig.vote,
                voter: sig.signer,
            });
            expectEvent(receipt, "Claimed", {
                vote: sig.vote,
                claimer: sig.signer,
                source: sig.signer
            })
            expectEvent(receipt, "PartialResult", {
                vote: VOTE_APPROVE,
                total: ''+pTest.initialBalance * 1
            })
        });  


        it("should not tabulate for delegate if voted ", async function () { 
            await expectRevert(
                testProposal.methods.tabulateDelegated(accounts[2], false).send({from: accounts[0]}),
                "Voter already tabulated"
            )
            await expectRevert(
                testProposal.methods.tabulateDelegated(accounts[5], false).send({from: accounts[0]}),
                "Voter already tabulated"
            )
        });  

        it("tabulates approve influence from direct delegate", async function () { 
            let receipt = await pTest.tabulateDelegated(testProposal, accounts[1]);
            assert.equal(await web3.eth.getBlockNumber()+'', await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Claimed", {
                vote: VOTE_APPROVE,
                claimer: accounts[2],
                source: accounts[1]
            })
            expectEvent(receipt, "PartialResult", {
                vote: VOTE_APPROVE,
                total: ''+pTest.initialBalance * 2
            })
        });  

        it("tabulates approve influence from indirect delegate", async function () { 
            let receipt = await pTest.tabulateDelegated(testProposal, accounts[0]);
            assert.equal(await web3.eth.getBlockNumber()+'', await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Claimed", {
                vote: VOTE_APPROVE,
                claimer: accounts[2],
                source: accounts[0]
            })
            expectEvent(receipt, "PartialResult", {
                vote: VOTE_APPROVE,
                total: ''+pTest.initialBalance * 3
            })
        });    

        it("should not tabulate influence from circular delegation chain when none voted", async function () { 
            await expectRevert(
                testProposal.methods.tabulateDelegated(accounts[7], false).send({from: accounts[0]}),
                "revert"
            )
        });    


        it("tabulates approve signature from circular delegation", async function () { 
            receipt = await pTest.tabulateSigned(testProposal, sigs[7]);
            assert.equal(await web3.eth.getBlockNumber()+'', await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "PartialResult", {
                vote: VOTE_APPROVE,
                total: ''+pTest.initialBalance * 4
            })
        })

        it("tabulates approve influence from circular direct delegate", async function () { 
            var receipt = await pTest.tabulateDelegated(testProposal, accounts[6]);
            assert.equal(await web3.eth.getBlockNumber()+'', await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Claimed", {
                vote: VOTE_APPROVE,
                claimer: accounts[7],
                source: accounts[6]
            })
            expectEvent(receipt, "PartialResult", {
                vote: VOTE_APPROVE,
                total: ''+pTest.initialBalance * 5
            })
        })
        
        it("tabulates approve influence from circular indirect delegate", async function () { 
            receipt = await pTest.tabulateDelegated(testProposal, accounts[9]);
            assert.equal(await web3.eth.getBlockNumber()+'', await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Claimed", {
                vote: VOTE_APPROVE,
                claimer: accounts[7],
                source: accounts[9]
            })
            expectEvent(receipt, "PartialResult", {
                vote: VOTE_APPROVE,
                total: ''+pTest.initialBalance * 6
            })
        })
        it("tabulates approve influence from circular delegate of claiming delegate", async function () { 
            receipt = await pTest.tabulateDelegated(testProposal, accounts[8]);
            assert.equal(await web3.eth.getBlockNumber()+'', await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Claimed", {
                vote: VOTE_APPROVE,
                claimer: accounts[7],
                source: accounts[8]
            })
            expectEvent(receipt, "PartialResult", {
                vote: VOTE_APPROVE,
                total: ''+pTest.initialBalance * 7
            })
        })

        it("retabulates approve influence to self vote from delegate claimed reject", async function () {
            sig = sigs[3];
            receipt = await pTest.tabulateSigned(testProposal, sig);
            assert.equal(await web3.eth.getBlockNumber()+'', await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Voted", {
                vote: sig.vote,
                voter: sig.signer,
            });
            expectEvent(receipt, "Claimed", {
                vote: sig.vote,
                claimer: sig.signer,
                source: sig.signer
            })
            expectEvent(receipt, "PartialResult", {
                vote: VOTE_REJECT,
                total: ''+pTest.initialBalance * 1
            })
            expectEvent(receipt, "PartialResult", {
                vote: VOTE_APPROVE,
                total: ''+pTest.initialBalance * 8
            })
        });  

        it("retabulates approve influence to self vote", async function () {
            sig = sigs[6];
            let lastTabulationBlock = await testProposal.methods.lastTabulationBlock().call();
            receipt = await pTest.tabulateSigned(testProposal, sig);
            assert.equal(lastTabulationBlock, await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Voted", {
                vote: sig.vote,
                voter: sig.signer,
            });
            expectEvent(receipt, "Claimed", {
                vote: sig.vote,
                claimer: sig.signer,
                source: sig.signer
            })
        });  
        
        it("retabulates approve influence to indirect delegate", async function () { 
            let lastTabulationBlock = await testProposal.methods.lastTabulationBlock().call();
            receipt = await pTest.tabulateDelegated(testProposal, accounts[8]);
            assert.equal(lastTabulationBlock, await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Claimed", {
                vote: VOTE_APPROVE,
                claimer: accounts[6],
                source: accounts[8]
            })
        });    

        it("retabulates approve influence to direct delegate", async function () {
            let lastTabulationBlock = await testProposal.methods.lastTabulationBlock().call();
            receipt = await pTest.tabulateDelegated(testProposal, accounts[9]);
            assert.equal(lastTabulationBlock, await testProposal.methods.lastTabulationBlock().call());
            expectEvent(receipt, "Claimed", {
                vote: VOTE_APPROVE,
                claimer: accounts[6],
                //source: accounts[?]
            })
        });    
        
        it("rejects finalization before tabulation end", async function () { 
            let lastTabulationBlock = await testProposal.methods.lastTabulationBlock().call();
            assert(await web3.eth.getBlockNumber() < +lastTabulationBlock+tabulationBlockDelay, "Wrong block number")
            await expectRevert(
                testProposal.methods.finalize().send({from: accounts[0]}),
                "Tabulation not ended"
            )
        }); 

        it("rejects clear before finalization", async function () { 
            await expectRevert(
                testProposal.methods.clear().send({from: accounts[0]}),
                "Not finalized"
            )
        }); 

        it("increses block to tabulation end", async function (){
            let lastTabulationBlock = +await testProposal.methods.lastTabulationBlock().call();
            await time.advanceBlockTo(lastTabulationBlock+tabulationBlockDelay+1);
            assert(await web3.eth.getBlockNumber() > +lastTabulationBlock+tabulationBlockDelay, "Wrong block number")
        });

        it("finalizes after tabulation end", async function (){
            receipt = await testProposal.methods.finalize().send({from: web3.eth.defaultAccount});
            expectEvent(receipt, "FinalResult", {result: VOTE_APPROVE});
        });


        it("reject tabulateDirect after finalization", async function () {
            await expectRevert(
                testProposal.methods.tabulateDirect(accounts[5]).send({from: accounts[0]}),
                "Tabulation ended"
            )
        }); 

        it("reject tabulateDelegated after finalization", async function () {
            await expectRevert(
                testProposal.methods.tabulateDelegated(accounts[0], false).send({from: accounts[0]}),
                "Tabulation ended"
            )
        }); 

        it("reject tabulateSigned after finalization", async function () {
            sig = sigs[0];
            await expectRevert(
                testProposal.methods.tabulateSigned(sig.vote, sig.position, sig.proof, sig.signature).send({from: accounts[0]}),
                "Tabulation ended"
            )
        }); 

        it("rejects finalization after finalization", async function () { 
            await expectRevert(
                testProposal.methods.finalize().send({from: accounts[0]}),
                "Already finalized"
            )
        }); 

        it("clear after finalization", async function () { 
            await testProposal.methods.clear().send({from: web3.eth.defaultAccount});
        }); 
    });

    describe("test qualified quorum reject", function() {
        var sigs = [];
        var testProposal;
        var blockStart;
        var voteBlockEnd;
        it("create proposal by factory", async function () {
            blockStart = await web3.eth.getBlockNumber();
            
            testProposal = await pTest.newProposal(
                MiniMeToken, 
                pTest.ChildDelegation, 
                "0xDA0", 
                tabulationBlockDelay, 
                blockStart, 
                blockEndDelay, 
                QUORUM_QUALIFIED
            );
        });

        it("include approve votes", async function () { 
            sigs = []
            let vote = VOTE_APPROVE;
            let approveHash = await testProposal.methods.getVoteHash(vote).call();
            let signatures = await Promise.all(accounts.slice(0,5).map((address) => {
                //in web app should web3.eth.personal.sign(approveHash, address)
                return web3.eth.sign(approveHash, address);    
            }))
            let merkleTree = new MerkleTree(signatures);    
            let merkleRoot = merkleTree.getHexRoot();
            
            let receipt = await testProposal.methods.voteSigned(merkleRoot).send({from: accounts[0]})
            let position = receipt.events.VoteSignatures.returnValues.position;
            for(var i = 0; i < signatures.length; i++) {
                sigs.push ({ 
                    position: position, 
                    vote: vote,
                    signature: signatures[i],
                    proof: merkleTree.getHexProof(signatures[i]),
                    signer: accounts[i]
                })
                
            }
        }); 

        it("include reject votes", async function () { 
            let vote = VOTE_REJECT;
            let approveHash = await testProposal.methods.getVoteHash(vote).call();
            let signatures = await Promise.all(accounts.slice(5).map((address) => {
                //in web app should web3.eth.personal.sign(approveHash, address)
                return web3.eth.sign(approveHash, address);    
            }))
            let merkleTree = new MerkleTree(signatures);    
            let merkleRoot = merkleTree.getHexRoot();
            
            let receipt = await testProposal.methods.voteSigned(merkleRoot).send({from: accounts[0]})
            let position = receipt.events.VoteSignatures.returnValues.position;
            for(var i = 0; i < signatures.length; i++) {
                sigs.push ({ 
                    position: position, 
                    vote: vote,
                    signature: signatures[i],
                    proof: merkleTree.getHexProof(signatures[i]),
                    signer: accounts[5+i]
                })
                
            }
        });
        
        it("increases block number to vote block end", async function () {
            voteBlockEnd = await testProposal.methods.voteBlockEnd().call();
            await time.advanceBlockTo(+voteBlockEnd+1);
            assert(await web3.eth.getBlockNumber() > voteBlockEnd, "Wrong block number")
        }); 

        it("tabulates the votes", async function () { 
            await Promise.all(sigs.map((sig) => {
                return pTest.tabulateSigned(testProposal, sig);    
            }))
        });

        it("increses block to tabulation end", async function (){
            let lastTabulationBlock = +await testProposal.methods.lastTabulationBlock().call();
            await time.advanceBlockTo(lastTabulationBlock+tabulationBlockDelay+1);
            assert(await web3.eth.getBlockNumber() > +lastTabulationBlock+tabulationBlockDelay, "Wrong block number")
        });

        it("finalizes after tabulation end", async function (){
            receipt = await testProposal.methods.finalize().send({from: web3.eth.defaultAccount});
            expectEvent(receipt, "FinalResult", {result: VOTE_REJECT});
        });

        it("clear after finalization", async function () { 
            await testProposal.methods.clear().send({from: web3.eth.defaultAccount});
        }); 
    });

    describe("test simple quorum reject", function() {
        var sigs = [];
        var testProposal;
        var blockStart;
        var voteBlockEnd;
        it("create proposal by factory", async function () {
            blockStart = await web3.eth.getBlockNumber();
            
            testProposal = await pTest.newProposal(
                MiniMeToken, 
                pTest.ChildDelegation, 
                "0xDA0", 
                tabulationBlockDelay, 
                blockStart, 
                blockEndDelay, 
                QUORUM_SIMPLE
            );
        });

        it("include approve votes", async function () { 
            sigs = []
            let vote = VOTE_APPROVE;
            let approveHash = await testProposal.methods.getVoteHash(vote).call();
            let signatures = await Promise.all(accounts.slice(0,5).map((address) => {
                //in web app should web3.eth.personal.sign(approveHash, address)
                return web3.eth.sign(approveHash, address);    
            }))
            let merkleTree = new MerkleTree(signatures);    
            let merkleRoot = merkleTree.getHexRoot();
            
            let receipt = await testProposal.methods.voteSigned(merkleRoot).send({from: accounts[0]})
            let position = receipt.events.VoteSignatures.returnValues.position;
            for(var i = 0; i < signatures.length; i++) {
                sigs.push ({ 
                    position: position, 
                    vote: vote,
                    signature: signatures[i],
                    proof: merkleTree.getHexProof(signatures[i]),
                    signer: accounts[i]
                })
                
            }
        }); 

        it("include reject votes", async function () { 
            let vote = VOTE_REJECT;
            let approveHash = await testProposal.methods.getVoteHash(vote).call();
            let signatures = await Promise.all(accounts.slice(5).map((address) => {
                //in web app should web3.eth.personal.sign(approveHash, address)
                return web3.eth.sign(approveHash, address);    
            }))
            let merkleTree = new MerkleTree(signatures);    
            let merkleRoot = merkleTree.getHexRoot();
            
            let receipt = await testProposal.methods.voteSigned(merkleRoot).send({from: accounts[0]})
            let position = receipt.events.VoteSignatures.returnValues.position;
            for(var i = 0; i < signatures.length; i++) {
                sigs.push ({ 
                    position: position, 
                    vote: vote,
                    signature: signatures[i],
                    proof: merkleTree.getHexProof(signatures[i]),
                    signer: accounts[5+i]
                })
                
            }
        });
        
        it("increases block number to vote block end", async function () {
            voteBlockEnd = await testProposal.methods.voteBlockEnd().call();
            await time.advanceBlockTo(+voteBlockEnd+1);
            assert(await web3.eth.getBlockNumber() > voteBlockEnd, "Wrong block number")
        }); 

        it("tabulates the votes", async function () { 
            await Promise.all(sigs.map((sig) => {
                return pTest.tabulateSigned(testProposal, sig);    
            }))
        });

        it("increses block to tabulation end", async function (){
            let lastTabulationBlock = +await testProposal.methods.lastTabulationBlock().call();
            await time.advanceBlockTo(lastTabulationBlock+tabulationBlockDelay+1);
            assert(await web3.eth.getBlockNumber() > +lastTabulationBlock+tabulationBlockDelay, "Wrong block number")
        });

        it("finalizes after tabulation end", async function (){
            receipt = await testProposal.methods.finalize().send({from: web3.eth.defaultAccount});
            expectEvent(receipt, "FinalResult", {result: VOTE_REJECT});
        });

        it("clear after finalization", async function () { 
            await testProposal.methods.clear().send({from: web3.eth.defaultAccount});
        }); 
    });

    describe("test simple quorum approve", function() {
        var sigs = [];
        var testProposal;
        var blockStart;
        var voteBlockEnd;
        it("create proposal by factory", async function () {
            blockStart = await web3.eth.getBlockNumber();
            testProposal = await pTest.newProposal(
                MiniMeToken, 
                pTest.ChildDelegation, 
                "0xDA0", 
                tabulationBlockDelay, 
                blockStart, 
                blockEndDelay, 
                QUORUM_SIMPLE
            );
        });

        it("include approve votes", async function () { 
            sigs = []
            let vote = VOTE_APPROVE;
            let approveHash = await testProposal.methods.getVoteHash(vote).call();
            let signatures = await Promise.all(accounts.slice(0,6).map((address) => {
                //in web app should web3.eth.personal.sign(approveHash, address)
                return web3.eth.sign(approveHash, address);    
            }))
            let merkleTree = new MerkleTree(signatures);    
            let merkleRoot = merkleTree.getHexRoot();
            
            let receipt = await testProposal.methods.voteSigned(merkleRoot).send({from: accounts[0]})
            let position = receipt.events.VoteSignatures.returnValues.position;
            for(var i = 0; i < signatures.length; i++) {
                sigs.push ({ 
                    position: position, 
                    vote: vote,
                    signature: signatures[i],
                    proof: merkleTree.getHexProof(signatures[i]),
                    signer: accounts[i]
                })
                
            }
        }); 

        it("include reject votes", async function () { 
            let vote = VOTE_REJECT;
            let approveHash = await testProposal.methods.getVoteHash(vote).call();
            let signatures = await Promise.all(accounts.slice(6).map((address) => {
                //in web app should web3.eth.personal.sign(approveHash, address)
                return web3.eth.sign(approveHash, address);    
            }))
            let merkleTree = new MerkleTree(signatures);    
            let merkleRoot = merkleTree.getHexRoot();
            
            let receipt = await testProposal.methods.voteSigned(merkleRoot).send({from: accounts[0]})
            let position = receipt.events.VoteSignatures.returnValues.position;
            for(var i = 0; i < signatures.length; i++) {
                sigs.push ({ 
                    position: position, 
                    vote: vote,
                    signature: signatures[i],
                    proof: merkleTree.getHexProof(signatures[i]),
                    signer: accounts[6+i]
                })
                
            }
        });
        
        it("increases block number to vote block end", async function () {
            voteBlockEnd = await testProposal.methods.voteBlockEnd().call();
            await time.advanceBlockTo(+voteBlockEnd+1);
            assert(await web3.eth.getBlockNumber() > voteBlockEnd, "Wrong block number")
        }); 

        it("tabulates the votes", async function () { 
            await Promise.all(sigs.map((sig) => {
                return pTest.tabulateSigned(testProposal, sig);    
            }))
        });

        it("increses block to tabulation end", async function (){
            let lastTabulationBlock = +await testProposal.methods.lastTabulationBlock().call();

            await time.advanceBlockTo(lastTabulationBlock+tabulationBlockDelay+1);
            assert(await web3.eth.getBlockNumber() > +lastTabulationBlock+tabulationBlockDelay, "Wrong block number")
        });

        it("finalizes after tabulation end", async function (){
            receipt = await testProposal.methods.finalize().send({from: web3.eth.defaultAccount});
            expectEvent(receipt, "FinalResult", {result: VOTE_APPROVE});
        });

        it("clear after finalization", async function () { 
            await testProposal.methods.clear().send({from: web3.eth.defaultAccount});
        }); 
    });
    
    describe("test delegate precompute", function() {
        var sigs = [];
        var testProposal;
        var blockStart;
        var voteBlockEnd;
        it("create proposal by factory", async function () {
            blockStart = await web3.eth.getBlockNumber();
            testProposal = await pTest.newProposal(
                MiniMeToken,
                pTest.ChildDelegation, 
                "0xDA0", 
                tabulationBlockDelay, 
                blockStart,
                blockEndDelay,
                QUORUM_SIMPLE);
        });

        it("include direct vote", async function () { 
            
            let receipt = await testProposal.methods.voteDirect(VOTE_APPROVE).send({from: accounts[8]});

        });   

        it("increases block number to vote block end", async function () {
            voteBlockEnd = await testProposal.methods.voteBlockEnd().call();
            await time.advanceBlockTo(+voteBlockEnd+1);
            assert(await web3.eth.getBlockNumber() > voteBlockEnd, "Wrong block number")
        }); 

        it("should precompute delegate", async function () {
            let gasBefore = await testProposal.methods.tabulateDelegated(accounts[0], true).estimateGas();
            let call = testProposal.methods.precomputeDelegation(accounts[0],true);
            await call.send({from: accounts[0], gas: await call.estimateGas()+ 10000 });
            let gasAfter = await testProposal.methods.tabulateDelegated(accounts[0], true).estimateGas();
            assert.equal(await testProposal.methods.cachedDelegateOf(accounts[0]).call(),await testProposal.methods.delegateOf(accounts[0]).call(), "Rendered wrong delegate");
            assert(gasAfter < gasBefore, "Didn't reduced gas usage");
            await pTest.tabulateDelegated(testProposal, accounts[0]);
            
        });

        it("increses block to tabulation end", async function (){
            let lastTabulationBlock = +await testProposal.methods.lastTabulationBlock().call();
            await time.advanceBlockTo(lastTabulationBlock+tabulationBlockDelay+1);
            assert(await web3.eth.getBlockNumber() > +lastTabulationBlock+tabulationBlockDelay, "Wrong block number")
        });

        it("finalizes after tabulation end", async function (){
            receipt = await testProposal.methods.finalize().send({from: web3.eth.defaultAccount});
            expectEvent(receipt, "FinalResult", {result: VOTE_APPROVE});
        });

        it("clear after finalization", async function () { 
            await testProposal.methods.clear().send({from: web3.eth.defaultAccount});
        }); 
    })
    
})