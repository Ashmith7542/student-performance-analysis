import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Calendar, User, Loader2 } from "lucide-react";
import { fetchNotes } from "@/lib/api";
import { toast } from "sonner";

export default function StudentNotes() {
  const subjectsFilter = ["All", "Physics", "Chemistry", "Mathematics", "English", "History", "Biology"];
  const [activeSubject, setActiveSubject] = useState("All");
  const [notesData, setNotesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await fetchNotes();
      setNotesData(res.data.notes);
    } catch (err: any) {
      toast.error(err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = activeSubject === "All" 
    ? notesData 
    : notesData.filter((note) => note.subject === activeSubject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Study Materials</h1>
        <p className="text-muted-foreground">Download notes and study materials shared by your teachers</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {subjectsFilter.map((subject) => (
          <button
            key={subject}
            onClick={() => setActiveSubject(subject)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeSubject === subject
                ? "bg-blue-600 text-white"
                : "bg-white border border-border text-foreground hover:border-blue-600"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No study materials found.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="p-6 shadow-md hover:shadow-lg transition-shadow">
              {/* Subject Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                  {note.subject}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-2">{note.title}</h3>

              {/* Metadata */}
              <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {note.uploaded_by || "Teacher"}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {note.created_at ? new Date(note.created_at).toLocaleDateString() : "N/A"}
                </div>
                <div className="text-xs">File URL: {note.file_url || "N/A"}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => {
                    if (note.file_url) window.open(note.file_url, "_blank");
                  }}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
