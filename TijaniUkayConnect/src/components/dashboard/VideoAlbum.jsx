
import React, { useState, useEffect, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Video, Play, Loader2, Search } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Input } from '@/components/ui/input';

    const VideoAlbum = () => {
      const [videos, setVideos] = useState([]);
      const [loading, setLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState("");
      const { toast } = useToast();

      useEffect(() => {
        const fetchVideos = async () => {
          setLoading(true);
          const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
          if (error) {
            toast({ title: "Error fetching videos", description: error.message, variant: "destructive" });
          } else {
            setVideos(data);
          }
          setLoading(false);
        };
        fetchVideos();
      }, [toast]);
      
      const filteredVideos = useMemo(() => {
          if (!searchTerm) return videos;
          return videos.filter(video => 
              video.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
      }, [videos, searchTerm]);

      const getYouTubeThumbnail = (url) => {
        try {
          const videoId = new URL(url).searchParams.get('v');
          return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Video';
        } catch (e) {
          return 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Video';
        }
      };

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
              <Video className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-800">Video Album</h2>
            </div>
             <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10"
                />
            </div>
          </div>

          {filteredVideos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchTerm ? "No videos match your search." : "No videos available yet."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video, index) => (
                <motion.a
                  key={video.id}
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow text-left group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-amber-100 flex items-center justify-center">
                    <img alt={video.title} className="w-full h-full object-cover" src={getYouTubeThumbnail(video.video_url)} />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-green-600 ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{video.title}</h3>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      YouTube
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      );
    };

    export default VideoAlbum;
