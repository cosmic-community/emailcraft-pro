'use client'

import { useState, useEffect } from 'react'
import { Edit, Eye, Trash2 } from 'lucide-react'
import type { EmailTemplate } from '@/types'
import TemplatePreviewModal from './TemplatePreviewModal'
import EditTemplateModal from './EditTemplateModal'

export default function TemplateGrid() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsPreviewOpen(true)
  }

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsEditOpen(true)
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== templateId))
      } else {
        throw new Error('Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template. Please try again.')
    }
  }

  const handleSaveComplete = () => {
    fetchTemplates() // Refresh the templates list
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48" />
        ))}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
        <p className="text-gray-500">Create your first email template to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900 line-clamp-2">
                  {template.metadata.template_name}
                </h3>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePreview(template)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Preview template"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Edit template"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Subject:</strong> {template.metadata.subject_line}</p>
                {template.metadata.template_category && (
                  <p><strong>Category:</strong> {
                    typeof template.metadata.template_category === 'object' 
                      ? template.metadata.template_category.value 
                      : template.metadata.template_category
                  }</p>
                )}
                {template.metadata.template_description && (
                  <p className="line-clamp-2">{template.metadata.template_description}</p>
                )}
              </div>
            </div>
            
            {template.metadata.preview_image && (
              <div className="px-4 pb-4">
                <img
                  src={`${template.metadata.preview_image.imgix_url}?w=400&h=200&fit=crop&auto=format,compress`}
                  alt="Template preview"
                  className="w-full h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false)
            setSelectedTemplate(null)
          }}
        />
      )}

      {/* Edit Modal */}
      {selectedTemplate && (
        <EditTemplateModal
          template={selectedTemplate}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false)
            setSelectedTemplate(null)
          }}
          onSave={handleSaveComplete}
        />
      )}
    </>
  )
}