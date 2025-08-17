import { Campaign } from '@/types'
import { Calendar, TrendingUp } from 'lucide-react'

interface RecentCampaignsProps {
  campaigns: Campaign[]
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'sent': return 'bg-green-100 text-green-800'
    case 'sending': return 'bg-blue-100 text-blue-800'
    case 'scheduled': return 'bg-yellow-100 text-yellow-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'paused': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function RecentCampaigns({ campaigns }: RecentCampaignsProps) {
  if (campaigns.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Campaigns</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No campaigns yet. Create your first campaign to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {campaign.metadata.campaign_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Template: {campaign.metadata.email_template?.title || 'No template'}
                </p>
                
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {campaign.metadata.send_date || 'No date set'}
                  </div>
                  
                  {campaign.metadata.campaign_stats && campaign.metadata.campaign_stats.open_rate > 0 && (
                    <div className="flex items-center text-xs text-gray-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {Math.round(campaign.metadata.campaign_stats.open_rate * 100)}% open rate
                    </div>
                  )}
                </div>
              </div>
              
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.metadata.campaign_status.key)}`}>
                {campaign.metadata.campaign_status.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}