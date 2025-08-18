'use client'

import { useState } from 'react'
import { Code, Eye } from 'lucide-react'

interface HtmlPreviewTabsProps {
  html: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function HtmlPreviewTabs({ html, onChange, placeholder }: HtmlPreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code')

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center space-x-2 ${
            activeTab === 'code'
              ? 'bg-white border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Code className="h-4 w-4" />
          <span>Code</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center space-x-2 ${
            activeTab === 'preview'
              ? 'bg-white border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Preview</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="h-64">
        {activeTab === 'code' ? (
          <textarea
            value={html}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm border-0 resize-none focus:ring-0 focus:outline-none"
            placeholder={placeholder || '<div>Your HTML content here...</div>'}
          />
        ) : (
          <div className="w-full h-full overflow-auto">
            {html ? (
              <iframe
                srcDoc={html}
                className="w-full h-full border-0"
                title="Email Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2" />
                  <p>Enter HTML content to see preview</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}