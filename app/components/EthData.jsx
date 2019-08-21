import React from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Dropdown from 'react-dropdown';
import "react-tabs/style/react-tabs.css";
import HexData from './HexData';
import EthAddress from './EthAddress';
import EthAddressList from './EthAddressList';
import './EthData.css';


class EthData extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            decoded: this.decodeValue(props.value, props.abi),
            values: [] 
        };
    }

    static propTypes = {
        control: PropTypes.bool,
        disabled: PropTypes.bool,
        onChange: PropTypes.func,
        onError: PropTypes.func,
        value: PropTypes.string,
        abi: PropTypes.array
    }

    static defaultProps = {
        onChange: ()=>{},
        onError: ()=>{},
        control: false,
        value: "0x",
        abi: []
    }
    componentDidUpdate(prevProps, prevState) {
        if(prevProps.value != this.props.value || prevProps.abi != this.props.abi) {
            this.setState({decoded: this.decodeValue(this.props.value, this.props.abi)})
        }
    }
    
    decodeValue(value, abi) {
        value = value.replace("0x","");
        const sig = value.substr(0, 8);
        const arg = value.substr(8);
        const methods = this.processABI(abi);
        const method = this.findMethod(methods, sig);
        const params = this.decodeArgs(method, arg)
        return {sig, arg, methods, method, params}
    }

    processABI(abi){
        if(!abi) return;
        var methods = [];
        try {
            methods = abi.filter(method => method.type == 'function' && !method.constant).map((method) => {
                method.value = web3.eth.abi.encodeFunctionSignature(method).replace("0x","");
                method.label = method.name;  
                return method;
            });
        } catch(e) {
            this.props.onError(e);
        }
        return methods;
    }

    findMethod(methods, sig) {
        for(var i = 0; i < methods.length; i++) {
            if(methods[i].value == sig){
                return methods[i];
            }
        }
        return null;
    }

    decodeArgs(method, arg) {
        var params = [];
        var decoded;
        try {
            decoded = web3.eth.abi.decodeParameters(method.inputs.map((v) => {return(v.type)}), arg);
        } catch(e) {
            decoded = method.inputs.map((input) => {
                
                const type = input.type;
                var defVal = "";
                if(type.startsWith("uint") || type.startsWith("int")){
                    defVal = "0";
                } else {
                    switch(type) {
                        case "address": 
                            defVal = "0x0000000000000000000000000000000000000000";
                            break;
                        case "bytes":
                            defVal = "0x";
                            break;            
                        default: 
                            defVal = "";
                            break;
                    }
                }
                return defVal;
            });
            this.props.onError(e);
        } 
        for(var i = 0; i < method.inputs.length; i++) {
            params[i] = decoded[i];
        }

        return params;
    }
    
    onUpdateMethod(method) {
        method = this.state.decoded.methods.filter(element => {
            return(element.value == method.value)
        })[0]
        this.setState({values:[]});
        this.fireChange(method, this.decodeArgs(method, this.state.decoded.arg))
        
    }

    onUpdateInput(i, type, event){
        
        var value = (event.target ? event.target.value : event);
        try{
            var params = Object.assign([], this.state.decoded.params);
            params[i] = value;
            this.fireChange(this.state.decoded.method, params)
        }catch(error){
            this.props.onError(error)
        }

    }

    fireChange(method, params,){
        console.log("fireChange", method,params)
        var encoded = "";
        try{
            encoded = web3.eth.abi.encodeParameters(method.inputs.map((v) => {return(v.type)}), params);
        }catch(error){
            this.props.onError(error);
        }finally{
            const value = "0x"+(method.value + encoded).replace("0x","");
            if(this.props.value != value){
                this.props.onChange(value, {method, params} )
            }
            
        }
        
    }


    onChange(i, type, event){
        const values = Object.assign([], this.state.values);
        values[i] = event.target ? event.target.value : event;
        if(type == 'bytes') {
           this.onUpdateInput(i, type, event);
        }
        this.setState({values});
    }

    
    render() {//onChange={this.onUpdateInput.bind(this,i, v.type)} 
        console.log("render", this.state)
        const { control, disabled, abi } = this.props; 
        const { sig, arg, methods, method, params } = this.state.decoded;
        const values = this.state.values;
        return (
            <div className="eth-calldata">
                <Tabs>
                    <TabList>
                        <Tab>ABI form</Tab>
                        <Tab>Hex editor</Tab>
                        <Tab>Options</Tab>
                    </TabList>
                    <TabPanel>
                        <Dropdown disabled={!control || disabled} options={methods} onChange={(method) => this.onUpdateMethod(method)} value={sig} placeholder="Select method"/>
                        <ul>
                        {method && method.inputs.map((v, i) => {
                            const value = params ? params[i] : "";
                            var display;
                            switch (v.type) {
                                case "address[]": 
                                    display = (<EthAddressList onLoad={this.onUpdateInput.bind(this,i,v.type)} onChange={(event) => this.onChange(i, v.type, event)} values={values[i] || value || []} control={control} disabled={disabled} />)
                                    break;
                                case "address": 
                                    display = (<EthAddress onLoad={this.onUpdateInput.bind(this,i,v.type)} onChange={(event) => this.onChange(i, v.type, event)} value={values[i] || value || ""} control={control} disabled={disabled} />)
                                    break;
                                case "uint256":
                                    display = (<input type="number" onChange={this.onUpdateInput.bind(this,i,v.type)} value={value} disabled={disabled} />)
                                    break;
                                case "string":
                                    display = (<input type="text" onChange={this.onUpdateInput.bind(this,i,v.type)} value={value} disabled={disabled} />)
                                    break;
                                case "bytes":
                                    display = (<textarea onChange={(event) => this.onChange(i, v.type, event)} value={values[i] || value || ""}  disabled={disabled} />)
                                    break;
                                default:
                                    display = (<input type="number" onChange={this.onUpdateInput.bind(this,i,v.type)} value={value} disabled={disabled} />)
                                    break;
                            }
                            return(<li key={i}><small>{v.name} ({v.type}): </small>{display}</li>)
                        })}
                        </ul>
                    </TabPanel>
                    <TabPanel>
                        {sig && <div className="eth-sig"><div className="sig-head">[sig]:</div><HexData control={control} disabled={disabled} buffer={Buffer.from(sig, "hex")} rowLength={6} setLength={6} nohead={true} /></div>}
                        {arg && <HexData control={control} disabled={disabled} buffer={Buffer.from(arg, "hex")} rowLength={32} setLength={4} />} 
                    </TabPanel>
                    <TabPanel>
                        <h2>Set ABI</h2>
                        <textarea
                            value={JSON.stringify(abi)}
                            placeholder="[]"
                            onChange={(event) => {
                                var abi = [];
                                try{
                                    abi = JSON.parse(event.target.value);  
                                }catch(e) {
                                    this.props.onError(e);
                                } finally {
                                    this.setABI(abi);
                                }
                            }} /> 
                    </TabPanel>
                </Tabs>
            </div>
        )
    }
}

export default EthData;