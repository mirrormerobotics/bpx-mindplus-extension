class Func {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        this.extensionId = extensionId;
    }

    _addCore(generator) {
        generator.addImport('import time');
        generator.addImport('import bpx_sdk');
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
        return '_bpx_require().setStandUp()';
    }

    sitDown(generator) {
        this._addCore(generator);
        return '_bpx_require().setSitDown()';
    }

    damping(generator) {
        this._addCore(generator);
        return '_bpx_require().setDamping()';
    }

    walkGait(generator) {
        this._addCore(generator);
        return '_bpx_require().setWalk()';
    }

    runningGait(generator) {
        this._addCore(generator);
        return '_bpx_require().setRunning()';
    }

    paceGait(generator) {
        this._addCore(generator);
        return '_bpx_require().setPace()';
    }

    boundGait(generator) {
        this._addCore(generator);
        return '_bpx_require().setBound()';
    }

    setVelocity(generator, block, parameter) {
        this._addCore(generator);
        return `_bpx_require().setVelocity(float(${parameter.X.code}), float(${parameter.Y.code}), float(${parameter.YAW.code}))`;
    }

    stop(generator) {
        this._addCore(generator);
        return '_bpx_require().setVelocity(0.0, 0.0, 0.0)';
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
