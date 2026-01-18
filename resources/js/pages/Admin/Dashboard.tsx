import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { PageProps, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { TrendingUp, TrendingDown, Users, Package, ShoppingCart, CreditCard, UserPlus, Calendar, Activity } from 'lucide-react';

interface AdminDashboardProps extends PageProps {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalTransactions: number;
  todayUsers: number;
  todayOrders: number;
  todayTransactions: number;
  jaybartOrderPusherEnabled: boolean;
  fosterOrderPusherEnabled: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  gradient 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  gradient: string;
}) => (
  <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
    <div className={`absolute inset-0 ${gradient} opacity-10`} />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${gradient} bg-opacity-20`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent className="relative z-10">
      <div className="text-3xl font-bold mb-1">{value}</div>
      {trend && trendValue && (
        <div className="flex items-center text-xs text-muted-foreground">
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
            {trendValue}
          </span>
          <span className="ml-1">from last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  totalUsers,
  totalProducts,
  totalOrders,
  totalTransactions,
  todayUsers,
  todayOrders,
  todayTransactions,
  jaybartOrderPusherEnabled,
  fosterOrderPusherEnabled,
}) => {
  const { auth } = usePage<AdminDashboardProps>().props;

  const toggleJaybartOrderPusher = () => {
    router.post('/admin/toggle-jaybart-order-pusher', {
      enabled: !jaybartOrderPusherEnabled
    });
  };

  const toggleFosterOrderPusher = () => {
    router.post('/admin/toggle-foster-order-pusher', {
      enabled: !fosterOrderPusherEnabled
    });
  };



  return (
    <AdminLayout
      user={auth?.user}
      header={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground">Welcome back, {auth?.user?.name}</p>
          </div>
        </div>
      }
    >
      <Head title="Admin Dashboard" />

      <div className="space-y-8">
        {/* Summary Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
            <h3 className="text-xl font-semibold">Overall Summary</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Users" 
              value={totalUsers.toLocaleString()} 
              icon={<Users className="h-5 w-5 text-blue-600" />}
              trend="up"
              trendValue="+12%"
              gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <StatCard 
              title="Total Products" 
              value={totalProducts.toLocaleString()} 
              icon={<Package className="h-5 w-5 text-green-600" />}
              trend="up"
              trendValue="+8%"
              gradient="bg-gradient-to-r from-green-500 to-green-600"
            />
            <StatCard 
              title="Total Orders" 
              value={totalOrders.toLocaleString()} 
              icon={<ShoppingCart className="h-5 w-5 text-orange-600" />}
              trend="up"
              trendValue="+23%"
              gradient="bg-gradient-to-r from-orange-500 to-orange-600"
            />
            <StatCard 
              title="Total Transactions" 
              value={totalTransactions.toLocaleString()} 
              icon={<CreditCard className="h-5 w-5 text-purple-600" />}
              trend="up"
              trendValue="+15%"
              gradient="bg-gradient-to-r from-purple-500 to-purple-600"
            />
          </div>
        </section>

        {/* Today Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-1 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
            <h3 className="text-xl font-semibold">Today's Activity</h3>
            <Badge variant="secondary" className="ml-2">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date().toLocaleDateString()}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard 
              title="New Users Today" 
              value={todayUsers.toLocaleString()} 
              icon={<UserPlus className="h-5 w-5 text-emerald-600" />}
              gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
            />
            <StatCard 
              title="Orders Today" 
              value={todayOrders.toLocaleString()} 
              icon={<ShoppingCart className="h-5 w-5 text-cyan-600" />}
              gradient="bg-gradient-to-r from-cyan-500 to-cyan-600"
            />
            <StatCard 
              title="Transactions Today" 
              value={todayTransactions.toLocaleString()} 
              icon={<CreditCard className="h-5 w-5 text-indigo-600" />}
              gradient="bg-gradient-to-r from-indigo-500 to-indigo-600"
            />
          </div>
        </section>

        {/* System Controls */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-1 bg-gradient-to-b from-red-500 to-pink-600 rounded-full" />
            <h3 className="text-xl font-semibold">System Controls</h3>
          </div>
          <div className="space-y-4">
            {/* Jaybart Order Pusher */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Jaybart Order Pusher (MTN)</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Manage automatic MTN order synchronization with Jaybart API
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={jaybartOrderPusherEnabled ? "default" : "secondary"}
                      className={jaybartOrderPusherEnabled ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {jaybartOrderPusherEnabled ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {jaybartOrderPusherEnabled ? 'MTN orders are being pushed to Jaybart API' : 'Jaybart order pushing is disabled'}
                    </span>
                  </div>
                  <button
                    onClick={toggleJaybartOrderPusher}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      jaybartOrderPusherEnabled 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg' 
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                        jaybartOrderPusherEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Foster Order Pusher */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Foster Order Pusher (Telecel, Ishare, Bigtime)</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Manage automatic Telecel, Ishare, and Bigtime order synchronization with Foster API
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={fosterOrderPusherEnabled ? "default" : "secondary"}
                      className={fosterOrderPusherEnabled ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {fosterOrderPusherEnabled ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {fosterOrderPusherEnabled ? 'Telecel, Ishare, and Bigtime orders are being pushed to Foster API' : 'Foster order pushing is disabled'}
                    </span>
                  </div>
                  <button
                    onClick={toggleFosterOrderPusher}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      fosterOrderPusherEnabled 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg' 
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                        fosterOrderPusherEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
