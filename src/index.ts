import * as _ from 'lodash';
 import './style.css';

  function component() {
    console.log('BUNDLE LOADED');
    const element = document.createElement('div');

    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    return element;
  }

document.body.appendChild(component());