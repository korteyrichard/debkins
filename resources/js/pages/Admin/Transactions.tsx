import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/admin-layout';
import { Head, usePage, router } from '@inertiajs/react';
import Pagination from '@/components/pagination';

interface User {
  name: string;
  email: string;
}

interface Order {
  user: User;
  beneficiary_number?: string;
}

interface Transaction {
  id: number;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  type: string;
  user?: User; // Direct user relationship for topups
  order?: Order; // Order relationship for order transactions
}

interface PaginatedTransactions {
  data: Transaction[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface AdminTransactionsPageProps {
  transactions: PaginatedTransactions;
  auth: any;
  filterType: string;
  filterPhone: string;
  filterDate: string;
  agentFee: number;
  [key: string]: any;
}

const typeLabels: Record<string, string> = {
  topup: 'Wallet Top Up',
  order: 'Order Purchase',
  agent_fee: 'Agent Fee',
  refund: 'Refund',
  admin_credit: 'Admin Credit',
  admin_debit: 'Admin Debit',
};

const typeColors: Record<string, string> = {
  topup: 'bg-green-100 text-green-800',
  order: 'bg-blue-100 text-blue-800',
  agent_fee: 'bg-orange-100 text-orange-800',
  refund: 'bg-yellow-100 text-yellow-800',
  admin_credit: 'bg-purple-100 text-purple-800',
  admin_debit: 'bg-red-100 text-red-800',
};

export default function AdminTransactions() {
  const { transactions, auth, filterType: initialFilterType, filterPhone: initialFilterPhone, filterDate: initialFilterDate, agentFee: initialAgentFee } = usePage<AdminTransactionsPageProps>().props;
  const [filterType, setFilterType] = useState(initialFilterType);
  const [filterPhone, setFilterPhone] = useState(initialFilterPhone);
  const [filterDate, setFilterDate] = useState(initialFilterDate);
  const [agentFee, setAgentFee] = useState(initialAgentFee);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value;
    setFilterType(newFilter);
    const params: any = {};
    if (newFilter) params.type = newFilter;
    if (filterPhone) params.phone = filterPhone;
    if (filterDate) params.date = filterDate;
    router.get(route('admin.transactions'), params, { preserveState: true, replace: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    setFilterPhone(newPhone);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setFilterDate(newDate);
  };

  const handleApplyFilters = () => {
    const params: any = {};
    if (filterType) params.type = filterType;
    if (filterPhone) params.phone = filterPhone;
    if (filterDate) params.date = filterDate;
    router.get(route('admin.transactions'), params, { preserveState: true, replace: true });
  };

  const handleClearFilters = () => {
    setFilterType('');
    setFilterPhone('');
    setFilterDate('');
    router.get(route('admin.transactions'), {}, { preserveState: true, replace: true });
  };

  const handleAgentFeeUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    router.post(route('admin.agent-fee.update'), { fee: agentFee }, {
      onFinish: () => setIsUpdating(false),
    });
  };

  return (
    <AdminLayout user={auth?.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Admin Transactions</h2>}>
      <Head title="Admin Transactions" />
      <div className="py-8 max-w-4xl mx-auto">
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <form onSubmit={handleAgentFeeUpdate} className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-2">Agent Registration Fee (GHS)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={agentFee}
                onChange={(e) => setAgentFee(parseFloat(e.target.value))}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Fee'}
            </button>
          </form>
        </div>
        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-2">Filter by Type:</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={filterType}
                onChange={handleFilterChange}
              >
                <option value="" className='text-slate-600'>All Types</option>
                <option value="topup" className='text-slate-600'>Wallet Top Ups</option>
                <option value="order" className='text-slate-600'>Order Purchases</option>
                <option value="agent_fee" className='text-slate-600'>Agent Fees</option>
                <option value="refund" className='text-slate-600'>Refunds</option>
                <option value="admin_credit" className='text-slate-600'>Admin Credits</option>
                <option value="admin_debit" className='text-slate-600'>Admin Debits</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2">Filter by Phone/Beneficiary:</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                placeholder="Phone or beneficiary number"
                value={filterPhone}
                onChange={handlePhoneChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Filter by Date:</label>
              <input
                type="date"
                className="border rounded px-3 py-2 w-full"
                value={filterDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
        {transactions.data.length === 0 ? (
          <div>No transactions found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone/Beneficiary</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.data.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-4 py-3 font-bold">{transaction.id}</td>
                    <td className="px-4 py-3 text-sm">{transaction.user?.name || transaction.order?.user?.name}</td>
                    <td className="px-4 py-3 text-sm">{transaction.order?.beneficiary_number || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">${transaction.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[transaction.type] || 'bg-gray-100 text-gray-800'}`}>
                        {typeLabels[transaction.type] || transaction.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{new Date(transaction.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <Pagination data={transactions} />
      </div>
    </AdminLayout>
  );
}