import React from 'react';
import ReactDOM from 'react-dom';
import EmbarkJS from 'Embark/EmbarkJS';
import Delegation from 'Embark/contracts/Delegation';
import { HashRouter, Route, Redirect, Link } from "react-router-dom";

import './TopicDemocracy.css';
import DelegationUI from './components/DelegationUI';
import DelegationFactoryUI from './components/DelegationFactoryUI';
import { CssBaseline, AppBar, Toolbar, Typography, withStyles } from '@material-ui/core';

const styles = theme => ({
  appBar: {
    position: 'relative',
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 2 * 2)]: {
      width: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
})

class TopicDemocracy extends React.Component {

  constructor(props) {
    super(props);

    //this.handleSelect = this.handleSelect.bind(this);

    this.state = {
      error: null,
      defaultAccount: null
    };
  }

  componentDidMount() {
    EmbarkJS.onReady((err) => {
        if (err) {
            return this.setState({ error: err.message || err });
        }
        this.setState({ defaultAccount: web3.eth.defaultAccount, blockchainEnabled: true })
    });

}

  render() {
    const { classes } = this.props;
    const { blockchainEnabled, defaultAccount } = this.state;
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
        <CssBaseline />
        <AppBar position="absolute" color="default" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" color="inherit" noWrap>
              Topic Democracy
            </Typography>
          </Toolbar>
        </AppBar>
        <main className={classes.layout}>
          <Route exact path="/" render={(match) => (
            <DelegationFactoryUI  account={defaultAccount} />
          )} />
          <Route path="/:address" render={(match) => (
            <DelegationUI account={defaultAccount} Delegation={new EmbarkJS.Blockchain.Contract({ abi: Delegation._jsonInterface, address: match.param.address }) } />
          )} />
        </main>
      </HashRouter>
    )
  }
}

export default withStyles(styles)(TopicDemocracy);
