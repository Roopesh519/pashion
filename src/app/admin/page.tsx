import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';

export default async function AdminPage() {
  await dbConnect();
  const [productCount, orderCount, userCount] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments(),
  ]);

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ padding: '1rem', background: '#fff', borderRadius: 6 }}>
          <h3>Products</h3>
          <p style={{ fontSize: '1.5rem' }}>{productCount}</p>
        </div>
        <div style={{ padding: '1rem', background: '#fff', borderRadius: 6 }}>
          <h3>Orders</h3>
          <p style={{ fontSize: '1.5rem' }}>{orderCount}</p>
        </div>
        <div style={{ padding: '1rem', background: '#fff', borderRadius: 6 }}>
          <h3>Customers</h3>
          <p style={{ fontSize: '1.5rem' }}>{userCount}</p>
        </div>
      </div>
    </div>
  );
}
