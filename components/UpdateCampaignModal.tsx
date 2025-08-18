'use client'

import { useState, useEffect } from 'react'
import { X, Save, AlertTriangle, CheckCircle } from 'lucide-react'
import { Campaign, EmailTemplate, CampaignStatusValue, getStatusValue } from '@/types'

interface UpdateCampaignModalProps {
  campaign: Campaign
  onClose: () => void
  onUpdated: () => void
}

interface UpdateResult {
  success: boolean
  message: string
}

export default function UpdateCampaignModal({ campaign, onClose, onUpdated }: UpdateCampaignModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  
  // Form state
  const [campaignName, setCampaignName] = useState(campaign.metadata.campaign_name || '')
  const [selectedTemplateId, setSelectedTemplateId] = useState(campaign.metadata.email_template?.id || '')
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatusValue>(
    getStatusValue(campaign.metadata.campaign_status)
  )
  const [sendDate, setSendDate] = useState(campaign.metadata.send_date || '')
  const [campaignNotes, setCampaignNotes] = useState(campaign.metadata.campaign_notes || '')
  const [targetTags, setTargetTags] = useState<string[]>(campaign.metadata.target_tags || [])

  const availableTags = [
    'Newsletter',
    'Promotions', 
    'VIP Customer',
    'New Subscriber',
    'Technology',
    'Marketing'
  ]

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/templates')
        if (response.ok) {
          const data = await response.json()
          setTemplates(data.templates || [])
        }
      } catch (error) {
        console.error('Error loading templates:', error)
      } finally {
        setLoadingTemplates(false)
      }
    }

    loadTemplates()
  }, [])

  const handleTargetTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setTargetTags(prev => [...prev, tag])
    } else {
      setTargetTags(prev => prev.filter(t => t !== tag))
    }
  }

  const handleUpdate = async () => {
    if (!campaignName.trim()) {
      setUpdateResult({
        success: false,
        message: 'Campaign name is required'
      })
      return
    }

    setIsLoading(true)
    try {
      // Only include metadata that has changed
      const metadata: any = {}
      
      if (campaignName !== campaign.metadata.campaign_name) {
        metadata.campaign_name = campaignName
      }
      
      if (selectedTemplateId && selectedTemplateId !== campaign.metadata.email_template?.id) {
        metadata.email_template = selectedTemplateId // Use just the ID
      }
      
      if (campaignStatus !== getStatusValue(campaign.metadata.campaign_status)) {
        metadata.campaign_status = campaignStatus
      }
      
      // Compare arrays properly for target_tags
      const currentTags = campaign.metadata.target_tags || []
      if (JSON.stringify(targetTags.sort()) !== JSON.stringify(currentTags.sort())) {
        metadata.target_tags = targetTags.length > 0 ? targetTags : null
      }
      
      if (sendDate !== campaign.metadata.send_date) {
        metadata.send_date = sendDate || null
      }
      
      if (campaignNotes !== campaign.metadata.campaign_notes) {
        metadata.campaign_notes = campaignNotes || null
      }

      const updateData: any = {}
      
      if (campaignName !== campaign.title) {
        updateData.title = campaignName
      }
      
      if (Object.keys(metadata).length > 0) {
        updateData.metadata = metadata
      }

      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update campaign')
      }

      setUpdateResult({
        success: true,
        message: 'Campaign updated successfully!'
      })

      // Call onUpdated after a short delay to show success message
      setTimeout(() => {
        onUpdated()
      }, 1500)

    } catch (error) {
      setUpdateResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update campaign'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (value: string) => {
    setCampaignStatus(value as CampaignStatusValue)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Update Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {updateResult ? (
          <div className="text-center">
            {updateResult.success ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Updated!</h3>
                <p className="text-gray-600 mb-4">{updateResult.message}</p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Update Failed</h3>
                <p className="text-red-600 mb-4">{updateResult.message}</p>
                <button
                  onClick={() => setUpdateResult(null)}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter campaign name"
                required
              />
            </div>

            {/* Email Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              {loadingTemplates ? (
                <div className="text-sm text-gray-500">Loading templates...</div>
              ) : (
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.metadata.template_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Campaign Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Status
              </label>
              <select
                value={campaignStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Paused">Paused</option>
              </select>
            </div>

            {/* Send Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Date
              </label>
              <input
                type="date"
                value={sendDate}
                onChange={(e) => setSendDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Target Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Tags
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableTags.map((tag) => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={targetTags.includes(tag)}
                      onChange={(e) => handleTargetTagChange(tag, e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Campaign Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Notes
              </label>
              <textarea
                value={campaignNotes}
                onChange={(e) => setCampaignNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes about this campaign..."
              />
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6">
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="btn btn-primary disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Campaign
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}