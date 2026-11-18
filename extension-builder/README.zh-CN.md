# BPX Mind+ 扩展打包工具

[English](README.md) | 中文

此目录提供可选的 PowerShell 打包脚本。脚本使用仓库根目录的 Mind+ V2 构建文件，放入指定的扩展源码，执行 `npm run build`，最后生成 Mind+ 可加载的 ZIP。

官方开发文档：<https://mindplus.dfrobot.com.cn/mp2/Extensions/ExtDevelopmentDocs/extension-development-overview/>

官方模板：<https://gitee.com/mind-plus/mindplus-ext2-builder>

## 目录

```text
extension-builder/
├─ build-extension.ps1       # 一键打包脚本
├─ upstream/                 # 仓库根目录构建文件的上游许可证
├─ templates/blank-extension/# 可复制的最小扩展模板
├─ docs/                     # config/index/func 编写教程
├─ dist/                     # 最终 ZIP（自动生成，不提交）
└─ .work/                    # 临时官方模板（自动生成，不提交）
```

## 环境要求

- Windows 10/11 64 位
- 推荐 PowerShell 7；仓库路径较深时，Windows PowerShell 5.1 可能遇到路径长度限制
- Node.js 18 或更高版本（包含 npm）
- 能访问 npm 依赖下载源（默认使用内置模板，无需从 Gitee 下载）

## 一键打包

在仓库根目录打开 PowerShell：

```powershell
pwsh -ExecutionPolicy Bypass -File .\extension-builder\build-extension.ps1
```

脚本会自动完成：

1. 从仓库根目录复制 Mind+ V2 构建文件。
2. 将仓库的 `extension/` 复制到临时构建目录。
3. 执行 `npm ci` 安装官方模板依赖。
4. 执行 `npm run build` 编译积木扩展。
5. 检查 `config.json`、`main.js` 和 `cover.png`。
6. 将完整扩展目录压缩到 `extension-builder/dist/`。
7. 输出 ZIP 的 SHA-256 校验值。

不传参数时构建保留的 BPX 示例。默认成果物：

```text
extension-builder/dist/MindPlus-extension-M1chael0919-bpxRobot-v0.1.4.zip
```

解压后选择下面的文件，即可在 Mind+ 的“加载测试扩展”中导入：

```text
ext-M1chael0919-bpxRobot@0.1.4/config.json
```

## 使用已经下载的官方模板

需要换用 Mind+ 官方模板的其他版本时，可以手动下载并解压，然后运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\extension-builder\build-extension.ps1 `
  -TemplatePath C:\path\to\mindplus-ext2-builder
```

## 构建你自己的扩展

先复制空白模板：

```powershell
Copy-Item .\extension-builder\templates\blank-extension .\my-extension -Recurse
```

按教程修改 `my-extension` 中的文件，然后运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\extension-builder\build-extension.ps1 `
  -ExtensionPath .\my-extension
```

脚本会从用户扩展的 `public/config.json` 自动读取 `author`、`id` 和 `version`，所以不需要修改打包脚本。详细编写方法见 [`docs/develop-your-extension.md`](docs/develop-your-extension.md)。

## 修改扩展

以下路径相对于仓库根目录：

- 扩展信息和版本号：`extension/public/config.json`
- 积木定义：`extension/index.js`
- Python 代码生成：`extension/func.js`
- 多语言翻译：`extension/locales/`
- BPX Python SDK：`extension/public/libraries/bpx_sdk/`

修改后重新运行打包脚本。不要手工修改 `.work/` 或 `dist/` 中的文件，因为它们会在下次构建时重新生成。

## 发布

`dist/` 不提交到 Git 仓库。测试通过后，在 GitHub Releases 中创建对应版本，并把生成的 ZIP 作为 Release Asset 上传。
