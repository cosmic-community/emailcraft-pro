'use client'

import { useState, useEffect } from 'react'
import { EmailTemplate } from '@/types'
import { Plus, X, Calendar, Tag, AlertCircle } from 'lucide-react'

interface CreateCampaignFormProps {
  templates: EmailTemplate[]
  preSelectedTemplateId?: string
}

const tagOptions = [
  'Newsletter',
  'Promotions', 
  'VIP Customer',
  'New Subscriber',
  'Technology',
  'Marketing'
]

export default function CreateCampaignForm({ templates, preSelectedTemplateId }: CreateCampaignFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    campaign_name: '',
    email_template: preSelectedTemplateId || '',
    campaign_status: 'draft' as const,
    target_tags: [] as string[],
    send_date: '',
    campaign_notes: ''
  })

  // Open modal automatically if template is pre-selected from URL
  useEffect(() => {
    if (preSelectedTemplateId) {
      setIsOpen(true)
      const template = templates.find(t => t.id === preSelectedTemplateId)
      if (template) {
        setFormData(prev => ({ 
          ...prev, 
          campaign_name: `Campaign using ${template.metadata.template_name}`,
          email_template: preSelectedTemplateId 
        }))
      }
    }
  }, [preSelectedTemplateId, templates])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log('Submitting campaign data:', formData)
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      console.log('Campaign creation response:', result)

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      if (!result.success) {
        throw new Error(result.error || 'Campaign creation failed')
      }
      
      // Reset form and close modal
      setFormData({
        campaign_name: '',
        email_template: '',
        campaign_status: 'draft',
        target_tags: [],
        send_date: '',
        campaign_notes: ''
      })
      setIsOpen(false)
      setError(null)
      
      // Refresh the page to show new campaign
      window.location.reload()
    } catch (error) {
      console.error('Error creating campaign:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create campaign. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      target_tags: prev.target_tags.includes(tag)
        ? prev.target_tags.filter(t => t !== tag)
        : [...prev.target_tags, tag]
    }))
  }

  const handleClose = () => {
    setIsOpen(false)
    setError(null)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary flex items-center text-sm sm:text-base"
      >
        <Plus className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Create Campaign</span>
        <span className="sm:hidden">Create</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Create Email Campaign</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm font-medium">Error creating campaign:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              required
              value={formData.campaign_name}
              onChange={(e) => setFormData(prev => ({ ...prev, campaign_name: e.target.value }))}
              className="input"
              placeholder="My Email Campaign"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Template *
            </label>
            <select
              required
              value={formData.email_template}
              onChange={(e) => setFormData(prev => ({ ...prev, email_template: e.target.value }))}
              className="input"
            >
              <option value="">Select a template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.metadata.template_name} - {template.metadata.subject_line}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              Target Tags
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tagOptions.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.target_tags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              ))}
            </div>
            {formData.target_tags.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                If no tags are selected, campaign will be sent to all subscribers
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Send Date (Optional)
            </label>
            <input
              type="date"
              value={formData.send_date}
              onChange={(e) => setFormData(prev => ({ ...prev, send_date: e.target.value }))}
              className="input"
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to save as draft for manual sending
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Notes
            </label>
            <textarea
              value={formData.campaign_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, campaign_notes: e.target.value }))}
              rows={3}
              className="input"
              placeholder="Optional notes about this campaign"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}