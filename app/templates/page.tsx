import { getTemplates } from '@/lib/cosmic'
import TemplateGrid from '@/components/TemplateGrid'
import CreateTemplateForm from '@/components/CreateTemplateForm'

// Force dynamic rendering for real-time data updates
export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const templates = await getTemplates()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 lg:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Create and manage your email templates with AI-powered generation.
          </p>
        </div>
        <div className="flex-shrink-0">
          <CreateTemplateForm />
        </div>
      </div>

      <TemplateGrid templates={templates} />
    </div>
  )
}