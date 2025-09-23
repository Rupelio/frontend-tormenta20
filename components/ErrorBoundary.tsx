import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary para capturar e tratar erros em componentes React
 * Fornece uma interface amigável quando algo dá errado
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Chamar callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log para monitoramento (pode ser integrado com serviços como Sentry)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Aqui você pode integrar com serviços de monitoramento como Sentry, LogRocket, etc.
    console.group('🐛 Error Boundary - Detalhes do Erro');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Stack:', error.stack);
    console.groupEnd();
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Renderizar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🐛</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ops! Algo deu errado
              </h2>
              <p className="text-gray-600 mb-6">
                Ocorreu um erro inesperado no sistema. Nossa equipe foi notificada e está trabalhando para resolver o problema.
              </p>

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Tentar Novamente
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Recarregar Página
                </button>
              </div>

              {/* Mostrar detalhes do erro em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer font-semibold text-red-600 mb-2">
                    Detalhes do Erro (Desenvolvimento)
                  </summary>
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                    <p className="font-semibold text-red-800">Erro:</p>
                    <p className="text-red-700 mb-2">{this.state.error.message}</p>

                    {this.state.errorInfo && (
                      <>
                        <p className="font-semibold text-red-800">Component Stack:</p>
                        <pre className="text-red-700 text-xs overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
