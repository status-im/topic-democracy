import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import DelegationFactory  from '../../embarkArtifacts/contracts/DelegationFactory';
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
            controller: props.account,
            parent: "0x0000000000000000000000000000000000000000",
            defaultDelegate: "0x0000000000000000000000000000000000000000",
            deployedAddress: null
        };
    }

    render() {
        const { classes, account } = this.props;
        const { parent, controller, defaultDelegate, deployedAddress} = this.state;
        if(deployedAddress) {
            return (<Redirect to={'/'+deployedAddress} />)
        }
        console.log(parent, controller, defaultDelegate);
        return (
            <Paper className={classes.paper}>
                <Grid container spacing={16}>
                    <Grid item>
                        <FormLabel component="legend">Controller</FormLabel>
                        <EthAddress allowZero={true} defaultValue={account} value={controller} control={true} onChange={(e) => this.setState({controller: e.target.value })}  />
                    </Grid>
                    <Grid item>
                        <FormLabel component="legend">Default Delegate</FormLabel>
                        <EthAddress allowZero={true} control={true} value={defaultDelegate} onChange={(e) => this.setState({defaultDelegate: e.target.value })}  />
                    </Grid>
                    <Grid item>
                        <FormLabel component="legend">Parent Delegation</FormLabel>
                        <EthAddress allowZero={true} control={true} value={parent} onChange={(e) => this.setState({parent: e.target.value })} />
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
                            onResult={(result) => {this.setState({deployedAddress: result.events.InstanceCreated.returnValues.instance})}}
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
