// Profile data layer.
//
// The catalogue is a static JSON export (`lib/data/profiles.json`) pulled out of
// the WE+AR TRBL site — no CMS and no commerce backend behind it yet. Everything
// the profile page renders comes from here, so swapping in a real API later
// means replacing these accessors and nothing else.
import catalogue from "./data/profiles.json";

export type Collection = "mns" | "wmns";
export type Viewport = "desktop" | "mobile";

export interface ProfileImage {
  src: string;
  /** webp sibling of `src`, when the export found one. */
  webp: string | null;
  width: number;
  height: number;
}

export interface ProfileSize {
  id: number;
  title: string;
}

interface ImageSet {
  main?: Partial<Record<Viewport, ProfileImage[]>>;
  preview?: Partial<Record<Viewport, ProfileImage | null>>;
  cart?: Partial<Record<Viewport, ProfileImage | null>>;
}

export interface Profile {
  id: number;
  title: string;
  slug: string;
  type: string;
  price: string;
  compareAtPrice: string | null;
  /** Trusted HTML from the export — authored content, not user input. */
  description: string;
  sizes: ProfileSize[];
  collections: Partial<Record<Collection, ImageSet>>;
}

export interface Accessory {
  id: number;
  title: string;
  slug: string;
  type: string;
  price: string;
  compareAtPrice: string | null;
  description: string;
}

const profiles = catalogue.profiles as unknown as Profile[];
export const accessory = catalogue.accessory as unknown as Accessory;
export const currency = catalogue.currency;
export const discount = catalogue.discount;

export const COLLECTIONS: Collection[] = ["mns", "wmns"];

export function getProfiles(): Profile[] {
  return profiles;
}

export function getProfile(slug: string): Profile | undefined {
  return profiles.find((p) => p.slug === slug);
}

export function isCollection(value: string): value is Collection {
  return (COLLECTIONS as string[]).includes(value);
}

/** Gallery images for one collection at one viewport, in the export's order. */
export function getGallery(
  profile: Profile,
  collection: Collection,
  viewport: Viewport
): ProfileImage[] {
  return profile.collections[collection]?.main?.[viewport] ?? [];
}

/**
 * Every garment is sold bundled with an IKI screen, so the price on the buy
 * button is the garment plus the accessory — matching the original site, where
 * a 250 sweat reads as 350 once IKI is included.
 */
export function getTotalPrice(profile: Profile): number {
  return Number(profile.price) + Number(accessory.price);
}

export function formatPrice(amount: number, currencyCode = currency): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Exactly what the client component needs for one profile in one collection.
 * Handing the whole `Profile` to a client component would serialise the other
 * collection's image set into the payload for nothing.
 */
export interface ProfileView {
  title: string;
  slug: string;
  description: string;
  images: Record<Viewport, ProfileImage[]>;
}

export function getProfileView(profile: Profile, collection: Collection): ProfileView {
  return {
    title: profile.title,
    slug: profile.slug,
    description: profile.description,
    images: {
      desktop: getGallery(profile, collection, "desktop"),
      mobile: getGallery(profile, collection, "mobile"),
    },
  };
}

/** Every (section, profile) pair the route should pre-render. */
export function getProfileParams(): { section: Collection; profile: string }[] {
  return COLLECTIONS.flatMap((section) =>
    profiles
      .filter((p) => p.collections[section]?.main?.desktop?.length)
      .map((p) => ({ section, profile: p.slug }))
  );
}
