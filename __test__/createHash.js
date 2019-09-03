const { createHash, deflate } = require('../src/common');
const { createTreeFileContent, createBlobFileContent } = require('../src/utils/object');

(() => {
    const hash = createHash(createBlobFileContent({ content: 'version 1' }));
    console.log('blob hash', hash); // 83baae61804e65cc73a7201a7252750c76066a30
})();


(() => {
    const buffer = createTreeFileContent({ 
        filepath: 'test.txt',
        mode: '100644',
        hash: '83baae61804e65cc73a7201a7252750c76066a30',
    })
    const hash = createHash(buffer);
    console.log('tree hash', hash);
})();