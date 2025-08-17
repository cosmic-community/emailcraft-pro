import Link from 'next/link'
import { Plus, Zap, Users, FileText, Mail } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      title: 'Create Campaign',
      description: 'Start a new email campaign',
      href: '/campaigns',
      icon: Mail,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Add Contacts',
      description: 'Import new subscribers',
      href: '/contacts',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'AI Template',
      description: 'Generate with AI',
      href: '/templates',
      icon: Zap,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Browse Templates',
      description: 'View all templates',
      href: '/templates',
      icon: FileText,
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
      </div>
      
      <div className="p-6 space-y-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`flex items-center p-3 rounded-lg text-white transition-colors ${action.color}`}
          >
            <action.icon className="h-5 w-5 mr-3" />
            <div>
              <div className="font-medium">{action.title}</div>
              <div className="text-xs opacity-90">{action.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}