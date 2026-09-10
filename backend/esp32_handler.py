import threading
import time
import requests
import random
from config import Config
from backend.rover_state import rover_state

class ESP32Handler:
    def __init__(self):
        self.running = False
        self.poll_thread = None
        self.timeout = 2.0

    def start(self):
        self.running = True
        self.poll_thread = threading.Thread(target=self._poll_loop, daemon=True)
        self.poll_thread.start()

    def stop(self):
        self.running = False
        if self.poll_thread:
            self.poll_thread.join()

    def send_command(self, command, speed=None):
        """Send a movement command to the physical ESP32 via HTTP"""
        if Config.DEMO_MODE:
            print(f"[DEMO] Sending command {command} with speed {speed}")
            return True

        url = f"{Config.ESP32_URL}/"
        try:
            if command == "stop" or command == "emergency_stop":
                res = requests.get(f"{url}stop", timeout=self.timeout)
            elif command in ["forward", "backward", "left", "right"]:
                res = requests.get(f"{url}move?direction={command}", timeout=self.timeout)
            
            if speed is not None:
                requests.get(f"{url}speed?value={speed}", timeout=self.timeout)
            
            return True
        except requests.exceptions.RequestException as e:
            print(f"Error communicating with ESP32: {e}")
            rover_state.esp32_connected = False
            return False

    def send_mode(self, mode):
        if Config.DEMO_MODE:
            return True
        try:
            res = requests.get(f"{Config.ESP32_URL}/mode?state={mode}", timeout=self.timeout)
            return res.status_code == 200
        except requests.exceptions.RequestException:
            return False

    def send_distance_command(self, direction, cm):
        if Config.DEMO_MODE:
            return True
        try:
            res = requests.get(f"{Config.ESP32_URL}/command?dir={direction}&cm={cm}", timeout=self.timeout)
            return res.status_code == 200
        except requests.exceptions.RequestException:
            return False

    def _poll_loop(self):
        """Poll telemetry data from the ESP32 (or simulate it in DEMO mode)"""
        while self.running:
            if Config.DEMO_MODE:
                self._simulate_telemetry()
                time.sleep(1.0)
            else:
                self._fetch_telemetry()
                time.sleep(0.3) # ESP32 updates every 300ms in html

    def _fetch_telemetry(self):
        try:
            res = requests.get(f"{Config.ESP32_URL}/sensor", timeout=self.timeout)
            if res.status_code == 200:
                data = res.json()
                rover_state.update_telemetry(data)
                rover_state.esp32_connected = True
        except requests.exceptions.RequestException:
            rover_state.esp32_connected = False
            rover_state.mpu6050_connected = False
            rover_state.lidar_connected = False

    def _simulate_telemetry(self):
        """Generate fake telemetry data for UI testing"""
        # Simulate moving if a command is active
        state = rover_state.get_full_state()
        cmd = state["motors"]["current_command"]
        
        sim_data = {
            "tot": state["telemetry"]["tot"] + (1.5 if cmd != "stop" else 0.0),
            "bwd": state["telemetry"]["bwd"] + (1.5 if cmd == "backward" else 0.0),
            "disp": state["telemetry"]["disp"] + (1.0 if cmd != "stop" else 0.0),
            "heading": (state["telemetry"]["heading"] + (2.0 if cmd == "right" else -2.0 if cmd == "left" else 0.0)) % 360.0,
            "x": state["telemetry"]["x"] + (1.0 if cmd == "forward" else 0.0),
            "y": state["telemetry"]["y"] + (1.0 if cmd == "forward" else 0.0),
            "lidar": random.randint(15, 100) if random.random() > 0.1 else 0, # sometimes disconnects
            "temp": 24.5 + random.random()
        }
        
        rover_state.update_telemetry(sim_data)
        rover_state.esp32_connected = True

esp32_handler = ESP32Handler()
