import { Button } from "@simplist/ui/components/button";
import { DialogFooter } from "@simplist/ui/components/dialog";
import { Spinner } from "@simplist/ui/components/spinner";

interface ImportDialogFooterProps {
  onCancel: () => void;
  onImport: () => void;
  importing: boolean;
  dataLength: number;
  entityName: string;
}

export const ImportDialogFooter = ({
  onCancel,
  onImport,
  importing,
  dataLength,
  entityName,
}: ImportDialogFooterProps) => {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>

      <Button onClick={onImport} disabled={importing || dataLength === 0}>
        {importing ? (
          <Spinner />
        ) : (
          `Import ${dataLength > 0 ? dataLength : ""} ${entityName}`
        )}
      </Button>
    </DialogFooter>
  );
};
