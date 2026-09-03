class Func {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        this.extensionId = extensionId;
    }

    _addCore(generator) {
        generator.addImport('import time');
        generator.addImport('import bpx_sdk');
        generator.addImport('from bpx_sdk.mindplus_control import MindPlusControl');
        generator.addVariable('bpx_motion', 'bpx_motion = None');
        generator.addFunction([
            'def _bpx_require():',
            '    if bpx_motion is None or not bpx_motion.isConnected():',
            '        raise RuntimeError("BPX is not connected. Add the BPX connect block first.")',
            '    return bpx_motion',
        ].join('\n'), true);
        generator.addFunction([
            'def _bpx_imu_axis(axis):',
            '    values = _bpx_require().getImuRpy()',
            '    return values[axis] if values is not None else None',
        ].join('\n'), true);
    }

    connect(generator, block, parameter) {
        this._addCore(generator);
        const ip = parameter.IP.code;
        generator.addInit('bpx_connect', [
            'if bpx_motion is not None:',
            '    bpx_motion.disconnect()',
            'bpx_motion = bpx_sdk.MotionLevelControl()',
            `bpx_motion.setRobotIp(str(${ip}))`,
            'bpx_motion.setRobotStateUploadPort(bpx_sdk.DEFAULT_CLIENT_ROBOT_STATE_UDP_PORT)',
            'bpx_motion.setTcpLocalPort(0)',
            'bpx_motion.setRobotStateUploadRate(50)',
            'bpx_motion.setMotionCommandRate(50)',
            'if not bpx_motion.connect():',
            '    raise RuntimeError("Unable to connect to BPX. Check the network and robot IP.")',
            'bpx_connect_deadline = time.time() + 15.0',
            'while not bpx_motion.isConnected() and time.time() < bpx_connect_deadline:',
            '    time.sleep(0.1)',
            'if not bpx_motion.isConnected():',
            '    raise RuntimeError("BPX connection timed out after 15 seconds. Check that the computer and BPX are on the same network.")',
            'bpx_motion.setVelocityControlFlag(True)',
        ].join('\n'), 5, true);
        return '';
    }

    isConnected(generator) {
        this._addCore(generator);
        return ['bpx_motion is not None and bpx_motion.isConnected()', generator.ORDER_ATOMIC];
    }

    disconnect(generator) {
        this._addCore(generator);
        return 'bpx_motion.disconnect() if bpx_motion is not None else None';
    }

    standUp(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).stand()';
    }

    sitDown(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).lie_down()';
    }

    damping(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).emergency_stop()';
    }

    walkGait(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).gait("setWalk", 0)';
    }

    runningGait(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).gait("setRunning", 8, 0)';
    }

    paceGait(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).gait("setPace", 6, 2)';
    }

    boundGait(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).gait("setBound", 6, 1)';
    }

    setVelocity(generator, block, parameter) {
        this._addCore(generator);
        return `MindPlusControl(_bpx_require()).velocity(float(${parameter.X.code}), float(${parameter.Y.code}), float(${parameter.YAW.code}))`;
    }

    stop(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).stop()';
    }

    resetJoints(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).reset_joints()';
    }

    velocityFor(generator, block, parameter) {
        this._addCore(generator);
        return `MindPlusControl(_bpx_require()).velocity_for(float(${parameter.X.code}), float(${parameter.Y.code}), float(${parameter.YAW.code}), float(${parameter.SECONDS.code}))`;
    }

    bipedalGait(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).gait("setBipedal", 3, 1)';
    }

    invBipedalGait(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).gait("setInvBipedal", 3, -1)';
    }

    pronkGait(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).gait("setPronk", 6, -1)';
    }

    leftFlip(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).flip("setLeftFlip", -1)';
    }

    rightFlip(generator) {
        this._addCore(generator);
        return 'MindPlusControl(_bpx_require()).flip("setRightFlip", -2)';
    }

    subGait(generator) {
        this._addCore(generator);
        return ['MindPlusControl(_bpx_require()).sub_gait()', generator.ORDER_ATOMIC];
    }

    batteryLevel(generator) {
        this._addCore(generator);
        return ['_bpx_require().getBatteryLevel()', generator.ORDER_ATOMIC];
    }

    imuRoll(generator) {
        this._addCore(generator);
        return ['_bpx_imu_axis(0)', generator.ORDER_ATOMIC];
    }

    imuPitch(generator) {
        this._addCore(generator);
        return ['_bpx_imu_axis(1)', generator.ORDER_ATOMIC];
    }

    imuYaw(generator) {
        this._addCore(generator);
        return ['_bpx_imu_axis(2)', generator.ORDER_ATOMIC];
    }

    motionState(generator) {
        this._addCore(generator);
        return ['_bpx_require().getCurrentMotionState()', generator.ORDER_ATOMIC];
    }

    currentGait(generator) {
        this._addCore(generator);
        return ['_bpx_require().getCurrentGait()', generator.ORDER_ATOMIC];
    }
}

export default Func;
