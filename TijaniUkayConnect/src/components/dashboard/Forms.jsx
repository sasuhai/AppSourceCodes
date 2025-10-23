
import React, { useState, useEffect, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { FileText, Download, Loader2, Search } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Input } from '@/components/ui/input';

    const Forms = () => {
        const [forms, setForms] = useState([]);
        const [loading, setLoading] = useState(true);
        const [searchTerm, setSearchTerm] = useState("");
        const { toast } = useToast();

        useEffect(() => {
            const fetchForms = async () => {
                setLoading(true);
                const { data, error } = await supabase.from('forms').select('*').order('title');
                if (error) {
                    toast({ title: 'Error fetching forms', description: error.message, variant: 'destructive' });
                } else {
                    setForms(data);
                }
                setLoading(false);
            };
            fetchForms();
        }, [toast]);

        const filteredForms = useMemo(() => {
            if (!searchTerm) return forms;
            return forms.filter(form =>
                form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.file_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }, [forms, searchTerm]);

        if (loading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
        }

        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-green-600" />
                        <h2 className="text-3xl font-bold text-gray-800">Forms</h2>
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                            placeholder="Search forms..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10"
                        />
                    </div>
                </div>

                {filteredForms.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredForms.map(form => (
                            <motion.div key={form.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
                                <FileText className="w-10 h-10 text-green-500 mb-4" />
                                <h3 className="text-lg font-bold text-gray-800 flex-grow">{form.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">{form.file_name}</p>
                                <a href={form.file_url} target="_blank" rel="noopener noreferrer" download>
                                    <Button className="w-full mt-auto bg-green-600 hover:bg-green-700">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </a>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                            {searchTerm ? "No forms match your search." : "No forms available at the moment."}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    export default Forms;
