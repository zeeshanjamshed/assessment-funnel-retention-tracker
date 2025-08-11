'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { QuizAnalytics } from '@/types'

interface FunnelChartProps {
  analytics: QuizAnalytics
}

export default function FunnelChart({ analytics }: FunnelChartProps) {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ]

  const chartData = analytics.slideData.map((slide, index) => ({
    name: slide.slide_title || `Slide ${slide.slide_sequence}`,
    users: slide.user_count,
    sequence: slide.slide_sequence,
    dropOff: index > 0 ? analytics.slideData[index - 1].user_count - slide.user_count : 0,
    retentionRate: ((slide.user_count / analytics.totalSessions) * 100).toFixed(1)
  }))

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Funnel Analysis</h2>
        <p className="text-gray-600">User progression through quiz slides</p>
      </div>

      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: string) => [
                name === 'users' ? `${value} users` : value,
                name === 'users' ? 'Users' : name
              ]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="users" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slide
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Retention Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drop-off
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chartData.map((slide, index) => (
              <tr key={slide.sequence}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {slide.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slide.users}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slide.retentionRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slide.dropOff > 0 ? `-${slide.dropOff}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}