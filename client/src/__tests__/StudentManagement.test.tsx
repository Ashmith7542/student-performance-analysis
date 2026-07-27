import { render, screen, fireEvent } from "@testing-library/react";
import StudentManagement from "../pages/StudentManagement";
import { apiRequest } from "../lib/api";

jest.mock("../lib/api");

describe("StudentManagement Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders student management form and list", async () => {
    (apiRequest as jest.Mock).mockResolvedValueOnce({
      data: [
        { id: "1", name: "John Doe", rollNumber: "123", class: "10A", department: "Science" },
      ],
    });

    render(<StudentManagement />);

    expect(await screen.findByText("Student Management")).toBeInTheDocument();
    expect(await screen.findByText("John Doe")).toBeInTheDocument();
  });

  test("adds a new student", async () => {
    (apiRequest as jest.Mock).mockResolvedValueOnce({ data: [] }); // Initial fetch
    (apiRequest as jest.Mock).mockResolvedValueOnce({}); // Add student
    (apiRequest as jest.Mock).mockResolvedValueOnce({
      data: [
        { id: "1", name: "Jane Doe", rollNumber: "456", class: "10B", department: "Arts" },
      ],
    }); // Fetch after adding

    render(<StudentManagement />);

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Roll Number"), {
      target: { value: "456" },
    });
    fireEvent.change(screen.getByPlaceholderText("Class"), {
      target: { value: "10B" },
    });
    fireEvent.change(screen.getByPlaceholderText("Department"), {
      target: { value: "Arts" },
    });

    fireEvent.click(screen.getByText("Add Student"));

    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
  });
});