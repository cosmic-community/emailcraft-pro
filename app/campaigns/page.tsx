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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 lg:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Email Campaigns</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Create, manage and send targeted email campaigns to your subscribers.
          </p>
        </div>
        <div className="flex-shrink-0">
          <CreateCampaignForm 
            templates={templates} 
            preSelectedTemplateId={params.template}
          />
        </div>
      </div>

      <CampaignList campaigns={campaigns} />
    </div>
  )
}