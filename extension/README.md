# BPX Mind+ V2 Python Block Extension

English | [中文](README.zh-CN.md)

This extension uses the BPX SDK 1.0.9 Windows wheels provided by the public [`mirrormerobotics/bpx_sdk_open`](https://github.com/mirrormerobotics/bpx_sdk_open) repository. It does not read any repository from the user's desktop.

## Python Compatibility

- 64-bit Windows
- CPython 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, and 3.14
- 32-bit Python and PyPy are not supported

The extension package contains a native `.pyd` for every supported CPython version. When Python imports `bpx_sdk`, the matching file is selected automatically from the current interpreter's ABI tag.

## Load as a Test Extension in Mind+

Build the extension from the [repository root](../README.md#extension-development-and-packaging). In Mind+ Python Block Mode, enable Extension Developer Mode and select `config.json` from the generated extension directory. Keep the complete generated directory together.
