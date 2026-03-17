import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef } from "react";
import TopNavigation from "./top-navigation";
import { useEditor } from "../hooks/use-editor";
import FileBreadCrumb from "./file-breadcrumb";
import Image from "next/image";
import { useFile, useUpdateFile } from "@/features/projects/hooks/use-file";
import CodeEditor from "./code-editor";

const DEBOUNCE_MS = 1500;

const EditorView = ({ projectId }: { projectId: Id<"projects"> }) => {
  const { activeTabId } = useEditor(projectId);
  const activeFile = useFile(activeTabId);
  const updateFile = useUpdateFile();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActiveFileBinary = activeFile && activeFile.storageId;
  const isActiveFileText = activeFile && !activeFile.storageId;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeTabId]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center w-full">
        <TopNavigation projectId={projectId} />
      </div>
      {activeTabId && <FileBreadCrumb projectId={projectId} />}
      {!activeFile && (
        <div className="size-full flex items-center justify-center">
          <Image
            src={"/vercel.svg"}
            alt="Polaris"
            width={50}
            height={50}
            className="opacity-25"
          />
        </div>
      )}
      {isActiveFileText && (
        <CodeEditor
          fileName={activeFile.name}
          key={activeFile._id}
          initialValue={activeFile.content ?? ""}
          onChange={(content: string) => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
              updateFile({ id: activeFile._id, content });
            }, DEBOUNCE_MS);
          }}
        />
      )}
      {isActiveFileBinary && <p>Implement binary preview</p>}
    </div>
  );
};

export default EditorView;
