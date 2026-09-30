import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Unexpected application error.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('NLAMS UI error:', error, info);
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-[#f4f7fa] flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white border border-slate-200 shadow-sm p-8">
          <div className="text-[10px] uppercase tracking-widest text-red-600 font-bold">NLAMS application error</div>
          <h1 className="text-2xl font-bold text-[#102a43] mt-2">This module could not be displayed</h1>
          <p className="text-sm text-slate-500 mt-2">The application caught the error instead of leaving a blank page. You can retry the current session.</p>
          <div className="mt-5 bg-red-50 border border-red-200 p-3 text-xs text-red-800 break-words">{this.state.message}</div>
          <button onClick={this.reset} className="mt-5 px-4 py-2 bg-[#102a43] text-white text-xs font-semibold">Retry module</button>
        </div>
      </div>
    );
  }
}
