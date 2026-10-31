// Frontend/src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { WardProvider } from './context/WardContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { AppRouter } from './routes/AppRouter';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <LanguageProvider>
            <AuthProvider>
              <WardProvider>
                <NotificationProvider>
                  <AppRouter />
                </NotificationProvider>
              </WardProvider>
            </AuthProvider>
          </LanguageProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
