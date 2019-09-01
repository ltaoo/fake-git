const fs = require('fs');

const { resolve } = require('./_utils');

const { parseIndexFileContent } = require('../src/utils/cacheIndex');

const content = fs.readFileSync(resolve('examples/index'));
parseIndexFileContent(content);