
import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Phone, Mail, MapPin, Loader2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';

    const Contacts = () => {
      const [contacts, setContacts] = useState([]);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      useEffect(() => {
        const fetchContacts = async () => {
          setLoading(true);
          const { data, error } = await supabase.from('contacts').select('*').order('name', { ascending: true });
          if (error) {
            toast({ title: "Error fetching contacts", description: error.message, variant: "destructive" });
          } else {
            setContacts(data);
          }
          setLoading(false);
        };
        fetchContacts();
      }, [toast]);

      if (loading) {
        return (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Phone className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-800">Contacts</h2>
          </div>

          {contacts.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No contacts available yet.</p>
                <p className="text-gray-500 text-sm">The administrator has not added any contacts.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-4">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{contact.name}</h3>
                  <div className="space-y-3">
                    {contact.phone && (
                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="break-all">{contact.email}</span>
                      </div>
                    )}
                    {contact.address && (
                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{contact.address}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      );
    };

    export default Contacts;
