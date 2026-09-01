# BPX 的 Mind+ V2 Python 积木扩展

此扩展使用公开仓库
[`mirrormerobotics/bpx_sdk_open`](https://github.com/mirrormerobotics/bpx_sdk_open)
提供的 BPX SDK 1.0.8 Windows wheels，不读取任何用户桌面仓库。

## Python 兼容范围

- 64 位 Windows
- CPython 3.8、3.9、3.10、3.11、3.12、3.13、3.14
- 不支持 32 位 Python 或 PyPy

扩展包同时包含各 CPython 版本对应的原生 `.pyd`。Python 导入
`bpx_sdk` 时会根据当前解释器的 ABI 标签自动选择匹配文件。

## Mind+ 测试加载

在 Mind+ Python积木模式启用扩展库开发者模式，然后选择本目录中的
`config.json`。必须保留 `config.json`、`main.js`、`requirements.txt` 和
整个 `libraries/bpx_sdk` 目录，不能只复制 `config.json`。
