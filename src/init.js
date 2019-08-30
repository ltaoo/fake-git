const fs = require('fs');
const path = require('path');

const { ROOT_DIR } = require('./common');

function init() {
    if (checkRootDirIsExist()) {
        // git 显示的错误中信息路径分隔符是平台无关的
        console.log(`Reinitialized existing Git repository in ${ROOT_DIR}`);
        return;
    }
    fs.mkdirSync(ROOT_DIR);

    createFile('config');
    writeFile(resolveFile('config'), `[core]
    repositoryformatversion = 0
    filemode = false
    bare = false
    logallrefupdates = true
    symlinks = false
    ignorecase = true`);
    createFile('HEAD');
    writeFile(resolveFile('HEAD'), 'ref: refs/heads/master');
    createFile('description');
    writeFile(resolveFile('description'), 'Unnamed repository; edit this file \'description\' to name the repository');

    createDir('refs');
    createDir('refs/heads')
    createDir('refs/tags')
    createDir('objects');
    createDir('objects/info');
    createDir('objects/pack');
    createDir('info');
    createFile('info/exclude');
    writeFile(resolveFile('info/exclude'), `# git ls-files --others --exclude-from=.git/info/exclude
# Lines that start with '#' are comments.
# For a project mostly in C, the following would be a good set of
# exclude patterns (uncomment them if you want to use them):
# *.[oa]
# *~`);

    console.log(`Initialized empty Git repository in ${ROOT_DIR}`);
}

/**
 * 检查是否已经存在 .fake-git 目录
 * @return {boolean}
 */
function checkRootDirIsExist() {
    try {
        fs.statSync(ROOT_DIR);
        return true;
    } catch {
        return false;
    }
}
function resolveFile(pathname) {
    return path.join(ROOT_DIR, pathname);
}

function createFile(filename) {
    fs.writeFileSync(path.join(ROOT_DIR, filename));
}
function createDir(dirpath) {
    fs.mkdirSync(path.join(ROOT_DIR, dirpath));
}

/**
 * 
 * @param {AbsolutePath} filename
 * @param {string} content 
 * @return {void 0}
 */
function writeFile(filename, content) {
    fs.writeFileSync(filename, content);
}

module.exports = init;
