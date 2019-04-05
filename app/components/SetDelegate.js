import DelegationModel from '../models/DelegationModel';
import React from 'react';
import { Form, FormGroup, FormControl, HelpBlock, Button } from 'react-bootstrap';


class SetDelegateUI extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        delegatedTo: "",
        delegation: [],
        error: null
      }      
      this.model = new DelegationModel(props.address);
    }
  
    handleDelegateChange(e){
      this.setState({delegatedTo: e.target.value});
    }
    componentDidMount() {
        this.model.delegationOf(web3.eth.defaultAccount).then(console.log);
        this.model.delegatedTo(web3.eth.defaultAccount).then((ret)=> {
            this.setState({delegatedTo: ret})
        });
        
    }
    delegate(e){
      e.preventDefault();
      this.model.delegate(web3.eth.defaultAccount, this.state.delegatedTo)
      .once('transactionHash', function(hash){ console.log("once txhash", hash) })
      .once('receipt', function(receipt){ console.log("once receipt", receipt) })
      .on('confirmation', function(confNumber, receipt){ console.log("on confirmation", confNumber,receipt) })
      .on('error', function(error){ console.log("on error", error) })
      .then(function(receipt){
        console.log("then receipt", receipt)
      });

    }
    
    render(){
        let error = this.state.error;
      return (<React.Fragment>
          { error != null && <Alert bsStyle="danger">{error}</Alert> }
          <h3> Delegation</h3>
          <Form inline>
            <FormGroup>
              <FormControl
                type="text"
                defaultValue={this.state.delegatedTo}
                onChange={(e) => this.handleDelegateChange(e)} />

              <Button bsStyle="primary" onClick={(e) => this.delegate(e)}>Set Delegate</Button>
            </FormGroup>
          </Form>


      </React.Fragment>
      );
    }
  }

export default SetDelegateUI;
