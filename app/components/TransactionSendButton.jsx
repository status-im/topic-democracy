import React from 'react';
import PropTypes from 'prop-types';
import { Button, CircularProgress } from '@material-ui/core';

class TransactionSendButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            txWaiting: false
        };
    }

    static propTypes = {
        sendTransaction: PropTypes.object.isRequired,
        onSend: PropTypes.func,
        onReceipt: PropTypes.func,
        onResult: PropTypes.func,
        onError: PropTypes.func,
        account: PropTypes.string,
        text: PropTypes.any,
        icon: PropTypes.any,
        size: PropTypes.string,
        variant: PropTypes.string,
        disabled: PropTypes.bool
    }

    static defaultProps = {
        account: null,
        className: 'tx-send',
        variant: 'text',
        size: 'small',
        icon: (<div className='.icon'/>),
        text: ('Send Transaction'),
        onSend: () => {},
        onResult: () => {},
        onReceipt: () => {},
        onError: () => {},
        disabled: false
    }

    submitTransaction(e) {
        e.preventDefault();
        const { sendTransaction, account, onSend, onReceipt, onResult, onError } = this.props;
        try{
            sendTransaction.estimateGas({ from: account }).then((estimatedGas) => {
                this.setState({ txWaiting: true });
                sendTransaction.send({
                    from: account,
                    gasLimit: estimatedGas
                }).once('transactionHash', (txHash) => {
                    onSend(txHash);
                }).once('receipt', (receipt) =>{
                    onReceipt(receipt);
                }).then((result) => {
                    onResult(result);
                }).catch((error) => {
                    onError(error);
                }).finally(() => {
                    this.setState({ txWaiting: false });
                });
            }).catch((error) => {
                onError(error);
            });
        } catch(error) {
            onError(error);
        }
        
    }

    render() {
        const { txWaiting } = this.state;
        const { size, variant, account, text, icon, disabled, className } = this.props;
        return (
            <Button
                className={className}
                type='submit' 
                size={size}
                variant={variant} 
                disabled={(disabled || txWaiting || !account)}
                onClick={(e) => this.submitTransaction(e)}>
                {text}
                {txWaiting ? 
                    <CircularProgress />
                    :
                    icon }
            </Button>
        )
    }
}

export default TransactionSendButton;