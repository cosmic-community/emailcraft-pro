import { getCampaigns, getContacts, getEmailTemplates } from '@/lib/cosmic'
import DashboardStats from '@/components/DashboardStats'
import RecentCampaigns from '@/components/RecentCampaigns'
import QuickActions from '@/components/QuickActions'

export default async function DashboardPage() {
  const [campaigns, contacts, templates] = await Promise.all([
    getCampaigns(),
    getContacts(),
    getEmailTemplates()
  ])

  // Calculate stats
  const totalContacts = contacts.length
  const activeCampaigns = campaigns.filter(c => c.metadata.campaign_status.key === 'sending').length
  const totalTemplates = templates.length
  const averageOpenRate = campaigns.length > 0 
    ? campaigns.reduce((acc, c) => acc + (c.metadata.campaign_stats?.open_rate || 0), 0) / campaigns.length
    : 0

  const stats = {
    totalContacts,
    activeCampaigns,
    totalTemplates,
    averageOpenRate: Math.round(averageOpenRate * 100)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to EmailCraft Pro
        </h1>
        <p className="text-gray-600">
          Manage your email marketing campaigns with powerful AI-driven tools.
        </p>
      </div>

      <DashboardStats stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <RecentCampaigns campaigns={campaigns.slice(0, 5)} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}