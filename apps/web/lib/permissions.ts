import { adminAc, createAccessControl, defaultStatements } from "better-auth/plugins/access";

type OrganizationPermissions = "update-name" | "update-logo" | "delete" | "view";
type ApiKeyPermissions = "create" | "delete";
type MemberPermissions = "invite" | "remove" | "view";
type PostPermissions = "create" | "update" | "delete";
type TagPermissions = "create" | "update" | "delete";
type CategoryPermissions = "create" | "update" | "delete";
type AnalyticsPermissions = "view" | "export";

type Permissions = {
  settings?: OrganizationPermissions[];
  apikeys?: ApiKeyPermissions[];
  members?: MemberPermissions[];
  posts?: PostPermissions[];
  tags?: TagPermissions[];
  categories?: CategoryPermissions[];
  analytics?: AnalyticsPermissions[];
};

const statement = {

  // readonly organization: readonly ["update", "delete"];
  // readonly member: readonly ["create", "update", "delete"];
  // readonly invitation: readonly ["create", "cancel"];
  ...defaultStatements,

  settings: ["update-name", "update-logo", "delete", "view"],
  apikeys: ["create", "delete"],
  members: ["invite", "remove", "view"],
  posts: ["create", "update", "delete"],
  tags: ["create", "update", "delete"],
  categories: ["create", "update", "delete"],
  analytics: ["view", "export"]
} as const;

const ac = createAccessControl(statement);

const member = ac.newRole({
  posts: ["create"],

  // defaults:
  organization: [],
  member: [],
  invitation: []
});

const editor = ac.newRole({
  posts: ["create", "update"],
  tags: ["create", "update"],
  categories: ["create", "update"],
  analytics: ["view"],

  // defaults:
  organization: [],
  member: [],
  invitation: []
});

const admin = ac.newRole({
  settings: ["update-name", "update-logo", "view"],
  apikeys: ["create", "delete"],
  members: ["view", "invite", "remove"],
  posts: ["create", "update", "delete"],
  tags: ["create", "update", "delete"],
  categories: ["create", "update", "delete"],
  analytics: ["view", "export"],

  // defaults:
  organization: ["update"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"]
});

const owner = ac.newRole({
  ...admin.statements,
  ...adminAc.statements,
  settings: ["delete", "update-logo", "update-name", "view"],

  // defaults:
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"]
});

export { ac, member, editor, admin, owner };
export type { Permissions };