const {
  BN,
  time,
  constants,
  expectEvent, 
  expectRevert,
} = require('@openzeppelin/test-helpers');
const MiniMeToken = artifacts.require('MiniMeToken');
const TestStatusNetwork = artifacts.require('TestStatusNetwork');
const ERC20TokenSpec = require('./abstract/erc20tokenspec');

let accounts;
config({
  contracts: {deploy:{
    "MiniMeTokenFactory": {},
    "MiniMeToken": {
      "args":["$MiniMeTokenFactory", constants.ZERO_ADDRESS, "0x0", "Status Test Token", 18, "STT", true],
    },
    "TestStatusNetwork": {
      "deploy": true,
      "args": ["$accounts[0]", "$MiniMeToken"],
      "onDeploy": [
        "await MiniMeToken.methods.changeController(TestStatusNetwork.address).send()",
        "await TestStatusNetwork.methods.setOpen(true).send()",
      ]
    }
  }}
}, (_err, web3_accounts) => {
  accounts = web3_accounts
});

contract("TestStatusNetwork", function() {
  this.timeout(0);
  it("should increase totalSupply in mint", async function() {
    let initialSupply = await MiniMeToken.methods.totalSupply().call();
    await TestStatusNetwork.methods.mint(100).send();
    let result = await MiniMeToken.methods.totalSupply().call();
    assert.equal(+result, +initialSupply+100);
  });

  it("should increase accountBalance in mint", async function() {
    let initialBalance = await MiniMeToken.methods.balanceOf(accounts[0]).call();
    await TestStatusNetwork.methods.mint(100).send({from: accounts[0]});
    let result = await MiniMeToken.methods.balanceOf(accounts[0]).call();
    assert.equal(+result, +initialBalance+100);
  });
  
  it("should burn account supply", async function() {
    let initialBalance = await MiniMeToken.methods.balanceOf(accounts[0]).call();
    await TestStatusNetwork.methods.destroyTokens(accounts[0], initialBalance).send({from: accounts[0]});
    assert.equal(+await MiniMeToken.methods.totalSupply().call(), 0);
    assert.equal(+await MiniMeToken.methods.balanceOf(accounts[0]).call(), 0);
  })
});
