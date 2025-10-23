import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';

const MyCalendar = ({ user }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, [user.id]);

  const loadEvents = () => {
    const bookings = JSON.parse(localStorage.getItem('tijaniBookings') || '[]');
    const userBookings = bookings.filter(b => b.residentId === user.id);
    
    const facilities = {
      clubhouse: 'Clubhouse Hall',
      tennis: 'Tennis/Pickleball Court',
      basketball: 'Basketball Court',
    };

    const calendarEvents = userBookings.map(b => ({
      id: b.id,
      title: facilities[b.facility],
      date: b.date,
      time: b.time,
      type: 'booking',
    }));

    setEvents(calendarEvents.sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarIcon className="w-8 h-8 text-green-600" />
        <h2 className="text-3xl font-bold text-gray-800">My Calendar</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Upcoming Events</h3>
        <div className="space-y-4">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-green-50 to-amber-50 rounded-xl p-5 border-l-4 border-green-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
          {events.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No upcoming events</p>
              <p className="text-gray-500 text-sm">Your facility bookings will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCalendar;