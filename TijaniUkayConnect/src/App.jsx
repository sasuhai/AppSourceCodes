
import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { Toaster } from '@/components/ui/toaster';
    import LandingPage from '@/components/LandingPage';
    import LoginPage from '@/components/LoginPage';
    import RegisterPage from '@/components/RegisterPage';
    import Dashboard from '@/components/Dashboard';
    import AdminDashboard from '@/components/AdminDashboard';
    import VisitorDetailsPage from '@/components/VisitorDetailsPage';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { supabase } from '@/lib/customSupabaseClient';

    function App() {
      const { user, session, loading } = useAuth();
      const [profile, setProfile] = useState(null);
      const [currentPage, setCurrentPage] = useState('landing');
      const [isAdminView, setIsAdminView] = useState(false);
      const [visitorId, setVisitorId] = useState(null);

      useEffect(() => {
        const path = window.location.pathname;
        const visitorMatch = path.match(/^\/visitor\/([0-9a-fA-F-]+)$/);

        if (visitorMatch) {
            setVisitorId(visitorMatch[1]);
            setCurrentPage('visitorDetails');
        } else {
            handlePopState();
            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
      }, []);
      
      const handlePopState = () => {
        const path = window.location.pathname.substring(1);
        const validPages = ['login', 'register', 'dashboard', 'admin'];
        if (validPages.includes(path)) {
            setCurrentPage(path);
        } else {
            setCurrentPage('landing');
        }
      };
      
      const fetchProfile = async () => {
        if (!user) return;
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
          if (data.role === 'admin') {
            setIsAdminView(true); // Default admin to admin view on login
          }
        } else if (error) {
          console.error('Error fetching profile:', error);
          handleNavigation('logout');
        }
      };

      useEffect(() => {
        if (currentPage === 'visitorDetails') return;
        
        if (loading) return;

        if (user && session) {
          if (!profile) {
            fetchProfile();
          }
        } else {
          setProfile(null);
          if (currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'landing') {
              setCurrentPage('landing');
          }
          setIsAdminView(false);
        }
      }, [user, session, loading, currentPage]);


      useEffect(() => {
        if (currentPage === 'visitorDetails') return;

        if (profile) {
          if (profile.status === 'Not Active') {
            setCurrentPage('not_active');
          } else if (profile.approved) {
             if (profile.role === 'admin' && isAdminView) {
                setCurrentPage('admin');
             } else {
                setCurrentPage('dashboard');
             }
          } else {
            setCurrentPage('pending');
          }
        } else if (!loading && !user) {
            const path = window.location.pathname.substring(1);
            if (path !== 'login' && path !== 'register' && path !== 'landing') {
                setCurrentPage('landing');
            }
        }
      }, [profile, loading, user, isAdminView, currentPage]);
      
      const handleNavigation = (page) => {
        if (page === 'logout') {
          supabase.auth.signOut();
          setProfile(null);
          setCurrentPage('landing');
          setIsAdminView(false);
          window.history.pushState({}, '', '/');
        } else {
          setCurrentPage(page);
          window.history.pushState({}, '', page === 'landing' ? '/' : `/${page}`);
        }
      };
      
      const handleViewSwitch = () => {
        if (profile && profile.role === 'admin') {
            setIsAdminView(prev => !prev);
        }
      };

      if (loading && currentPage !== 'visitorDetails') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-2xl font-semibold text-gray-700">Loading...</div>
          </div>
        );
      }

      const renderPage = () => {
        switch (currentPage) {
          case 'visitorDetails':
              return <VisitorDetailsPage visitorId={visitorId} />;
          case 'landing':
            return <LandingPage onNavigate={handleNavigation} />;
          case 'login':
            return <LoginPage onNavigate={handleNavigation} />;
          case 'register':
            return <RegisterPage onNavigate={handleNavigation} />;
          case 'dashboard':
            return <Dashboard user={profile} onLogout={() => handleNavigation('logout')} onSwitchView={handleViewSwitch} isAdmin={profile?.role === 'admin'} />;
          case 'admin':
            return <AdminDashboard user={profile} onLogout={() => handleNavigation('logout')} onSwitchView={handleViewSwitch} />;
          case 'pending':
            return (
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">⏳</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Pending</h2>
                  <p className="text-gray-600 mb-6">
                    Your registration is awaiting admin approval. You'll receive a notification once approved.
                  </p>
                  <button
                    onClick={() => handleNavigation('logout')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            );
            case 'not_active':
            return (
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🚫</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Not Active</h2>
                  <p className="text-gray-600 mb-6">
                    Your account is currently inactive. Please contact the administrator for assistance.
                  </p>
                  <button
                    onClick={() => handleNavigation('logout')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            );
          default:
            return <LandingPage onNavigate={handleNavigation} />;
        }
      };

      return (
        <>
          <Helmet>
            <title>Tijani Ukay Resident Portal - Your Community Hub</title>
            <meta name="description" content="Exclusive digital hub for Tijani Ukay residents to manage residence activities, book facilities, and stay connected with the community." />
          </Helmet>
          {renderPage()}
          <Toaster />
        </>
      );
    }

    export default App;
