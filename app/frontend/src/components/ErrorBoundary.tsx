/**
 * Global Error Boundary
 * Catches and handles React errors gracefully
 */

import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      errorInfo: { componentStack: errorInfo.componentStack || 'Unknown component stack' },
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We apologize for the inconvenience. An unexpected error occurred in the application.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Error details (dev only)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto text-red-600 dark:text-red-400">
                    {this.state.error.toString()}
                    {this.state.errorInfo && `\n\nComponent Stack:\n${this.state.errorInfo.componentStack}`}
                  </pre>
                </details>
              )}
            </div>

            {/* Recovery Actions */}
            <div className="space-y-3">
              <Button
                onClick={this.handleReset}
                variant="primary"
                size="lg"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4" />
                Return to Dashboard
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>

            {/* Help Link */}
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              If the problem persists,<br/>
              <a 
                href="mailto:support@salesape.com" 
                className="text-pink-600 dark:text-pink-400 hover:underline"
              >
                contact our support team
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
