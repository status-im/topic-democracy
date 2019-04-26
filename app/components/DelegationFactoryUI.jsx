import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import DelegationFactory  from 'Embark/contracts/DelegationFactory';
import EthAddress from './EthAddress';
import { FormLabel, Paper, Grid } from '@material-ui/core';
import TransactionSendButton from './TransactionSendButton';

const styles = theme => ({
  root: {
    display: 'flex',
  }
});

const zeroIfNull = (address) => {
    return address ? address : "0x0000000000000000000000000000000000000000"
}

const sendTransaction = (parent, controller, defaultDelegate) => {
    try {
        return (!controller && !defaultDelegate) ?
            DelegationFactory.methods.createDelegation(zeroIfNull(parent)) :
            DelegationFactory.methods.createDelegation(
                zeroIfNull(parent),
                zeroIfNull(controller),
                zeroIfNull(defaultDelegate)
                )
    } catch(e) {
        return null;
    }
    
}

class DelegationFactoryUI extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            parent: null,
            controller: null,
            defaultDelegate: null
        };
    }

    render() {
        const { classes, account } = this.props;
        const { parent, controller, defaultDelegate } = this.state;
        const tx = sendTransaction(parent,controller,defaultDelegate);
        return (
            <Paper>
                <Grid container spacing={24}>
                    <Grid item xs={12} sm={6}>
                        <FormLabel component="legend">Parent Delegation</FormLabel>
                        <EthAddress control={true} onChange={(parent) => this.setState({parent})} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormLabel component="legend">Controller</FormLabel>
                        <EthAddress defaultValue={account} control={true} onChange={(controller) => this.setState({controller})}  />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormLabel component="legend">Default Delegate</FormLabel>
                        <EthAddress control={true} onChange={(defaultDelegate) => this.setState({defaultDelegate})}  />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                
                    <TransactionSendButton 
                        sendTransaction={tx}
                        disabled={!tx}
                        account={account}
                        onSend={(txHash) => {console.log("txHash",txHash)}}
                        onResult={(result) => {console.log("result",result)}}
                        onReceipt={(receipt) => {console.log("receipt",receipt)}}
                        onError={(error) => {console.log("error",error)}}
                    />
                    </Grid>
                    
                </Grid>

                
            </Paper>
        );
    }
}

DelegationFactoryUI.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(DelegationFactoryUI);
