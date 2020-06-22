# Topic Democracy

A liquid democracy of topics with a hierarchy of delegates.

## Introduction

### Properties

#### Direct Democracy

Every address that votes goes into direct democracy mode, otherwise it would go to delegative democracy mode, and it's influence passed to the first delegate that voted.

#### Delegative Democracy

Vote influence can be delegated through a hierarchical trust network of specialized delegates.

To delegate is to entrust (a task or responsibility) to another person.
The delegate property enables the “liquid” feature of topic democracy. 
Means that “influence” can easily (but still democratically) flow between accounts.
A delegation is not only the direct delegate, but also the indirect delegates, which easily can withdraw indirect influence.
Delegations can derive childs where a specific delegate can be found and that a default delegate might be used for sub democracies.
A hierarchy of delegations is defined as trust network.

##### Ignores low user engagement
A default delegate address is defined, but anyone can change their delegate at anytime. 

Default delegate can be defined as a kickstart curator, for taking actions to unclog approval of needed proposals.
Once most users are engaged with governance, the default delegate would become irrelevant for approval.
Once proven that Default Delegate is unnecessary, a removal can be proposed, or the change of it can be requested.
Sub democracies can set their own default delegate. The parent default delegation would came in priority over the child default delegate. If parent default delegate don’t claims non engaged users influence, child default delegate can claim it.

#### Veto safety
After a proposal is approved, a cancelation proposal can be approved to cancel the execution.

Even with advanced democratic properties on delegation, a last minute vote could cast undesirable execution by a cheaply bribed/forced superdelegate(s).
- Once a Vote proposal is accepted, anyone can vote in veto proposal.
- Veto process is a totally brand new Proposal, that if Approved causes the cancelation of execution proposal.
- Veto phase gives a second chance of canceling a pending execution proposal.
- To be executed a proposal needs to be Approved in “Vote” phase and rejected/ignored in “Veto” phase.
- Veto uses different delegation.
- Veto could have different voting and quorum rules.

#### Extendable
Sub democracies can implement their own rules and become governed by the same trust network.
- New subsystems can be controlled by a new sub democracy. 
- A sub democracy is a democracy which uses the same trust network. 
- Aggregating new sub democracies to a trust network is permissionless. 
- Common factor between sub/root democracies are the choose of same trust network.
- Completely customizable sub democracy
- Sub democracy use a child delegation with possible custom default delegate.
- Using a common trust network utilize user trusted actors to take decisions, without user having to configure it for each sub democracy 
- Unrelated DAOs can reuse the same trust network at any specialization level to kickstart their delegations, even if they use totally different token/system.

### Methodology

#### Gasless voting

Absolutely free to vote, outsourcing the cost to the execution of proposal.

Topic Democracy enables users to set delegates and vote in proposals, by sending their signature in a specific status.im #channels, volunteers can include all signatures in one transaction near voting period end. 
Proposals are first voted by users and later tabulated, only if an inchain consequence is required the proposal is processed in chain. 
The processing of proposals is done by stake, which can be proven as wrong to transfer the stake to prover. (TBD)

Anyone can be a volunteer to include merkle root of voters signatures in the proposals.
- A likely volunteer would be proponent, however it would only include approval votes. 
- Volunteering voters could include their signed vote along other user’s vote.
- Voters should wait for volunteer merkle proof response and verify vote inclusion.
Gas intense operations are done in tabulation, using signatures and merkle proofs provided by volunteers or collected from whisper channels. 
The tabulation extends the finalization block at every tabulation. 

#### Delegations

Every address have a delegate, which by default is address `0x0000000000000000000000000000000000000000` (default delegate). Circular delegations are possible.
For root delegation, the default delegate (`0x0000000000000000000000000000000000000000`) always delegates to `0x0000000000000000000000000000000000000000`, but for sub delegations it may delegate to another address (defined by the sub delegation), which becomes the default delegatee of that sub democracy.  
When an address defines the delegate to itself, it means an delegation endpoint (equivalent to "not having a delegate"), but in practice is a ciruclar delegation to itself.


### Gasless voting


### Proposal Types

Initially it would be implemented 3 types of proposals:
- Execution: absolute majority quorum with delegation, only touchs blockchain if approval is possible
- Elections: builds a ranking of most voted, inchain or offchain
- Polls: offchain/chat only

### Topic Polls
Topic polls are like Proposals, however they exists only in chat layer. These polls don't cause any inchain consequences therefore no reason to process this inside blockchain - but technically they could if needed.

Topic polls happen inside public chats, anyone would be able to start or vote a poll, just like in Twitter. 
Opening a poll is like sending a message questioning, and voting is like sending a message answering. "My vote for \<proposal\> is \<vote\>" 
The voting uses delegatable SNT as carbon vote. Delegation is read from blockchain or through a signature. 
Works with EIP1581 (separation of wallet and chat key) because wallet can delegate to any chat key.

Anyone can retrieve the messages from history nodes and calculate by themselves, volunteers can cast the results with a merkle tree of voters with data available in IPFS/Swarm.

A different delegate can be defined for each chat room. 
Chat rooms can inherit delegates from upper level room, 
e.g. 
root topic = #status
sub topic = #status-design  

## Topic Democracy is not an ICO
Topic Democracy could be used to control a contract that executes withdraws, however it won't be truly fair/safe, specially if the voting token is generated proportionally to the deposits (like in ICOs). 
For that cases the contract should ensure that whoever contributed, can veto their own contribution against a "majority attack". This is an important safety aspect of ICOs (and any influence minting based on contributed funds to be used by the governance), otherwise, during the ICO period, a whale could simply make the majority of contribution, and right after this period execute a proposal of 100% withdraw of everyone else's contribution. 
A simple way to implement an ICO for Topic Democracy would be ICO contract, the genesis would mint influence to this contract (and others, such as for SGT system), and they would sell tokens during the Contribution Period, and after that would buy back giving the remaining funds back (and burning the token).
> This does not concern for SNT, as the Contribution period ended, which was conducted with blind limiting on the contributions (and its current price in ETH is way larger then the remaining funds in ETH), however Topic Democracy is also being designed to allow communities to build their own governances inside Status, so this is still relevant for Topic Democracy.  
 

### Blockers
- Extensions pre-v1 are limited
- Extensions in v1 are not implemented
- Dapps cannot access chat key or broadcast to status network.

## Running
Requires https://github.com/creationix/nvm
 ```
 nvm install v10.15
 nvm use v10.15
 npm install -g embark
 git clone https://github.com/status-im/topic-democracy.git
 cd topic-democracy
 npm install
 embark test
 embark run
 ```
