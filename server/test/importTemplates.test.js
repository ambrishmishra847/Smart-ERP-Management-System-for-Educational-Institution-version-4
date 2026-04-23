import test from "node:test";
import assert from "node:assert/strict";
import { getImportTemplate } from "../src/utils/importTemplates.js";

test("admissions import normalizes imported source labels", async () => {
  const template = getImportTemplate("admissions");
  const mapped = await template.mapRow({
    studentname: "Riya Singh",
    email: "riya@example.com",
    program: "BCA",
    academicyear: "2026",
    source: "pdf",
    status: "review",
  });

  assert.equal(mapped.source, "campaign");
  assert.equal(mapped.status, "under-review");
});

test("placements import validates minimum required fields", async () => {
  const template = getImportTemplate("placements");
  const mapped = await template.mapRow({
    companyname: "Open Future Labs",
    role: "Graduate Engineer",
    deadline: "2026-06-01",
  });

  assert.equal(
    template.validate(mapped),
    "Required fields: companyName, roleTitle, description, deadline"
  );
});

test("announcements import splits audience roles correctly", async () => {
  const template = getImportTemplate("announcements");
  const mapped = await template.mapRow({
    title: "Semester Notice",
    content: "Classes resume Monday.",
    audience: "student, faculty-professor, parent-guardian",
  });

  assert.deepEqual(mapped.audience, ["student", "faculty-professor", "parent-guardian"]);
});
