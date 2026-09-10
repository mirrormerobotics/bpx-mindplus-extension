# BPX Mind+ V2 Python Block Extension

English | [中文](README.zh-CN.md)

This extension uses the BPX SDK 1.0.9 Windows wheels provided by the public [`mirrormerobotics/bpx_sdk_open`](https://github.com/mirrormerobotics/bpx_sdk_open) repository. It does not read any repository from the user's desktop.

## Python Compatibility

- 64-bit Windows
- CPython 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, and 3.14
- 32-bit Python and PyPy are not supported

The extension package contains a native `.pyd` for every supported CPython version. When Python imports `bpx_sdk`, the matching file is selected automatically from the current interpreter's ABI tag.

## Load as a Test Extension in Mind+

Enable Extension Developer Mode in Mind+ Python Block Mode, then select `config.json` from this directory. Keep `config.json`, `main.js`, `requirements.txt`, and the complete `libraries/bpx_sdk` directory together. Do not copy only `config.json`.
