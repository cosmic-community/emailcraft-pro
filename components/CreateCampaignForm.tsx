'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { createCampaign, getEmailTemplates } from '@/lib/cosmic'
import { EmailTemplate } from '@/types'

const AVAILABLE_TAGS = [
  'Newsletter',
  'Promotions', 
  'VIP Customer',
  'New Subscriber',
  'Technology',
  'Marketing'
]

export default function CreateCampaignForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [formData, setFormData] = useState({
    campaign_name: '',
    email_template: '',
    campaign_status: 'draft' as const,
    target_tags: [] as string[],
    send_date: '',
    campaign_notes: ''
  })

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = async () => {
    try {
      const templatesList = await getEmailTemplates()
      setTemplates(templatesList)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createCampaign(formData)
      
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
      
      // Refresh the page to show new campaign
      window.location.reload()
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      target_tags: prev.target_tags.includes(tag)
        ? prev.target_tags.filter(t => t !== tag)
        : [...prev.target_tags, tag]
    }))
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Campaign
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Create New Campaign</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
              placeholder="Spring Sale Campaign"
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
            {templates.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                No templates available. Create a template first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Status
            </label>
            <select
              value={formData.campaign_status}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                campaign_status: e.target.value as any
              }))}
              className="input"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    formData.target_tags.includes(tag)
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Send Date
            </label>
            <input
              type="date"
              value={formData.send_date}
              onChange={(e) => setFormData(prev => ({ ...prev, send_date: e.target.value }))}
              className="input"
            />
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

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || templates.length === 0}
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