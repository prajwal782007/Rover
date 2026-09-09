import threading

class RoverState:
    def __init__(self):
        self._lock = threading.Lock()
        
        # Connection statuses
        self.esp32_connected = False
        self.camera_left_connected = False
        self.camera_right_connected = False
        self.mpu6050_connected = False
        self.lidar_connected = False
        
        # Telemetry Data (Matching the ESP32 code's JSON structure + previous MPU specs)
        self.telemetry = {
            "tot": 0.0,
            "bwd": 0.0,
            "disp": 0.0,
            "heading": 0.0,
            "x": 0.0,
            "y": 0.0,
            "lidar": 0,
            "temp": 0.0,
            # Synthesized MPU for full dashboard support
            "mpu6050": {
                "acceleration": {"x": 0.0, "y": 0.0, "z": 0.0},
                "gyroscope": {"x": 0.0, "y": 0.0, "z": 0.0}
            }
        }
        
        # Motor State
        self.motor_state = {
            "front_left": "STOP",
            "front_right": "STOP",
            "back_left": "STOP",
            "back_right": "STOP",
            "speed": 200,
            "current_command": "stop"
        }

    def update_telemetry(self, data):
        with self._lock:
            # Update telemetry values based on the ESP32 sensor response
            if 'tot' in data: self.telemetry['tot'] = data['tot']
            if 'bwd' in data: self.telemetry['bwd'] = data['bwd']
            if 'disp' in data: self.telemetry['disp'] = data['disp']
            if 'heading' in data: self.telemetry['heading'] = data['heading']
            if 'x' in data: self.telemetry['x'] = data['x']
            if 'y' in data: self.telemetry['y'] = data['y']
            if 'lidar' in data: 
                self.telemetry['lidar'] = data['lidar']
                self.lidar_connected = data['lidar'] > 0 # basic check for connection
            if 'temp' in data: self.telemetry['temp'] = data['temp']
            
            # Since real ESP32 provides heading via MPU6050, we set MPU connected if heading exists
            if 'heading' in data:
                self.mpu6050_connected = True

    def set_motor_state(self, command, speed=None):
        with self._lock:
            self.motor_state["current_command"] = command
            if speed is not None:
                self.motor_state["speed"] = speed

            if command == "forward":
                self._set_all_motors("FORWARD")
            elif command == "backward":
                self._set_all_motors("BACKWARD")
            elif command == "left":
                self.motor_state["front_left"] = "BACKWARD"
                self.motor_state["back_left"] = "BACKWARD"
                self.motor_state["front_right"] = "FORWARD"
                self.motor_state["back_right"] = "FORWARD"
            elif command == "right":
                self.motor_state["front_left"] = "FORWARD"
                self.motor_state["back_left"] = "FORWARD"
                self.motor_state["front_right"] = "BACKWARD"
                self.motor_state["back_right"] = "BACKWARD"
            else: # stop or emergency_stop
                self._set_all_motors("STOP")

    def _set_all_motors(self, state):
        self.motor_state["front_left"] = state
        self.motor_state["front_right"] = state
        self.motor_state["back_left"] = state
        self.motor_state["back_right"] = state

    def get_full_state(self):
        with self._lock:
            return {
                "type": "telemetry",
                "telemetry": self.telemetry,
                "motors": self.motor_state,
                "connections": {
                    "esp32": self.esp32_connected,
                    "mpu6050": self.mpu6050_connected,
                    "lidar": self.lidar_connected,
                    "camera_left": self.camera_left_connected,
                    "camera_right": self.camera_right_connected
                }
            }

rover_state = RoverState()
