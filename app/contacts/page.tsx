import { getContacts } from '@/lib/cosmic'
import ContactList from '@/components/ContactList'
import AddContactForm from '@/components/AddContactForm'
import { Plus } from 'lucide-react'

export default async function ContactsPage() {
  const contacts = await getContacts()

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contacts</h1>
          <p className="text-gray-600">
            Manage your subscriber list and organize contacts with tags.
          </p>
        </div>
        <AddContactForm />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Contacts ({contacts.length})
          </h2>
        </div>
        <ContactList contacts={contacts} />
      </div>
    </div>
  )
}