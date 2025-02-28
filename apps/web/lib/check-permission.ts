import { headers } from "next/headers";
import { auth } from "./auth";
import { Permissions } from "./permissions";
import { forbidden } from "next/navigation";

interface CheckPermissionParams {
  permission: Permissions;
  organizationId: string;
}

export const checkPermission = async ({ permission, organizationId }: CheckPermissionParams): Promise<boolean> => {
  const hasPermission = await auth.api.hasPermission({
    body: {
      permission,
      organizationId,
    },
    headers: await headers(),
  });

  if (hasPermission.error) {
    forbidden();
  }

  return hasPermission.success;
};