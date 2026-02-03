'use client';

import React, { useState, useEffect } from 'react';
import ClientDate from './ClientDate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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
      toast.success('Booking confirmed');
      setTimeout(() => {
        setStatus('idle');
        setShowForm(false);
        setFormData({ name: '', email: '' });
        setSelectedDate(null);
        setSelectedTime(null);
      }, 2000);
    } catch (err) {
      setStatus('error');
      toast.error('Failed to create booking');
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
        <Button
          key={day}
          size="sm"
          onClick={() => !isPast && setSelectedDate(dateStr)}
          disabled={isPast}
          variant={selectedDate === dateStr ? 'default' : isToday ? 'ghost' : 'ghost'}
          className={`p-2 text-sm font-semibold ${isPast ? 'text-zinc-300 cursor-not-allowed' : ''}`}
        >
          {day}
        </Button>
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
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                  ← Prev
                </Button>
                <h4 className="font-semibold text-zinc-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                  Next →
                </Button>
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
                Selected: <ClientDate value={selectedDate} />
              </p>

              <div className="mb-6">
                <p className="text-sm font-semibold text-zinc-900 mb-3">Available Times</p>
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {timeSlots.map(time => (
                    <Button
                      key={time}
                      size="sm"
                      variant={selectedTime === time ? 'default' : 'ghost'}
                      onClick={() => setSelectedTime(time)}
                      className={selectedTime === time ? 'p-2' : 'p-2'}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedTime && (
                <form onSubmit={handleBooking} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Button type="submit" className="w-full" size="lg" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Booking...' : 'Confirm Booking'}
                  </Button>
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
