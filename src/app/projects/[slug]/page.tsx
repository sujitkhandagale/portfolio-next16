import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProjectDetail from "@/components/ProjectDetail/ProjectDetail";
import { getProject, profile, projects } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

// Every project is known at build time, so pre-render all of them.
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };

  const title = `${project.title} — ${profile.name}`;
  return {
    title,
    description: project.summary,
    openGraph: {
      title,
      description: project.summary,
      type: "article",
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <>
      <Navbar />
      <main id="main">
        <ProjectDetail project={project} />
      </main>
      <Footer />
    </>
  );
}
