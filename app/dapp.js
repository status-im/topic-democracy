import React from 'react';
import ReactDOM from 'react-dom';
import EmbarkJS from 'Embark/EmbarkJS';
import Delegation from 'Embark/contracts/Delegation';
import { HashRouter, Route, Redirect, Link } from "react-router-dom";

import './dapp.css';
import Delegation from './components/Delegation';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.handleSelect = this.handleSelect.bind(this);

    this.state = {
      error: null,
      account: null
    };
  }

  componentDidMount() {
    EmbarkJS.onReady((err) => {
        if (err) {
            return this.setState({ error: err.message || err });
        }
        this.setState({ account: web3.eth.defaultAccount, blockchainEnabled: true })
    });

}

  render() {
    const { blockchainEnabled, account } = this.state;
    if (!blockchainEnabled) {
        return (
            <div>Waiting for blockchain.</div>
        )
    }

    if (!defaultAccount) {
        return (
            <div>Waiting for account.</div>
        )
    }
    return (
      <HashRouter hashType="noslash">
        <Route exact path="/:address?" render={(match) => (
          <Delegation account={account} Delegation={new EmbarkJS.Blockchain.Contract({ abi: Delegation._jsonInterface, address: match.param.address }) } />
        )} />
      </HashRouter>
    )
  }
}

ReactDOM.render(<App></App>, document.getElementById('app'));
