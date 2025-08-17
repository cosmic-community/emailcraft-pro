'use client'

import { useState, useEffect } from 'react'
import { X, Send, Mail, AlertTriangle, CheckCircle, Users } from 'lucide-react'
import { Campaign, Contact } from '@/types'
import ContactSelector from './ContactSelector'
import TestEmailModal from './TestEmailModal'

interface SendCampaignModalProps {
  campaign: Campaign
  onClose: () => void
  onSent: () => void
}

interface SendResult {
  success: boolean
  message: string
  stats?: {
    totalRecipients: number
    successfulSends: number
    failedSends: number
  }
}

export default function SendCampaignModal({ campaign, onClose, onSent }: SendCampaignModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sendResult, setSendResult] = useState<SendResult | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [showContactSelector, setShowContactSelector] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Validate campaign
  useEffect(() => {
    const errors: string[] = []
    
    if (!campaign.metadata.email_template) {
      errors.push('No email template selected')
    }
    
    if (!campaign.metadata.email_template?.metadata?.html_content) {
      errors.push('Email template has no content')
    }
    
    if (!campaign.metadata.email_template?.metadata?.subject_line) {
      errors.push('Email template has no subject line')
    }
    
    setValidationErrors(errors)
  }, [campaign])

  const handleSendNow = async () => {
    if (validationErrors.length > 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          campaignId: campaign.id,
          selectedContacts: selectedContacts.map(c => c.id)
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send campaign')
      }

      setSendResult(result)
      onSent()
    } catch (error) {
      setSendResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send campaign'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRecipientCount = () => {
    if (selectedContacts.length > 0) {
      return selectedContacts.length
    }
    
    // If no specific contacts selected, estimate based on target tags
    if (campaign.metadata.target_tags && campaign.metadata.target_tags.length > 0) {
      return `Contacts with tags: ${campaign.metadata.target_tags.join(', ')}`
    }
    
    return 'All subscribed contacts'
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Send Campaign</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {sendResult ? (
            <div className="text-center">
              {sendResult.success ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Sent!</h3>
                  <p className="text-gray-600 mb-4">{sendResult.message}</p>
                  {sendResult.stats && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{sendResult.stats.totalRecipients}</p>
                          <p className="text-gray-500">Total</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-600">{sendResult.stats.successfulSends}</p>
                          <p className="text-gray-500">Success</p>
                        </div>
                        <div>
                          <p className="font-medium text-red-600">{sendResult.stats.failedSends}</p>
                          <p className="text-gray-500">Failed</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="btn btn-primary w-full"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Send Failed</h3>
                  <p className="text-red-600 mb-4">{sendResult.message}</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="flex-1 btn btn-secondary"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => setSendResult(null)}
                      className="flex-1 btn btn-primary"
                    >
                      Try Again
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {/* Campaign Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {campaign.metadata.campaign_name}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Template:</span> {campaign.metadata.email_template?.metadata?.template_name || 'Unknown'}</p>
                    <p><span className="font-medium">Subject:</span> {campaign.metadata.email_template?.metadata?.subject_line || 'No subject'}</p>
                  </div>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Cannot send campaign:</h4>
                        <ul className="text-sm text-red-700 mt-1">
                          {validationErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recipients */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">Recipients</label>
                    <button
                      onClick={() => setShowContactSelector(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Select Contacts
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Will send to:</span> {getRecipientCount()}
                    </p>
                    {selectedContacts.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Selected contacts:</p>
                        <div className="space-y-1">
                          {selectedContacts.slice(0, 3).map((contact) => (
                            <p key={contact.id} className="text-xs text-gray-700">
                              {contact.metadata.first_name} {contact.metadata.last_name} - {contact.metadata.email}
                            </p>
                          ))}
                          {selectedContacts.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{selectedContacts.length - 3} more contacts
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
                      onClick={() => setShowTestModal(true)}
                      disabled={validationErrors.length > 0}
                      className="btn btn-secondary disabled:opacity-50 flex items-center"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Test
                    </button>
                    <button
                      onClick={handleSendNow}
                      disabled={isLoading || validationErrors.length > 0}
                      className="btn btn-primary disabled:opacity-50 flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showContactSelector && (
        <ContactSelector
          onClose={() => setShowContactSelector(false)}
          onSelect={setSelectedContacts}
          selectedContacts={selectedContacts}
          targetTags={campaign.metadata.target_tags}
        />
      )}

      {showTestModal && (
        <TestEmailModal
          campaign={campaign}
          onClose={() => setShowTestModal(false)}
        />
      )}
    </>
  )
}