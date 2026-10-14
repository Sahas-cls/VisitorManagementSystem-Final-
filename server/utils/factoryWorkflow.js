// Group 1 (Sri Lankan) factories use the full approval flow ("STANDARD").
// Group 2 (other countries) use HR-only approval ("HR_ONLY").
const db = require("../models");

async function getWorkflowType(factoryId) {
  if (!factoryId) return "STANDARD";
  const factory = await db.Factory.findByPk(factoryId, {
    attributes: ["Factory_Id", "Workflow_Type"],
  });
  return factory?.Workflow_Type || "STANDARD";
}

async function isHrOnly(factoryId) {
  return (await getWorkflowType(factoryId)) === "HR_ONLY";
}

// Comma separated emails of the given user categories for a factory,
// optionally limited to one department (HR users are factory wide).
async function getEmails(factoryId, categories, departmentId = null) {
  const where = { Factory_Id: factoryId, user_category: categories };
  if (departmentId) where.Department_Id = departmentId;
  const users = await db.department_Users.findAll({ where });
  return users.map((u) => u.user_email).join(",");
}

// Department head and department users of the requested department.
async function getDepartmentEmails(factoryId, departmentId) {
  return getEmails(
    factoryId,
    ["Department Head", "Department User"],
    departmentId,
  );
}

// New registration (HR_ONLY factories): HR users plus the requested department's head and users.
async function getHrOnlyRegistrationRecipients(factoryId, departmentId) {
  const hrEmails = await getEmails(factoryId, ["HR User"]);
  const deptEmails = await getDepartmentEmails(factoryId, departmentId);
  return [hrEmails, deptEmails].filter(Boolean).join(",");
}

// After HR approval (HR_ONLY factories): department head, department users and factory managers.
// HR users are excluded (they made the approval).
async function getHrApprovalRecipients(factoryId, departmentId) {
  const deptEmails = await getDepartmentEmails(factoryId, departmentId);
  const managerEmails = await getEmails(factoryId, ["Factory Manager"]);
  return [deptEmails, managerEmails].filter(Boolean).join(",");
}

module.exports = {
  isHrOnly,
  getEmails,
  getHrApprovalRecipients,
  getHrOnlyRegistrationRecipients,
};
