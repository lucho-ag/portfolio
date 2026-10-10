import Boot from "@/components/Boot";
import Experience from "@/components/Experience";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Stack from "@/components/sections/Stack";
import Certs from "@/components/sections/Certs";
import Inside from "@/components/sections/Inside";
import { getAchievements, getCertifications, getCredits, getProjects, getSite, getStack } from "@/lib/content";

export default async function Home() {
  const site = getSite();
  const projects = await getProjects();
  const certifications = getCertifications();
  const achievements = getAchievements();
  const stack = getStack();

  return (
    <main>
      <Boot lines={site.boot} />
      <Experience
        sceneData={{
          covers: projects.map((p) => p.meta.cover),
          holder: site.name,
          documents: [
            ...certifications.map((c) => ({ kind: "CERTIFICATION" as const, title: c.title, subtitle: c.issuer, date: c.date })),
            ...achievements.map((a) => ({ kind: "ACHIEVEMENT" as const, title: a.title, subtitle: a.description, date: a.date })),
          ],
        }}
      >
        <Hero site={site} />
        <Projects projects={projects} />
        <Stack stack={stack} />
        <Certs certifications={certifications} achievements={achievements} />
        <Inside
          site={site}
          projects={projects}
          certifications={certifications}
          achievements={achievements}
          stack={stack}
          credits={getCredits()}
        />
      </Experience>
    </main>
  );
}
