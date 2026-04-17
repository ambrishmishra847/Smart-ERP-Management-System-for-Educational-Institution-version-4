import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const LibraryMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [circulation, setCirculation] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [membersResponse, circulationResponse] = await Promise.all([
        api.get("/erp/library/members"),
        api.get("/erp/library/circulation"),
      ]);
      setMembers(membersResponse.data);
      setCirculation(circulationResponse.data);
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <SectionCard title="Library Members" subtitle="Student and staff membership visibility with borrowing activity.">
        <DataTable
          columns={[
            { key: "name", label: "Member" },
            { key: "role", label: "Role" },
            { key: "identity", label: "Roll / Employee" },
            { key: "borrowed", label: "Borrowed Items" },
          ]}
          rows={members.map((member) => ({
            name: member.name,
            role: member.roleLabel || member.role,
            identity: member.rollNumber || member.employeeId || "-",
            borrowed: circulation.filter((item) => item.member?._id === member._id && item.status === "issued").length,
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default LibraryMembersPage;
