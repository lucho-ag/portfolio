import type { Project } from "@/lib/content";
import Reveal from "../Reveal";
import Window from "../ui/Window";
import ProjectBrowser from "./ProjectBrowser";

/** Pausa 2b: estante de discos. Lista navegable + ficha; el DVD 3D muestra la portada elegida. */
export default function Projects({ projects }: { projects: Project[] }) {
  return (
    <Reveal pause="projects" className="absolute inset-y-0 right-[4vw] flex w-[min(30rem,92vw)] items-center py-8">
      <Window subject="PROJECTS" status={`${projects.length} DISCS`} className="w-full">
        <ProjectBrowser projects={projects} />
      </Window>
    </Reveal>
  );
}
