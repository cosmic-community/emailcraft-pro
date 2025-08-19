'use client'

import { useState } from 'react'
import { Eye, Code } from 'lucide-react'

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
      <div className="flex bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeTab === 'code'
              ? 'text-blue-600 bg-white border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Code className="h-4 w-4 mr-2" />
          HTML Code
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeTab === 'preview'
              ? 'text-blue-600 bg-white border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'code' ? (
          <textarea
            value={html}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-64 p-4 border-none resize-none focus:ring-0 focus:outline-none font-mono text-sm"
          />
        ) : (
          <div className="p-4 h-64 overflow-auto">
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <div className="text-gray-400 italic">
                No HTML content to preview. Switch to HTML Code tab to add content.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}