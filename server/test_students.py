import unittest
from app import app
from models import students_collection
from bson.objectid import ObjectId

class TestStudentAPI(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.student_id = None

    def test_add_student(self):
        response = self.app.post("/api/students", json={
            "name": "John Doe",
            "rollNumber": "12345",
            "class": "10A",
            "department": "Science"
        })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.student_id = data["data"]["id"]

    def test_get_students(self):
        response = self.app.get("/api/students")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertIsInstance(data["data"], list)

    def test_update_student(self):
        if not self.student_id:
            self.test_add_student()
        response = self.app.put(f"/api/students/{self.student_id}", json={
            "name": "John Updated",
            "class": "10B"
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])

    def test_delete_student(self):
        if not self.student_id:
            self.test_add_student()
        response = self.app.delete(f"/api/students/{self.student_id}")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])

    def tearDown(self):
        if self.student_id:
            students_collection.delete_one({"_id": ObjectId(self.student_id)})

if __name__ == "__main__":
    unittest.main()