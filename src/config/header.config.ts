export interface HeaderConfig {
  sticky: boolean;
  showSearch: boolean;
  showAccount: boolean;
  showWishlist: boolean;
  showCart: boolean;
  transparentOnHero: boolean;
  mobileMenuStyle: 'drawer' | 'dropdown';
}

export const headerConfig: HeaderConfig = {
  sticky: true,
  showSearch: true,
  showAccount: true,
  showWishlist: false,
  showCart: true,
  transparentOnHero: false,
  mobileMenuStyle: 'dropdown',
};
