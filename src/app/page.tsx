import Boot from "@/components/Boot";
import CvView from "@/components/cv/CvView";
import Experience from "@/components/Experience";
import MotionGate from "@/components/MotionGate";
import RecruiterLink from "@/components/RecruiterLink";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Stack from "@/components/sections/Stack";
import Certs from "@/components/sections/Certs";
import Inside from "@/components/sections/Inside";
import { getAllContent } from "@/lib/content";

export default async function Home() {
  const content = await getAllContent();
  const { site, projects, stack, certifications, achievements, credits } = content;

  const experience = (
    <main>
      <Boot lines={site.boot} />
      <RecruiterLink />
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
          credits={credits}
        />
      </Experience>
    </main>
  );

  return <MotionGate experience={experience} fallback={<CvView {...content} />} />;
}
