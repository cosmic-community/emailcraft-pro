import { getEmailTemplates } from '@/lib/cosmic'
import TemplateGrid from '@/components/TemplateGrid'
import CreateTemplateForm from '@/components/CreateTemplateForm'

export default async function TemplatesPage() {
  const templates = await getEmailTemplates()

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
          <p className="text-gray-600">
            Create and manage your email templates with AI-powered generation.
          </p>
        </div>
        <CreateTemplateForm />
      </div>

      <TemplateGrid templates={templates} />
    </div>
  )
}