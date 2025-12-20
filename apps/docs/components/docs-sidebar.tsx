import { AppSidebar } from "@/components/app-sidebar";
import { getDocsNavItems } from "@/lib/content";

export const DocsSidebar = async () => {
  const items = await getDocsNavItems();

  return <AppSidebar items={items} />;
};
