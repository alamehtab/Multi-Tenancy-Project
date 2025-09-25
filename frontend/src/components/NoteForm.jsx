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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 mb-6 w-full max-w-xl mx-auto px-4"
    >
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="px-4 py-2 border rounded dark:bg-gray-700 text-sm sm:text-base"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="px-4 py-2 border rounded dark:bg-gray-700 text-sm sm:text-base resize-none"
      />
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm sm:text-base"
      >
        Add
      </button>
    </form>
  );
}
