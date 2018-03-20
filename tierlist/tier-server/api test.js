const port = 4200
const base = 'http://localhost:'+port+'/api/v1/'
const path = base + 'characters/';

import fetch from 'node-fetch'; //npm install node-fetch --save

console.log('fetch characters');
fetch(path)
    .then(response => response.json())
    .then(result => console.log(result))
    .catch(e => console.log(e));
console.log('EOF');