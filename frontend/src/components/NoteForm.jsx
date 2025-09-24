import { useState } from "react";

export default function NoteForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onCreate({ title, content });
    setTitle("");
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="px-3 py-2 border rounded dark:bg-gray-700"
      />
      <input
        type="text"
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="px-3 py-2 border rounded dark:bg-gray-700"
      />
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Add
      </button>
    </form>
  );
}
