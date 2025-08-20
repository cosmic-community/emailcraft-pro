'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, Zap, Upload, Image as ImageIcon } from 'lucide-react'
import HtmlPreviewTabs from './HtmlPreviewTabs'

interface UploadedImage {
  url: string;
  name: string;
}

export default function CreateTemplateForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    template_name: '',
    subject_line: '',
    html_content: '',
    template_category: 'Newsletter' as const,
    template_description: '',
    ai_prompt: ''
  })

  // Auto-resize textarea function
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  // Handle AI prompt change with auto-resize
  const handleAIPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, ai_prompt: e.target.value }))
    autoResizeTextarea(e.target)
  }

  // Auto-resize on mount and when value changes
  useEffect(() => {
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current)
    }
  }, [formData.ai_prompt])

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

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
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
      const response = await fetch('/api/templates', {
        method: 'POST',
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
        throw new Error(errorData.error || 'Failed to create template')
      }

      const result = await response.json()
      
      // Reset form and close modal
      setFormData({
        template_name: '',
        subject_line: '',
        html_content: '',
        template_category: 'Newsletter',
        template_description: '',
        ai_prompt: ''
      })
      setUploadedImages([])
      setIsOpen(false)
      
      // Refresh the page to show new template
      window.location.reload()
    } catch (error) {
      console.error('Error creating template:', error)
      alert(error instanceof Error ? error.message : 'Failed to create template. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIGenerate = async () => {
    if (!formData.ai_prompt.trim()) {
      alert('Please enter a prompt for AI generation')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/templates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: formData.ai_prompt,
          images: uploadedImages.map(img => img.url)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate template')
      }

      const { html } = await response.json()
      
      setFormData(prev => ({ 
        ...prev, 
        html_content: html,
        template_name: prev.template_name || 'AI Generated Template',
        subject_line: prev.subject_line || 'Generated Email Template'
      }))
    } catch (error) {
      console.error('Error generating template:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate template. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Template
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Create Email Template</h2>
          <button
            onClick={() => setIsOpen(false)}
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
                <option value="Newsletter">Newsletter</option>
                <option value="Promotional">Promotional</option>
                <option value="Welcome Series">Welcome Series</option>
                <option value="Transactional">Transactional</option>
                <option value="Announcement">Announcement</option>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              AI Template Generator
            </h3>
            
            {/* Image Upload Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-blue-800">
                  Upload Images (optional)
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md text-sm disabled:opacity-50"
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
              
              <p className="text-xs text-blue-600">
                Upload images to include in your AI-generated template. Max 5MB per image.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={formData.ai_prompt}
                onChange={handleAIPromptChange}
                placeholder="Describe the email template you want (e.g., 'professional newsletter with product highlights and modern design')"
                className="w-full input resize-none overflow-hidden min-h-[2.5rem]"
                style={{ maxHeight: '200px' }}
                rows={1}
              />
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="btn btn-primary whitespace-nowrap disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Template'}
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
              onClick={() => setIsOpen(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}