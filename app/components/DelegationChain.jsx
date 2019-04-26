import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import Breadcrumbs from '@material-ui/lab/Breadcrumbs';
import EthAddress from './EthAddress';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit,
  },
  chip: {
    backgroundColor: theme.palette.grey[100],
    height: 24,
    color: theme.palette.grey[800],
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.grey[300],
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(theme.palette.grey[300], 0.12),
    },
  },
  avatar: {
    background: 'none',
    marginRight: -theme.spacing.unit * 1.5,
  },
});

function CustomBreadcrumb(props) {
  const { classes, ...rest } = props;
  return <EthAddress {...rest} />;
}

CustomBreadcrumb.propTypes = {
  classes: PropTypes.object.isRequired,
};

const StyledBreadcrumb = withStyles(styles)(CustomBreadcrumb);

function DelegationChain(props) {
  const { classes, delegation } = props;

  return (
      <Breadcrumbs arial-label="Breadcrumb" maxItems={5}>
        {delegation.map((value) => {
            <StyledBreadcrumb
              href="#"
              value={value}
              blockyScale={3}
            />
        })}
      </Breadcrumbs>
  );
}

DelegationChain.propTypes = {
  classes: PropTypes.object.isRequired,
  delegation: PropTypes.array.isRequired
};

export default withStyles(styles)(DelegationChain);
