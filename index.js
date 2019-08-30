const fs = require('fs');
const path = require('path');

const parser = require('yargs-parser');

const init = require('./src/init');

const argv = parser(process.argv.slice(2));

console.log(argv);
if (argv._[0] === 'init') {
    init();
}
