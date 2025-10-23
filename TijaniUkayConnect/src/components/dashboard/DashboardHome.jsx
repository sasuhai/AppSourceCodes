
import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Bell, Calendar, ChevronRight, Loader2, Search } from 'lucide-react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { linkify } from '@/lib/utils';

    const DashboardHome = ({ user, onNavigate, menuItems }) => {
      const [recentAnnouncements, setRecentAnnouncements] = useState([]);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      useEffect(() => {
        const fetchRecentAnnouncements = async () => {
          setLoading(true);
          const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);

          if (error) {
            toast({
              title: "Error fetching announcements",
              description: error.message,
              variant: "destructive",
            });
          } else {
            setRecentAnnouncements(data);
          }
          setLoading(false);
        };
        fetchRecentAnnouncements();
      }, [toast]);

      const WelcomeHeader = () => (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-2xl shadow-lg text-white mb-8"
        >
          <h2 className="text-3xl font-bold">Welcome back, {user?.full_name?.split(' ')[0] || 'Resident'}!</h2>
          <p className="mt-2 text-green-100">Here's what's happening in your community today.</p>
        </motion.div>
      );

      const QuickAccessGrid = () => (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.filter(item => item.id !== 'home').slice(0, 8).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onNavigate(item.id)}
                className={`group p-6 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between h-40`}
              >
                <div>
                  <item.icon className="w-8 h-8 mb-2 opacity-80 group-hover:opacity-100" />
                  <h4 className="text-xl font-bold">{item.label}</h4>
                  <p className="text-sm text-white/80">{item.desc}</p>
                </div>
                <ChevronRight className="w-6 h-6 self-end opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      );

      const RecentAnnouncements = () => (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Announcements</h3>
          {loading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
          ) : recentAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {recentAnnouncements.map((ann, index) => (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500"
                >
                  <h4 className="font-bold text-gray-800 text-lg">{ann.title}</h4>
                  <p className="text-gray-600 text-sm mt-1 mb-3" dangerouslySetInnerHTML={{ __html: linkify(ann.content.substring(0, 100) + '...') }}/>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => onNavigate('announcements')} className="font-semibold text-green-600 hover:text-green-700 flex items-center">
                      Read More <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl shadow-md">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No new announcements.</p>
            </div>
          )}
        </div>
      );

      return (
        <div className="space-y-8">
          <WelcomeHeader />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <QuickAccessGrid />
            </div>
            <div className="lg:col-span-1">
                <RecentAnnouncements />
            </div>
          </div>
        </div>
      );
    };

    export default DashboardHome;
