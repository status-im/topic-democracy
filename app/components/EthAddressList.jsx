import React from 'react';
import PropTypes from 'prop-types';
import EthAddress from './EthAddress';
import './EthAddressList.css';
import TrashIcon from "./icon/Trash";
const nullAddress = "0x0000000000000000000000000000000000000000"

class EthAddressList extends React.Component {

    static propTypes = {
		className: PropTypes.string,
		values: PropTypes.array,
		defaultValue: PropTypes.array,
		colors: PropTypes.bool,
		blocky: PropTypes.bool,
        allowZero: PropTypes.bool,
		blockySize: PropTypes.number,
		blockyScale: PropTypes.number,
		control: PropTypes.bool,
        disabled: PropTypes.bool,
        allowAdd: PropTypes.bool,
        allowRemove: PropTypes.bool,
        onChange: PropTypes.func,
		onLoad: PropTypes.func
	};

	static defaultProps = {
		className: 'eth-address-list',
        values: [],
		colors: true,
		control: false,
		allowZero: false,
		blocky: true,
		blockySize: 8,
		blockyScale: 4,
        disabled: false,
        allowAdd: true,
        allowRemove: true,
        onChange: () => {},
        onLoad: () => {}
	};

    constructor(props) {
        super(props);
        this.state = { 
            newItem: "",
            addresses: []
        };
    }

    
    setAddress(address, ensReverse, i) {
        const addresses = this.state.addresses.slice(0);
        if(addresses[i] == address){
            return;
        }
        addresses[i]=address;
        this.setState({addresses});
        this.props.onLoad(addresses);
    }

    setValue(value, i) {
        const values = this.props.values.slice(0);
        const addresses = this.state.addresses.slice(0);
        values[i]=value;
        addresses[i]=nullAddress;
        this.setState({addresses});
        this.props.onLoad(addresses);
        this.props.onChange(values);
    }

    newItem(address) {
        const values = this.props.values.slice(0);
        const addresses = this.state.addresses.slice(0);
        values.push(this.state.newItem);
        addresses.push(address);
        this.setState({addresses, newItem: ''});
        this.props.onLoad(addresses);
        this.props.onChange(values);
    }

    removeAddress(i) {
        const values = this.props.values.filter((item, j) => i !== j);
        const addresses = this.state.addresses.filter((item, j) => i !== j);
        this.setState({addresses});
        this.props.onLoad(addresses);
        this.props.onChange(values);
    }


    render() {
        const {newItem} = this.state;
        const {values, control, disabled, allowZero, blocky, blockySize, blockyScale, colors, allowAdd, allowRemove} = this.props;
        var list = values.map(
            (value, index, array) => {
                return(
                    <li className="d-flex" key={index}>
                        <EthAddress
                            control={control}
                            value={value}
                            allowZero={allowZero}
                            disabled={disabled}
                            blocky={blocky}
                            blockySize={blockySize}
                            blockyScale={blockyScale}
                            colors={colors}  
                            toolBarActions={
                                (control && allowRemove) ? [
                                    {
                                        action: (event) => { this.removeAddress(index)},
                                        text: (<><TrashIcon/> Remove</>) 
                                    }
                                ] : [] }
                            onChange={(event) => {
                                this.setValue(event.target.value, index);
                            }}
                            onLoad={(address, ensReverse) => {
                                this.setAddress(address, ensReverse, index);
                            }}
                            onError={(error) => {
                                this.props.onError(error);
                            }}
                             />
                    </li>
                );
                }
        );
        return (
            <ul className="eth-address-list">
                {list}
                {control && !disabled && allowAdd && <li className="d-flex new-item">
                    <EthAddress
                        control={true}
                        enableToolBar={false}
                        ENSReverseLookup={false}
                        value={newItem}
                        allowZero={allowZero}
                        blocky={blocky}
                        blockySize={blockySize}
                        blockyScale={blockyScale}
                        colors={colors}
                        onChange={(event) => {this.setState({newItem: event.target.value})}}  
                        onLoad={async (address, ensReverse) => {
                            if(address != nullAddress){
                                this.newItem(address);
                            }
                        }} />
                    </li>}
            </ul>
        );
    }



}

export default EthAddressList;