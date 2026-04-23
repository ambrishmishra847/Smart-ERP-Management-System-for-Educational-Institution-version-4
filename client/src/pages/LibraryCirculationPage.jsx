import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const LibraryCirculationPage = () => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    book: "",
    member: "",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
  });

  const load = async () => {
    const [booksResponse, membersResponse, circulationResponse] = await Promise.all([
      api.get("/erp/library/books"),
      api.get("/erp/library/members"),
      api.get("/erp/library/circulation"),
    ]);
    setBooks(booksResponse.data);
    setMembers(membersResponse.data);
    setItems(circulationResponse.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/erp/library/circulation", form);
    setForm({
      book: "",
      member: "",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: "",
    });
    await load();
  };

  const markReturn = async (id) => {
    await api.patch(`/erp/library/circulation/${id}/return`, { fineAmount: 0 });
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Issue Book" subtitle="Track issue and return workflows for students and staff.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <select value={form.book} onChange={(event) => setForm((prev) => ({ ...prev, book: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select book</option>
            {books.map((book) => (
              <option key={book._id} value={book._id}>{book.title} ({book.copiesAvailable}/{book.copiesTotal})</option>
            ))}
          </select>
          <select value={form.member} onChange={(event) => setForm((prev) => ({ ...prev, member: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>{member.name} ({member.rollNumber || member.employeeId || member.email})</option>
            ))}
          </select>
          <input type="date" value={form.issueDate} onChange={(event) => setForm((prev) => ({ ...prev, issueDate: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input type="date" value={form.dueDate} onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Issue Book</button>
        </form>
      </SectionCard>

      <SectionCard title="Circulation Register" subtitle="Active issue-return records across the library.">
        <DataTable
          columns={[
            { key: "book", label: "Book" },
            { key: "member", label: "Member" },
            { key: "dates", label: "Issue / Due" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={items.map((item) => ({
            book: item.book?.title || "-",
            member: `${item.member?.name || "-"} (${item.member?.rollNumber || item.member?.employeeId || "-"})`,
            dates: `${new Date(item.issueDate).toLocaleDateString("en-IN")} / ${new Date(item.dueDate).toLocaleDateString("en-IN")}`,
            status: item.status,
            actions: item.status === "issued"
              ? <button type="button" onClick={() => markReturn(item._id)} className="text-emerald-600">Mark Returned</button>
              : (item.returnedAt ? new Date(item.returnedAt).toLocaleDateString("en-IN") : "-"),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default LibraryCirculationPage;
