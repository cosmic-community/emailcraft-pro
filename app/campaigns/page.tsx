import { getCampaigns, getTemplates } from '@/lib/cosmic'
import CampaignList from '@/components/CampaignList'
import CreateCampaignForm from '@/components/CreateCampaignForm'

// Force dynamic rendering for real-time data updates
export const dynamic = 'force-dynamic'

interface SearchParams {
  template?: string
}

interface CampaignsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  const params = await searchParams
  const [campaigns, templates] = await Promise.all([
    getCampaigns(),
    getTemplates()
  ])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Campaigns</h1>
          <p className="text-gray-600">
            Create, manage and send targeted email campaigns to your subscribers.
          </p>
        </div>
        <CreateCampaignForm 
          templates={templates} 
          preSelectedTemplateId={params.template}
        />
      </div>

      <CampaignList campaigns={campaigns} />
    </div>
  )
}