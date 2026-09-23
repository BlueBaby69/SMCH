import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: 'Active Niches', value: '0', icon: LayoutDashboard, color: 'text-blue-500' },
    { label: 'Pending Approval', value: '0', icon: Clock, color: 'text-yellow-500' },
    { label: 'Published Posts', value: '0', icon: CheckCircle, color: 'text-green-500' },
    { label: 'Errors', value: '0', icon: AlertCircle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400">Overview of your AI social engine performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.label}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-zinc-500 text-sm text-center py-12">
            No recent activity. Start by creating a new niche brand in the Profiles manager.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
