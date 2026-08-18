export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const footerConfig = {
  tagline: 'Elevate your everyday style.',

  columns: [
    {
      title: 'Shop',
      links: [
        { label: 'New Arrivals', href: '/shop?sort=newest' },
        { label: 'All Products', href: '/shop' },
        { label: 'Collections', href: '/collections' },
        { label: 'Sale', href: '/sale' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'Shipping Policy', href: '/shipping' },
        { label: 'Returns & Exchanges', href: '/returns' },
        { label: 'FAQs', href: '/faq' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
  ] as FooterColumn[],

  showNewsletter: true,
  newsletterTitle: 'Subscribe to our newsletter',
  newsletterDescription: 'Get the latest updates on new products and upcoming sales.',
} as const;
