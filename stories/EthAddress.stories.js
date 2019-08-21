import React from 'react';

import { storiesOf, addDecorator } from '@storybook/react';
import { actions, action, decorate } from '@storybook/addon-actions';
import { withKnobs, text, boolean, number } from '@storybook/addon-knobs/react'

import EthAddress from '../app/components/EthAddress';

const getProps = () => {
    return {
        onError     : decorate([e => [e[0].name + ' : ' + e[0].message] ]).action('onError'),
        onChange    : action('onChange'),
        onLoad      : action('onLoad'),
        disabled    : boolean('disabled', false),
        control     : boolean('control', true),
        value       : text('value', 'ethereum.eth'),
        allowZero   : boolean('allowZero', false),
        colors      : boolean('colors', true),
        blocky      : boolean('blocky', true),
        blockyScale : number("blockyScale", 4),
        blockySize  : number("blockySize", 8),
    }
};
storiesOf('EthAddress', module)
  .addDecorator(withKnobs)
  .add('static', () => <EthAddress {...getProps()}  />)
  .add('active', () => {
    class EthAddressStory extends React.Component {
      constructor(props){
        super(props);
        this.state = {
          value : this.props.value || ""
        }
      }
      onChange = ( event )=> {
        this.setState({ value: event.target.value })
        this.props.onChange(event);
      }
      render() {
        const props = {
          ...this.props, 
          onChange:this.onChange,
          value:this.state.value   
        }
        return (<EthAddress {...props} />);
      }
    };

    return <EthAddressStory {...getProps()} />

  });