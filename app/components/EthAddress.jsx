import React from 'react';
import PropTypes from 'prop-types';
import Blockies from 'react-blockies';
import { Overlay, Tooltip } from 'react-bootstrap';
import copy from 'copy-to-clipboard';
import './EthAddress.css';
import ClipIcon from "./Icon/Clip";

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
		onChange: PropTypes.func
	};

	static defaultProps = {
		className: 'eth-address',
		value: null,
		defaultValue: nullAddress,
		colors: true,
		control: false,
		allowZero: true,
		blocky: true,
		blockySize: 8,
		blockyScale: 4,
		disabled: false,
		onChange: () => { }
	};

	constructor(props) {
		super(props);
		this.controlRef = React.createRef();
		this.attachRef = containerRef => this.setState({ containerRef });
		this.state = {
			value: null,
			address: nullAddress,
			ensReverse: null,
			valid: false,
			tooltipVisible: false 
		};
	}


	componentDidMount() {
		this.setValue(this.props.value || this.props.defaultValue);
    }

	componentDidUpdate(prevProps, prevState) {
        if (prevProps.value != this.props.value && this.props.value != this.state.value) {
            this.setValue(this.props.value);
		}
		if(prevState.value != this.state.value) {
			this.checkValue();	
		}
		if(prevState.address != this.state.address) {
			this.checkAddress();
		}
    }

	setValue(value){
		if(this.props.control) {
			this.controlRef.current.textContent = value;
		}
		this.setState({value, address: nullAddress, ensReverse: null});
	}

	checkAddress() {
		const { value, address } = this.state;
		if(address != nullAddress){
			EmbarkJS.Names.lookup(address, (err, name) => {
				if(err){
					console.log(address, err)
				}
				this.setState({ensReverse: name});
				this.props.onChange(address, value, name);
			})
		} else {
			this.setState({ensReverse: null});
			this.props.onChange(address, value, null);
		}
	}	
	
	checkValue() {
		const { value } = this.state;
		if(value == null){
			this.setState({address: nullAddress, valid: this.props.allowZero});
		}else if(value.startsWith("0x")) {
			const valid = (this.props.allowZero || value != nullAddress) && /^(0x)?[0-9a-f]{40}$/i.test(value);
			if (valid) {
				this.setState({address: value, valid});
			} else {
				this.setState({address: nullAddress, valid});
			}
		} else {
			EmbarkJS.Names.resolve(value, (err, result) => {
				if(err){
					this.setState({address: nullAddress, valid: false});
				} else {
					const valid = !err && result != nullAddress;
					this.setState({address: result, valid});	
				}
			});
		}
	}
	onClick = () => {
		if (!this.props.control) {
			copy(this.state.address);
			this.setState({ tooltipText: "Copied", tooltipVisible: true });
			clearTimeout(this.timeout);
			this.timeout = setTimeout(() => { this.setState({ tooltipVisible: false }) }, 1000)
		}
	}
	
    onKeyPress(event) {
        if (event.charCode === 13) {
            event.preventDefault();
        }
    }

    onKeyUp(event) {
		clearTimeout(this.keyWait);
		this.keyWait = setTimeout(() => {this.setState({ value: this.controlRef.current.textContent })}, 200);
	}

    handlePaste(event) {
		event.stopPropagation();
		event.preventDefault();
		var clipboardData, pastedData;
        clipboardData = event.clipboardData || window.clipboardData;
		pastedData = clipboardData.getData('Text');
		this.controlRef.current.textContent = pastedData;
		this.setState({ value: pastedData });
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
			blocky,
			blockySize,
			blockyScale,
			control
		} = this.props;
		const { ensReverse, value, valid, address } = this.state;
		const { containerRef, tooltipVisible, tooltipText } = this.state;
		const colorStyle = colors ? {
			backgroundImage: this.getBackgroundGradient(address)
		} : {}
		return (
			<span ref={this.attachRef} style={colorStyle} onClick={this.onClick} className={`${className} ${valid ? '': 'err' }`} >
				<span className={valid ? "bg" : "err"}>
					{blocky && valid &&	 
						<Blockies className="blocky" seed={address.toLowerCase()} size={blockySize} scale={blockyScale} />
					}
					<span className={control ? "indicator" : "text" } >
						{ensReverse && 
						<span className="ens-reverse">
							<small>{ensReverse}</small>
						</span>}
						<span> 
							<strong>{address.substr(0, 6)}</strong><small>{address.substr(6, 36)}</small><strong>{address.substr(36, 6)}</strong>
						</span>
					</span>
					{ control ? 
					<span 
						className="control"
						ref={this.controlRef} 
						placeholder={nullAddress}
						onKeyPress={(event) => this.onKeyPress(event)} 
						onKeyUp={(event) => this.onKeyUp(event)}
						onPaste={(event) => this.handlePaste(event)}
						contentEditable={!disabled} 
						/>
					: 
					<span className="clip-icon">
						<ClipIcon width={15} fill="#CCC"/>
					</span> 
					}
					<Overlay target={containerRef} show={tooltipVisible} placement="bottom">
						{(props) => {
							delete props['show'];
							return (
								<Tooltip id="address-tooltip" {...props} >{tooltipText}</Tooltip>
							)
						}}
					</Overlay>
				</span>
			</span>		
		)
	}

	componentWillUnmount() {
		clearTimeout(this.timeout);
	}}

export default EthAddress;
