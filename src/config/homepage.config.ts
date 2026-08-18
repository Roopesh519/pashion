export type HomepageSectionType =
  | 'hero'
  | 'featuredCategories'
  | 'newArrivals'
  | 'featuredProducts'
  | 'banner'
  | 'newsletter';

interface HeroSection {
  type: 'hero';
  enabled: boolean;
  title: string;
  subtitle: string;
  image: string;
  primaryButton: { label: string; href: string };
  secondaryButton: { label: string; href: string };
}

interface FeaturedCategoriesSection {
  type: 'featuredCategories';
  enabled: boolean;
  title: string;
  subtitle: string;
}

interface NewArrivalsSection {
  type: 'newArrivals';
  enabled: boolean;
  title: string;
  subtitle: string;
  limit: number;
}

interface FeaturedProductsSection {
  type: 'featuredProducts';
  enabled: boolean;
  title: string;
  subtitle: string;
  limit: number;
}

interface BannerSection {
  type: 'banner';
  enabled: boolean;
  title: string;
  subtitle: string;
  image: string;
  button: { label: string; href: string };
}

interface NewsletterSection {
  type: 'newsletter';
  enabled: boolean;
  title: string;
  subtitle: string;
}

export type HomepageSection =
  | HeroSection
  | FeaturedCategoriesSection
  | NewArrivalsSection
  | FeaturedProductsSection
  | BannerSection
  | NewsletterSection;

export const homepageConfig: HomepageSection[] = [
  {
    type: 'hero',
    enabled: true,
    title: 'Define Your Vibe',
    subtitle: 'Streetwear that speaks louder than words.',
    image: '/brand/hero.webp',
    primaryButton: { label: 'Shop New Arrivals', href: '/shop' },
    secondaryButton: { label: 'View Collections', href: '/collections' },
  },
  {
    type: 'featuredCategories',
    enabled: true,
    title: 'Trending Collections',
    subtitle: 'Curated just for you',
  },
  {
    type: 'newArrivals',
    enabled: true,
    title: 'New Arrivals',
    subtitle: 'Fresh styles just dropped',
    limit: 4,
  },
  {
    type: 'featuredProducts',
    enabled: false,
    title: 'Featured Products',
    subtitle: 'Hand-picked favourites',
    limit: 4,
  },
  {
    type: 'banner',
    enabled: false,
    title: 'Up to 50% Off',
    subtitle: 'Limited time sale on selected items',
    image: '/brand/banner.webp',
    button: { label: 'Shop Sale', href: '/sale' },
  },
  {
    type: 'newsletter',
    enabled: false,
    title: 'Stay in the Loop',
    subtitle: 'Get the latest drops and exclusive offers.',
  },
];
