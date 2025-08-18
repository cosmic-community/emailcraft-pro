'use client'

import { useState } from 'react'
import { Campaign } from '@/types'
import { Calendar, Users, TrendingUp, Mail, Send, Edit } from 'lucide-react'
import SendCampaignModal from './SendCampaignModal'
import UpdateCampaignModal from './UpdateCampaignModal'

interface CampaignListProps {
  campaigns: Campaign[]
}

function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase()
  switch (statusLower) {
    case 'sent': return 'bg-green-100 text-green-800'
    case 'sending': return 'bg-blue-100 text-blue-800'
    case 'scheduled': return 'bg-yellow-100 text-yellow-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'paused': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusValue(campaign: Campaign): string {
  // Handle both string and object formats for backward compatibility
  if (typeof campaign.metadata.campaign_status === 'string') {
    return campaign.metadata.campaign_status || 'Draft'
  }
  return campaign.metadata.campaign_status?.value || 'Draft'
}

function getStatusKey(campaign: Campaign): string {
  return campaign.metadata.campaign_status?.key || 'draft'
}

export default function CampaignList({ campaigns: initialCampaigns }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const handleCampaignSent = () => {
    // Refresh the page to get updated campaign data
    window.location.reload()
  }

  const handleCampaignUpdated = () => {
    // Refresh the page to get updated campaign data
    window.location.reload()
  }

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    if (getStatusKey(campaign) === 'draft' && campaign.metadata.email_template) {
      setShowSendModal(true)
    } else {
      setShowUpdateModal(true)
    }
  }

  const handleSendClick = (e: React.MouseEvent, campaign: Campaign) => {
    e.stopPropagation()
    setSelectedCampaign(campaign)
    setShowSendModal(true)
  }

  const handleEditClick = (e: React.MouseEvent, campaign: Campaign) => {
    e.stopPropagation()
    setSelectedCampaign(campaign)
    setShowUpdateModal(true)
  }

  const closeModals = () => {
    setSelectedCampaign(null)
    setShowSendModal(false)
    setShowUpdateModal(false)
  }

  if (campaigns.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No campaigns yet. Create your first campaign to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign) => {
          const statusValue = getStatusValue(campaign)
          const statusColor = getStatusColor(statusValue)
          
          return (
            <div 
              key={campaign.id} 
              className="card p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleCampaignClick(campaign)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {campaign.metadata.campaign_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Template: {campaign.metadata.email_template?.metadata?.template_name || 'No template selected'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                    {statusValue}
                  </span>
                  
                  {getStatusKey(campaign) === 'draft' && campaign.metadata.email_template && (
                    <button
                      onClick={(e) => handleSendClick(e, campaign)}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => handleEditClick(e, campaign)}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {campaign.metadata.send_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(campaign.metadata.send_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {campaign.metadata.campaign_stats && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{campaign.metadata.campaign_stats.recipients} recipients</span>
                  </div>
                )}
              </div>
              
              {campaign.metadata.campaign_stats && campaign.metadata.campaign_stats.open_rate > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {Math.round(campaign.metadata.campaign_stats.open_rate * 100)}%
                      </p>
                      <p className="text-xs text-gray-500">Open Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {Math.round(campaign.metadata.campaign_stats.click_rate * 100)}%
                      </p>
                      <p className="text-xs text-gray-500">Click Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {campaign.metadata.campaign_stats.delivered}
                      </p>
                      <p className="text-xs text-gray-500">Delivered</p>
                    </div>
                  </div>
                </div>
              )}
              
              {campaign.metadata.target_tags && campaign.metadata.target_tags.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Target Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {campaign.metadata.target_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {campaign.metadata.campaign_notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">{campaign.metadata.campaign_notes}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedCampaign && showSendModal && (
        <SendCampaignModal
          campaign={selectedCampaign}
          onClose={closeModals}
          onSent={handleCampaignSent}
        />
      )}

      {selectedCampaign && showUpdateModal && (
        <UpdateCampaignModal
          campaign={selectedCampaign}
          onClose={closeModals}
          onUpdated={handleCampaignUpdated}
        />
      )}
    </>
  )
}