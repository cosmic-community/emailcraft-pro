import { getContacts } from '@/lib/cosmic'
import ContactList from '@/components/ContactList'
import AddContactForm from '@/components/AddContactForm'
import { Plus } from 'lucide-react'

// Force dynamic rendering for real-time data updates
export const dynamic = 'force-dynamic'

export default async function ContactsPage() {
  const contacts = await getContacts()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 lg:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Contacts</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your subscriber list and organize contacts with tags.
          </p>
        </div>
        <div className="flex-shrink-0">
          <AddContactForm />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            All Contacts ({contacts.length})
          </h2>
        </div>
        <ContactList contacts={contacts} />
      </div>
    </div>
  )
}