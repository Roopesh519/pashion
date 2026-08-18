export interface NavItem {
  label: string;
  href: string;
  /** Highlight with accent color (e.g. Sale) */
  highlight?: boolean;
}

export const navigationConfig: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Sale', href: '/sale', highlight: true },
];
