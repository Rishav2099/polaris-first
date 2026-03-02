import { Id } from "@/convex/_generated/dataModel";
import { useProject } from "../../hooks/use-projects";
import {
  ChevronRightIcon,
  CopyMinusIcon,
  FilePlusIcon,
  FolderPlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useCreateFile,
  useCreateFolder,
  useFolderContents,
} from "../../hooks/use-file";
import CreateInput from "./create-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Tree from "./tree";

export const FileExplorer = ({ projectId }: { projectId: Id<"projects"> }) => {
  const project = useProject(projectId);
  const [isopen, setIsopen] = useState(true);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [collapseKey, setCollapseKey] = useState(0);

  const createFile = useCreateFile();
  const createFolder = useCreateFolder();
  const rootFiles = useFolderContents({
    projectId,
    enabled: isopen,
  });

  const handleCreate = (name: string) => {
    setCreating(null);

    if (creating === "file") {
      createFile({
        projectId,
        name,
        content: "",
        parentId: undefined,
      });
    } else {
      createFolder({
        projectId,
        name,
        parentId: undefined,
      });
    }
  };

  return (
    <ScrollArea className="flex justify-between items-center">
      <div
        role="button"
        onClick={() => setIsopen((value) => !value)}
        className="group/project cursor-pointer w-full text-left flex items-center gap-0.5 h-5.5 bg-accent font-bold"
      >
        <div className="flex items-center">
          <ChevronRightIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              isopen && "rotate-90",
            )}
          />
          <p className="text-xs uppercase line-clamp-1">
            {project?.name ?? "Loading..."}
          </p>
        </div>
        <div className="opacity-100 group-hover/project:opacity-100 transition-none duration-0 flex items-center gap-0.5 ml-auto">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsopen(true);
              setCreating("file");
            }}
            variant={"highlight"}
            size={"icon-xs"}
          >
            <FilePlusIcon className="size-3.5" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsopen(true);
              setCreating("folder");
            }}
            variant={"highlight"}
            size={"icon-xs"}
          >
            <FolderPlusIcon className="size-3.5" />
          </Button>
          <Button variant={"highlight"} size={"icon-xs"}>
            <CopyMinusIcon className="size-3.5" />
          </Button>
        </div>
      </div>
      {isopen && (
        <>
          {rootFiles === undefined && "Loading"}
          {creating && (
            <CreateInput
              type={creating}
              level={0}
              onSubmit={handleCreate}
              onCancel={() => setCreating(null)}
            />
          )}
          {rootFiles?.map((item) => (
            <Tree
              key={`${item._id}-${collapseKey}`}
              item={item}
              level={0}
              projectId={projectId}
            />
          ))}
        </>
      )}
    </ScrollArea>
  );
};
