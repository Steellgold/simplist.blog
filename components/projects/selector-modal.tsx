"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

interface Project {
  id: string;
  name: string;
  slug: string;
}

interface ProjectSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
  title?: string;
  description?: string;
}

export const ProjectSelectorModal = ({
  open,
  onOpenChange,
  projects,
  onProjectSelect,
  title = "Select Project",
  description = "Choose which project you want to upgrade to Pro",
}: ProjectSelectorModalProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const handleSubmit = () => {
    if (selectedProjectId) {
      onProjectSelect(selectedProjectId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <RadioGroup
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            className="space-y-3"
          >
            {projects.map((project) => (
              <div key={project.id} className="flex items-center space-x-2">
                <RadioGroupItem value={project.id} id={project.id} />
                <Label htmlFor={project.id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {project.slug}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedProjectId}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
