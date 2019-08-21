
import React from 'react';

import { storiesOf, addDecorator } from '@storybook/react';
import { decorate, action } from '@storybook/addon-actions';

import { withKnobs, text, boolean } from '@storybook/addon-knobs/react'

const getProps = () => {return {
    onError     : decorate([e => [e[0].name + ' : ' + e[0].message] ]).action('onError'),
    onChange    : action('onChange'),
    value       : text('value', ''),
    type        : text('type', 'text'),
    disabled    : boolean('disabled', false),
    placeholder : text('placeholder', '')
}};

storiesOf('input', module)
  .addDecorator(withKnobs)
  .add('static', () => <input {...getProps()} />)
  .add('active', () => {
    class InputStory extends React.Component {
      constructor(props){
        super(props);
        this.state = {
          value : this.props.value || ""
        }
      }
      onChange = event => {
        this.setState({ value: event.target.value })
        this.props.onChange(event);
      }
      render() {
        const props = {
          ...this.props, 
          onChange:this.onChange,
          value:this.state.value   
        }
        return (<input {...props} />);
      }

    };

    return <InputStory {...getProps()} />

  });
  