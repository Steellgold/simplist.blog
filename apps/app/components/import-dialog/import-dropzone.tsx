import { Dropzone } from "@simplist/ui/components/dropzone";

interface ImportDropzoneProps {
  file: File | null;
  onFile: (file: File) => void;
  onClear: () => void;
}

export const ImportDropzone = ({
  file,
  onFile,
  onClear,
}: ImportDropzoneProps) => {
  return (
    <Dropzone
      size="sm"
      onDrop={(files) => {
        const droppedFile = files[0];
        if (droppedFile) onFile(droppedFile);
      }}
      accept={{
        "text/csv": [".csv"],
        "application/json": [".json"],
        "text/xml": [".xml"],
        "application/xml": [".xml"],
      }}
      multiple={false}
      file={file ? { file, name: file.name } : null}
      onClear={onClear}
      label="Upload file"
      description="or drag and drop"
      hint="CSV, JSON, XML"
    />
  );
};
