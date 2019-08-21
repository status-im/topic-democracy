import React from 'react';

import { storiesOf, addDecorator } from '@storybook/react';
import { action, decorate } from '@storybook/addon-actions';
import { withKnobs, text, boolean, number } from '@storybook/addon-knobs/react'

import HexData from '../app/components/HexData';

const getProps = () => {
    return {
        onError     : decorate([e => [e[0].name + ' : ' + e[0].message] ]).action('onError'),
        onChange    : action('onChange'),
        disabled    : boolean('disabled', false),
        control     : boolean('control', true),
        buffer       : Buffer.from(text('Data', "00112233445566778899AABBCCDDEEFF"), "hex"),
        rowLength   : number("Row Length", 32),
        setLength   : number("Set Length", 4)
    }
};

storiesOf('HexData', module)
  .addDecorator(withKnobs)
  .add('static', () => <HexData {...getProps()}  />)
  .add('active', () => {
    class HexDataStory extends React.Component {
      constructor(props){
        super(props);
        this.state = {
            buffer : this.props.buffer || Buffer.from("")
        }
      }
      onChange = value => {
        this.setState({ buffer: value })
        this.props.onChange(value);
      }
      render() {
        const props = {
          ...this.props, 
          onChange:this.onChange,
          buffer:this.state.buffer   
        }
        return (<HexData {...props} />);
      }

    };

    return <HexDataStory {...getProps()} />

  });