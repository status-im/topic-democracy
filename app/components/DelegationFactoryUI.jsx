import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import DelegationFactory  from 'Embark/contracts/DelegationFactory';
import EthAddress from './EthAddress';
import { FormLabel, Paper, Grid } from '@material-ui/core';
import TransactionSendButton from './TransactionSendButton';

const styles = theme => ({
    paper: {
      marginTop: theme.spacing.unit * 3,
      marginBottom: theme.spacing.unit * 3,
      padding: theme.spacing.unit * 2,
      [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
        marginTop: theme.spacing.unit * 6,
        marginBottom: theme.spacing.unit * 6,
        padding: theme.spacing.unit * 3,
      },
    },
  });


const zeroIfNull = (address) => {
    return address ? address : "0x0000000000000000000000000000000000000000"
}


class DelegationFactoryUI extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            parent: null,
            controller: props.account,
            defaultDelegate: null
        };
    }

    render() {
        const { classes, account } = this.props;
        const { parent, controller, defaultDelegate } = this.state;
        console.log(parent, controller, defaultDelegate);
        return (
            <Paper className={classes.paper}>
                <Grid container spacing={16}>
                    <Grid item>
                        <FormLabel component="legend">Controller</FormLabel>
                        <EthAddress defaultValue={account} control={true} onChange={(controller) => this.setState({controller})}  />
                    </Grid>
                    <Grid item>
                        <FormLabel component="legend">Default Delegate</FormLabel>
                        <EthAddress control={true} onChange={(defaultDelegate) => this.setState({defaultDelegate})}  />
                    </Grid>
                    <Grid item>
                        <FormLabel component="legend">Parent Delegation</FormLabel>
                        <EthAddress control={true} onChange={(parent) => this.setState({parent})} />
                    </Grid> 
                    <Grid item>
                        <TransactionSendButton 
                            sendTransaction={(!controller && !defaultDelegate) ?
                                DelegationFactory.methods.createDelegation(parent) :
                                DelegationFactory.methods.createDelegation(
                                    parent,
                                    controller,
                                    defaultDelegate
                                    )}
                            account={account}
                            text="Deploy Delegation"
                            onSend={(txHash) => {console.log("txHash",txHash)}}
                            onResult={(result) => {console.log("result",result.events)}}
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
