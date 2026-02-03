'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { API_URL } from '../../lib/api';
import ClientDate from '../../components/ClientDate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/businesses/${businessId}/public`)
      .then((res) => {
        if (!res.ok) throw new Error('Business not found');
        return res.json();
      })
      .then((data) => {
        setBusiness(data);
        setAnalysis(data.analysis || {});
      })
      .catch(() => setBusiness(null))
      .finally(() => setLoading(false));
  }, [businessId]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [requestBooking, setRequestBooking] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');

    try {
      // Submit lead (public endpoint - no auth required)
      const leadResponse = await fetch(`${API_URL}/businesses/${businessId}/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!leadResponse.ok) throw new Error('Failed to submit lead');
      
      const newLead = await leadResponse.json();
      setLeads([...leads, newLead]);

      // Submit booking if requested (public endpoint)
      if (requestBooking && selectedDate && selectedTime) {
        const bookingResponse = await fetch(`${API_URL}/businesses/${businessId}/public/bookings`, {
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
      toast.success("Thanks — we've sent your message to the business.");
      setTimeout(() => {
        setFormStatus('idle');
        setShowLeadForm(false);
        setRequestBooking(false);
      }, 2000);
    } catch (err) {
      setFormStatus('error');
      toast.error('Failed to send message — please try again.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-zinc-600">Loading...</div>;
  }

  if (!business) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">Business not found</div>;
  }

  // Get hero headline from analysis, fallback to default
  const heroHeadline = analysis?.heroHeadline || `Welcome to ${business?.name}`;
  const marketingCopy = analysis?.marketingCopy || business?.description || 'Professional services tailored to your needs.';
  const services = analysis?.services || [];
  const brandColors = analysis?.brandColors || ['#3b82f6', '#1e40af'];
  const heroColor = brandColors[0] || '#3b82f6';

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Hero Section */}
      <div 
        className="text-white py-24 px-4"
        style={{
          background: `linear-gradient(135deg, ${heroColor}cc 0%, ${brandColors[1] || heroColor}99 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 leading-tight">{heroHeadline}</h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">{marketingCopy}</p>
          <Button 
            onClick={() => setShowLeadForm(!showLeadForm)} 
            className="px-8 py-6 text-lg font-semibold bg-white text-zinc-900 hover:bg-zinc-100"
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Services Section */}
      {services.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-800 py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 text-zinc-900 dark:text-zinc-50">What We Offer</h2>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-16">Our comprehensive range of services designed for you</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service: string, idx: number) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-zinc-700 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div 
                    className="w-12 h-12 rounded-full mb-4 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: brandColors[idx % brandColors.length] || heroColor }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">{service}</h3>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    Professional {service.toLowerCase()} services tailored to meet your business needs and goals.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      {showLeadForm && (
        <div className="bg-white dark:bg-zinc-900 py-20 px-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-2 text-zinc-900 dark:text-zinc-50">Get in Touch</h2>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12">
              Tell us about your project and let's create something amazing together
            </p>
            <form onSubmit={handleLeadSubmit} className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Your Name *</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Your Email *</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Company (Optional)</label>
                <Input
                  type="text"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Message *</label>
                <Textarea
                  placeholder="Tell us about your project..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full"
                />
              </div>
              {/* Optional Booking Checkbox */}
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <Checkbox
                  id="requestBooking"
                  checked={requestBooking}
                  onChange={(e) => setRequestBooking((e.target as HTMLInputElement).checked)}
                />
                <label htmlFor="requestBooking" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  I would like to book an appointment
                </label>
              </div>

              {/* Booking Calendar (Optional) */}
              {requestBooking && (
                <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700 space-y-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Select Your Appointment</h3>

                  {/* Calendar Grid */}
                  <div className="bg-white dark:bg-zinc-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                      <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                        ← Prev
                      </Button>
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 text-lg">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h4>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                        Next →
                      </Button>
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
                          <Button
                            key={time}
                            size="sm"
                            variant={selectedTime === time ? 'default' : 'ghost'}
                            onClick={() => setSelectedTime(time)}
                            className="p-2"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                      {selectedTime && (
                        <p className="text-sm text-zinc-600 mt-3">
                          Selected: <ClientDate value={selectedDate} /> at {selectedTime}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full py-6 text-lg font-semibold mt-8"
                style={{ backgroundColor: heroColor }}
                disabled={formStatus === 'loading'}
              >
                {formStatus === 'loading' ? '⏳ Sending...' : '✓ Send Message'}
              </Button>
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
      <div className="bg-zinc-900 dark:bg-black text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-400 mb-2">
            Powered by <span className="font-semibold text-white">SalesAPE</span>
          </p>
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
