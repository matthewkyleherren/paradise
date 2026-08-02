// Product data layer.
//
// The catalogue is a static JSON export (`lib/data/products.json`) pulled out of
// the WE+AR TRBL site — no CMS and no commerce backend behind it yet. Everything
// the product page renders comes from here, so swapping in a real API later
// means replacing these accessors and nothing else.
import catalogue from "./data/products.json";

export type Collection = "mns" | "wmns";
export type Viewport = "desktop" | "mobile";

export interface ProductImage {
  src: string;
  /** webp sibling of `src`, when the export found one. */
  webp: string | null;
  width: number;
  height: number;
}

export interface ProductSize {
  id: number;
  title: string;
}

interface ImageSet {
  main?: Partial<Record<Viewport, ProductImage[]>>;
  preview?: Partial<Record<Viewport, ProductImage | null>>;
  cart?: Partial<Record<Viewport, ProductImage | null>>;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  type: string;
  price: string;
  compareAtPrice: string | null;
  /** Trusted HTML from the export — authored content, not user input. */
  description: string;
  sizes: ProductSize[];
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

const products = catalogue.products as unknown as Product[];
export const accessory = catalogue.accessory as unknown as Accessory;
export const currency = catalogue.currency;
export const discount = catalogue.discount;

export const COLLECTIONS: Collection[] = ["mns", "wmns"];

export function getProducts(): Product[] {
  return products;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function isCollection(value: string): value is Collection {
  return (COLLECTIONS as string[]).includes(value);
}

/** Gallery images for one collection at one viewport, in the export's order. */
export function getGallery(
  product: Product,
  collection: Collection,
  viewport: Viewport
): ProductImage[] {
  return product.collections[collection]?.main?.[viewport] ?? [];
}

/**
 * Every garment is sold bundled with an IKI screen, so the price on the buy
 * button is the garment plus the accessory — matching the original site, where
 * a 250 sweat reads as 350 once IKI is included.
 */
export function getTotalPrice(product: Product): number {
  return Number(product.price) + Number(accessory.price);
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
 * Exactly what the client component needs for one product in one collection.
 * Handing the whole `Product` to a client component would serialise the other
 * collection's image set into the payload for nothing.
 */
export interface ProductView {
  title: string;
  slug: string;
  description: string;
  images: Record<Viewport, ProductImage[]>;
}

export function getProductView(product: Product, collection: Collection): ProductView {
  return {
    title: product.title,
    slug: product.slug,
    description: product.description,
    images: {
      desktop: getGallery(product, collection, "desktop"),
      mobile: getGallery(product, collection, "mobile"),
    },
  };
}

/** Every (section, product) pair the route should pre-render. */
export function getProductParams(): { section: Collection; product: string }[] {
  return COLLECTIONS.flatMap((section) =>
    products
      .filter((p) => p.collections[section]?.main?.desktop?.length)
      .map((p) => ({ section, product: p.slug }))
  );
}
