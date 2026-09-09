import unittest
from backend.rover_state import RoverState

class TestRoverState(unittest.TestCase):
    def setUp(self):
        self.state = RoverState()

    def test_initial_state(self):
        self.assertFalse(self.state.esp32_connected)
        self.assertEqual(self.state.motor_state["current_command"], "stop")

    def test_update_telemetry(self):
        self.state.update_telemetry({"lidar": 50, "heading": 90.0})
        self.assertTrue(self.state.lidar_connected)
        self.assertTrue(self.state.mpu6050_connected)
        self.assertEqual(self.state.telemetry["heading"], 90.0)

    def test_motor_forward(self):
        self.state.set_motor_state("forward")
        self.assertEqual(self.state.motor_state["front_left"], "FORWARD")
        self.assertEqual(self.state.motor_state["back_right"], "FORWARD")

if __name__ == '__main__':
    unittest.main()
