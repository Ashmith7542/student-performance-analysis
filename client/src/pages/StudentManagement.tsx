import React, { useState, useEffect } from "react";
import { apiRequest } from "../lib/api";

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    class: "",
    department: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      const response = await apiRequest("/students", { method: "GET" });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await apiRequest("/students", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      fetchStudents();
      setFormData({ name: "", rollNumber: "", class: "", department: "" });
    } catch (error) {
      console.error("Error adding student:", error);
    }
  }

  return (
    <div>
      <h1>Student Management</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Roll Number"
          value={formData.rollNumber}
          onChange={(e) =>
            setFormData({ ...formData, rollNumber: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Class"
          value={formData.class}
          onChange={(e) => setFormData({ ...formData, class: e.target.value })}
        />
        <input
          type="text"
          placeholder="Department"
          value={formData.department}
          onChange={(e) =>
            setFormData({ ...formData, department: e.target.value })
          }
        />
        <button type="submit">Add Student</button>
      </form>

      <h2>Student List</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            {student.name} - {student.rollNumber} - {student.class} - {student.department}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentManagement;