"""Mind+ 0.1.3 synchronous helpers. No automatic reconnect or calibration retry."""
import math
import time


class MindPlusControl:
    INTERVAL = 0.2

    def __init__(self, motion):
        self.motion = motion

    def require(self):
        if not self.motion.isConnected():
            raise RuntimeError("BPX connection lost; stop the robot using its local controls.")
        return self.motion

    def call(self, method, *args):
        result = getattr(self.require(), method)(*args)
        if result is False:
            raise RuntimeError("BPX command failed: " + method)
        return result

    def best_effort_stop(self):
        # Cleanup must not hide the original error, and cannot guarantee a stop on disconnect.
        for method, args in (("setVelocityControlFlag", (False,)),
                             ("setVelocity", (0.0, 0.0, 0.0))):
            try:
                self.call(method, *args)
            except Exception:
                pass

    def repeat_for(self, method, seconds, *args):
        deadline = time.monotonic() + seconds
        while True:
            self.call(method, *args)
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                return
            time.sleep(min(self.INTERVAL, remaining))

    def reset_joints(self):
        # User must position feet, shins and knee regions against the ground FIRST.
        self.call("setZeroPositionsFlag")
        time.sleep(1.0)
        self.require()

    def stand(self):
        deadline = time.monotonic() + 15.0
        try:
            while True:
                self.call("setStandUp")
                if self.call("getCurrentMotionState") == 6:
                    return
                if time.monotonic() >= deadline:
                    raise RuntimeError("BPX stand-up timed out after 15 seconds.")
                time.sleep(self.INTERVAL)
        except BaseException:
            self.best_effort_stop()
            raise

    def lie_down(self):
        deadline = time.monotonic() + 15.0
        try:
            self.call("setVelocityControlFlag", False)
            while True:
                self.call("setSitDown")
                # 3 is the transition; only 0 means fully lying down.
                if self.call("getCurrentMotionState") == 0:
                    return
                if time.monotonic() >= deadline:
                    raise RuntimeError("BPX lie-down timed out after 15 seconds.")
                time.sleep(self.INTERVAL)
        except BaseException:
            self.best_effort_stop()
            raise

    def stop(self):
        try:
            self.repeat_for("setVelocity", 2.0, 0.0, 0.0, 0.0)
            self.call("setVelocityControlFlag", False)
        except BaseException:
            self.best_effort_stop()
            raise

    @staticmethod
    def finite(value):
        value = float(value)
        if not math.isfinite(value):
            raise ValueError("BPX velocity and duration must be finite numbers.")
        return value

    def velocity(self, x, y, yaw):
        values = tuple(self.finite(v) for v in (x, y, yaw))
        try:
            self.call("setVelocityControlFlag", True)
            self.call("setVelocity", *values)
        except BaseException:
            self.best_effort_stop()
            raise

    def velocity_for(self, x, y, yaw, seconds):
        values = tuple(self.finite(v) for v in (x, y, yaw))
        seconds = self.finite(seconds)
        if seconds < 0:
            raise ValueError("BPX duration cannot be negative.")
        try:
            if seconds > 0:
                self.call("setVelocityControlFlag", True)
                self.repeat_for("setVelocity", seconds, *values)
            self.stop()
        except BaseException:
            self.best_effort_stop()
            raise

    def gait(self, method, main_gait, sub_gait=None):
        try:
            self.call(method)  # Trigger once: do not retrigger jumps or balance transitions.
            deadline = time.monotonic() + 5.0
            while True:
                gait = self.call("getCurrentGait")
                sub = self.sub_gait() if sub_gait is not None else None
                if gait == main_gait and (sub_gait is None or sub == sub_gait):
                    return
                if time.monotonic() >= deadline:
                    raise RuntimeError("BPX gait confirmation timed out: " + method)
                time.sleep(self.INTERVAL)
        except BaseException:
            self.best_effort_stop()
            raise

    def flip(self, method, target_sub):
        if (method, target_sub) not in (("setLeftFlip", -1), ("setRightFlip", -2)):
            raise ValueError("Unsupported BPX flip.")
        try:
            self.stop()
            started = time.monotonic()
            self.call(method)  # Exactly one trigger.
            cleared = False
            while True:
                elapsed = time.monotonic() - started
                if not cleared:
                    accepted = (self.call("getCurrentGait") == 4
                                and self.sub_gait() == target_sub)
                    if accepted or elapsed >= 0.5:
                        # Raw request clear, not blocking gait confirmation.
                        self.call("setWalk")
                        cleared = True
                if elapsed >= 5.0:
                    break
                time.sleep(min(0.1, 5.0 - elapsed))
            self.call("setWalk")
        except BaseException:
            try:
                self.call("setWalk")
            except Exception:
                pass
            self.best_effort_stop()
            raise

    def sub_gait(self):
        raw = self.call("getSubGait")
        if raw is None:
            return None
        raw = int(raw)
        return raw - 256 if raw > 127 else raw

    def emergency_stop(self):
        self.call("setDamping")  # Software command only; not a hardware E-stop.
