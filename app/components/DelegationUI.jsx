import React from 'react';
import PropTypes from 'prop-types';
import EthAddress from './EthAddress';
import Breadcrumbs from '@material-ui/lab/Breadcrumbs';

class DelegationUI extends React.Component {
	static propTypes = {
		className: PropTypes.string,
        Delegation: PropTypes.object.isRequired,
        account: PropTypes.string.isRequired,
	};

	static defaultProps = {
		className: 'delegation',
	};

	constructor(props) {
		super(props);
		this.state = {
            delegate: null,
            delegateChain: [],
            editDelegate: null,
            editDelegation: [],

		};
	}


	componentDidMount() {
        this.delegateChainOf(this.props.account);
    }


    delegation() {
        const delegateChain = this.state.delegateChain;
        if(!delegateChain.includes(delegate)){
            delegateChain.push(delegate);
            this.setState({delegateChain});
            this.props.Delegation.methods.delegatedTo(delegate).call().then((delegatedTo) => {
                this.delegateChainOf(delegatedTo);
            });
        }
    }

    delegateChainOf(delegate) {
        const delegateChain = this.state.delegateChain;
        if(!delegateChain.includes(delegate)){
            delegateChain.push(delegate);
            this.setState({delegateChain});
            this.props.Delegation.methods.delegatedTo(delegate).call().then((delegatedTo) => {
                this.delegateChainOf(delegatedTo);
            });
        }
    }

    editDelegationOf(delegate) {
        const editDelegation = this.state.editDelegation;
        if(!delegateChain.includes(delegate)){
            editDelegation.push(delegate);
            this.setState({editDelegation});
            this.props.Delegation.methods.delegatedTo(delegate).call().then((delegatedTo) => {
                this.editDelegationOf(delegatedTo);
            });
        }
    }



	render() {
		const {
            Delegation,
			className,
		} = this.props;
        const {delegate, delegateChain,  editDelegate, editDelegation } = this.state;
        
		return (
			<div className={className} >
                <div>
                    <p>Delegation:</p>
                    <EthAddress value={Delegation.options.address} />
                </div>
                <div>
                    <small>Delegate Chain:</small>
                    <Breadcrumbs arial-label="Breadcrumb" maxItems={5}>
                    {
                        delegateChain.map((value, i) => {
                            return <EthAddress key={i} value={value} />
                        })
                    }
                    </Breadcrumbs>
                </div>
                <div>
                    <p>Delegate Set</p>
                    <EthAddress defaultValue={editDelegate} control={true} onChange={(editDelegate) => {
                        this.setState({editDelegate});
                        if(editDelegate != delegateChain[0]) {
                            this.setState({editDelegation : []});
                            this.editDelegationOf(editDelegate);
                        }
                    }} />
                    
                    {editDelegation.length > 0 &&
                        <Breadcrumbs arial-label="Breadcrumb" maxItems={5}>
                        {
                            editDelegation.map((value) => {
                                return <EthAddress value={value} />
                            })
                        }
                        </Breadcrumbs>
                    }
                </div>

			</div>
		)
	}
	
}

export default DelegationUI;
