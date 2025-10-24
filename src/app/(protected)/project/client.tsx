"use client";
import { deleteProject, updateProject } from "@/actions/project";
import ProjectForm from "./form";
import ProjectList from "./list";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { Prisma } from "@prisma/client";
import DialogConfirm from "@/components/dialog/dialog-confirm";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

type ProjectType = Prisma.ProjectGetPayload<{}>;

const ProjectClient = () => {
  const {
    data: projectQuery,
    refetch,
    isFetching,
  } = trpc.getProjects.useQuery({ onlyActive: false });
  const [flash, setFlash] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (projectId: string) => {
    setIsLoading(true);
    try {
      await deleteProject(projectId);
      toast.success("Project deleted successfully");
      await refetch();
    } catch (error) {
      toast.error("Error deleting project");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleEdit = (project: ProjectType) => {
    try {
      setFlash(true);
      setIsLoading(true);
      setSelectedProject(project);
      setTimeout(() => setFlash(false), 800);
    } catch (err) {
      toast.error("Error updating project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (projectId: string, tobe: boolean) => {
    try {
      setIsLoading(true);
      await updateProject({ id: projectId, is_active: tobe });
      await refetch();
    } catch (error) {
      toast.error("Error updating project");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <ProjectForm
        flash={flash}
        onSuccess={() => {
          setSelectedProject(null);
          refetch();
        }}
        project={selectedProject}
        setProject={setSelectedProject}
      />
      <div className="relative">
        {(isLoading || isFetching) && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/70">
            <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
          </div>
        )}
        <ProjectList
          projects={projectQuery?.projects ?? []}
          onDelete={(projectId) => {
            setProjectId(projectId);
            setShowConfirm(true);
          }}
          onEdit={handleEdit}
          toggleActive={handleToggleActive}
        />
      </div>
      <DialogConfirm
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => handleDelete(projectId)}
      />
    </div>
  );
};

export default ProjectClient;
