# BPX Mind+ 扩展打包工具

这个子目录保存 BPX Python 积木扩展的可重复打包流程。脚本会下载 **Mind+ V2 官方 `mindplus-ext2-builder` 模板**，将 `source/extension` 中的 BPX 源码放入模板，执行官方的 `npm run build`，最后生成 Mind+ 可加载的 ZIP。

官方开发文档：<https://mindplus.dfrobot.com.cn/mp2/Extensions/ExtDevelopmentDocs/extension-development-overview/>

官方模板：<https://gitee.com/mind-plus/mindplus-ext2-builder>

## 目录

```text
extension-builder/
├─ build-extension.ps1       # 一键打包脚本
├─ source/extension/         # BPX 扩展源码和运行库
├─ dist/                     # 最终 ZIP（自动生成，不提交）
└─ .work/                    # 临时官方模板（自动生成，不提交）
```

## 环境要求

- Windows 10/11 64 位
- PowerShell 5.1 或 PowerShell 7
- Node.js 18 或更高版本（包含 npm）
- 能访问 Mind+ 官方 Gitee 模板仓库

## 一键打包

在仓库根目录打开 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\extension-builder\build-extension.ps1
```

脚本会自动完成：

1. 下载 Mind+ V2 官方模板。
2. 将 `source/extension` 覆盖到模板的 `extension` 目录。
3. 执行 `npm ci` 安装官方模板依赖。
4. 执行 `npm run build` 编译积木扩展。
5. 检查 `config.json`、`main.js` 和 `cover.png`。
6. 将完整扩展目录压缩到 `extension-builder/dist/`。
7. 输出 ZIP 的 SHA-256 校验值。

默认成果物：

```text
extension-builder/dist/BPX-MindPlus-extension-v0.1.2-mirrormerobotics-win-cp38-cp314.zip
```

解压后选择下面的文件，即可在 Mind+ 的“加载测试扩展”中导入：

```text
ext-mirrormerobotics-bpxRobot@0.1.2/config.json
```

## 使用已经下载的官方模板

网络不稳定时，可以先手动下载并解压官方模板，然后运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\extension-builder\build-extension.ps1 `
  -TemplatePath C:\path\to\mindplus-ext2-builder
```

## 修改扩展

- 扩展信息和版本号：`source/extension/public/config.json`
- 积木定义：`source/extension/index.js`
- Python 代码生成：`source/extension/func.js`
- 中英文翻译：`source/extension/locales/`
- BPX Python SDK：`source/extension/public/libraries/bpx_sdk/`

修改后重新运行打包脚本。不要手工修改 `.work/` 或 `dist/` 中的文件，因为它们会在下次构建时重新生成。

## 发布

`dist/` 不提交到 Git 仓库。测试通过后，在 GitHub Releases 中创建对应版本，并把生成的 ZIP 作为 Release Asset 上传。

