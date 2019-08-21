import MultiSigWallet from '../embarkArtifacts/contracts/MultiSigWallet';
import React from 'react';

import { storiesOf, addDecorator } from '@storybook/react';
import { action, actions, decorate } from '@storybook/addon-actions';
import { withKnobs, boolean, object } from '@storybook/addon-knobs/react'

import EthTxSubmit from '../app/components/EthTxSubmit';

const txObj = {
 to: "0x3D597789ea16054a084ac84ce87F50df9198F415",
 value: "100000000000000000",
 data: "0x",
 nonce: null
};

const getProps = (value = object("value", txObj)) => {
  return {
      onError     : decorate([e => [e[0].name + ' : ' + e[0].message] ]).action('onError'),
      ...actions({ onSubmission: 'onSubmission', onResult: 'onResult' , onReceipt: 'onReceipt' }),
      disabled    : boolean('disabled', false),
      control     : boolean('control', true),
      value       : value
  }
};

storiesOf('EthTxSubmit', module)
  .addDecorator(withKnobs)
  .add('web3.eth.sendTransaction', () => <EthTxSubmit {...getProps() }/>)
  .add('web3.eth.Contract', () => <EthTxSubmit {...getProps(new EmbarkJS.Blockchain.Contract({ abi: MultiSigWallet._jsonInterface, address: "0xB913626032140A86c77D1fdde4f611A00D589C55" }).methods.changeRequirement(1)) }/>)
