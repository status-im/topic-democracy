# Topic Democracy
A liquid democracy of topics with a hierarchy of delegates.

## Core concepts
Topic Democracy enables users to set delegates and vote in proposals, by sending their signature in a specific status.im #channels, volunteers can include all signatures in one transaction near voting period end. 
Proposals are first voted by users and later tabulated, only if an inchain consequence i

### Delegative
Vote influence can be delegated through a hierarchical trust network of specialized delegates.

To delegate is to entrust (a task or responsibility) to another person.
The delegate property enables the “liquid” feature of topic democracy. 
Means that “influence” can easily (but still democratically) flow between accounts.
A delegation is not only the direct delegate, but also the indirect delegates, which easily can withdraw indirect influence.
Delegations can derive childs where a specific delegate can be found and that a default delegate might be used for sub democracies.
A hierarchy of delegations is defined as trust network.

### Vetoable
After a proposal is approved, a cancelation proposal can be approved to cancel the execution.

Even with advanced democratic properties on delegation, a last minute vote could cast undesirable execution by a cheaply bribed/forced superdelegate(s).
- Once a Vote proposal is accepted, anyone can vote in veto proposal.
- Veto process is a totally brand new Proposal, that if Approved causes the cancelation of execution proposal.
- Veto phase gives a second chance of canceling a pending execution proposal.
- To be executed a proposal needs to be Approved in “Vote” phase and rejected/ignored in “Veto” phase.
- Veto uses different delegation.
- Veto could have different voting and quorum rules.

### Extendable and customizable
Sub democracies can implement their own rules and become governed by the same trust network.
- New subsystems can be controlled by a new sub democracy. 
- A sub democracy is a democracy which uses the same trust network. 
- Aggregating new sub democracies to a trust network is permissionless. 
- Common factor between sub/root democracies are the choose of same trust network.
- Completely customizable sub democracy
- Sub democracy use a child delegation with possible custom default delegate.
- Using a common trust network utilize user trusted actors to take decisions, without user having to configure it for each sub democracy 
- Unrelated DAOs can reuse the same trust network at any specialization level to kickstart their delegations, even if they use totally different token/system.


### Ignores low user engagement
A default delegate address is defined, but anyone can change their delegate at anytime. 

Default delegate can be defined as a kickstart curator, for taking actions to unclog approval of needed proposals.
Once most users are engaged with governance, the default delegate would become irrelevant for approval.
Once proven that Default Delegate is unnecessary, a removal can be proposed, or the change of it can be requested.
Sub democracies can set their own default delegate. The parent default delegation would came in priority over the child default delegate. If parent default delegate don’t claims non engaged users influence, child default delegate can claim it.

### Gasless voting
Absolutely free to vote, outsourcing the cost to the execution of proposal.

Anyone can be a volunteer to include merkle root of voters signatures in the proposals.
- A likely volunteer would be proponent, however it would only include approval votes. 
- Volunteering voters could include their signed vote along other user’s vote.
- Voters should wait for volunteer merkle proof response and verify vote inclusion.
Gas intense operations are done in tabulation, using signatures and merkle proofs provided by volunteers or collected from whisper channels. 
The tabulation extends the finalization block at every tabulation. 

## Tabulation methods:

Enforced:
Cannot accumulate votes towards decision, i.e. votes must always be tabulated against winning position. Used for `Simple Quorum Approve/Reprove` gas economy.

Free:
Any vote can be tabulated and is interest of participants or proponent in paying for this processing.

## Proposal Types

### 1. Execution Proposal
- Single Option Approve/Reprove
- Liquid Democracy
- Absolute Quorum
- Default Delegation might enabled for specific topics
- Vetoable

Tabulation method: Free 

### 2. Election Proposal
- Competition Style, most voted win
- Might have multiple winners, list would output in asc order of most voted
- Linked lists build ranking
- Liquid Democracy
- Default delegation is always disabled 

Tabulation method: Free (it's participants or proponent interest in pay for tabulation)

### 3. Crowdsource Proposal
- Multiple Option Approve/Reproval; 
- Custom Options; 
- Simple Quorum.
- Viscous Democracy after first layer
- Default delegation is always disabled 

Users holding SNT can voice their opinion using status API in channel: #democracy-[proposalid]
Options can be suggested without SNT through Status API in channel: #democracy-[proposalid]
Options can be commented on without SNT through Status API in channel #democracy-[proposalId]-[SuggestionDataHash]

Signatures are grathered from Status.im Mailserv
Gas is paid by proponent at execution phase, if inchain actions are needed upon this. 

Tabulation method: 
1. Enforced (Dispute): Cannot accumulate positive votes; or
2. Free


## Running
Requires `geth` command available in $PATH for npm start
 ```
 git clone https://github.com/status-im/topic-democracy.git
 cd topic-democracy
 npm install
 npm test
 npm start
 ```
