import EmbarkJS from './embarkArtifacts/EmbarkJS';
import Delegation from './embarkArtifacts/contracts/Delegation';
import DelegationFactory from './embarkArtifacts/contracts/DelegationFactory';

class DelegationModel {

    static async deploy(parent, controller, defaultDelegate, from) {
        var parentAddress;
        if(parent) {
            if(parent instanceof DelegationModel) {
                parentAddress = parent.contract._address;
            } else if (parent instanceof EmbarkJS.Blockchain.Contract){
                parentAddress = parent._address;
            } else {
                parentAddress = parent;
            }            
        }
        let result = await DelegationFactory.methods.createDelegation(parentAddress, controller, defaultDelegate).send({from: from});
        return new DelegationModel(result.events.InstanceCreated.instance);
    }

    constructor(address) {
        this.contract = new EmbarkJS.Blockchain.Contract({ abi: Delegation._jsonInterface, address: address});
    }

    delegate(from, to) {
        console.log(this.contract.options.address +".delegate("+to+").send({from: " + from + "})");
        return this.contract.methods.delegate(to).send({from: from});
    }
    
    async createSubDelegationAsync(controller, defaultDelegate, from) {
        let result = await DelegationFactory.methods.createDelegation(this.contract._address,controller,defaultDelegate).send({from: from});
        return new DelegationModel(result.events.InstanceCreated.instance);
    }

    async getParent() {
        if(this.parent == null) {
            parentAddress = await this.contract.methods.parentDelegation().call();
            this.parent = new DelegationModel(parentAddress);
        }
        return this.parent;
    }

    delegatedTo(who) {
        return this.contract.methods.delegatedTo(who).call()
    }

    delegatedToAt(who, block) {
        return this.contract.methods.delegatedToAt(who, block).call()
    }

    async delegationOf(influenceSrc) {
        let delegation = [];
        var curDelegate = influenceSrc;
        do {
            delegation.push(curDelegate)
            curDelegate = await this.delegatedTo(curDelegate).call();
        }while(!delegation.includes(curDelegate));
        return delegation;
    }
    
}

export default DelegationModel;