
import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { QrCode, Plus, Calendar, Clock, User, Phone, Car, Loader2, Trash2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

    const VisitorInvitation = ({ user }) => {
      const [visitors, setVisitors] = useState([]);
      const [showForm, setShowForm] = useState(false);
      const [loading, setLoading] = useState(true);
      const [submitting, setSubmitting] = useState(false);
      const [formData, setFormData] = useState({
        name: '',
        phone: '',
        visit_date: '',
        visit_time: '',
        vehicle_plate: '',
        vehicle_type: 'Car',
        purpose: '',
      });
      const { toast } = useToast();

      const loadVisitors = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('visitors')
          .select('*')
          .eq('resident_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          toast({ title: 'Error fetching visitors', description: error.message, variant: 'destructive' });
        } else {
          setVisitors(data);
        }
        setLoading(false);
      }, [user.id, toast]);

      useEffect(() => {
        loadVisitors();
      }, [loadVisitors]);

      const handleDelete = async (visitorId) => {
        const { error } = await supabase.from('visitors').delete().eq('id', visitorId);
        if (error) {
            toast({ title: "Failed to delete invitation", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Invitation Deleted", description: "The visitor invitation has been removed." });
            loadVisitors();
        }
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const visitorData = { ...formData, resident_id: user.id };
        const { data: newVisitor, error: insertError } = await supabase
          .from('visitors')
          .insert(visitorData)
          .select()
          .single();

        if (insertError) {
          toast({ title: "Failed to create invitation", description: insertError.message, variant: "destructive" });
          setSubmitting(false);
          return;
        }

        const qrContent = `${window.location.origin}/visitor/${newVisitor.id}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrContent)}`;
        
        const { error: updateError } = await supabase
            .from('visitors')
            .update({ qr_code_url: qrCodeUrl, updated_at: new Date().toISOString() })
            .eq('id', newVisitor.id);

        if (updateError) {
            toast({ title: "Failed to update QR code", description: updateError.message, variant: "destructive" });
        } else {
            toast({ title: "Visitor Invited! 🎉", description: "QR code generated successfully." });
            setFormData({ name: '', phone: '', visit_date: '', visit_time: '', vehicle_plate: '', vehicle_type: 'Car', purpose: '' });
            setShowForm(false);
            loadVisitors();
        }

        setSubmitting(false);
      };

      if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
      }

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <QrCode className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-800">Visitor Invitations</h2>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Invite Visitor
            </Button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">New Visitor Invitation</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Visitor Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" placeholder="John Doe" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" placeholder="+60123456789" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Visit Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="date" value={formData.visit_date} onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Visit Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="time" value={formData.visit_time} onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" required />
                    </div>
                  </div>
                   <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Plate No</label>
                     <div className="relative">
                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={formData.vehicle_plate} onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" placeholder="WXY 1234" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                    <select value={formData.vehicle_type} onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none">
                        <option>Car</option>
                        <option>Motorcycle</option>
                        <option>Van</option>
                        <option>Truck</option>
                        <option>Others</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose of Visit</label>
                  <textarea value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none" rows="3" placeholder="Describe the purpose of visit" required />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={submitting}>
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate QR Code"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visitors.map((visitor) => (
              <motion.div
                key={visitor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col"
              >
                <div className="bg-gradient-to-br from-green-100 to-amber-100 rounded-xl p-4 mb-4 flex items-center justify-center">
                  {visitor.qr_code_url ? <img src={visitor.qr_code_url} alt="Visitor QR Code" className="w-36 h-36" /> : <div className="w-36 h-36 flex items-center justify-center"><Loader2 className="animate-spin"/></div>}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{visitor.name}</h3>
                <div className="space-y-2 text-sm text-gray-600 flex-grow">
                  <p><strong>Phone:</strong> {visitor.phone}</p>
                  <p><strong>Date:</strong> {new Date(visitor.visit_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {visitor.visit_time}</p>
                  <p><strong>Vehicle:</strong> {visitor.vehicle_plate || 'N/A'} ({visitor.vehicle_type})</p>
                  <p><strong>Purpose:</strong> {visitor.purpose}</p>
                </div>
                <div className="mt-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete the visitor invitation. This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(visitor.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </motion.div>
            ))}
          </div>

          {visitors.length === 0 && !showForm && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No visitor invitations yet</p>
              <p className="text-gray-500 text-sm">Click "Invite Visitor" to create your first invitation</p>
            </div>
          )}
        </div>
      );
    };

    export default VisitorInvitation;
  