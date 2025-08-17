'use client'

import { useState } from 'react'
import { X, Send, AlertTriangle, CheckCircle } from 'lucide-react'
import { Campaign } from '@/types'
import { validateCampaignForSending } from '@/lib/email'

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

  const validation = validateCampaignForSending(campaign)

  const handleSend = async () => {
    if (!validation.isValid) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId: campaign.id }),
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Send Campaign</h2>
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
                        <p className="text-gray-500">Sent</p>
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
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">
                {campaign.metadata.campaign_name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Template: {campaign.metadata.email_template?.metadata?.template_name || 'Unknown'}
              </p>
              
              {campaign.metadata.target_tags && campaign.metadata.target_tags.length > 0 ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Target audience:</p>
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
              ) : (
                <p className="text-sm text-gray-600 mb-4">
                  Will be sent to all subscribed contacts
                </p>
              )}

              {!validation.isValid && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Cannot send campaign:</h4>
                      <ul className="text-sm text-red-700 mt-1">
                        {validation.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading || !validation.isValid}
                className="flex-1 btn btn-primary disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Campaign
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}