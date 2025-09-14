import { Mail, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Left side - Branding */}
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">EmailCraft Pro</span>
            <span className="text-sm text-gray-500">© 2024</span>
          </div>
          
          {/* Center - Links */}
          <div className="flex items-center space-x-6">
            <a 
              href="#" 
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              Support
            </a>
          </div>
          
          {/* Right side - Made with love */}
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>by Cosmic Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  )
}