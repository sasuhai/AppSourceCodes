import React, { useState, useEffect, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { FileText, Download, Loader2, Search } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Input } from '@/components/ui/input';

    const Documents = () => {
      const [documents, setDocuments] = useState([]);
      const [loading, setLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState("");
      const { toast } = useToast();

      useEffect(() => {
        const fetchDocuments = async () => {
          setLoading(true);
          const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
          if (error) {
            toast({ title: "Error fetching documents", description: error.message, variant: "destructive" });
          } else {
            setDocuments(data);
          }
          setLoading(false);
        };
        fetchDocuments();
      }, [toast]);

      const filteredDocuments = useMemo(() => {
          if (!searchTerm) return documents;
          return documents.filter(doc => 
              doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
          );
      }, [documents, searchTerm]);

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
                    <FileText className="w-8 h-8 text-green-600" />
                    <h2 className="text-3xl font-bold text-gray-800">Documents</h2>
                </div>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10"
                    />
                </div>
            </div>

            {filteredDocuments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                        {searchTerm ? "No documents match your search." : "No documents available yet."}
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocuments.map((doc, index) => (
                        <motion.div 
                            key={doc.id} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-amber-100 rounded-xl flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-green-700" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 flex-grow">{doc.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{doc.file_name}</p>
                            <Button asChild className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 mt-auto">
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" download>
                                    <Download className="w-4 h-4" />
                                    Download
                                </a>
                            </Button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
      );
    };

    export default Documents;