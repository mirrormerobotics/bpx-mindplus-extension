import ArgumentType from '../utils/argument-type';
import BlockType from '../utils/block-type';
import blockIconURI from './icon/blockIcon.svg';
import menuIconURI from './icon/menuIcon.svg';
import Func from './func';
import {setLocaleData, formatMessage, setLocale} from '../utils/translation';
import LocaleData from './locales';

setLocaleData(LocaleData);

class ExtensionBPX {
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
            name: formatMessage({id: 'ext.bpx.name', default: 'BPX Robot'}),
            blockIconURI,
            menuIconURI,
            color1: '#3157D5',
            color2: '#2446B7',
            color3: '#193692',
            blocks: [
                ...[
                    ['resetJoints', 'BPX reset joints (ground-contact pose required)'],
                    ['invBipedalGait', 'BPX use inverted bipedal gait'],
                    ['bipedalGait', 'BPX use bipedal gait'],
                    ['pronkGait', 'BPX use pronk gait'],
                    ['leftFlip', 'BPX left flip (trigger once)'],
                    ['rightFlip', 'BPX right flip (trigger once)'],
                ].map(([opcode, label]) => ({
                    opcode,
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: `bpx.${opcode}`, default: label}),
                })),
                {
                    opcode: 'subGait',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({id: 'bpx.subGait', default: 'BPX current sub-gait'}),
                },
                {
                    opcode: 'velocityFor',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.velocityFor', default: 'BPX velocity forward [X] lateral [Y] yaw [YAW] for [SECONDS] seconds then stop'}),
                    arguments: {
                        X: {type: ArgumentType.NUMBER, defaultValue: 0},
                        Y: {type: ArgumentType.NUMBER, defaultValue: 0},
                        YAW: {type: ArgumentType.NUMBER, defaultValue: 0.2},
                        SECONDS: {type: ArgumentType.NUMBER, defaultValue: 30},
                    },
                },
                {
                    opcode: 'connect',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.connect', default: 'connect BPX at [IP]'}),
                    arguments: {
                        IP: {
                            type: ArgumentType.STRING,
                            defaultValue: '10.21.20.1',
                            inputParams: {symbol: '\"\"'}
                        }
                    }
                },
                {
                    opcode: 'isConnected',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({id: 'bpx.isConnected', default: 'BPX connected?'}),
                },
                {
                    opcode: 'disconnect',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.disconnect', default: 'disconnect BPX'}),
                },
                {
                    opcode: 'standUp',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.standUp', default: 'BPX stand up'}),
                },
                {
                    opcode: 'sitDown',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.sitDown', default: 'BPX sit down'}),
                },
                {
                    opcode: 'damping',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.damping', default: 'BPX damping mode'}),
                },
                {
                    opcode: 'walkGait',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.walkGait', default: 'BPX use walking gait'}),
                },
                {
                    opcode: 'runningGait',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.runningGait', default: 'BPX use running gait'}),
                },
                {
                    opcode: 'paceGait',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.paceGait', default: 'BPX use pace gait'}),
                },
                {
                    opcode: 'boundGait',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.boundGait', default: 'BPX use bound gait'}),
                },
                {
                    opcode: 'setVelocity',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.setVelocity', default: 'BPX velocity forward [X] lateral [Y] yaw [YAW]'}),
                    arguments: {
                        X: {type: ArgumentType.NUMBER, defaultValue: 0.3},
                        Y: {type: ArgumentType.NUMBER, defaultValue: 0},
                        YAW: {type: ArgumentType.NUMBER, defaultValue: 0}
                    }
                },
                {
                    opcode: 'stop',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({id: 'bpx.stop', default: 'BPX stop moving'}),
                },
                {
                    opcode: 'batteryLevel',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({id: 'bpx.batteryLevel', default: 'BPX battery level (%)'}),
                },
                {
                    opcode: 'imuRoll',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({id: 'bpx.imuRoll', default: 'BPX IMU roll'}),
                },
                {
                    opcode: 'imuPitch',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({id: 'bpx.imuPitch', default: 'BPX IMU pitch'}),
                },
                {
                    opcode: 'imuYaw',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({id: 'bpx.imuYaw', default: 'BPX IMU yaw'}),
                },
                {
                    opcode: 'motionState',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({id: 'bpx.motionState', default: 'BPX motion state'}),
                },
                {
                    opcode: 'currentGait',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({id: 'bpx.currentGait', default: 'BPX current gait'}),
                }
            ].sort((a, b) => {
                const order = ['connect', 'isConnected', 'disconnect', 'resetJoints',
                    'standUp', 'sitDown', 'damping', 'walkGait', 'runningGait',
                    'paceGait', 'boundGait', 'pronkGait', 'invBipedalGait', 'bipedalGait',
                    'leftFlip', 'rightFlip', 'setVelocity', 'velocityFor', 'stop',
                    'batteryLevel', 'imuRoll', 'imuPitch', 'imuYaw', 'motionState',
                    'currentGait', 'subGait'];
                return order.indexOf(a.opcode) - order.indexOf(b.opcode);
            }),
            menus: {}
        };
    }
}

export default ExtensionBPX;
