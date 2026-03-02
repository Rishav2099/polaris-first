import { Id } from "@/convex/_generated/dataModel";
import React from "react";
import TopNavigation from "./top-navigation";
import { useEditor } from "../hooks/use-editor";
import FileBreadCrumb from "./file-breadcrumb";
import Image from "next/image";
import { useFile } from "@/features/projects/hooks/use-file";
import CodeEditor from "./code-editor";

const EditorView = ({ projectId }: { projectId: Id<"projects"> }) => {
  const { activeTabId } = useEditor(projectId);
  const activeFile = useFile(activeTabId)
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
      {activeFile && (
        <CodeEditor
        fileName={activeFile.name}
        />
      )}

    </div>
  );
};

export default EditorView;
