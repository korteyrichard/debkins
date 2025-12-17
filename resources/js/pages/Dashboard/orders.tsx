import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Head, usePage, router } from '@inertiajs/react';

interface Product {
  id: number;
  name: string;
  price: number;
  size?: string;
  pivot: {
    quantity: number;
    price: number;
    beneficiary_number?: string;
  };
}

interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
  network?: string;
  beneficiary_number?: string;
  products: Product[];
}

interface OrdersPageProps {
  orders: Order[];
  auth: any;
  [key: string]: any;
}

export default function OrdersPage() {
  const { orders, auth } = usePage<OrdersPageProps>().props;
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [networkFilter, setNetworkFilter] = useState('');
  const [orderIdSearch, setOrderIdSearch] = useState('');
  const [beneficiarySearch, setBeneficiarySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Extract unique networks and statuses for filter dropdowns
  const networks = Array.from(new Set(orders.map(o => o.network).filter(Boolean)));
  const statuses = Array.from(new Set(orders.map(o => o.status).filter(Boolean)));

  const filteredOrders = orders.filter(order => {
    const matchesNetwork = !networkFilter || order.network === networkFilter;
    const matchesOrderId = !orderIdSearch || order.id.toString().includes(orderIdSearch);
    const matchesBeneficiary = !beneficiarySearch || 
      order.beneficiary_number?.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
      order.products.some(product => 
        product.pivot.beneficiary_number?.toLowerCase().includes(beneficiarySearch.toLowerCase())
      );
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesNetwork && matchesOrderId && matchesBeneficiary && matchesStatus;
  });

  const handleExpand = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getNetworkColor = (network?: string) => {
    if (!network) return '';
    if (network.toLowerCase() === 'telecel') return 'bg-red-500';
    if (network.toLowerCase() === 'mtn') return 'bg-yellow-500';
    if (network.toLowerCase() === 'bigtime' || network.toLowerCase() === 'ishare' || network.toLowerCase() === 'at data (instant)' || network.toLowerCase() === 'at (big packages)') return 'bg-blue-500';
    return '';
  };

  return (
    <DashboardLayout user={auth?.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">My Orders</h2>}>
      <Head title="Orders" />
      <div className="py-8 max-w-4xl mx-auto">
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search by Order ID:</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                placeholder="Enter order ID..."
                value={orderIdSearch}
                onChange={e => setOrderIdSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Search by Beneficiary Number:</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                placeholder="Enter beneficiary number..."
                value={beneficiarySearch}
                onChange={e => setBeneficiarySearch(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Network:</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={networkFilter}
                onChange={e => setNetworkFilter(e.target.value)}
              >
                <option value="" className='text-slate-800'>All Networks</option>
                {networks.map(network => (
                  <option key={network} value={network} className='text-slate-700'>{network}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Status:</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="" className='text-slate-800'>All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status} className='text-slate-700'>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {filteredOrders.length === 0 ? (
          <div>No orders found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border-2 border-slate-600">
            <table className="min-w-full bg-white dark:bg-gray-800 border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-slate-600">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-slate-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-slate-600">Beneficiaries</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-slate-600">Network</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border border-slate-600">Size</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-4 py-3 font-bold border border-slate-600">{order.id}</td>
                    <td className="px-4 py-3 border border-slate-600">
                      <div className="text-sm">
                        <div className="font-medium">{new Date(order.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-slate-600">
                      <div className="space-y-1">
                        {order.products.map(product => (
                          <div key={product.id} className="text-sm">
                            {product.pivot.beneficiary_number || '-'}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className={`px-4 py-3 rounded ${getNetworkColor(order.network)} text-white font-medium border border-slate-600`}>
                      {order.network || '-'}
                    </td>
                    <td className="px-4 py-3 border border-slate-600">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 border border-slate-600">
                      <div className="space-y-1">
                        {order.products.map(product => (
                          <div key={product.id} className="text-sm">
                            {product.size || '-'}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}