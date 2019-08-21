import React from 'react';

import { storiesOf, addDecorator } from '@storybook/react';
import { action, decorate } from '@storybook/addon-actions';
import { withKnobs, text, boolean } from '@storybook/addon-knobs/react'
import EthValue from '../app/components/EthValue';

const getProps = () => {
    return {
        onError     : decorate([e => [e[0].name + ' : ' + e[0].message] ]).action('onError'),
        onChange    : action('onChange'),
        disabled    : boolean('disabled', false),
        control     : boolean('control', true),
        value       : text('value', '100000000000000000')
    }
};

storiesOf('EthValue', module)
  .addDecorator(withKnobs)
  .add('static', () => <EthValue {...getProps()}  />)
  .add('active', () => {
    class EthValueStory extends React.Component {
      constructor(props){
        super(props);
        this.state = {
          value : this.props.value || ""
        }
      }
      onChange = value => {
        this.setState({ value })
        this.props.onChange(value);
      }
      render() {
        const props = {
          ...this.props, 
          onChange:this.onChange,
          value:this.state.value   
        }
        return (<EthValue {...props} />);
      }
    };
    
    return <EthValueStory {...getProps()} />
  });
