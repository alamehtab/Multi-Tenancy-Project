import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import api from "../api";

export default function NotesList({ notes, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [loadingId, setLoadingId] = useState(null); // For showing spinner

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
      const res = await api.put(`/notes/${Number(id)}`, {
        title: editTitle,
        content: editContent,
      });
      onUpdate(id, res.data); // update parent state
      cancelEdit();
    } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Error updating note");
      setLoadingId(null);
    }
  };

  return (
    <ul className="space-y-4">
      {notes.map((note) => (
        <li
          key={note.id}
          className="p-4 bg-gray-100 dark:bg-gray-700 rounded flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          {editingId === note.id ? (
            <div className="flex-1 flex flex-col gap-2 w-full">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="px-2 py-1 border rounded w-full"
              />
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="px-2 py-1 border rounded w-full"
              />
              <div className="flex gap-2 mt-2 items-center">
                <button
                  onClick={() => saveEdit(note.id)}
                  disabled={loadingId === note.id}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-2"
                >
                  {loadingId === note.id ? (
                    <span className="w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin"></span>
                  ) : null}
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full">
              <p className="font-bold text-lg">{note.title}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
            </div>
          )}

          {editingId !== note.id && (
            <div className="flex gap-3 mt-2 md:mt-0">
              <button
                onClick={() => startEdit(note)}
                className="text-blue-600 hover:text-blue-800 transition"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="text-red-500 hover:text-red-700 transition"
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
