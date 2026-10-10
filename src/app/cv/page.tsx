import type { Metadata } from "next";
import CvView from "@/components/cv/CvView";
import { getAllContent, getSite } from "@/lib/content";

const site = getSite();

export const metadata: Metadata = {
  title: "CV",
  description: `${site.title}. ${site.tagline}`,
  alternates: { canonical: "/cv" },
};

/** Modo reclutador: la información completa en una página rápida e imprimible. */
export default async function CvPage() {
  return <CvView {...await getAllContent()} />;
}
