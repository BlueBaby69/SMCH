"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-zinc-400">Track reach and engagement across your brand ecosystem.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-300 border border-zinc-700">
          <Activity className="w-3 h-3" />
          Real-time sync enabled
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-400 text-sm">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
            <p className="text-xs text-green-500 mt-1">+0% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-400 text-sm">Avg. Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0%</div>
            <p className="text-xs text-zinc-500 mt-1">Based on last 30 days</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-400 text-sm">Top Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">N/A</div>
            <p className="text-xs text-zinc-500 mt-1">No data available</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Performance Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-zinc-500 text-sm text-center py-12">
            No analytics data found. Publish posts to start tracking engagement.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
