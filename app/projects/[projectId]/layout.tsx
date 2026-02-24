import { Id } from "@/convex/_generated/dataModel";
import ProjectIdLayout from "@/features/projects/components/project-id-layout";
import React from "react";

const layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;
  return (
    <div>
      <ProjectIdLayout projectId={projectId as Id<"projects">}>
        {children}
      </ProjectIdLayout>
    </div>
  );
};

export default layout;
