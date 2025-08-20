import { Users, Mail, FileText, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  stats: {
    totalContacts: number
    activeCampaigns: number
    totalTemplates: number
    averageOpenRate: number
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      title: 'Total Contacts',
      value: stats.totalContacts.toLocaleString(),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns.toString(),
      icon: Mail,
      color: 'text-green-600'
    },
    {
      title: 'Email Templates',
      value: stats.totalTemplates.toString(),
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      title: 'Avg. Open Rate',
      value: `${stats.averageOpenRate}%`,
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {statItems.map((item) => (
        <div key={item.title} className="card p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className={`p-2 rounded-lg bg-gray-50 ${item.color} mb-2 sm:mb-0 self-start`}>
              <item.icon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">{item.title}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}