import { configure } from '@storybook/react';

import EmbarkJS from '../embarkArtifacts/embarkjs';
export default EmbarkJS;
// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /\.stories\.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
