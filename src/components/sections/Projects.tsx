import type { Project } from "@/lib/content";
import Reveal from "../Reveal";
import Window from "../ui/Window";
import ProjectBrowser from "./ProjectBrowser";

/** Pausa 2b: estante de discos. Lista navegable + ficha; el DVD 3D muestra la portada elegida. */
export default function Projects({ projects }: { projects: Project[] }) {
  return (
    <Reveal
      pause="projects"
      className="absolute inset-x-[4vw] bottom-0 flex items-end pb-6 md:inset-x-auto md:inset-y-0 md:right-[4vw] md:w-[min(30rem,92vw)] md:items-center md:py-8"
    >
      <Window subject="PROJECTS" status={`${projects.length} DISCS`} className="max-h-[55vh] w-full md:max-h-[85vh]">
        <ProjectBrowser projects={projects} />
      </Window>
    </Reveal>
  );
}
