import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const LibraryFinesPage = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const response = await api.get("/erp/library/circulation");
      setItems(response.data.filter((item) => Number(item.fineAmount || 0) > 0));
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <SectionCard title="Library Fines" subtitle="Overdue and returned-book fines tracked from circulation records.">
        <DataTable
          columns={[
            { key: "member", label: "Member" },
            { key: "book", label: "Book" },
            { key: "dueDate", label: "Due Date" },
            { key: "returnedAt", label: "Returned" },
            { key: "fine", label: "Fine Amount" },
          ]}
          rows={items.map((item) => ({
            member: `${item.member?.name || "-"} (${item.member?.rollNumber || item.member?.employeeId || "-"})`,
            book: item.book?.title || "-",
            dueDate: new Date(item.dueDate).toLocaleDateString("en-IN"),
            returnedAt: item.returnedAt ? new Date(item.returnedAt).toLocaleDateString("en-IN") : "-",
            fine: item.fineAmount,
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default LibraryFinesPage;
