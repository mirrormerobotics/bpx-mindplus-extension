import ArgumentType from '../utils/argument-type';
import BlockType from '../utils/block-type';
import blockIconURI from './icon/blockIcon.svg';
import menuIconURI from './icon/menuIcon.svg';
import Func from './func';
import {setLocaleData, formatMessage, setLocale} from '../utils/translation';
import LocaleData from './locales';

setLocaleData(LocaleData);

class Extension {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        this.funcs = new Func(runtime, extensionId);
    }

    setLocale(locale) {
        setLocale(locale);
    }

    getCodePrimitives() {
        return this.funcs;
    }

    getInfo() {
        return {
            name: formatMessage({id: 'ext.helloExample.name', default: 'My Extension'}),
            blockIconURI,
            menuIconURI,
            color1: '#3776ab',
            color2: '#2f6690',
            color3: '#28577a',
            blocks: [
                {
                    opcode: 'sayHello',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'helloExample.sayHello', default: 'print [TEXT]'}),
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello Mind+',
                            inputParams: {symbol: '""'}
                        }
                    }
                },
                {
                    opcode: 'helloText',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({id: 'helloExample.helloText', default: 'hello text'})
                }
            ],
            menus: {}
        };
    }
}

export default Extension;
