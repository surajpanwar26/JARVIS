import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { QuickResultPage } from './pages/QuickResultPage';
import { DeepResearchPage } from './pages/DeepResearchPage';
import { DocAnalysisPage } from './pages/DocAnalysisPage';
import { LoginPage } from './pages/LoginPage';
import { PageView } from './types';

interface NavState {
  page: PageView;
  initialQuery?: string;
  initialFile?: File;
}

interface User {
  email: string;
  name: string;
  picture?: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [navState, setNavState] = useState<NavState>({ page: 'HOME' });

  // Check if user is already authenticated on app load
  useEffect(() => {
    // Listen for OAuth success messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'oauth-success') {
        const token = event.data.token;
        if (token) {
          localStorage.setItem('authToken', token);
          setIsAuthenticated(true);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Check for existing token in localStorage
    const existingToken = localStorage.getItem('authToken');
    if (existingToken) {
      setIsAuthenticated(true);
    }
    
    // Cleanup listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleNavigate = (page: PageView, initialQuery?: string, initialFile?: File) => {
    setNavState({ page, initialQuery, initialFile });
  };

  const handleLogin = () => {
    // Set authenticated state when called from LoginPage
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      // Use environment variable for API URL with fallback to localhost
      // @ts-ignore: ImportMeta.env is not properly typed in TypeScript
      const apiUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8002';
      await fetch(`${apiUrl}/api/auth/logout`);
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0B0F19] to-[#0B0F19] flex flex-col font-sans overflow-hidden text-slate-200">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[100px]"></div>
         <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[100px]"></div>
      </div>

      {/* Main Content View Port */}
      <main className="relative z-10 flex-1 h-screen overflow-hidden">
        {navState.page === 'HOME' && (
          <HomePage onNavigate={handleNavigate} onLogout={handleLogout} />
        )}
        
        {navState.page === 'QUICK_RESULT' && (
          <QuickResultPage 
            initialQuery={navState.initialQuery} 
            onBack={() => setNavState({ page: 'HOME' })} 
          />
        )}
        
        {navState.page === 'DEEP_RESULT' && (
          <DeepResearchPage 
            initialQuery={navState.initialQuery} 
            onBack={() => setNavState({ page: 'HOME' })} 
          />
        )}
        
        {navState.page === 'DOC_ANALYSIS' && (
          <DocAnalysisPage 
            initialFile={navState.initialFile} 
            onBack={() => setNavState({ page: 'HOME' })} 
          />
        )}
      </main>

    </div>
  );
}

export default App;