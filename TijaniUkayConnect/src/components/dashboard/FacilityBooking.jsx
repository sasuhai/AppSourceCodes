import React, { useState, useEffect, useMemo, useCallback } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Calendar, Clock, MapPin, Plus, Loader2, X, Info } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';

    const FacilityBooking = ({ user }) => {
      const [bookings, setBookings] = useState([]);
      const [allBookings, setAllBookings] = useState([]);
      const [facilities, setFacilities] = useState([]);
      const [showForm, setShowForm] = useState(false);
      const [loading, setLoading] = useState(true);
      const [selectedFacility, setSelectedFacility] = useState(null);
      const [formData, setFormData] = useState({
        facility_id: '',
        booking_date: '',
        booking_time: '',
      });

      const { toast } = useToast();

      const timeSlots = Array.from({ length: 18 }, (_, i) => {
        const hour = i + 6;
        return `${hour.toString().padStart(2, '0')}:00`;
      });

      const fetchFacilities = useCallback(async () => {
        const { data, error } = await supabase.from('facilities').select('*');
        if (error) {
          toast({ title: 'Error fetching facilities', description: error.message, variant: 'destructive' });
        } else {
          setFacilities(data);
          if (data.length > 0 && !formData.facility_id) {
            setFormData(prev => ({ ...prev, facility_id: data[0].id }));
            setSelectedFacility(data[0]);
          }
        }
      }, [toast, formData.facility_id]);

      const fetchUserBookings = useCallback(async () => {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, facilities(name)')
          .eq('user_id', user.id)
          .order('booking_date', { ascending: true })
          .order('booking_time', { ascending: true });

        if (error) {
          toast({ title: 'Error fetching your bookings', description: error.message, variant: 'destructive' });
        } else {
          setBookings(data);
        }
      }, [user.id, toast]);
      
      const fetchAllBookings = useCallback(async () => {
        const { data, error } = await supabase.from('bookings').select('facility_id, booking_date, booking_time');
        if (error) {
            toast({ title: 'Error fetching all bookings', description: error.message, variant: 'destructive' });
        } else {
            setAllBookings(data);
        }
      }, [toast]);

      useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          await Promise.all([fetchFacilities(), fetchUserBookings(), fetchAllBookings()]);
          setLoading(false);
        };
        fetchData();

        const bookingsChannel = supabase.channel('facility-bookings-realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, 
            (payload) => {
              fetchAllBookings();
              fetchUserBookings();
            }
          )
          .subscribe();

        return () => {
            supabase.removeChannel(bookingsChannel);
        };
      }, [fetchFacilities, fetchUserBookings, fetchAllBookings]);

      const bookedSlots = useMemo(() => {
        if (!formData.facility_id || !formData.booking_date) return new Set();
        
        return new Set(
            allBookings
                .filter(b => b.facility_id === formData.facility_id && b.booking_date === formData.booking_date)
                .map(b => b.booking_time.slice(0, 5))
        );
      }, [allBookings, formData.facility_id, formData.booking_date]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(bookedSlots.has(formData.booking_time)){
             toast({ title: "Slot Unavailable", description: "This time slot is already booked. Please choose another.", variant: "destructive" });
             return;
        }

        const { error } = await supabase.from('bookings').insert({ ...formData, user_id: user.id });

        if (error) {
          toast({ title: 'Booking Failed', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Booking Confirmed! 🎉', description: 'Your facility has been reserved successfully.' });
          setFormData({ facility_id: facilities[0]?.id || '', booking_date: '', booking_time: '' });
          setSelectedFacility(facilities[0] || null);
          setShowForm(false);
        }
      };
      
      const handleCancel = async (bookingId) => {
        const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
        if(error) {
            toast({ title: 'Cancellation Failed', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Booking Cancelled', description: 'Your reservation has been removed.' });
        }
      };
      
      const handleFacilityChange = (e) => {
        const facilityId = e.target.value;
        setFormData({ ...formData, facility_id: facilityId, booking_time: '' });
        setSelectedFacility(facilities.find(f => f.id === facilityId));
      };

      const handleDateChange = (e) => {
        setFormData({ ...formData, booking_date: e.target.value, booking_time: '' });
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
              <Calendar className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-800">Facility Booking</h2>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
              <Plus className="w-5 h-5" /> New Booking
            </Button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Book a Facility</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Facility</label>
                    <select value={formData.facility_id} onChange={handleFacilityChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" required>
                      {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>

                  {selectedFacility && selectedFacility.description && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md flex items-start gap-3">
                          <Info className="w-5 h-5 mt-1 flex-shrink-0" />
                          <p className="text-sm">{selectedFacility.description}</p>
                      </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                      <input type="date" value={formData.booking_date} onChange={handleDateChange} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Time Slot (1 hour)</label>
                      <select value={formData.booking_time} onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" required disabled={!formData.booking_date}>
                        <option value="">Select time</option>
                        {timeSlots.map(slot => <option key={slot} value={slot} disabled={bookedSlots.has(slot)}>{slot}{bookedSlots.has(slot) ? ' (Booked)' : ''}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">Confirm Booking</Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <motion.div key={booking.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
                <div className="flex-grow">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 mb-4 flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{booking.facilities.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{new Date(booking.booking_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{booking.booking_time}</span></div>
                    </div>
                </div>
                <Button onClick={() => handleCancel(booking.id)} variant="destructive" className="w-full mt-auto"><X className="w-4 h-4 mr-2"/>Cancel Booking</Button>
              </motion.div>
            ))}
          </div>

          {bookings.length === 0 && !showForm && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No bookings yet</p>
              <p className="text-gray-500 text-sm">Click "New Booking" to reserve a facility</p>
            </div>
          )}
        </div>
      );
    };

    export default FacilityBooking;