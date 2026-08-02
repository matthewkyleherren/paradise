import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProfile,
  getProfileParams,
  getProfileView,
  isCollection,
} from "@/lib/profiles";
import { SITE_URL } from "@/lib/seo";
import ProfileView from "@/components/Profile/ProfileView";

type RouteParams = { section: string; profile: string };

export function generateStaticParams() {
  return getProfileParams();
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { section, profile: slug } = await params;
  const profile = getProfile(slug);
  if (!profile || !isCollection(section)) return {};

  const description = plainText(profile.description).slice(0, 200);
  const image = profile.collections[section]?.main?.desktop?.[0]?.src;

  return {
    title: profile.title,
    description,
    alternates: { canonical: `/profile/${section}/${slug}` },
    openGraph: {
      title: profile.title,
      description,
      url: `/profile/${section}/${slug}`,
      type: "website",
      ...(image ? { images: [{ url: image, alt: profile.title }] } : {}),
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { section, profile: slug } = await params;

  if (!isCollection(section)) notFound();

  const profile = getProfile(slug);
  if (!profile || !profile.collections[section]?.main?.desktop?.length) notFound();

  // No commerce on the page, so this describes the entry rather than an offer.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: profile.title,
    description: plainText(profile.description),
    url: `${SITE_URL}/profile/${section}/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileView key={`${section}/${slug}`} profile={getProfileView(profile, section)} />
    </>
  );
}
