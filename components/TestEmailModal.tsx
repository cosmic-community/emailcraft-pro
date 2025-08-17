'use client'

import { useState } from 'react'
import { X, Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react'
import { Campaign } from '@/types'

interface TestEmailModalProps {
  campaign: Campaign
  onClose: () => void
}

export default function TestEmailModal({ campaign, onClose }: TestEmailModalProps) {
  const [testEmail, setTestEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSendTest = async () => {
    if (!testEmail) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/campaigns/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          campaignId: campaign.id,
          testEmail 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email')
      }

      setResult({ success: true, message: data.message })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send test email'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Send Test Email</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {result ? (
          <div className="text-center">
            {result.success ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Test Email Sent!</h3>
                <p className="text-gray-600 mb-4">{result.message}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setResult(null)}
                    className="flex-1 btn btn-secondary"
                  >
                    Send Another
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 btn btn-primary"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Send Failed</h3>
                <p className="text-red-600 mb-4">{result.message}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 btn btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setResult(null)}
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
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {campaign.metadata.campaign_name}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Template:</span> {campaign.metadata.email_template?.metadata?.template_name}</p>
                  <p><span className="font-medium">Subject:</span> {campaign.metadata.email_template?.metadata?.subject_line}</p>
                </div>
              </div>

              <div>
                <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Send test email to:
                </label>
                <input
                  type="email"
                  id="testEmail"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {testEmail && !isValidEmail(testEmail) && (
                <p className="mt-2 text-sm text-red-600">Please enter a valid email address</p>
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
                onClick={handleSendTest}
                disabled={isLoading || !testEmail || !isValidEmail(testEmail)}
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
                    Send Test
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