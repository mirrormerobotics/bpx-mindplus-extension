# BPX Mind+ 扩展打包工具

这是一个通用的 Mind+ V2 扩展打包工具，同时保留 **BPX Python 积木扩展 0.1.3** 作为完整示例。脚本默认使用仓库内置的 **Mind+ V2 官方 `mindplus-ext2-builder` 模板构建快照**，放入扩展源码，执行 `npm run build`，最后生成 Mind+ 可加载的 ZIP。

可以直接打包 BPX 示例，也可以指定自己的扩展文件夹。打包工具不会自动把任意 Python 文件转换为积木；自定义扩展仍需按 Mind+ 规范编写积木定义、代码生成逻辑和扩展配置。

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
- 能访问 npm 依赖下载源（`npm ci` 需要安装依赖）

默认使用内置模板，无需从 Gitee 下载。只有内置模板缺失且未指定 `-TemplatePath` 时，脚本才尝试从官方 Gitee 仓库下载模板。

BPX 示例运行环境为 Windows 64 位、CPython 3.8–3.14，以及 Mind+ V2.0.7 或更高版本的 Python 积木模式。Node.js 用于打包，Python 用于运行 BPX 积木，二者用途不同。

## 一键打包

1. 将本仓库下载并解压到本地电脑，或通过 Git 克隆。
2. 在资源管理器中打开仓库根目录，即同时能看到 `README.md` 和 `extension-builder` 文件夹的位置。
3. 点击资源管理器地址栏，输入 `powershell` 并回车，打开位于该目录的 PowerShell。
4. 输入下面的命令并回车：

```powershell
powershell -ExecutionPolicy Bypass -File .\extension-builder\build-extension.ps1
```

脚本会自动完成：

1. 复制仓库内置的 Mind+ V2 官方模板构建快照（不依赖 Gitee 临时下载）。
2. 将 `source/extension` 覆盖到模板的 `extension` 目录。
3. 执行 `npm ci` 安装官方模板依赖。
4. 自动设置官方模板与新版 Node.js 所需的构建兼容选项，再执行 `npm run build` 编译积木扩展；结束后恢复原有选项。
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

必须保留整个解压目录，不能只复制 `config.json`。加载和使用方法见[仓库首页指导说明书](../README.md)。

### 与 Release 的对应关系

[v0.1.3 Release](https://github.com/mirrormerobotics/bpx-mindplus-extension/releases/tag/v0.1.3) 的 ZIP 由对应标签下的本脚本和默认 BPX 源码生成，没有另行手工修改产物。

需要复现某个已发布版本时，请下载该版本标签下的仓库源码，再执行打包命令；`master` 分支可能随后续版本继续更新。相同源码和构建依赖应生成相同的运行内容，但 ZIP 内的文件时间戳可能导致整个 ZIP 的 SHA-256 不同。

## 使用已经下载的官方模板

需要换用 Mind+ 官方模板的其他版本时，可以手动下载并解压，然后运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\extension-builder\build-extension.ps1 `
  -TemplatePath "C:\path\to\mindplus-ext2-builder"
```

请将示例路径换成实际模板文件夹，该文件夹内应包含 `package.json`。指定模板可能改变依赖和构建结果；复现本仓库 Release 时应使用对应标签内置的模板。

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

脚本会从用户扩展的 `public/config.json` 自动读取 `author`、`id` 和 `version`，所以不需要修改打包脚本。文件夹路径含空格时请用双引号包住。

产物命名为 `MindPlus-extension-作者-ID-v版本号.zip`，默认保存在 `extension-builder/dist/`。详细编写方法见 [自定义扩展开发教程](docs/develop-your-extension.md)，其中介绍 `config.json`、`index.js` 和 `func.js` 的编写方法。

## 修改扩展

- 扩展信息和版本号：`source/extension/public/config.json`
- 积木定义：`source/extension/index.js`
- Python 代码生成：`source/extension/func.js`
- 中英文翻译：`source/extension/locales/`
- BPX Python SDK：`source/extension/public/libraries/bpx_sdk/`
- BPX 动作封装：`source/extension/public/libraries/bpx_sdk/mindplus_control.py`

0.1.3 的站立和趴下状态等待、定时速度及停止流程、步态确认和侧翻流程由 `mindplus_control.py` 实现；`func.js` 生成调用这些功能的 Python 代码。

修改后重新运行打包脚本。不要手工修改 `.work/` 或 `dist/` 中的文件，因为它们会在下次构建时重新生成。

## 发布

1. 修改功能时同步更新扩展配置中的版本号，并重新打包、测试。
2. 将扩展源码和必要的运行依赖提交到仓库，不提交 `dist/`、`.work/` 或 `node_modules/`。
3. 用本次构建所对应的源码提交创建版本标签和 GitHub Release。
4. 将 `dist/` 中实际生成的 ZIP 作为 Release 附件上传，不要再手工改包内内容。

模板会将 `public/` 中的文件复制进发布包，因此这里仅放正式发布需要的资源和运行文件，不要放临时测试说明、笔记或调试文件。

## 常见问题

- **提示找不到 `node`**：安装 Node.js 后关闭并重新打开 PowerShell，用 `node -v` 确认可用。
- **`npm -v` 提示脚本被禁止**：可使用 `npm.cmd -v` 检查。打包脚本在 Windows 下优先调用 `npm.cmd`。
- **找不到打包脚本**：确认 PowerShell 当前目录是仓库根目录，而不是 `extension-builder` 文件夹内部。
- **配置文件无效**：检查 `public/config.json` 的 JSON 格式及 `id`、`author`、`version`、`mode` 字段，文件应使用 UTF-8 编码。
- **依赖安装失败**：检查终端中 `npm ci` 的具体错误及网络连接；不要将未完成构建的文件上传为 Release。
