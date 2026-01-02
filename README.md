# Pashion - Modern eCommerce Platform

A full-featured, responsive eCommerce website built with Next.js 14, TypeScript, and MongoDB. Features a complete shopping experience with user authentication, cart management, checkout flow, and an admin CMS panel.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Ready-green)

## ✨ Features

### Customer-Facing
- 🏠 **Homepage** with hero banner and product showcases
- 🛍️ **Product Catalog** with filtering and search
- 📦 **Product Details** with size/color selection and image gallery
- 🛒 **Shopping Cart** with quantity management
- 💳 **Checkout Flow** with order summary
- 👤 **User Authentication** (Login/Register/Dashboard)
- 📱 **Fully Responsive** design

### Admin Panel
- 📊 **Dashboard** with overview statistics
- 📝 **Product Management** (CRUD operations)
- 📋 **Order Management** with status tracking
- 🎨 **Clean UI** with data tables and filters

### Technical
- ⚡ **Next.js 14** (App Router, Server Components)
- 🔒 **NextAuth.js** authentication
- 📦 **MongoDB** with Mongoose ODM
- 🎨 **CSS Modules** (Vanilla CSS, no dependencies)
- 🛡️ **TypeScript** for type safety
- 💾 **Context API** for state management

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or later
- MongoDB database (local or cloud)

### Installation

1. **Clone and install dependencies:**
```bash
cd pashion
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pashion
NEXTAUTH_SECRET=your_super_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

3. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
pashion/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin panel pages
│   │   ├── api/               # API routes
│   │   ├── cart/              # Shopping cart page
│   │   ├── checkout/          # Checkout page
│   │   ├── product/[slug]/    # Dynamic product pages
│   │   ├── shop/              # Product listing page
│   │   └── ...
│   ├── components/            # React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── layout/           # Layout components (Header, Footer)
│   │   ├── product-detail/   # Product detail components
│   │   ├── products/         # Product card components
│   │   ├── shop/             # Shop page components
│   │   └── ui/               # Reusable UI components
│   ├── context/              # React Context providers
│   ├── lib/                  # Utility functions
│   ├── models/               # Mongoose schemas
│   └── ...
├── public/                    # Static assets
└── ...
```

## 🔑 Key Pages

- `/` - Homepage
- `/shop` - Product catalog
- `/product/[slug]` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/login` - User login
- `/register` - User registration
- `/account` - User dashboard
- `/admin` - Admin dashboard (requires admin role)
- `/admin/products` - Product management
- `/admin/orders` - Order management

## 🔌 API Routes

### Products
- `GET /api/products` - List products (supports ?category and ?featured filters)
- `POST /api/products` - Create product (admin only)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only)

### Orders
- `GET /api/orders` - List orders (supports ?userId and ?status filters)
- `POST /api/orders` - Create order

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

## 🛠️ Development

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Lint code:
```bash
npm run lint
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js (generate with `openssl rand -base64 32`) | Yes |
| `NEXTAUTH_URL` | Base URL of the application | Yes |

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy!

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted with Docker

See [deployment guide](brain/deployment_guide.md) for detailed instructions.

## 🗄️ Database Setup

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Add database user and whitelist IP (0.0.0.0/0 for development)
4. Get connection string and add to `.env.local`

### Local MongoDB
```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
# or apt-get install mongodb     # Ubuntu

# Start MongoDB
mongod --dbpath=/path/to/data
```

## 🎨 Customization

### Colors
Edit CSS variables in `src/app/globals.css`:
```css
:root {
  --primary: #000000;
  --accent: #e11d48;
  /* ... */
}
```

### Components
All components use CSS Modules for styling, located in `*.module.css` files alongside component files.

## 📦 Dependencies

### Core
- next: 14.2.35
- react: 18.x
- typescript: 5.x

### Database & Auth
- mongoose: 8.x (Node 18 compatible)
- next-auth: 4.24.x
- bcryptjs: 2.x

### Icons
- lucide-react: Latest

## 🤝 Contributing

This is a showcase project. Feel free to fork and modify for your own use.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

Built with modern web technologies and best practices for eCommerce applications.

---

**Need Help?** Check the `/brain` directory for detailed implementation guides and walkthroughs.
