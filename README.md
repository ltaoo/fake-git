# fake-git

尝试自己实现 `git` 客户端。

## init

```bash
node index.js init
```

## hash-object

```bash
node index.js hash-object -w test.txt
```

## cat-file
用来展示 `object` 文件内容、大小或者类型。

```bash
usage: git cat-file (-t [--allow-unknown-type] | -s [--allow-unknown-type] | -e | -p | <type> | --textconv | --filters) [--path=<path>] <object>
   or: git cat-file (--batch | --batch-check) [--follow-symlinks] [--textconv | --filters]

<type> can be one of: blob, tree, commit, tag
    -t                    show object type
    -s                    show object size
    -e                    exit with zero when there's no error
    -p                    pretty-print object's content
    --textconv            for blob objects, run textconv on object's content
    --filters             for blob objects, run filters on object's content
    --path <blob>         use a specific path for --textconv/--filters
    --allow-unknown-type  allow -s and -t to work with broken/corrupt objects
    --buffer              buffer --batch output
    --batch[=<format>]    show info and content of objects fed from the standard input
    --batch-check[=<format>]
                          show info about objects fed from the standard input
    --follow-symlinks     follow in-tree symlinks (used with --batch or --batch-check)
    --batch-all-objects   show all objects with --batch or --batch-check
    --unordered           do not order --batch-all-objects output
```

## update-index
更新 `index`，其实 `index` 就是「暂存区」，即我们 `git add` 后将文件添加到的地方，实际上就是一个位于 `.git` 文件夹下的 `index` 文件。

该命令需要指定多个参数
- --add
- --cacheinfo
- 100644
- 83baae61804e65cc73a7201a7252750c76066a30
- test.txt

### 文件模式
`update-index` 第三个参数用来指定文件模式，100644 表示普通文件；100755 表示可执行文件；120000 表示符号链接。

### hash 值
`update-index` 第四个参数用来指定 `hash` 值，这个 `hash` 必须有相应的 `object` 文件。
可以用 `hash-object -w test.txt` 获取到 `hash` 值。

## index 文件详解
在 `.git` 根目录下，存在一个 `index` 文件，这个文件就是所谓的「缓存区」了。这个文件包含什么内容呢？

https://mincong-h.github.io/2018/04/28/git-index/

## 源码

### object

```c
/*
 * The object type is stored in 3 bits.
 */
struct object {
	unsigned parsed : 1;
	unsigned type : TYPE_BITS;
	unsigned flags : FLAG_BITS;
	struct object_id oid;
};
```
https://github.com/git/git/blob/77556354bb/object.c#L144

## 参考
- [对象存储](https://git-scm.com/book/zh/v1/Git-%E5%86%85%E9%83%A8%E5%8E%9F%E7%90%86-Git-%E5%AF%B9%E8%B1%A1#%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A8)
- [index-format.txt](https://github.com/git/git/blob/master/Documentation/technical/index-format.txt)
- https://cloud.tencent.com/developer/article/1105427
- [git object.c](https://github.com/git/git/blob/master/object.c#L210)
