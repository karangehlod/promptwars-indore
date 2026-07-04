import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Logger } from '../../utils/logger';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Logger.error(`React render error: ${error.message}`);
    console.error('[ErrorBoundary]', error, errorInfo.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleGoHome = () => {
    // Clear Zustand + localStorage and reload to get a clean slate
    try {
      localStorage.removeItem('travelyarro-storage');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-red-700 dark:text-red-300 mb-1 font-mono bg-red-100 dark:bg-red-900/50 px-3 py-2 rounded-lg">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-3 mb-6">
              This is likely a temporary issue. Try recovering the page or start fresh.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
              >
                Try to Recover
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full py-2.5 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 text-red-800 dark:text-red-200 font-medium rounded-xl transition-colors text-sm"
              >
                Reset App &amp; Start Fresh
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
