export interface CategoryConfig {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  featured?: boolean;
}

export const categoryConfig: CategoryConfig[] = [
  {
    name: 'Hoodies',
    slug: 'hoodies',
    image: '/brand/categories/hoodies.webp',
    description: 'Urban streetwear hoodies and oversized fits',
    featured: true,
  },
  {
    name: 'T-Shirts',
    slug: 't-shirts',
    image: '/brand/categories/t-shirts.webp',
    description: 'Essential graphic and plain t-shirts',
    featured: true,
  },
  {
    name: 'Pants',
    slug: 'pants',
    image: '/brand/categories/pants.webp',
    description: 'Cargo pants, joggers and denim',
    featured: true,
  },
];
