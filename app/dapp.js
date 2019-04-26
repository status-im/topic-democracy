import React from 'react';
import { render } from 'react-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import TopicDemocracy from './TopicDemocracy';

const theme = createMuiTheme();

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <TopicDemocracy />
    </MuiThemeProvider>
  );
}

render(<App />, document.querySelector('#app'));