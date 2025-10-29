import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Bell, Calendar, AlertCircle, Search, Loader2 } from 'lucide-react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { linkify } from '@/lib/utils';

    const Announcements = () => {
      const [announcements, setAnnouncements] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      useEffect(() => {
        const fetchAnnouncements = async () => {
          setLoading(true);
          const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            toast({
              title: "Error fetching announcements",
              description: error.message,
              variant: "destructive",
            });
          } else {
            setAnnouncements(data);
          }
          setLoading(false);
        };
        fetchAnnouncements();
      }, [toast]);

      const getCategoryColor = (category) => {
        const colors = {
          General: 'bg-blue-100 text-blue-700',
          AGM: 'bg-purple-100 text-purple-700',
          Maintenance: 'bg-orange-100 text-orange-700',
          Event: 'bg-green-100 text-green-700',
          Rules: 'bg-amber-100 text-amber-700',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
      };

      const filteredAnnouncements = announcements.filter(
        (ann) =>
          ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ann.content.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-800">Announcements</h2>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredAnnouncements.length > 0 ? filteredAnnouncements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg p-6`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-800">{announcement.title}</h3>
                  </div>
                </div>
                <p className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: linkify(announcement.content) }} />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(announcement.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </motion.div>
            )) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No announcements found.</p>
                </div>
            )}
          </div>
        </div>
      );
    };

    export default Announcements;