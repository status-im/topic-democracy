const utils = require("../utils/testUtils")

const DelegationFactory = artifacts.require('DelegationFactory');
const DelegationBase = artifacts.require('DelegationBase');

let accounts;
var defaultDelegateSub;
var defaultDelegateSubSub;
config({
    contracts: {deploy:{
        "DelegationBase": {
            "args": [ utils.zeroAddress ]
        },
        "DelegationInit": {
        },
        "DelegationFactory": {
            "args": ["$DelegationBase", "$DelegationInit", utils.zeroAddress]
        }

      }}
  }, (_err, web3_accounts) => {
    accounts = web3_accounts
    defaultDelegateSub = accounts[5];
    defaultDelegateSubSub = accounts[6]
  });


contract("DelegationBase", function() {
    this.timeout(0);
;
    var RootDelegation;
    var SubDelegation;
    var SubSubDelegation;
    it("creates root delegation", async function () {
        let result = await DelegationFactory.methods.createDelegation(utils.zeroAddress).send();
        RootDelegation = new web3.eth.Contract(DelegationBase._jsonInterface, result.events.InstanceCreated.returnValues[0]);
        result = await RootDelegation.methods.delegatedTo(accounts[0]).call()
        assert.equal(result, utils.zeroAddress)
        result = await RootDelegation.methods.delegatedTo(utils.zeroAddress).call()
        assert.equal(result, utils.zeroAddress)    
    })

    it("creates first sub delegation", async function () {
        console.log(RootDelegation._address,defaultDelegateSub,defaultDelegateSub)
        let result = await DelegationFactory.methods.createDelegation(RootDelegation._address,defaultDelegateSub,defaultDelegateSub).send();
        SubDelegation = new web3.eth.Contract(DelegationBase._jsonInterface, result.events.InstanceCreated.returnValues[0]);
        result = await SubDelegation.methods.delegatedTo(utils.zeroAddress).call()
        assert.equal(result, defaultDelegateSub)          
    })

    it("starts with default delegate", async function () {
        let result = await SubDelegation.methods.delegatedTo(accounts[0]).call()
        assert.equal(result, utils.zeroAddress)
    })

    it("a0 delegates to a1", async function () {
        result = await SubDelegation.methods.delegate(accounts[1]).send({from: accounts[0]})
        assert.equal(result.events.Delegate.returnValues.who, accounts[0])
        assert.equal(result.events.Delegate.returnValues.to, accounts[1])
        result = await SubDelegation.methods.delegatedTo(accounts[0]).call()
        assert.equal(result, accounts[1])
    })

    it("a1 delegate to a2", async function () {
        result = await SubDelegation.methods.delegate(accounts[2]).send({from: accounts[1]})
        assert.equal(result.events.Delegate.returnValues.who, accounts[1])
        assert.equal(result.events.Delegate.returnValues.to, accounts[2])
        result = await SubDelegation.methods.delegatedTo(accounts[1]).call()
        assert.equal(result, accounts[2]) 
    })


    it("a2 delegate to a3", async function () {
        result = await SubDelegation.methods.delegate(accounts[3]).send({from: accounts[2]})
        assert.equal(result.events.Delegate.returnValues.who, accounts[2])
        assert.equal(result.events.Delegate.returnValues.to, accounts[3])
        result = await SubDelegation.methods.delegatedTo(accounts[2]).call()
        assert.equal(result, accounts[3])
    })    


    it("creates child delegation", async function () {
        let result = await DelegationFactory.methods.createDelegation(SubDelegation._address, defaultDelegateSubSub, defaultDelegateSubSub).send();
        SubSubDelegation = new web3.eth.Contract(DelegationBase._jsonInterface, result.events.InstanceCreated.returnValues[0]);
    })

    it("Child Delegate to Default", async function () {
        result = await SubSubDelegation.methods.delegatedTo(accounts[2]).call()
        assert.equal(result, accounts[3])
    })    

    it("Child a2 delegate to a4", async function () {
        result = await SubSubDelegation.methods.delegate(accounts[4]).send({from: accounts[2]})
        assert.equal(result.events.Delegate.returnValues.who, accounts[2])
        assert.equal(result.events.Delegate.returnValues.to, accounts[4])
        result = await SubSubDelegation.methods.delegatedTo(accounts[2]).call()
        assert.equal(result, accounts[4])
    })    

    it("default delegate should be able to delegate", async function () {
        result = await SubSubDelegation.methods.delegate(accounts[6]).send({from: defaultDelegateSub})
        assert.equal(result.events.Delegate.returnValues.who, defaultDelegateSub)
        assert.equal(result.events.Delegate.returnValues.to, accounts[6])
        result = await SubSubDelegation.methods.delegatedTo(defaultDelegateSub).call()
        assert.equal(result, accounts[6])

    })   
})