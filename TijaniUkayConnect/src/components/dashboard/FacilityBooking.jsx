
import React, { useState, useEffect, useMemo, useCallback } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Calendar, Clock, MapPin, Plus, Loader2, X, Info, ChevronLeft, ChevronRight } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const FacilityBooking = ({ user }) => {
      const [bookings, setBookings] = useState([]);
      const [allBookings, setAllBookings] = useState([]);
      const [facilities, setFacilities] = useState([]);
      const [showForm, setShowForm] = useState(false);
      const [loading, setLoading] = useState(true);
      const [selectedFacilityId, setSelectedFacilityId] = useState('');
      const [formData, setFormData] = useState({
        facility_id: '',
        booking_date: '',
        booking_time: '',
      });
      const [currentDate, setCurrentDate] = useState(new Date());

      const { toast } = useToast();

      const timeSlots = Array.from({ length: 18 }, (_, i) => {
        const hour = i + 6;
        return `${hour.toString().padStart(2, '0')}:00`;
      });

      const weekDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(currentDate, i));
      }, [currentDate]);

      const fetchFacilities = useCallback(async () => {
        const { data, error } = await supabase.from('facilities').select('*');
        if (error) {
          toast({ title: 'Error fetching facilities', description: error.message, variant: 'destructive' });
        } else {
          setFacilities(data);
          if (data.length > 0 && !selectedFacilityId) {
            setSelectedFacilityId(data[0].id);
          }
        }
      }, [toast, selectedFacilityId]);

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
        const { data, error } = await supabase.from('bookings').select('id, facility_id, booking_date, booking_time, user_id, profiles(full_name)');
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

      const calendarBookings = useMemo(() => {
        const bookingsMap = new Map();
        if (!selectedFacilityId) return bookingsMap;

        allBookings
            .filter(b => b.facility_id === selectedFacilityId)
            .forEach(b => {
                const key = `${b.booking_date}_${b.booking_time.slice(0, 5)}`;
                bookingsMap.set(key, b);
            });
        return bookingsMap;
      }, [allBookings, selectedFacilityId]);
      
      const handleNewBookingClick = () => {
        setFormData({
            facility_id: selectedFacilityId,
            booking_date: new Date().toISOString().split('T')[0],
            booking_time: '',
        });
        setShowForm(true);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        
        const key = `${formData.booking_date}_${formData.booking_time}`;
        if(calendarBookings.has(key)){
             toast({ title: "Slot Unavailable", description: "This time slot is already booked. Please choose another.", variant: "destructive" });
             return;
        }

        const { error } = await supabase.from('bookings').insert({ ...formData, user_id: user.id });

        if (error) {
          toast({ title: 'Booking Failed', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Booking Confirmed! 🎉', description: 'Your facility has been reserved successfully.' });
          setFormData({ facility_id: '', booking_date: '', booking_time: '' });
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
      
      const handleSlotClick = (date, time) => {
        const key = `${date.toISOString().split('T')[0]}_${time}`;
        if (calendarBookings.has(key)) {
            const booking = calendarBookings.get(key);
            toast({
                title: "Slot Booked",
                description: `This slot is booked by ${booking.user_id === user.id ? 'you' : booking.profiles?.full_name || 'another resident'}.`,
            });
            return;
        }
        setFormData({
            facility_id: selectedFacilityId,
            booking_date: date.toISOString().split('T')[0],
            booking_time: time,
        });
        setShowForm(true);
      };

      const selectedFacility = useMemo(() => facilities.find(f => f.id === selectedFacilityId), [facilities, selectedFacilityId]);

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
            <div className="flex items-center gap-2">
                <select value={selectedFacilityId} onChange={(e) => setSelectedFacilityId(e.target.value)} className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none">
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <Button onClick={handleNewBookingClick} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> New
                </Button>
            </div>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Book a Facility</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Facility</label>
                    <input type="text" value={facilities.find(f => f.id === formData.facility_id)?.name || ''} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100" readOnly />
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
                      <input type="date" value={formData.booking_date} onChange={(e) => setFormData({...formData, booking_date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Time Slot (1 hour)</label>
                      <input type="time" value={formData.booking_time} onChange={(e) => setFormData({...formData, booking_time: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" required />
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

          <div className="bg-white p-4 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}><ChevronLeft /></Button>
                <h3 className="text-lg font-bold text-gray-700 text-center">
                    {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
                <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}><ChevronRight /></Button>
            </div>
            <div className="overflow-x-auto">
                <div className="grid grid-cols-[auto_repeat(7,1fr)] min-w-[800px] md:min-w-0 text-xs sm:text-sm">
                    <div className="sticky left-0 bg-white z-10"></div>
                    {weekDates.map(date => (
                        <div key={date.toISOString()} className="text-center font-semibold p-2 border-b-2 border-gray-200">
                            <div className="text-gray-500">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div>{date.getDate()}</div>
                        </div>
                    ))}
                    {timeSlots.map(time => (
                        <React.Fragment key={time}>
                            <div className="p-2 text-right text-gray-500 border-r-2 border-gray-200 sticky left-0 bg-white z-10">{time}</div>
                            {weekDates.map(date => {
                                const key = `${date.toISOString().split('T')[0]}_${time}`;
                                const booking = calendarBookings.get(key);
                                const isMyBooking = booking?.user_id === user.id;
                                return (
                                    <div key={date.toISOString()} className="border-b border-r border-gray-100 h-12">
                                        <button 
                                            onClick={() => handleSlotClick(date, time)}
                                            className={`w-full h-full text-[10px] sm:text-xs text-center transition-colors ${
                                                booking 
                                                ? (isMyBooking ? 'bg-green-500 text-white' : 'bg-red-400 text-white')
                                                : 'bg-green-50 hover:bg-green-200'
                                            }`}
                                        >
                                            {booking ? (isMyBooking ? 'My Booking' : 'Booked') : ''}
                                        </button>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 mt-8">My Upcoming Bookings</h3>
            {bookings.length > 0 ? (
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
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No upcoming bookings</p>
                    <p className="text-gray-500 text-sm">Book a facility using the calendar above!</p>
                </div>
            )}
          </div>
        </div>
      );
    };

    export default FacilityBooking;
