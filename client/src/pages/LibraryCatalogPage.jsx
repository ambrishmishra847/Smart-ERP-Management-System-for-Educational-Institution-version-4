import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const LibraryCatalogPage = () => {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    accessionNumber: "",
    author: "",
    category: "",
    isbn: "",
    publisher: "",
    shelf: "",
    copiesTotal: 1,
    copiesAvailable: 1,
  });

  const load = async () => {
    const response = await api.get("/erp/library/books");
    setBooks(response.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/erp/library/books", {
      ...form,
      copiesTotal: Number(form.copiesTotal),
      copiesAvailable: Number(form.copiesAvailable),
    });
    setForm({
      title: "",
      accessionNumber: "",
      author: "",
      category: "",
      isbn: "",
      publisher: "",
      shelf: "",
      copiesTotal: 1,
      copiesAvailable: 1,
    });
    await load();
  };

  const removeBook = async (id) => {
    await api.delete(`/erp/library/books/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Add Library Resource" subtitle="Maintain the institutional catalog with shelf and copy information.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required placeholder="Book title" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.accessionNumber} onChange={(event) => setForm((prev) => ({ ...prev, accessionNumber: event.target.value }))} required placeholder="Accession number" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.author} onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))} required placeholder="Author" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} required placeholder="Category" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.isbn} onChange={(event) => setForm((prev) => ({ ...prev, isbn: event.target.value }))} placeholder="ISBN" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.publisher} onChange={(event) => setForm((prev) => ({ ...prev, publisher: event.target.value }))} placeholder="Publisher" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.shelf} onChange={(event) => setForm((prev) => ({ ...prev, shelf: event.target.value }))} placeholder="Shelf location" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <div className="grid gap-4 md:grid-cols-2">
            <input value={form.copiesTotal} type="number" onChange={(event) => setForm((prev) => ({ ...prev, copiesTotal: event.target.value }))} placeholder="Total copies" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            <input value={form.copiesAvailable} type="number" onChange={(event) => setForm((prev) => ({ ...prev, copiesAvailable: event.target.value }))} placeholder="Available copies" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          </div>
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Add To Catalog</button>
        </form>
      </SectionCard>

      <SectionCard title="Catalog" subtitle="Live library inventory and availability.">
        <DataTable
          columns={[
            { key: "title", label: "Title" },
            { key: "author", label: "Author" },
            { key: "category", label: "Category" },
            { key: "copies", label: "Copies" },
            { key: "actions", label: "Actions" },
          ]}
          rows={books.map((book) => ({
            title: `${book.title} (${book.accessionNumber})`,
            author: book.author,
            category: book.category,
            copies: `${book.copiesAvailable}/${book.copiesTotal}`,
            actions: <button type="button" onClick={() => removeBook(book._id)} className="text-rose-600">Remove</button>,
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default LibraryCatalogPage;
