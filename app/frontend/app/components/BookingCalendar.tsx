'use client';

import React, { useState, useEffect } from 'react';

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  createdAt: string;
}

interface BookingCalendarProps {
  businessId: string;
  businessName: string;
}

export default function BookingCalendar({ businessId, businessName }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00',
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setStatus('loading');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/businesses/${businessId}/bookings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            date: selectedDate,
            time: selectedTime,
          }),
        }
      );

      if (!response.ok) throw new Error('Booking failed');

      const newBooking = await response.json();
      setBookings([...bookings, newBooking]);
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setShowForm(false);
        setFormData({ name: '', email: '' });
        setSelectedDate(null);
        setSelectedTime(null);
      }, 2000);
    } catch (err) {
      setStatus('error');
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
      const isPast = new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));

      days.push(
        <button
          key={day}
          onClick={() => !isPast && setSelectedDate(dateStr)}
          disabled={isPast}
          className={`p-2 rounded text-sm font-semibold ${
            isPast
              ? 'text-zinc-300 cursor-not-allowed'
              : selectedDate === dateStr
              ? 'bg-blue-600 text-white'
              : isToday
              ? 'bg-blue-100 text-blue-900'
              : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6">
      <h3 className="text-2xl font-bold text-zinc-900 mb-6">Book an Appointment</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="text-blue-600 font-semibold hover:underline"
            >
              ← Prev
            </button>
            <h4 className="font-semibold text-zinc-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="text-blue-600 font-semibold hover:underline"
            >
              Next →
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-zinc-600 text-xs py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
        </div>

        {/* Time slots & Form */}
        <div>
          {selectedDate && (
            <>
              <p className="text-sm font-semibold text-zinc-900 mb-4">
                Selected: {new Date(selectedDate).toLocaleDateString()}
              </p>

              <div className="mb-6">
                <p className="text-sm font-semibold text-zinc-900 mb-3">Available Times</p>
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded text-sm font-semibold ${
                        selectedTime === time
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTime && (
                <form onSubmit={handleBooking} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Booking...' : 'Confirm Booking'}
                  </button>
                  {status === 'success' && (
                    <div className="p-3 bg-green-50 text-green-700 text-sm rounded text-center">
                      ✓ Booking confirmed!
                    </div>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upcoming Bookings */}
      {bookings.length > 0 && (
        <div className="mt-8 border-t border-zinc-200 pt-6">
          <h4 className="font-semibold text-zinc-900 mb-4">Upcoming Bookings</h4>
          <div className="space-y-2">
            {bookings.map(booking => (
              <div key={booking.id} className="p-3 bg-blue-50 rounded text-sm">
                <p className="font-semibold text-blue-900">{booking.name}</p>
                <p className="text-blue-800">{booking.date} at {booking.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
