'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Business {
  id: string;
  name: string;
  url: string;
  description?: string;
  createdAt: string;
}

interface Lead {
  id: string;
  businessId: string;
  name: string;
  email: string;
  company?: string;
  message?: string;
  createdAt: string;
}

export default function GeneratedWebsite() {
  const params = useParams();
  const businessId = params.businessId as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [requestBooking, setRequestBooking] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

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

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');

    try {
      // Submit lead
      const leadResponse = await fetch(`${API_URL}/businesses/${businessId}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!leadResponse.ok) throw new Error('Failed to submit lead');
      
      const newLead = await leadResponse.json();
      setLeads([...leads, newLead]);

      // Submit booking if requested
      if (requestBooking && selectedDate && selectedTime) {
        const bookingResponse = await fetch(`${API_URL}/businesses/${businessId}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            date: selectedDate,
            time: selectedTime,
          }),
        });

        if (!bookingResponse.ok) throw new Error('Failed to create booking');
      }

      setFormData({ name: '', email: '', company: '', message: '' });
      setSelectedDate(null);
      setSelectedTime(null);
      setFormStatus('success');
      setTimeout(() => {
        setFormStatus('idle');
        setShowLeadForm(false);
        setRequestBooking(false);
      }, 2000);
    } catch (err) {
      setFormStatus('error');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-zinc-600">Loading...</div>;
  }

  if (!business) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">Business not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">{business.name}</h1>
          {business.description && (
            <p className="text-xl text-blue-100 mb-8">{business.description}</p>
          )}
          <button
            onClick={() => setShowLeadForm(!showLeadForm)}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Get in Touch
          </button>
        </div>
      </div>

      {/* Contact Form Section */}
      {showLeadForm && (
        <div className="bg-zinc-50 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-zinc-900">Contact Us</h2>
            <form onSubmit={handleLeadSubmit} className="bg-white rounded-lg p-8 shadow-md space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Company (optional)"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              {/* Optional Booking Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="requestBooking"
                  checked={requestBooking}
                  onChange={(e) => setRequestBooking(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="requestBooking" className="text-sm text-zinc-700">
                  I would like to book an appointment
                </label>
              </div>

              {/* Booking Calendar (Optional) */}
              {requestBooking && (
                <div className="mt-6 pt-6 border-t border-zinc-200">
                  <h3 className="text-lg font-semibold mb-4 text-zinc-900">Select Your Appointment</h3>

                  {/* Calendar Grid */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                        }
                        className="px-3 py-1 text-zinc-600 hover:bg-zinc-200 rounded"
                      >
                        ← Prev
                      </button>
                      <h4 className="font-semibold text-zinc-900">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                        }
                        className="px-3 py-1 text-zinc-600 hover:bg-zinc-200 rounded"
                      >
                        Next →
                      </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-sm font-semibold text-zinc-500">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div>
                      <h4 className="font-semibold text-zinc-900 mb-3">Select Time</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`p-2 rounded text-sm font-semibold ${
                              selectedTime === time
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                      {selectedTime && (
                        <p className="text-sm text-zinc-600 mt-3">
                          Selected: {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={formStatus === 'loading'}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {formStatus === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
              {formStatus === 'success' && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center">
                  ✓ Thank you! We'll be in touch soon.
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-zinc-900 text-white py-8 px-4 text-center">
        <p className="text-zinc-400">
          Powered by <span className="font-semibold text-white">SalesAPE</span>
        </p>
      </div>
    </div>
  );
}
