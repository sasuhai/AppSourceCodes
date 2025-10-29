import React, { useState, useEffect, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Image as ImageIcon, Loader2, Link as LinkIcon, Search } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';

    const PhotoAlbum = () => {
      const [photos, setPhotos] = useState([]);
      const [loading, setLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState("");
      const { toast } = useToast();

      useEffect(() => {
        const fetchPhotos = async () => {
          setLoading(true);
          const { data, error } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
          if (error) {
            toast({ title: "Error fetching photos", description: error.message, variant: "destructive" });
          } else {
            setPhotos(data);
          }
          setLoading(false);
        };
        fetchPhotos();
      }, [toast]);

      const filteredPhotos = useMemo(() => {
          if (!searchTerm) return photos;
          return photos.filter(photo =>
              photo.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
      }, [photos, searchTerm]);

      if (loading) {
        return (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        );
      }

      const isValidHttpUrl = (string) => {
        let url;
        try {
          url = new URL(string);
        } catch (_) {
          return false;
        }
        return url.protocol === "http:" || url.protocol === "https:";
      };
      
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-800">Photo Album</h2>
            </div>
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                    placeholder="Search photos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10"
                />
            </div>
          </div>

          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchTerm ? "No photos match your search." : "No photos available yet."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative aspect-video bg-white rounded-2xl shadow-lg overflow-hidden group flex flex-col justify-end p-6 text-white"
                >
                    {isValidHttpUrl(photo.image_url) ? (
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundImage: `url(${photo.image_url})` }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-amber-100 flex items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-gray-400" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold truncate drop-shadow-md">{photo.title}</h3>
                        <Button
                            onClick={() => isValidHttpUrl(photo.image_url) ? window.open(photo.image_url, '_blank') : toast({title: "Invalid URL", description: "This photo does not have a valid link.", variant: "destructive"})}
                            variant="secondary"
                            size="sm"
                            className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
                        >
                            <LinkIcon className="w-4 h-4" />
                            Open Link
                        </Button>
                    </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      );
    };

    export default PhotoAlbum;