"use client";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { FaGithub } from "react-icons/fa";
import { SparkleIcon } from "lucide-react";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";
import ProjectList from "./project-list";
import { useCreateProject } from "../hooks/use-projects";
import { useEffect, useState } from "react";
import { ProjectsCommandDialog } from "./project-command-dialog";
import ImportGithubDialog from "./import-github-dialog";

export const ProjectView = () => {
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);

  const createProject = useCreateProject();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault();
          setCommandDialogOpen(true);
        }
      }
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "i") {
          e.preventDefault();
          setGithubDialogOpen(true);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <ProjectsCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
      <ImportGithubDialog
        open={githubDialogOpen}
        onOpenChange={setGithubDialogOpen}
      />
      <div className="flex flex-col  justify-center h-screen w-full mx-auto gap-4 max-w-sm">
        <div className="flex gap-2">
          <img src="/vercel.svg" alt="logo" className="w-10 h-10" />
          <h1 className="font-bold text-4xl">Polaris</h1>
        </div>
        <div className="grid grid-cols-2 gap-2 ">
          <Button
            variant={"outline"}
            onClick={() => {
              createProject({
                name: uniqueNamesGenerator({
                  dictionaries: [adjectives, animals, colors],
                  separator: "-",
                  length: 3,
                }),
              });
            }}
            className="h-full items-start justify-between p-4 bg-background border flex flex-col gap-6 rounded-none"
          >
            <div className="flex w-full justify-between">
              <SparkleIcon className="size-4" />
              <Kbd className="bg-accent border">ctrl + j</Kbd>
            </div>
            <div>
              <span className="text-sm">New</span>
            </div>
          </Button>
          <Button
            variant={"outline"}
            className="h-full items-start justify-between p-4 bg-background border flex flex-col gap-6 rounded-none"
            onClick={() => setGithubDialogOpen(true)}
          >
            <div className="flex w-full justify-between">
              <FaGithub className="size-4" />
              <Kbd className="bg-accent border">ctrl + l</Kbd>
            </div>
            <div>
              <span className="text-sm">Import</span>
            </div>
          </Button>
        </div>
        <ProjectList onViewAll={() => setCommandDialogOpen(true)} />
      </div>
    </>
  );
};
