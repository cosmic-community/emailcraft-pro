'use client'

import { useState } from 'react'
import { EmailTemplate } from '@/types'
import { FileText, Copy } from 'lucide-react'
import TemplatePreviewModal from './TemplatePreviewModal'

interface TemplateGridProps {
  templates: EmailTemplate[]
}

export default function TemplateGrid({ templates }: TemplateGridProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handlePreview = (e: React.MouseEvent, template: EmailTemplate) => {
    e.stopPropagation()
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  const handleUseTemplate = (e: React.MouseEvent, template: EmailTemplate) => {
    e.stopPropagation()
    // Redirect to campaigns page with template pre-selected
    const params = new URLSearchParams()
    params.set('template', template.id)
    window.location.href = `/campaigns?${params.toString()}`
  }

  const closePreview = () => {
    setSelectedTemplate(null)
    setShowPreview(false)
  }

  if (templates.length === 0) {
    return (
      <div className="card p-6 sm:p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No templates yet. Create your first template to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {templates.map((template) => (
          <div key={template.id} className="card overflow-hidden">
            {template.metadata.preview_image?.imgix_url ? (
              <img
                src={`${template.metadata.preview_image.imgix_url}?w=800&h=400&fit=crop&auto=format,compress`}
                alt={template.metadata.template_name}
                className="w-full h-32 sm:h-48 object-cover"
              />
            ) : (
              <div className="w-full h-32 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              </div>
            )}
            
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                    {template.metadata.template_name}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    📧 {template.metadata.subject_line}
                  </p>
                  
                  {template.metadata.template_description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {template.metadata.template_description}
                    </p>
                  )}
                  
                  {template.metadata.template_category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {template.metadata.template_category.value || template.metadata.template_category}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={(e) => handlePreview(e, template)}
                  className="flex-1 btn btn-primary text-sm"
                >
                  Preview
                </button>
                <button 
                  onClick={(e) => handleUseTemplate(e, template)}
                  className="flex-1 sm:flex-none btn btn-secondary text-sm"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && showPreview && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={closePreview}
          onUseTemplate={() => handleUseTemplate({ stopPropagation: () => {} } as any, selectedTemplate)}
        />
      )}
    </>
  )
}