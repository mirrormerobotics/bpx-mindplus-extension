# 编写自己的 Mind+ V2 Python 积木扩展

构建器只能负责编译、检查和打包。开发者仍需描述“积木长什么样”和“每块积木生成什么 Python 代码”。最少需要 `config.json`、`index.js`、`func.js` 和封面图片。

建议先复制 `templates/blank-extension`，在能够成功构建后逐步增加积木。

## 1. 文件结构

```text
my-extension/
├─ index.js                 # 积木外观、参数和菜单
├─ func.js                  # 每块积木生成的 Python 代码
├─ icon/
│  ├─ blockIcon.svg
│  └─ menuIcon.svg
├─ locales/
│  ├─ en.json
│  ├─ zh-cn.json
│  └─ index.js
└─ public/
   ├─ config.json           # 扩展身份和版本
   ├─ cover.png             # 扩展库卡片封面
   ├─ README.md
   ├─ requirements.txt      # 可选的 Python 依赖说明
   └─ libraries/            # 可选：随扩展复制的 Python/C/C++ 运行库
```

## 2. config.json

```json
{
  "id": "helloExample",
  "version": "1.0.0",
  "name": {
    "zh-cn": "我的扩展",
    "en": "My Extension"
  },
  "description": {
    "zh-cn": "第一个 Mind+ 扩展",
    "en": "My first Mind+ extension"
  },
  "author": "yourname",
  "cover": "cover.png",
  "main": "main.js",
  "isDevice": false,
  "sku": "",
  "mode": "python-block",
  "meta": {
    "runtimeVersion": "0.0.1"
  }
}
```

- `id`：扩展的永久标识。发布后不要修改。
- `author`：作者标识，会进入生成目录名。只使用英文字母、数字、点、下划线或连字符。
- `version`：语义化版本，例如 `1.0.0`；每次发布应递增。
- `name`、`description`：扩展库中显示的中英文名称和说明。
- `mode`：本模板使用 `python-block`。
- `cover`、`main`：通常保持 `cover.png` 和 `main.js`。

生成目录名为：

```text
ext-<author>-<id>@<version>
```

## 3. index.js：定义积木

`getInfo()` 返回扩展名称、颜色、图标和积木列表。最重要的是 `opcode`：它把积木和 `func.js` 中的同名方法连接起来。

```js
{
  opcode: 'sayHello',
  blockType: BlockType.COMMAND,
  text: formatMessage({
    id: 'helloExample.sayHello',
    default: 'print [TEXT]'
  }),
  arguments: {
    TEXT: {
      type: ArgumentType.STRING,
      defaultValue: 'Hello Mind+',
      inputParams: { symbol: '""' }
    }
  }
}
```

- `COMMAND`：命令积木，生成一条或多条语句。
- `REPORTER`：圆角值积木，返回字符串或数字表达式。
- `BOOLEAN`：菱形条件积木，返回真假表达式。
- `arguments` 的键（例如 `TEXT`）必须与积木文字中的 `[TEXT]` 一致。
- 发布后不要随意修改已有积木的 `opcode` 或参数键，否则旧项目可能无法加载。

## 4. func.js：生成 Python 代码

方法名必须与积木的 `opcode` 完全一致：

```js
sayHello(generator, block, parameter) {
    const text = parameter.TEXT.code;
    return `print(${text})`;
}
```

值积木需要返回“Python 表达式 + 运算优先级”：

```js
helloText(generator) {
    return ['"Hello Mind+"', generator.ORDER_ATOMIC];
}
```

需要导入 Python 模块时：

```js
generator.addImport('import time');
```

不要直接拼接未经处理的用户文字；优先使用 `parameter.<参数名>.code`，让 Mind+ 生成器负责字符串引号和表达式。

## 5. 翻译

`locales/zh-cn.json`：

```json
{
  "ext.helloExample.name": "我的扩展",
  "helloExample.sayHello": "打印 [TEXT]"
}
```

`locales/en.json` 使用相同的键，仅替换显示文字。`locales/index.js` 汇总语言内容；官方模板构建时也会处理本地化文件。

## 6. 图片与第三方库

- 用自己的 `public/cover.png` 替换示例封面。
- `icon/*.svg` 应替换成自己的积木图标。
- 纯 Python 文件可放在 `public/libraries/`。
- `.pyd`、`.dll` 等原生库必须与目标操作系统和 Python 版本匹配。
- 如果扩展依赖多个 Python 版本，应像 BPX 示例一样分别提供对应版本的 `.pyd`。

## 7. 构建和测试

```powershell
powershell -ExecutionPolicy Bypass -File .\extension-builder\build-extension.ps1 `
  -ExtensionPath .\my-extension
```

成功后解压 `extension-builder/dist/` 中的 ZIP，在 Mind+ 开发者模式中点击“加载测试扩展”，选择解压目录内的 `config.json`。

构建成功不等于功能正确。必须逐块检查积木外观、生成的 Python 代码、依赖加载和实际运行结果。

## 8. 发布前检查

- `id` 和 `author` 使用稳定的英文标识。
- 版本号已递增。
- 中英文名称、积木文字完整。
- 不包含密码、令牌、个人路径或无关文件。
- 所有支持的 Python 版本均已测试。
- ZIP 放入 GitHub Release，不直接提交到源码目录。

