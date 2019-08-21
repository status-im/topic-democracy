import React from 'react';

import { storiesOf, addDecorator } from '@storybook/react';
import { action, actions, decorate } from '@storybook/addon-actions';
import { withKnobs, boolean, number, array } from '@storybook/addon-knobs/react'

import EthAddressList from '../app/components/EthAddressList';
const getProps = () => {
    return {
        onError     : decorate([e => [e[0].name + ' : ' + e[0].message] ]).action('onError'),
        onChange    : action('onChange'),
        onLoad    : action('onLoad'),
        disabled    : boolean('disabled', false),
        control     : boolean('control', true),
        values      : array("values", ["unicorn.stateofus.eth", "ethereum.eth", "0x744d70FDBE2Ba4CF95131626614a1763DF805B9E"]),
        allowAdd    : boolean('allowAdd', true),
        allowRemove : boolean('allowRemove', true),
        allowZero   : boolean('allowZero', false),
        colors      : boolean('colors', true),
        blocky      : boolean('blocky', true),
        blockyScale : number("blockyScale", 4),
        blockySize  : number("blockySize", 8),
    }
};
const commonEvents = {...actions({ onChange: 'onChange'}), onError: decorate([e => [e[0].name + ' : ' + e[0].message] ]).action('onError')};
  storiesOf('EthAddressList', module)
  .addDecorator(withKnobs)
  .add('static', () => <EthAddressList {...getProps()}  />)
  .add('active', () => {
    class EthAddressListStory extends React.Component {
      constructor(props){
        super(props);
        this.state = {
          values : this.props.values || []
        }
      }
      onChange = (values) => {
        this.setState({ values })
        this.props.onChange(values);
      }
      render() {
        const props = {
          ...this.props, 
          onChange:this.onChange,
          values:this.state.values   
        }
        return (<EthAddressList {...props} />);
      }

    };

    return <EthAddressListStory {...getProps()} />

  });