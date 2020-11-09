import EmbarkJS from '../../embarkArtifacts/embarkjs';
import React from 'react';
import PropTypes from 'prop-types';
import Blockies from 'react-blockies';
import copy from 'copy-to-clipboard';
import './EthAddress.css';
import ClipIcon from "./icon/Clip";
import MoreIcon from "./icon/More";
import { HashLoader } from 'react-spinners';

const nullAddress = "0x0000000000000000000000000000000000000000"
class EthAddress extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		address: PropTypes.string,
		defaultValue: PropTypes.string,
		colors: PropTypes.bool,
		blocky: PropTypes.bool,
		blockySize: PropTypes.number,
		blockyScale: PropTypes.number,
		control: PropTypes.bool,
		disabled: PropTypes.bool,
		onChange: PropTypes.func,
		onLoad: PropTypes.func,
		onError: PropTypes.func,
		toolBarActions: PropTypes.arrayOf(PropTypes.object)
	};

	static defaultProps = {
		className: 'eth-address',
		value: "",
		defaultValue: "",
		colors: true,
		control: true,
		allowZero: true,
		blocky: true,
		blockySize: 8,
		blockyScale: 4,
		disabled: false,
		onChange: () => { },
		onLoad: () => { },
		onError: () => { },
		enableToolBar: true,
		ENSReverseLookup: true,
		toolBarActions: []
	};

	constructor(props) {
		super(props);
		this.controlRef = React.createRef();
		this.ref = React.createRef();
		this.state = {
			ensLookup: null,
			loaded: false,
			validAddress: false,
			address: null,
			acceptedOutput: false,
			ensReverse: null,
			menuVisible: false 
		};
	}


	componentDidMount() {
		this.setValue(this.props.value || this.props.defaultValue);
		document.addEventListener("mousedown", this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener("mousedown", this.handleClickOutside);
	}

	handleClickOutside = event => {
		if (this.ref.current && !this.ref.current.contains(event.target)) {
		  	this.setState({
				menuVisible: false,
		  	});
		}
	};


	componentDidUpdate(prevProps, prevState) {
        if (prevProps.value != this.props.value) {
            this.setValue(this.props.value);
		}
    }


	setValue(value){
		if(!value) {
			value = ""
		}
		value = value.trim();
		const validAddress = /^(0x)?[0-9a-f]{40}$/i.test(value);
		const acceptedOutput = validAddress && (this.props.allowZero || value != nullAddress);
		this.setState(
			{
				ensLookup: validAddress ? null : value, 
				address: validAddress ? value : nullAddress, 
				validAddress, 
				acceptedOutput,
				loaded: false, 
				ensReverse: null, 
				ensResolve: false 
			}
		);
		if(validAddress) {
			this.lookupENSReverseName(value);
		} else {
			this.loadAddressFromENS(value);
		}
	}
	
	loadAddressFromENS(value) {
		EmbarkJS.Names.resolve(value, (err, address) => {
			if(err) {
				this.setState({
					ensLookup: value,
					address: nullAddress,
					ensResolve: false, 
					validAddress: false, 
					ensReverse: null,
					loaded: true,
					acceptedOutput: false
				});
				this.props.onError(err);
				this.props.onLoad(nullAddress, null);
			} else {
				this.setState({
					ensLookup: value, 
					address, 
					ensResolve: true, 
					validAddress: true,
					ensReverse: null,
					loaded: false,
					acceptedOutput:	address != nullAddress
				});
				this.lookupENSReverseName(address);
			}
		});
	
	}

	lookupENSReverseName(address) {
		if(this.props.ENSReverseLookup){
			EmbarkJS.Names.lookup(address, (err, ensReverse) => {
				this.setState({ensReverse, loaded: true});
				this.props.onLoad(address, ensReverse);
			})
		} else {
			this.setState({ensReverse: null, loaded: true});
			this.props.onLoad(address, null);
		}
	}	
	

	onClick = () => {
		const { menuVisible, } = this.state
		this.setState({ menuVisible: !menuVisible });
	}
	copyAddress = () => {
		copy(this.state.address);
		this.setState({ menuVisible: false })	
	}
	copyValue = () => {
		copy(this.props.value);
		this.setState({ menuVisible: false })	
	}
	copyLookup = () => {
		copy(this.state.ensReverse);
		this.setState({ menuVisible: false })	
	}
	zeroAddress = () => {
		this.setNativeValue(this.controlRef.current, nullAddress);
		this.setState({ menuVisible: false })	
	}

    setNativeValue(element, value) {
		const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
		const prototype = Object.getPrototypeOf(element);
		const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
		
		if (valueSetter && valueSetter !== prototypeValueSetter) {
			prototypeValueSetter.call(element, value);
		} else {
		  valueSetter.call(element, value);
		}
		element.dispatchEvent(new Event('input', { bubbles: true }));
	  }

    handlePaste(event) {
		var clipboardData, pastedData;
        clipboardData = event.clipboardData || window.clipboardData;
		pastedData = clipboardData.getData('Text');
		if(/^(0x)?[0-9a-f]{40}$/i.test(pastedData)){
			event.stopPropagation();
			event.preventDefault();
			this.setNativeValue(this.controlRef.current, pastedData);
		}
    }

    focus() {
        this.controlRef.current.focus();
	}
	
	getBackgroundGradient(address) {
		return `linear-gradient(90deg, #${address.substr(2, 6)} 0% 14%, #${address.substr(8, 6)} 14% 28%, #${address.substr(14, 6)} 28% 42%, #${address.substr(19, 6)} 43% 57%, #${address.substr(24, 6)} 58% 72%, #${address.substr(30, 6)} 72% 86%, #${address.substr(36, 6)} 86% 100%)`
	}
	
	render() {
		const {
			disabled,
			className,
			colors,
			allowZero,
			blocky,
			blockySize,
			blockyScale,
			control,
			enableToolBar,
			toolBarActions,
			value
		} = this.props;
		const { menuVisible,  ensReverse, validAddress, loaded, acceptedOutput, ensResolve} = this.state;
		const address = validAddress ? this.state.address : nullAddress; 
		const colorStyle = colors ? {
			backgroundImage: this.getBackgroundGradient(address)
		} : {}
		return (	
			<span ref={this.ref} style={colorStyle} className={`${className}`} >
				<span className={(acceptedOutput) ? "bg" : "err"}>
					{blocky &&	 
						<Blockies className="blocky" seed={address.toLowerCase()} size={blockySize} scale={blockyScale} />
					}
					<span className={control ? "indicator" : "text" } >
						{ensReverse && 
						<span className="ens-reverse">
							<small>{ensReverse}</small>
						</span>}
						<span className="hex"> 
							<strong>{address.substr(0, 6)}</strong><small>{address.substr(6, 36)}</small><strong>{address.substr(36, 6)}</strong>
						</span>
					</span>
					{ control && 
					<input 
						className="control hex"
						ref={this.controlRef} 
						value={value}
						placeholder={nullAddress}
						onChange={(event) => this.props.onChange(event)}
						onPaste={(event) => this.handlePaste(event)}
						disabled={disabled} 
						/>
					}
					{((enableToolBar) || (toolBarActions && toolBarActions.length > 0)) && (loaded ? 
					<span className="more-icon" onClick={this.onClick}>
						<MoreIcon fill="#000" width={15} /> 
					</span> : 
					<span className="loading" onClick={this.onClick}>
						<HashLoader loading={!loaded} sizeUnit={"px"} size={15}/> 
					</span>)}
				</span>
				{ menuVisible && <nav className="menu text-left">
						{ toolBarActions.map((value, index) => {
							return (<a key={index} onClick={value.action}> {value.text} </a>) 
						})}
						
						{ enableToolBar && acceptedOutput && <a onClick={this.copyAddress}><ClipIcon /> Copy address </a> }
						{ enableToolBar && ensReverse && <a onClick={this.copyLookup}><ClipIcon /> Copy ENS name </a> }
						{ enableToolBar && (!acceptedOutput || (address != value && ensReverse != value)) && <a onClick={this.copyValue}><ClipIcon /> Copy input value </a> }
						{ enableToolBar && allowZero && value != nullAddress && <a onClick={this.zeroAddress}> Set to address zero </a> }
					</nav> }			
			</span>
		)
	}
}

export default EthAddress;
