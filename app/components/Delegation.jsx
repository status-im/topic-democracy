import React from 'react';
import PropTypes from 'prop-types';
import EthAddress from './EthAddress';
import Breadcrumbs from '@material-ui/lab/Breadcrumbs';

class Delegation extends React.Component {
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
            delegation = [],
            editDelegate = null,
            editDelegation = [],

		};
	}


	componentDidMount() {
        this.delegationOf(this.props.account);
    }


    delegationOf(delegate) {
        const delegation = this.state.delegation;
        if(!delegation.includes(delegate)){
            delegation.push(delegate);
            this.setState({delegation});
            this.props.Delegation.methods.delegatedTo(delegate).then((delegatedTo) => {
                this.delegationOf(delegatedTo);
            });
        }
    }

    editDelegationOf(delegate) {
        const delegation = this.state.editDelegation;
        if(!delegation.includes(delegate)){
            editDelegation.push(delegate);
            this.setState({editDelegation});
            this.props.Delegation.methods.delegatedTo(delegate).then((delegatedTo) => {
                this.editDelegationOf(delegatedTo);
            });
        }
    }



	render() {
		const {
            Delegation,
			className,
		} = this.props;
        const { delegation, editDelegate } = this.state;
        
		return (
			<div className={className} >
                <div>
                    <p>Delegation Address:</p>
                    <EthAddress value={Delegation.options.address} />
                </div>


                <div>
                    <small>Current delegation:</small>
                    <Breadcrumbs arial-label="Breadcrumb" maxItems={5}>
                    {
                        delegation.map((value) => {
                            return <EthAddress value={value} />
                        })
                    }
                    </Breadcrumbs>
                </div>
                <div>
                    <p>Set Delegate:</p>
                    <EthAddress defaultValue={delegation[0]} control={true} onChange={(editDelegate) => {
                        this.setState({editDelegate});
                        if(editDelegate != delegation[0]) {
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

export default Delegation;
