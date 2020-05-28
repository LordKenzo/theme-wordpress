import './components/slider';
import $ from 'jquery';

import { sayHelloTo } from './components/say';

console.log(sayHelloTo('World'));

$('body').click(() => {
  alert('ciao');
});
