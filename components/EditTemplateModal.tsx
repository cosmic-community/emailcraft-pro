'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Zap, Upload, Save } from 'lucide-react'
import HtmlPreviewTabs from './HtmlPreviewTabs'
import type { EmailTemplate } from '@/types'

interface UploadedImage {
  url: string;
  name: string;
}

interface EditTemplateModalProps {
  template: EmailTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EditTemplateModal({ 
  template, 
  isOpen, 
  onClose, 
  onSave 
}: EditTemplateModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    template_name: template.metadata.template_name || '',
    subject_line: template.metadata.subject_line || '',
    html_content: template.metadata.html_content || '',
    template_category: template.metadata.template_category?.key || 'newsletter' as const,
    template_description: template.metadata.template_description || '',
    ai_edit_prompt: ''
  })

  // Reset form data when template changes
  useEffect(() => {
    setFormData({
      template_name: template.metadata.template_name || '',
      subject_line: template.metadata.subject_line || '',
      html_content: template.metadata.html_content || '',
      template_category: template.metadata.template_category?.key || 'newsletter' as const,
      template_description: template.metadata.template_description || '',
      ai_edit_prompt: ''
    })
    setUploadedImages([])
  }, [template])

  // Auto-resize textarea function
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  // Handle AI prompt change with auto-resize
  const handleAIPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, ai_edit_prompt: e.target.value }))
    autoResizeTextarea(e.target)
  }

  // Auto-resize on mount and when value changes
  useEffect(() => {
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current)
    }
  }, [formData.ai_edit_prompt])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const newImages: UploadedImage[] = []

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} is not an image`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 5MB`)
          continue
        }

        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const result = await response.json()
        newImages.push({
          url: result.url,
          name: file.name
        })
      }

      setUploadedImages(prev => [...prev, ...newImages])
    } catch (error) {
      console.error('Error uploading images:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload images')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const insertImageUrl = (url: string) => {
    const imageTag = `<img src="${url}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`
    setFormData(prev => ({ 
      ...prev, 
      html_content: prev.html_content + '\n' + imageTag
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_name: formData.template_name,
          subject_line: formData.subject_line,
          html_content: formData.html_content,
          template_category: formData.template_category,
          template_description: formData.template_description
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update template')
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error updating template:', error)
      alert(error instanceof Error ? error.message : 'Failed to update template. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIEdit = async () => {
    if (!formData.ai_edit_prompt.trim()) {
      alert('Please enter instructions for AI editing')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/templates/${template.id}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: formData.ai_edit_prompt,
          currentHtml: formData.html_content,
          images: uploadedImages.map(img => img.url)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to edit template with AI')
      }

      const { html } = await response.json()
      
      setFormData(prev => ({ 
        ...prev, 
        html_content: html,
        ai_edit_prompt: ''
      }))
    } catch (error) {
      console.error('Error editing template with AI:', error)
      alert(error instanceof Error ? error.message : 'Failed to edit template with AI. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                required
                value={formData.template_name}
                onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
                className="input"
                placeholder="My Awesome Template"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Category
              </label>
              <select
                value={formData.template_category}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  template_category: e.target.value as any
                }))}
                className="input"
              >
                <option value="newsletter">Newsletter</option>
                <option value="promotion">Promotional</option>
                <option value="welcome">Welcome Series</option>
                <option value="transactional">Transactional</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Line *
            </label>
            <input
              type="text"
              required
              value={formData.subject_line}
              onChange={(e) => setFormData(prev => ({ ...prev, subject_line: e.target.value }))}
              className="input"
              placeholder="📧 Your Monthly Update"
              maxLength={150}
            />
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900 mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              AI Template Editor
            </h3>
            
            {/* Image Upload Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-purple-800">
                  Upload Images (optional)
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md text-sm disabled:opacity-50"
                >
                  <Upload className="h-3 w-3" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-16 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        onClick={() => insertImageUrl(image.url)}
                        className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Insert
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-purple-600">
                Upload images to include in your edited template. Max 5MB per image.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={formData.ai_edit_prompt}
                onChange={handleAIPromptChange}
                placeholder="Describe the changes you want (e.g., 'add a hero section with the uploaded image', 'make the design more modern', 'add a call-to-action button')"
                className="w-full input resize-none overflow-hidden min-h-[2.5rem]"
                style={{ maxHeight: '200px' }}
                rows={1}
              />
              <button
                type="button"
                onClick={handleAIEdit}
                disabled={isGenerating}
                className="btn btn-primary whitespace-nowrap disabled:opacity-50"
              >
                {isGenerating ? 'Editing...' : 'Edit with AI'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HTML Content *
            </label>
            <HtmlPreviewTabs
              html={formData.html_content}
              onChange={(html) => setFormData(prev => ({ ...prev, html_content: html }))}
              placeholder="<div>Your HTML content here...</div>"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.template_description}
              onChange={(e) => setFormData(prev => ({ ...prev, template_description: e.target.value }))}
              rows={3}
              className="input"
              placeholder="Brief description of this template"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn btn-primary disabled:opacity-50 flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}