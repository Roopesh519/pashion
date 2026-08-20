import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import StatCard from '@/components/admin/StatCard';
import DashboardCharts from '@/components/admin/DashboardCharts';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';

export default async function AdminPage() {
  await dbConnect();

  // Fetch data for stats
  const userCountAndChartData = await Promise.all([
    Product.countDocuments(),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    User.countDocuments(),
    (async () => {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      return Order.aggregate([
        { $match: { createdAt: { $gte: last7Days } } },
        { 
          $group: { 
            _id: { $dateToString: { format: "%b %d", date: "$createdAt" } }, 
            revenue: { $sum: "$totalAmount" } 
          } 
        },
        { $sort: { _id: 1 } }
      ]);
    })()
  ]);

  const productCount = userCountAndChartData[0] as number;
  const orderStats = userCountAndChartData[1] as any[];
  const recentOrders = userCountAndChartData[2] as any[];
  const userCount = userCountAndChartData[3] as number;

  // Calculate analytics
  const totalRevenue = orderStats[0]?.totalRevenue || 0;
  const orderCount = orderStats[0]?.orderCount || 0;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
  const chartData = (userCountAndChartData[4] || []).map((item: any) => ({
    date: item._id,
    revenue: item.revenue
  }));

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      trend: { value: 12, isUp: true },
      color: '#10b981'
    },
    {
      title: 'Total Orders',
      value: orderCount,
      icon: ShoppingCart,
      trend: { value: 8, isUp: true },
      color: '#3b82f6'
    },
    {
      title: 'Active Customers',
      value: userCount,
      icon: Users,
      trend: { value: 5, isUp: true },
      color: '#8b5cf6'
    },
    {
      title: 'Total Products',
      value: productCount,
      icon: Package,
      trend: { value: 2, isUp: true },
      color: '#f59e0b'
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Dashboard Overview</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="dashboard-content-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Orders Table */}
        <section className="dashboard-section recent-orders">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="#3b82f6" />
              <h2>Recent Orders</h2>
            </div>
            <Link href="/admin/orders" className="view-all-link">View All Orders</Link>
          </div>

          <div className="activity-table-container">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => (
                    <tr key={order._id}>
                      <td data-label="Order ID" style={{ fontWeight: 600 }}>#{order._id.toString().slice(-6).toUpperCase()}</td>
                      <td data-label="Customer">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</td>
                      <td data-label="Date">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td data-label="Amount" style={{ fontWeight: 600 }}>{formatCurrency(order.totalAmount ?? 0)}</td>
                      <td data-label="Status">
                        <span className={`status-badge status-${order.status || 'pending'}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No orders found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Insights */}
        <section className="dashboard-section insights">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} color="#8b5cf6" />
              <h2>Quick Insights</h2>
            </div>
          </div>

          <div className="insights-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <DashboardCharts data={chartData} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="insight-item">
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Average Order Value</p>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{formatCurrency(avgOrderValue)}</h4>
              </div>
              <div className="insight-item">
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Conversion Rate</p>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>3.2%</h4>
              </div>
            </div>
            <div className="insight-item">
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Store Views</p>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>12,458</h4>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
