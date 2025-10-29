import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Home, Bell, Calendar, FileText, Image, Video, User, LogOut, Menu, X, Contact, Shield, QrCode } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import FacilityBooking from '@/components/dashboard/FacilityBooking';
    import Documents from '@/components/dashboard/Documents';
    import Forms from '@/components/dashboard/Forms';
    import Contacts from '@/components/dashboard/Contacts';
    import PhotoAlbum from '@/components/dashboard/PhotoAlbum';
    import VideoAlbum from '@/components/dashboard/VideoAlbum';
    import Announcements from '@/components/dashboard/Announcements';
    import DashboardHome from '@/components/dashboard/DashboardHome';
    import UserProfile from '@/components/dashboard/UserProfile';
    import VisitorInvitation from '@/components/dashboard/VisitorInvitation';

    const Dashboard = ({ user, onLogout, onSwitchView }) => {
      const [activeTab, setActiveTab] = useState('home');
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

      const menuItems = [
          { id: 'home', label: 'Home', icon: Home, desc: 'Overview of your community', color: 'from-blue-500 to-blue-600' },
          { id: 'announcements', label: 'Announcements', icon: Bell, desc: 'Latest updates & news', color: 'from-purple-500 to-purple-600' },
          { id: 'visitors', label: 'Visitors', icon: QrCode, desc: 'Manage visitor invitations', color: 'from-red-500 to-red-600' },
          { id: 'facilities', label: 'Facilities', icon: Calendar, desc: 'Book amenities & spaces', color: 'from-green-500 to-green-600' },
          { id: 'documents', label: 'Documents', icon: FileText, desc: 'Access important files', color: 'from-amber-500 to-amber-600' },
          { id: 'forms', label: 'Forms', icon: FileText, desc: 'Submit official requests', color: 'from-cyan-500 to-cyan-600' },
          { id: 'photos', label: 'Photo', icon: Image, desc: 'View community photos', color: 'from-pink-500 to-pink-600' },
          { id: 'videos', label: 'Video', icon: Video, desc: 'Watch community videos', color: 'from-indigo-500 to-indigo-600' },
          { id: 'contacts', label: 'Contacts', icon: Contact, desc: 'Community directory', color: 'from-teal-500 to-teal-600' },
      ];

      const renderContent = () => {
        switch (activeTab) {
          case 'home':
            return <DashboardHome user={user} onNavigate={setActiveTab} menuItems={menuItems} />;
          case 'facilities':
            return <FacilityBooking user={user} />;
          case 'documents':
            return <Documents />;
          case 'forms':
            return <Forms user={user} />;
          case 'contacts':
            return <Contacts />;
          case 'photos':
            return <PhotoAlbum />;
          case 'videos':
            return <VideoAlbum />;
          case 'announcements':
            return <Announcements />;
          case 'visitors':
            return <VisitorInvitation user={user} />;
          case 'profile':
            return <UserProfile user={user} />;
          default:
            return <DashboardHome user={user} onNavigate={setActiveTab} menuItems={menuItems} />;
        }
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
          <nav className="bg-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-700 to-amber-600 bg-clip-text text-transparent">TijaniUkay.Connect</span>
                </div>
                
                <div className="hidden md:flex items-center space-x-4">
                  {user && user.role === 'admin' && (
                    <Button onClick={onSwitchView} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600">
                      <Shield className="w-4 h-4" />
                      Admin View
                    </Button>
                  )}
                  <span className="text-gray-700 font-medium">{user?.full_name}</span>
                  <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>

                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </nav>

          <div className="flex">
            <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg overflow-y-auto z-30`}>
              <div className="p-4 space-y-2">
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'text-gray-700 hover:bg-green-50'}`}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                <div className="pt-4 border-t" />
                <button onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'text-gray-700 hover:bg-green-50'}`}>
                   <User className="w-5 h-5" />
                   <span className="font-medium">My Profile</span>
                </button>
                <div className="md:hidden pt-4 border-t">
                  {user && user.role === 'admin' && (
                      <Button onClick={() => {onSwitchView(); setMobileMenuOpen(false);}} className="w-full flex items-center gap-2 bg-amber-500 hover:bg-amber-600 mb-2">
                        <Shield className="w-4 h-4" />
                        Admin View
                      </Button>
                  )}
                  <Button variant="outline" onClick={onLogout} className="w-full flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </aside>

            <main className="flex-1 p-4 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      );
    };
    export default Dashboard;