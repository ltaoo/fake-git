const {
    createIndexFileContent,
} = require('../src/utils/cacheIndex');

const content = createIndexFileContent([{
    mode: '100644',
    filepath: 'test.txt',
    hash: '83baae61804e65cc73a7201a7252750c76066a30',
}]);
