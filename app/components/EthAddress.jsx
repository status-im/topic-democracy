import React from 'react';
import PropTypes from 'prop-types';
import Blockies from 'react-blockies';
import './EthAddress.css';

class EthAddress extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		value: PropTypes.string,
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
		defaultValue: "0x0000000000000000000000000000000000000000",
		colors: true,
		control: false,
		blocky: true,
		blockySize: 8,
		blockyScale: 4,
		disabled: false,
		onChange: () => { }
	};

	constructor(props) {
		super(props);
		this.controlRef = React.createRef();
		this.state = {
			value: props.value != undefined ? props.value : props.defaultValue,
		};
	}


	componentDidMount() {
		if(this.props.control)
        	this.controlRef.current.textContent = this.state.value;
    }

	componentDidUpdate(prevProps, prevState) {
        if (prevProps.value != this.props.value && this.props.value != this.state.value) {
            this.setState({value: this.props.value});
        }
    }

    onKeyPress(event) {
        if (event.charCode === 13) {
            event.preventDefault();
        }
    }

    onKeyUp(event) {
		let text = this.controlRef.current.textContent;
		if(text.length == 0){
			text = "0x0000000000000000000000000000000000000000";
		}
		this.setState({ value: text });
		this.notifyListeners(text);
	}
	
	notifyListeners(text) {
		if (/^(0x)?[0-9a-f]{40}$/i.test(text)) {
			this.props.onChange(text);
		} else {
			this.props.onChange(null);
		}
	}

    handlePaste(event) {
        var clipboardData, pastedData;
        clipboardData = event.clipboardData || window.clipboardData;
        pastedData = clipboardData.getData('Text');
        if (/^(0x)?[0-9a-f]{40}$/i.test(pastedData)) {
            event.stopPropagation();
            event.preventDefault();
            this.controlRef.current.textContent = pastedData;
            this.setState({ value: pastedData });
		} else {
			this.setState({ value: this.controlRef.current.textContent });
		}
		this.notifyListeners(this.controlRef.current.textContent);
    }

    focus() {
        this.controlRef.current.focus();
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
		const { value } = this.state;
		let valid = /^(0x)?[0-9a-f]{40}$/i.test(value);
		const colorStyle = colors && valid ? {
			backgroundImage: `linear-gradient(90deg, #${value.substr(6, 6)} 0% 15%, #${value.substr(12, 6)} 17% 32%, #${value.substr(18, 6)} 34% 49%, #${value.substr(24, 6)} 51% 66%, #${value.substr(30, 6)} 68% 83%, #${value.substr(36, 6)} 85% 100%)`
		} : {}
		return (
			<span style={colorStyle} className={`${className}`} >
				<span className={valid ? "bg" : "err"}>
					{blocky && 
						<span className="blocky">
							<Blockies seed={value.toLowerCase()} size={blockySize} scale={blockyScale} />
						</span>}
					<span className={control ? "indicator" : "text" } >
						<strong>{value.substr(0, 6)}</strong><small>{value.substr(6, 36)}</small><strong>{value.substr(36, 6)}</strong>
					</span>
					{ control ? 
					<span 
						className="control"
						ref={this.controlRef} 
						placeholder="0x0000000000000000000000000000000000000000"
						onKeyPress={(event) => this.onKeyPress(event)} 
						onKeyUp={(event) => this.onKeyUp(event)}
						onPaste={(event) => this.handlePaste(event)}
						contentEditable={!disabled} 
						/>
					: 
					<span /> 
					}
				</span>
			</span>		
		)
	}
	
}

export default EthAddress;
