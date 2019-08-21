import React from 'react';
import PropTypes from 'prop-types';
import { HashLoader } from 'react-spinners';

class EthTxSubmit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            txWaiting: false
        };
    }

    static propTypes = {
        value: PropTypes.object.isRequired,
        onSubmission: PropTypes.func,
        onReceipt: PropTypes.func,
        onResult: PropTypes.func,
        onError: PropTypes.func,
        account: PropTypes.string,
        text: PropTypes.any,
        icon: PropTypes.any,
        size: PropTypes.string,
        animation: PropTypes.string,
        variant: PropTypes.string,
        disabled: PropTypes.bool

    }

    static defaultProps = {
        account: null,
        variant: 'primary',
        size: 'sm',
        icon: (<div className='.icon'/>),
        text: ('Send Transaction'),
        onSubmission: () => {},
        onResult: () => {},
        onReceipt: () => {},
        onError: () => {},
        disabled: false
    }

    submitTransaction(e) {
        e.preventDefault();
        const { value, account, onSubmission, onReceipt, onResult, onError } = this.props;
        const isTxObj = !value.estimateGas || !value.send;
        try{
            (isTxObj ? web3.eth.estimateGas(value) : value.estimateGas()).then((estimatedGas) => {
                this.setState({ txWaiting: true });
                (isTxObj ? web3.eth.sendTransaction({...value, gas: estimatedGas}) : value.send({ gasLimit: estimatedGas })).once('transactionHash', (txHash) => {
                    onSubmission(txHash);
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
        const { size, variant, text, icon, disabled } = this.props;
        return (
            <button
                type='submit' 
                size={size}
                variant={variant} 
                disabled={(disabled || txWaiting)}
                onClick={(e) => this.submitTransaction(e)}>
                {text}
                {txWaiting ? 
                    <HashLoader sizeUnit={"px"} size={15} loadig={true} />
                    :
                    icon }
            </button>
        )
    }
}

export default EthTxSubmit;