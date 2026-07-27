import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { postQueries } from "@/lib/queries/post.queries";
import { Post } from "@/lib/types";
import { urlFor } from "@/lib/sanity.image";
import { portableTextToPlainText, SITE_URL } from "@/lib/seo";
import PostClient from "./PostClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post: Post | null = await client.fetch(postQueries.bySlug, { slug });

  if (!post) return {};

  const description =
    portableTextToPlainText(post.description) ||
    `${post.basicInfo?.category ?? "Project"} for ${post.basicInfo?.client ?? "a client"}${
      post.basicInfo?.year ? ` (${post.basicInfo.year})` : ""
    }.`;
  const imageUrl =
    post.hasMainImage !== false
      ? urlFor(post.mainImage).width(1200).height(630).fit("crop").url()
      : undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/p/${slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `/p/${slug}`,
      type: "article",
      ...(imageUrl ? { images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }] } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post: Post | null = await client.fetch(postQueries.bySlug, { slug });

  const jsonLd = post && {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: post.title,
    description: portableTextToPlainText(post.description),
    url: `${SITE_URL}/p/${slug}`,
    ...(post.hasMainImage !== false
      ? { image: urlFor(post.mainImage).width(1200).height(630).fit("crop").url() }
      : {}),
    creator: { "@type": "Person", name: "Jordi Garreta" },
    dateCreated: post.basicInfo?.year ? String(post.basicInfo.year) : undefined,
    ...(post.basicInfo?.client ? { about: post.basicInfo.client } : {}),
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PostClient slug={slug} />
    </>
  );
}
