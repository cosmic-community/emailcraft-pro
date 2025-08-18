'use client'

import { useState } from 'react'
import { Campaign } from '@/types'
import { X, Copy } from 'lucide-react'

interface DuplicateCampaignModalProps {
  campaign: Campaign
  onClose: () => void
  onDuplicated: () => void
}

export default function DuplicateCampaignModal({ campaign, onClose, onDuplicated }: DuplicateCampaignModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [campaignName, setCampaignName] = useState(`${campaign.metadata.campaign_name} (Copy)`)

  const handleDuplicate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const duplicateData = {
        campaign_name: campaignName,
        email_template: campaign.metadata.email_template?.id,
        campaign_status: 'draft',
        target_tags: campaign.metadata.target_tags || [],
        campaign_notes: `Duplicated from: ${campaign.metadata.campaign_name}`
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to duplicate campaign')
      }

      onDuplicated()
      onClose()
    } catch (error) {
      console.error('Error duplicating campaign:', error)
      alert(error instanceof Error ? error.message : 'Failed to duplicate campaign. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Copy className="h-5 w-5 mr-2" />
            Duplicate Campaign
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Original Campaign:</h3>
          <p className="text-sm text-gray-600">{campaign.metadata.campaign_name}</p>
          <p className="text-xs text-gray-500">Template: {campaign.metadata.email_template?.metadata?.template_name || 'No template'}</p>
        </div>

        <form onSubmit={handleDuplicate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Campaign Name *
            </label>
            <input
              type="text"
              required
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="input"
              placeholder="Enter campaign name"
            />
          </div>

          <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
            <p><strong>What will be duplicated:</strong></p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Email template</li>
              <li>Target tags</li>
              <li>Campaign settings</li>
            </ul>
            <p className="mt-2"><strong>Note:</strong> The new campaign will be created as a draft.</p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Duplicating...' : 'Duplicate Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}