import { Contact } from '@/types'
import { Mail, Tag, Calendar } from 'lucide-react'

interface ContactListProps {
  contacts: Contact[]
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'subscribed': return 'bg-green-100 text-green-800'
    case 'unsubscribed': return 'bg-red-100 text-red-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function ContactList({ contacts }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <p className="text-gray-500">No contacts yet. Add your first contact to get started!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {contacts.map((contact) => (
        <div key={contact.id} className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between">
            <div className="flex-1 mb-3 sm:mb-0">
              <div className="flex items-center mb-1">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">
                  {contact.metadata.first_name} {contact.metadata.last_name}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {contact.metadata.email}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                {contact.metadata.date_subscribed && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    Subscribed {new Date(contact.metadata.date_subscribed).toLocaleDateString()}
                  </div>
                )}
                
                {contact.metadata.tags && contact.metadata.tags.length > 0 && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Tag className="h-3 w-3 mr-1" />
                    {contact.metadata.tags.slice(0, 2).join(', ')}
                    {contact.metadata.tags.length > 2 && ` +${contact.metadata.tags.length - 2}`}
                  </div>
                )}
              </div>
              
              {contact.metadata.notes && (
                <p className="text-xs text-gray-500 mt-2">{contact.metadata.notes}</p>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.metadata.subscription_status.key)}`}>
                {contact.metadata.subscription_status.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}