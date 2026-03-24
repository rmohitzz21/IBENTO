import React from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDFC] p-6 text-center">
          <div className="max-w-md w-full">
            <h1 className="font-filson font-black text-[#F06138] text-5xl mb-4">Oops!</h1>
            <h2 className="font-filson font-bold text-[#101828] text-xl mb-3">Something went wrong.</h2>
            <p className="font-lato text-[#6A6A6A] text-sm mb-8">
              We encountered an unexpected error. Please try refreshing the page or navigating back home.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl font-lato font-bold text-sm hover:opacity-90 transition-opacity bg-[#F06138] text-[#FDFAD6]"
              >
                Refresh Page
              </button>
              <a
                href="/"
                className="px-6 py-2.5 rounded-xl font-lato font-bold text-sm transition-colors border-2 border-gray-200 text-[#101828] hover:bg-gray-50"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
