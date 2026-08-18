# Customization Guide

This template is designed so that a new customer website can be created by modifying
configuration files and brand assets — without touching core components.

---

## Quick-Start Checklist

```
1. Clone / copy this repository
2. Replace brand assets          →  public/brand/
3. Edit site config              →  src/config/site.config.ts
4. Edit theme config             →  src/config/theme.config.ts
5. Edit header config            →  src/config/header.config.ts
6. Edit navigation               →  src/config/navigation.config.ts
7. Edit homepage sections        →  src/config/homepage.config.ts
8. Edit category config          →  src/config/category.config.ts
9. Edit footer content           →  src/config/footer.config.ts
10. Set environment variables    →  .env.local
11. Add products via Admin Panel →  /admin/products
12. Deploy
```

---

## 1. Store Name, Tagline & Contact

**File:** `src/config/site.config.ts`

```ts
export const siteConfig = {
  name: 'UrbanEdge',          // Used in header, footer, page titles, admin
  tagline: 'Premium Streetwear',
  description: '...',
  logo: '/brand/logo.svg',
  contact: {
    email: 'hello@urbanedge.com',
    phone: '+1 (555) 000-0000',
    address: '...',
  },
  social: {
    instagram: 'https://instagram.com/urbanedge',
    facebook: '',             // Leave empty string to hide icon
    twitter: '',
    youtube: '',
  },
  copyright: '© 2025 UrbanEdge. All rights reserved.',
};
```

---

## 2. Brand Assets

**Directory:** `public/brand/`

| File | Purpose |
|------|---------|
| `logo.svg` | Main logo (light backgrounds) |
| `logo-dark.svg` | Logo for dark backgrounds |
| `favicon.ico` | Browser tab icon |
| `hero.webp` | Default homepage hero image |
| `banner.webp` | Optional promotional banner image |
| `placeholder.webp` | Fallback product image |

Replace these files when setting up a new customer.
Components reference them via `siteConfig.logo` or `homepageConfig` — no component edits needed.

---

## 3. Colors & Theme

**File:** `src/config/theme.config.ts`

```ts
export const themeConfig = {
  colors: {
    primary: '#000000',       // Main brand color (buttons, header)
    accent: '#e11d48',        // Highlights, sale badges, sale nav link
    background: '#ffffff',
    // ...
  },
  radius: {
    button: '0.5rem',         // Controls all button corner radius
    card: '0.5rem',
    input: '0.5rem',
  },
  style: {
    button: 'rounded',        // 'rounded' | 'pill' | 'square'
    productCard: 'minimal',   // 'minimal' | 'bordered' | 'elevated'
    header: 'modern',         // 'classic' | 'minimal' | 'modern'
    hero: 'full-width',       // 'full-width' | 'split' | 'centered'
  },
};
```

All values are injected as CSS custom properties at runtime by `ThemeProvider`.
You never need to edit `globals.css` for branding changes.

**Example — Black/Red theme:**
```ts
colors: {
  primary: '#111111',
  accent: '#dc2626',
}
```

---

## 4. Typography

**File:** `src/config/theme.config.ts`

```ts
typography: {
  headingFont: '"Playfair Display", serif',
  bodyFont: '"Inter", sans-serif',
},
```

Also add the font import to `src/app/layout.tsx` (Google Fonts or local).

---

## 5. Navigation

**File:** `src/config/navigation.config.ts`

```ts
export const navigationConfig = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Sale', href: '/sale', highlight: true },
];
```

`highlight: true` renders the link in the accent color.
The Header component reads this array — no Header edits needed.

---

## 6. Homepage Sections

**File:** `src/config/homepage.config.ts`

### Enable / Disable Sections

```ts
{ type: 'newsletter', enabled: false }   // hidden
{ type: 'newsletter', enabled: true }    // shown
```

### Reorder Sections

Change the array order — the page renders sections in the order they appear.

### Customize Section Content

```ts
{
  type: 'hero',
  enabled: true,
  title: 'Premium Streetwear',
  subtitle: 'Crafted for the bold.',
  image: '/brand/hero.webp',
  primaryButton: { label: 'Shop Now', href: '/shop' },
  secondaryButton: { label: 'View Collections', href: '/collections' },
},
```

### Available Section Types

| Type | Description |
|------|-------------|
| `hero` | Full-width hero banner |
| `featuredCategories` | Grid of category cards (pulled from DB) |
| `newArrivals` | Latest products (pulled from DB) |
| `featuredProducts` | Products marked `isFeatured` in DB |
| `banner` | Promotional image banner with CTA |
| `newsletter` | Email signup form |

---

## 7. Footer

**File:** `src/config/footer.config.ts`

```ts
export const footerConfig = {
  tagline: 'Elevate your everyday style.',
  showNewsletter: true,
  columns: [
    {
      title: 'Shop',
      links: [
        { label: 'New Arrivals', href: '/shop?sort=newest' },
        { label: 'Sale', href: '/sale' },
      ],
    },
    // Add or remove columns freely
  ],
};
```

Social links come from `siteConfig.social` — empty strings hide the icon.

---

## 8. Categories

Categories are **data-driven** — they come from the products in the database.

To set up categories for a new customer:
1. Go to `/admin/products`
2. Create products and assign them to categories (e.g. "Sneakers", "Jackets")
3. Categories automatically appear in the shop filter, collections page, and homepage

No code changes needed.

---

## 9. Environment Variables

**File:** `.env.local`

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.com
```

Do **not** put UI configuration (colors, names, fonts) in environment variables.
Those belong in `src/config/` so they are version-controlled with the customer repo.

---

## 10. Admin Panel

The admin panel is the same application for every customer.
It automatically uses `siteConfig.name` for its title and branding.

Access at `/admin` (requires admin role).

To create the first admin user:
```bash
node scripts/createAdminUser.js
```

---

## Files You Should NOT Normally Modify

These are core application files. Modifying them means you are changing
functionality, not just customer configuration:

```
src/components/layout/Header.tsx
src/components/layout/Footer.tsx
src/components/layout/Hero.tsx
src/components/products/ProductCard.tsx
src/components/ui/
src/app/cart/
src/app/checkout/
src/app/product/[slug]/
src/app/shop/
src/app/collections/
src/app/sale/
src/app/account/
src/app/admin/
src/app/api/
src/lib/
src/models/
src/middleware.ts
src/context/
```

---

## Creating a New Customer Repository

```bash
# 1. Clone template
git clone <template-repo> customer-name
cd customer-name

# 2. Remove template git history, start fresh
rm -rf .git && git init

# 3. Replace brand assets
cp /path/to/customer/logo.svg public/brand/logo.svg
cp /path/to/customer/hero.webp public/brand/hero.webp

# 4. Edit configs
#    src/config/site.config.ts
#    src/config/theme.config.ts
#    src/config/navigation.config.ts
#    src/config/homepage.config.ts
#    src/config/footer.config.ts

# 5. Set environment variables
cp .env.local.example .env.local
# Edit .env.local with customer DB and secrets

# 6. Install and run
npm install
npm run dev
```
