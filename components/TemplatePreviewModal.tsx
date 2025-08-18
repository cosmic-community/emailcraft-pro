'use client'

import { useState } from 'react'
import { EmailTemplate } from '@/types'
import { X, Eye, Copy } from 'lucide-react'

interface TemplatePreviewModalProps {
  template: EmailTemplate
  onClose: () => void
  onUseTemplate: () => void
}

export default function TemplatePreviewModal({ template, onClose, onUseTemplate }: TemplatePreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Preview: {template.metadata.template_name}
            </h2>
            <p className="text-sm text-gray-600">
              Subject: {template.metadata.subject_line}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onUseTemplate}
              className="btn btn-primary"
            >
              Use Template
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-hidden">
          <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden">
            <iframe
              srcDoc={template.metadata.html_content}
              className="w-full h-full"
              title="Email Preview"
            />
          </div>
        </div>
      </div>
    </div>
  )
}