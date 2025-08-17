import { getCampaigns } from '@/lib/cosmic'
import CampaignList from '@/components/CampaignList'
import CreateCampaignForm from '@/components/CreateCampaignForm'

// Force dynamic rendering for real-time data updates
export const dynamic = 'force-dynamic'

export default async function CampaignsPage() {
  const campaigns = await getCampaigns()

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaigns</h1>
          <p className="text-gray-600">
            Create and manage your email marketing campaigns.
          </p>
        </div>
        <CreateCampaignForm />
      </div>

      <CampaignList campaigns={campaigns} />
    </div>
  )
}