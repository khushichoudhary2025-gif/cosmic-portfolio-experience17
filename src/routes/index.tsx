import { createFileRoute } from "@tanstack/react-router";
import { SpaceExperience } from "@/components/space/Experience";
import { profile } from "@/lib/profile";

const title = `${profile.name} — AI Engineer & Full Stack Developer`;
const description = `Portfolio of ${profile.name}: ${profile.tagline}. Projects, skills, experience and certifications.`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.name,
          jobTitle: profile.titles[0],
          email: profile.email,
          address: profile.location,
          sameAs: Object.values(profile.socials),
        }),
      },
    ],
  }),
  component: SpaceExperience,
});
