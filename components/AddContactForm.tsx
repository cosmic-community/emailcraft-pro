'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createContact } from '@/lib/cosmic'
import { SubscriptionStatus } from '@/types'

const AVAILABLE_TAGS = [
  'Newsletter',
  'Promotions', 
  'VIP Customer',
  'New Subscriber',
  'Technology',
  'Marketing'
]

export default function AddContactForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    subscription_status: 'subscribed' as SubscriptionStatus,
    tags: [] as string[],
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createContact({
        ...formData,
        date_subscribed: new Date().toISOString().split('T')[0]
      })
      
      // Reset form and close modal
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        subscription_status: 'subscribed' as SubscriptionStatus,
        tags: [],
        notes: ''
      })
      setIsOpen(false)
      
      // Refresh the page to show new contact
      window.location.reload()
    } catch (error) {
      console.error('Error creating contact:', error)
      alert('Failed to create contact. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Contact
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Add New Contact</h2>
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
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input"
              placeholder="contact@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Status
            </label>
            <select
              value={formData.subscription_status}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                subscription_status: e.target.value as SubscriptionStatus
              }))}
              className="input"
            >
              <option value="subscribed">Subscribed</option>
              <option value="pending">Pending Confirmation</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    formData.tags.includes(tag)
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
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="input"
              placeholder="Optional notes about this contact"
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
              disabled={isLoading}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}