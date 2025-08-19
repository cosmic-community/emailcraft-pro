'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, Zap } from 'lucide-react'
import HtmlPreviewTabs from './HtmlPreviewTabs'

export default function CreateTemplateForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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
        body: JSON.stringify({ prompt: formData.ai_prompt }),
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
            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              AI Template Generator
            </h3>
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