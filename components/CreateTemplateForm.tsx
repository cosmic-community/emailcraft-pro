'use client'

import { useState } from 'react'
import { Plus, X, Zap } from 'lucide-react'
import { createEmailTemplate } from '@/lib/cosmic'

export default function CreateTemplateForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    template_name: '',
    subject_line: '',
    html_content: '',
    template_category: 'newsletter' as const,
    template_description: '',
    ai_prompt: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createEmailTemplate(formData)
      
      // Reset form and close modal
      setFormData({
        template_name: '',
        subject_line: '',
        html_content: '',
        template_category: 'newsletter',
        template_description: '',
        ai_prompt: ''
      })
      setIsOpen(false)
      
      // Refresh the page to show new template
      window.location.reload()
    } catch (error) {
      console.error('Error creating template:', error)
      alert('Failed to create template. Please try again.')
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
        throw new Error('Failed to generate template')
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
      alert('Failed to generate template. Please try again.')
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
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              AI Template Generator
            </h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.ai_prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, ai_prompt: e.target.value }))}
                placeholder="Describe the email template you want (e.g., 'professional newsletter with product highlights')"
                className="flex-1 input"
              />
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="btn btn-primary whitespace-nowrap disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HTML Content *
            </label>
            <textarea
              required
              value={formData.html_content}
              onChange={(e) => setFormData(prev => ({ ...prev, html_content: e.target.value }))}
              rows={12}
              className="input font-mono text-sm"
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