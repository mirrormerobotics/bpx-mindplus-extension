# BPX Mind+ 扩展打包工具

这是一个通用的 Mind+ V2 扩展构建器，同时保留 BPX Python 积木扩展作为完整示例。脚本默认使用仓库内置的 **Mind+ V2 官方 `mindplus-ext2-builder` 模板构建快照**，放入用户指定的扩展源码，执行官方的 `npm run build`，最后生成 Mind+ 可加载的 ZIP。

官方开发文档：<https://mindplus.dfrobot.com.cn/mp2/Extensions/ExtDevelopmentDocs/extension-development-overview/>

官方模板：<https://gitee.com/mind-plus/mindplus-ext2-builder>

## 目录

```text
extension-builder/
├─ build-extension.ps1       # 一键打包脚本
├─ official-template/        # Mind+ V2 官方模板的构建文件快照
├─ source/extension/         # 完整 BPX 示例（默认构建）
├─ templates/blank-extension/# 可复制的最小扩展模板
├─ docs/                     # config/index/func 编写教程
├─ dist/                     # 最终 ZIP（自动生成，不提交）
└─ .work/                    # 临时官方模板（自动生成，不提交）
```

## 环境要求

- Windows 10/11 64 位
- PowerShell 5.1 或 PowerShell 7
- Node.js 18 或更高版本（包含 npm）
- 能访问 npm 依赖下载源（默认使用内置模板，无需从 Gitee 下载）

## 一键打包

在仓库根目录打开 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\extension-builder\build-extension.ps1
```

脚本会自动完成：

1. 复制仓库内置的 Mind+ V2 官方模板构建快照（不依赖 Gitee 临时下载）。
2. 将 `source/extension` 覆盖到模板的 `extension` 目录。
3. 执行 `npm ci` 安装官方模板依赖。
4. 执行 `npm run build` 编译积木扩展。
5. 检查 `config.json`、`main.js` 和 `cover.png`。
6. 将完整扩展目录压缩到 `extension-builder/dist/`。
7. 输出 ZIP 的 SHA-256 校验值。

不传参数时构建保留的 BPX 示例。默认成果物：

```text
extension-builder/dist/MindPlus-extension-mirrormerobotics-bpxRobot-v0.1.3.zip
```

解压后选择下面的文件，即可在 Mind+ 的“加载测试扩展”中导入：

```text
ext-mirrormerobotics-bpxRobot@0.1.3/config.json
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

- 扩展信息和版本号：`source/extension/public/config.json`
- 积木定义：`source/extension/index.js`
- Python 代码生成：`source/extension/func.js`
- 中英文翻译：`source/extension/locales/`
- BPX Python SDK：`source/extension/public/libraries/bpx_sdk/`
- BPX 动作封装：`source/extension/public/libraries/bpx_sdk/mindplus_control.py`

修改后重新运行打包脚本。不要手工修改 `.work/` 或 `dist/` 中的文件，因为它们会在下次构建时重新生成。

## 发布

`dist/` 不提交到 Git 仓库。测试通过后，在 GitHub Releases 中创建对应版本，并把生成的 ZIP 作为 Release Asset 上传。
