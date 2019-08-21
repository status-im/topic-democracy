import React from 'react';
import PropTypes from 'prop-types';
import './HexData.css';

class Item extends React.Component {
	constructor(props) {
		super(props);
		this.controlRef = React.createRef();
		this.state = {
		}
	}

    focus() {
        this.controlRef.current.focus();
	}
	onBlur(event) {
		this.setValue(this.controlRef.current.textContent);
	}
    onKeyPress(event) {
        if (event.charCode === 13) {
			event.preventDefault();
			this.setValue(this.controlRef.current.textContent);
        }
    }

    onKeyUp(event) {
		clearTimeout(this.keyWait);
		if(this.controlRef.current.textContent){
			this.keyWait = setTimeout(() => { this.setValue(this.controlRef.current.textContent)}, 500);
		}
	}

    handlePaste(event) {
		event.stopPropagation();
		event.preventDefault();
		var clipboardData, pastedData;
        clipboardData = event.clipboardData || window.clipboardData;
		pastedData = clipboardData.getData('Text');
		this.props.setValues(pastedData);
	}
	setValue(value){
		this.props.setValues(value)
	}
	render() {
		var classes = (this.props.active ? 'active' : '') + (this.props.value == -1 ? ' none' : '');
		return (
			<li 
				ref={this.controlRef} 
				contentEditable={true}
				onKeyPress={(event) => this.onKeyPress(event)} 
				onKeyUp={(event) => this.onKeyUp(event)}
				onPaste={(event) => this.handlePaste(event)}
				onBlur={(event) => this.onBlur(event)} 
				className={classes} 
				onMouseOver={() => { this.props.activate(this.props.index)}} 
				onMouseLeave={() => { this.props.clear()}}>
				{this.props.byteString}
			</li>
		);
	}
}

class Set extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
		}
	}
	setValues(item, values) {
		this.props.setValues(item, values);
	}
	render() {
		var items = this.props.set.map(function(b, i) {
			var byteString = "";

			if (b != -1 ) {
				byteString = b.toString(16);

				if(byteString.length == 1) {
					byteString = "0" + byteString;
				}
			}

			var active = this.props.activeItem == i && this.props.active
			return (<Item key={i} index={i} value={b} byteString={byteString} active={active} setValues={this.setValues.bind(this,i)} activate={this.props.activateItem} clear={this.props.clearItem}/>);
		}.bind(this));

		return (
			<ul className={"setHex" + (this.props.active ? ' active' : '')} onMouseOver={() => { this.props.activateSet(this.props.index)}} onMouseLeave={() => { this.props.clearSet()}}>
				{items}
			</ul>
		);
	}
}

class Row extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			activeSet: -1,
			activeItem: -1
		};
	}
	setValues(set, item, values){
		if(!values) { return; }
		this.props.setValues(set, item, values);
	}
	setActiveSet(activeSet) {
		if(this.props.sets[activeSet][this.state.activeItem] == -1) return;
		this.setState({activeSet: activeSet});
	}
	clearActiveSet() {
		this.setState({activeSet: -1});
	}
	setActiveItem (activeItem) {
		this.setState({activeItem: activeItem});
	}
	clearActiveItem () {
		this.setState({activeItem: -1});
	}
	render() {
		var sets = this.props.sets.map(function(set, i) {
			var active = this.state.activeSet == i ? true : false

			var props = {
				set: set,
				index: i,
				key: i,
				active: active,
				setValues: this.setValues.bind(this, i),
				activeItem:   (item) => { this.state.activeItem(item) },
				activateSet:  (activeSet) => { this.setActiveSet(activeSet) },
				clearSet:     () => { this.clearActiveSet() },
				activateItem: (activeItem) => { this.setActiveItem(activeItem) },
				clearItem:    () => { this.clearActiveItem() }
			}

			return (<Set {...props}/>);
		}.bind(this));
		return (
			<div className="hex-row">
				{!this.props.nohead && <div className="hex-head">[{this.props.heading}]:</div>}
				<div className="hex-sets">{sets}</div>
			</div>
		);
	}
}

class Hex extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		}
	}
	setValues(row, set, item, newValues) {
		this.props.setValues(row,set,item,newValues);
	}
	render() {
		var pad = "0000";

		var rows = this.props.rows.map(function(row, i) {
			var heading = ''+i*this.props.bytesper;
				heading = pad.substring(0, pad.length - heading.length) + heading;
				return <Row setValues={this.setValues.bind(this, i)} nohead={this.props.nohead} key={i} sets={row} heading={heading}/>;
		}.bind(this));

		return (
			<div className="hexdata">
				<div className="hex">
					{rows}
				</div>
			</div>
		);
	}
}

class HexData extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		}
	}

	static propTypes = {
        control: PropTypes.bool,
        disabled: PropTypes.bool,
        onChange: PropTypes.func,
	}
	setValues(row,set,item,newValues){
		console.log("update "+row,set,item,newValues)
	}
	render() {
		var rowChunk = this.props.rowLength, setChunk = this.props.setLength;
		var rows = [], row = [], set = [], sets = [];
		var temparray, x, k;
		var buffer = [];
		var bytes = this.props.buffer.length;

		if(Buffer.isBuffer(this.props.buffer)) {
			for (var i = 0; i < bytes; i++) {
				buffer.push(this.props.buffer[i]);
			}
		} else {
			buffer = this.props.buffer;
		}

		for (var i = 0; i<bytes; i+=rowChunk) {
			sets = [];
			temparray = buffer.slice(i,i+rowChunk);

			for(var z = temparray.length; z < rowChunk; z++) {
				temparray.push(-1);
			}
			row = [];
			for (x=0,k=temparray.length; x<k; x+=setChunk) {
				set = temparray.slice(x,x+setChunk);

				for(z = set.length; z < setChunk; z++) {
					set.push(-1);
				}
				row.push(set);

			}
			rows.push(row);
		}

		return (
			<Hex setValues={this.setValues.bind(this)} nohead={this.props.nohead} rows={rows} bytesper={rowChunk} />
		);
	}
}

export default HexData;



