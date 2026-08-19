export const siteConfig = {
  name: 'Pashion',
  tagline: 'Define Your Vibe',
  description: 'Modern urban fashion for the streets.',
  longDescription:
    'Discover the latest in urban streetwear. Shop hoodies, tees, and accessories that define your style.',

  /** Path relative to /public */
  logo: '',
  logoDark: '',
  favicon: '/brand/Urban.png',

  contact: {
    email: 'hello@pashion.store',
    phone: '+1 (555) 000-0000',
    address: '123 Fashion Street, New York, NY 10001',
  },

  social: {
    instagram: 'https://instagram.com/pashion',
    facebook: 'https://facebook.com/pashion',
    twitter: 'https://twitter.com/pashion',
    youtube: 'https://youtube.com/pashion',
  },

  copyright: `© ${new Date().getFullYear()} Pashion. All rights reserved.`,
} as const;
