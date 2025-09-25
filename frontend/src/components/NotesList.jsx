import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { updateNote } from "../../api/notes";

export default function NotesList({ notes, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setLoadingId(null);
  };

  const saveEdit = async (id) => {
    try {
      setLoadingId(id);
      const res = await updateNote(id, {
        title: editTitle,
        content: editContent,
      });
      onUpdate(id, res.data);
      cancelEdit();
    } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Error updating note");
      setLoadingId(null);
    }
  };

  return (
    <ul className="space-y-4 px-4">
      {notes.map((note) => (
        <li
          key={note.id}
          className="p-4 bg-gray-100 dark:bg-gray-700 rounded flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          {editingId === note.id ? (
            <div className="flex-1 flex flex-col gap-2 w-full">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="px-3 py-2 border rounded w-full text-sm sm:text-base"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="px-3 py-2 border rounded w-full text-sm sm:text-base resize-none"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => saveEdit(note.id)}
                  disabled={loadingId === note.id}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 text-sm sm:text-base"
                >
                  {loadingId === note.id ? (
                    <span className="w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin"></span>
                  ) : null}
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full">
              <p className="font-bold text-lg break-words">{note.title}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                {note.content}
              </p>
            </div>
          )}

          {editingId !== note.id && (
            <div className="flex gap-3 sm:gap-4 mt-2 sm:mt-0">
              <button
                onClick={() => startEdit(note)}
                className="text-blue-600 hover:text-blue-800 transition"
                aria-label="Edit note"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="text-red-500 hover:text-red-700 transition"
                aria-label="Delete note"
              >
                <Trash2 size={20} />
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
