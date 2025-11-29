"use client";

import { useRouter } from "next/navigation";

interface QuickActionsCardProps {
  projectSlug: string;
  articlesUsed: number;
  articlesLimit: number;
  apiKeysUsed: number;
  apiKeysLimit: number;
}

export const QuickActionsCard = ({
  projectSlug,
  articlesUsed,
  articlesLimit,
  apiKeysUsed,
  apiKeysLimit,
}: QuickActionsCardProps) => {
  const router = useRouter();

  return (
    <></>
    // <Card>
    //   <CardHeader>
    //     <CardTitle>Quick Actions</CardTitle>
    //   </CardHeader>
    //   <CardContent className="space-y-3">
    //     <ProgressLink
    //       href={`/${projectSlug}/articles/new`}
    //       variant="default"
    //       className="w-full justify-start"
    //       value={articlesUsed}
    //       max={articlesLimit}
    //     >
    //       <FileText />
    //       New Article
    //       {articlesLimit !== -1 && (
    //         <span className="ml-auto text-xs opacity-70">
    //           {articlesUsed}/{articlesLimit}
    //         </span>
    //       )}
    //     </ProgressLink>

    //     <ProgressLink
    //       href={`/${projectSlug}/api-keys`}
    //       variant="outline"
    //       className="w-full justify-start"
    //       value={apiKeysUsed}
    //       max={apiKeysLimit}
    //     >
    //       <Key />
    //       Create API Key
    //       {apiKeysLimit !== -1 && (
    //         <span className="ml-auto text-xs opacity-70">
    //           {apiKeysUsed}/{apiKeysLimit}
    //         </span>
    //       )}
    //     </ProgressLink>

    //     <Link
    //       className={buttonVariants({ variant: "outline", className: "w-full" })}
    //       href={`/${projectSlug}/analytics`}
    //     >
    //       <LineChart />
    //       View Analytics
    //     </Link>

    //     <Link
    //       href={`/${projectSlug}/settings`}
    //       className={buttonVariants({ variant: "outline", className: "w-full" })}
    //     >
    //       <Settings />
    //       Project Settings
    //     </Link>
    //   </CardContent>
    // </Card>
  );
};
