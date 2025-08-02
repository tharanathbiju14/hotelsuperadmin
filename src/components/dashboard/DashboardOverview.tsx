import React from 'react';
import { UserCheck, UserX, Clock as UserClock, TrendingUp, Building2, Star } from 'lucide-react';

interface DashboardOverviewProps {
  stats: {
    approved: number;
    pending: number;
    rejected: number;
  };
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats }) => {
  const StatCard = ({ title, value, icon: Icon, color, bgColor, trend }: any) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Registration Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Hotels"
            value={stats.approved + stats.pending}
            icon={Building2}
            color="bg-blue-500"
            bgColor="bg-blue-50"
            trend="All registered hotels"
          />
          <StatCard
            title="Approved Users"
            value={stats.approved}
            icon={UserCheck}
            color="bg-green-500"
            bgColor="bg-green-50"
            trend="+8% this month"
          />
          <StatCard
            title="Pending Users"
            value={stats.pending}
            icon={UserClock}
            color="bg-yellow-500"
            bgColor="bg-yellow-50"
            trend="Awaiting review"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <UserCheck className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">New hotel approved</p>
              <p className="text-xs text-gray-500">Grand Plaza Hotel was approved 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <UserClock className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Pending review</p>
              <p className="text-xs text-gray-500">Mountain Lodge submitted registration 4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Profile updated</p>
              <p className="text-xs text-gray-500">Ocean View Resort updated their information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};