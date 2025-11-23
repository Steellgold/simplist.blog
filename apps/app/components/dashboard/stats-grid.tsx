import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@simplist/ui/components/card";
import { Progress } from "@simplist/ui/components/progress";
import { Eye, FileText, HardDrive, Key } from "lucide-react";

interface StatsGridProps {
  publishedArticles: number;
  totalViews: number;
  activeApiKeys: number;
  apiKeyLimit: number;
  storageUsed: number;
  storageLimit: number;
}

export const StatsGrid = ({
  publishedArticles,
  totalViews,
  activeApiKeys,
  apiKeyLimit,
  storageUsed,
  storageLimit,
}: StatsGridProps) => {
  const formatStorage = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  const storagePercentage = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Published Articles</CardTitle>
          <CardAction>
            <FileText className="h-4 w-4" />
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">{publishedArticles}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {publishedArticles === 0 ? "No articles yet" : publishedArticles === 1 ? "article published" : "articles published"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Views</CardTitle>
          <CardAction>
            <Eye className="h-4 w-4" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalViews.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            all-time views
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardAction>
            <Key className="h-4 w-4" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {activeApiKeys} / {apiKeyLimit === -1 ? "∞" : apiKeyLimit}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeApiKeys === 0 ? "No keys created" : "active keys"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Used</CardTitle>
          <CardAction>
            <HardDrive className="h-4 w-4" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatStorage(storageUsed)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            of {formatStorage(storageLimit)}
          </p>
          <Progress value={storagePercentage} className="mt-2 h-1" />
        </CardContent>
      </Card>
    </div>
  );
};
