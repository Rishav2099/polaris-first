"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useProjects } from "../hooks/use-projects";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Trash2Icon, ExternalLinkIcon, AlertCircleIcon, Loader2Icon, GlobeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming you use Sonner for alerts
import { FaGithub } from "react-icons/fa";

interface ProjectCommandDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const getProjectIcon = (project: Doc<"projects">) => {
  if (project.importStatus === "completed") {
    return <FaGithub className="size-4 text-muted-foreground" />;
  }

  if (project.importStatus === "failed") {
    return <AlertCircleIcon className="size-4 text-muted-foreground " />;
  }

  if (project.importStatus === "importing") {
    return (
      <Loader2Icon className="size-4 text-muted-foreground animate-spin" />
    );
  }

  return <GlobeIcon className="size-4 text-muted-foreground" />;
};

export const ProjectsCommandDialog = ({ open, onOpenChange }: ProjectCommandDialogProps) => {
  const projects = useProjects();
  const router = useRouter();
  const deleteProject = useMutation(api.projects.remove);

  const handleDelete = async (id: Id<"projects">, name: string) => {
    try {
      await deleteProject({ id });
      toast.success(`Project "${name}" deleted`);
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search projects..." />
      <CommandList>
        <CommandEmpty>No Projects Found.</CommandEmpty>
        <CommandGroup heading="Projects">
          {projects?.map((project) => (
            /* 1. Wrap each item in a Context Menu */
            <ContextMenu key={project._id}>
              <ContextMenuTrigger>
                <CommandItem
                  value={`${project.name}-${project._id}`}
                  onSelect={() => {
                    router.push(`/project/${project._id}`);
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-2"
                >
                  {getProjectIcon(project)}
                  <span>{project.name}</span>
                </CommandItem>
              </ContextMenuTrigger>

              {/* 2. Define the 'Right-Click' options */}
              <ContextMenuContent className="w-48">
                <ContextMenuItem 
                  onClick={() => router.push(`/project/${project._id}`)}
                  className="gap-2"
                >
                  <ExternalLinkIcon className="size-3.5" />
                  Open Project
                </ContextMenuItem>
                
                <ContextMenuItem 
                  onClick={() => handleDelete(project._id as Id<"projects">, project.name)}
                  className="gap-2 text-destructive focus:bg-destructive focus:text-white"
                >
                  <Trash2Icon className="size-3.5" />
                  Delete Project
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};