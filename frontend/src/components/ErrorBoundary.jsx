// frontend/src/components/ErrorBoundary.jsx
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    if (this.props.onError) {
      try { this.props.onError(error, errorInfo) } catch (_) {}
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 border border-red-300 bg-red-50 rounded text-sm text-red-700">
          <div className="font-semibold mb-1">Something went wrong.</div>
          {this.props.fallback ? (
            this.props.fallback
          ) : (
            <div>
              <div className="mb-1">{this.state.error?.message || 'Unknown error'}</div>
              <button
                className="mt-2 px-3 py-1 rounded bg-red-600 text-white"
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
