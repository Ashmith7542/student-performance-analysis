import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { fetchNotes, uploadNote } from "@/lib/api";
import { toast } from "sonner";

export default function TeacherUploadNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    subject: "Physics",
    title: "",
    description: "",
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await fetchNotes();
      setNotes(res.data.notes);
    } catch (err: any) {
      toast.error(err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Please enter a title");
      return;
    }

    setUploading(true);
    try {
      // Simulate file upload by using the file name as a URL for now
      const fileUrl = file ? URL.createObjectURL(file) : "https://example.com/dummy-note.pdf";

      await uploadNote({
        title: formData.title,
        subject: formData.subject,
        description: formData.description,
        file_url: fileUrl,
        department: user?.department || "General",
      });

      toast.success("Note uploaded successfully");
      setFormData({ subject: "Physics", title: "", description: "" });
      setFile(null);
      loadNotes(); // Refresh list
    } catch (err: any) {
      toast.error(err.message || "Failed to upload note");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Study Materials</h1>
        <p className="text-muted-foreground">Share notes and study materials with your students</p>
      </div>

      {/* Upload Form */}
      <Card className="p-6 shadow-md mb-8">
        <h2 className="text-lg font-bold text-foreground mb-6">Upload New Notes</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <Input
                type="text"
                placeholder="Chapter title or topic"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              placeholder="Brief description of the notes"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Upload File</label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:bg-blue-50 transition-colors cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
                accept=".pdf,.doc,.docx"
              />
              <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-foreground">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX up to 10MB</p>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload Notes"}
          </Button>
        </form>
      </Card>

    </div>
  );
}
