import { getCampaigns, getContacts, getTemplates } from '@/lib/cosmic'
import DashboardStats from '@/components/DashboardStats'
import RecentCampaigns from '@/components/RecentCampaigns'
import QuickActions from '@/components/QuickActions'

// Force dynamic rendering for real-time data updates
export const dynamic = 'force-dynamic'

// Define types for the data structures
interface CampaignStatus {
  key: string;
}

interface CampaignStats {
  open_rate?: number;
}

interface CampaignMetadata {
  campaign_status: CampaignStatus;
  campaign_stats?: CampaignStats;
}

interface Campaign {
  id: string;
  metadata: CampaignMetadata;
}

interface Contact {
  id: string;
}

interface Template {
  id: string;
}

export default async function DashboardPage() {
  const [campaigns, contacts, templates] = await Promise.all([
    getCampaigns(),
    getContacts(),
    getTemplates()
  ])

  // Calculate stats with proper typing
  const totalContacts = contacts.length
  const activeCampaigns = (campaigns as Campaign[]).filter((c: Campaign) => 
    c.metadata?.campaign_status?.key === 'sending'
  ).length
  const totalTemplates = templates.length
  const averageOpenRate = campaigns.length > 0 
    ? (campaigns as Campaign[]).reduce((acc: number, c: Campaign) => 
        acc + (c.metadata?.campaign_stats?.open_rate || 0), 0
      ) / campaigns.length
    : 0

  const stats = {
    totalContacts,
    activeCampaigns,
    totalTemplates,
    averageOpenRate: Math.round(averageOpenRate * 100)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome to EmailCraft Pro
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your email marketing campaigns with powerful AI-driven tools.
        </p>
      </div>

      <DashboardStats stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6 lg:mt-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <RecentCampaigns campaigns={campaigns.slice(0, 5)} />
        </div>
        <div className="order-1 lg:order-2">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}