'use client'

import { useState, useEffect } from 'react'
import { X, Search, Users, Check } from 'lucide-react'
import { Contact } from '@/types'

interface ContactSelectorProps {
  onClose: () => void
  onSelect: (contacts: Contact[]) => void
  selectedContacts: Contact[]
  targetTags?: string[]
}

export default function ContactSelector({ 
  onClose, 
  onSelect, 
  selectedContacts, 
  targetTags 
}: ContactSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedContacts.map(c => c.id))
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tagged'>('all')

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    filterContacts()
  }, [contacts, searchTerm, selectedFilter, targetTags])

  const fetchContacts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/contacts')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch contacts')
      }

      if (data.success && Array.isArray(data.contacts)) {
        setContacts(data.contacts)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
      setError(error instanceof Error ? error.message : 'Failed to load contacts')
    } finally {
      setIsLoading(false)
    }
  }

  const filterContacts = () => {
    let filtered = contacts

    // Only show subscribed contacts
    filtered = filtered.filter(contact => 
      contact.metadata.subscription_status?.key === 'subscribed' || 
      contact.metadata.subscription_status?.value === 'Subscribed'
    )

    // Filter by target tags if specified and filter is set to 'tagged'
    if (selectedFilter === 'tagged' && targetTags && targetTags.length > 0) {
      filtered = filtered.filter(contact => {
        const contactTags = contact.metadata.tags
        if (!contactTags || !Array.isArray(contactTags)) return false
        
        return targetTags.some(tag => contactTags.includes(tag))
      })
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(contact => {
        const email = contact.metadata.email?.toLowerCase() || ''
        const firstName = contact.metadata.first_name?.toLowerCase() || ''
        const lastName = contact.metadata.last_name?.toLowerCase() || ''
        
        return email.includes(term) || 
               firstName.includes(term) || 
               lastName.includes(term) ||
               `${firstName} ${lastName}`.includes(term)
      })
    }

    setFilteredContacts(filtered)
  }

  const handleToggleContact = (contact: Contact) => {
    const newSelectedIds = new Set(selectedIds)
    
    if (selectedIds.has(contact.id)) {
      newSelectedIds.delete(contact.id)
    } else {
      newSelectedIds.add(contact.id)
    }
    
    setSelectedIds(newSelectedIds)
  }

  const handleSelectAll = () => {
    const allIds = new Set(filteredContacts.map(c => c.id))
    setSelectedIds(allIds)
  }

  const handleClearAll = () => {
    setSelectedIds(new Set())
  }

  const handleConfirm = () => {
    const selected = contacts.filter(contact => selectedIds.has(contact.id))
    onSelect(selected)
    onClose()
  }

  const getContactName = (contact: Contact) => {
    const firstName = contact.metadata.first_name || ''
    const lastName = contact.metadata.last_name || ''
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }
    
    return contact.metadata.email
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Select Recipients</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedFilter === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Subscribed
              </button>
              {targetTags && targetTags.length > 0 && (
                <button
                  onClick={() => setSelectedFilter('tagged')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedFilter === 'tagged' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  With Target Tags ({targetTags.join(', ')})
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={filteredContacts.length === 0}
              >
                Select All ({filteredContacts.length})
              </button>
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">Loading contacts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">❌ Error loading contacts</div>
              <p className="text-gray-500 text-sm">{error}</p>
              <button 
                onClick={fetchContacts}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
              >
                Try again
              </button>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {searchTerm || selectedFilter === 'tagged' 
                  ? 'No contacts found matching your criteria.' 
                  : 'No subscribed contacts available.'}
              </p>
              {contacts.length > 0 && (
                <p className="text-sm text-gray-400">
                  Total contacts in system: {contacts.length}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleToggleContact(contact)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedIds.has(contact.id)
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedIds.has(contact.id)
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedIds.has(contact.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getContactName(contact)}
                          </p>
                          <p className="text-sm text-gray-600">{contact.metadata.email}</p>
                          {contact.metadata.date_subscribed && (
                            <p className="text-xs text-gray-500">
                              Subscribed: {contact.metadata.date_subscribed}
                            </p>
                          )}
                        </div>
                      </div>
                      {contact.metadata.tags && Array.isArray(contact.metadata.tags) && contact.metadata.tags.length > 0 && (
                        <div className="mt-2 ml-7 flex flex-wrap gap-1">
                          {contact.metadata.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${
                                targetTags?.includes(tag)
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedIds.size} of {filteredContacts.length} contacts selected
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="btn btn-primary"
                disabled={selectedIds.size === 0}
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}