import React from 'react';
import EthAddress from './EthAddress';
import EthValue from './EthValue';
import EthData from './EthData';
import PropTypes from 'prop-types';
import './EthCall.css';

class EthCall extends React.Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        control: PropTypes.bool,
        disabled: PropTypes.bool,
        onChange: PropTypes.func,
        onError: PropTypes.func,
        value: PropTypes.object,
    }

    static defaultProps = {
        control: false,
        disabled: false,
        onError: () => {},
        onChange: () => {},
        value: { value: "0", data: "0x", to: "0x0000000000000000000000000000000000000000"},
        abi: []
    }

    handleChange(name, value) {
        const tx = Object.assign({}, this.props.value);
        tx[name] = value;
        this.props.onChange(tx);
    }
 
    render() {
        const {control, disabled, abi, onError, value} = this.props;
        return (<div className="eth-call">
            <ul>
                <li>
                    <small className="text-secondary">Destination:</small>
                    <EthAddress 
                        control={control} 
                        disabled={disabled} 
                        blockyScale={4} 
                        value={value.to} 
                        onChange={this.handleChange.bind(this, 'to')}
                        onError={onError} />
                </li>
                <li>
                    <small className="text-secondary">Value:</small>
                    <EthValue 
                        control={control} 
                        disabled={disabled} 
                        value={value.value} 
                        onChange={this.handleChange.bind(this, 'value')} 
                        onError={onError} />
                </li>
                <li>
                    <small className="text-secondary">Data:</small>
                    <EthData 
                        control={control} 
                        disabled={disabled} 
                        value={value.data} 
                        onChange={this.handleChange.bind(this, 'data')}
                        abi={abi} 
                        onError={onError} />
                </li>
            </ul>
        </div>)

    }
}

export default EthCall;