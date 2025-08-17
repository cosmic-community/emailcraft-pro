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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div key={item.title} className="card p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-gray-50 ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{item.title}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}