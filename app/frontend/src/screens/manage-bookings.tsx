import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Mail,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  businessName: string;
  businessId: string;
  status?: string;
  createdAt: string;
}

export function ManageBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all bookings from all user's websites
  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('supabase.auth.token');
        if (!token) {
          setError('Please log in to view bookings');
          navigate('/');
          return;
        }

        // First, fetch all businesses
        const businessesResponse = await fetch('http://localhost:3001/businesses', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!businessesResponse.ok) {
          throw new Error('Failed to fetch businesses');
        }

        const businesses = await businessesResponse.json();
        const allBookings: Booking[] = [];

        // For each business, fetch its bookings
        for (const business of businesses) {
          try {
            const bookingsResponse = await fetch(
              `http://localhost:3001/businesses/${business.id}/bookings`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (bookingsResponse.ok) {
              const businessBookings = await bookingsResponse.json();
              // Enrich bookings with business info
              const enrichedBookings = businessBookings.map((booking: any) => ({
                ...booking,
                businessName: business.name,
                businessId: business.id,
              }));
              allBookings.push(...enrichedBookings);
            }
          } catch (err) {
            console.error(`Failed to fetch bookings for business ${business.id}:`, err);
          }
        }

        // Sort by date and time, most recent first
        allBookings.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB.getTime() - dateA.getTime();
        });

        setBookings(allBookings);
        setError('');
      } catch (err: any) {
        console.error('Failed to fetch bookings:', err);
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, [navigate]);

  const handleDeleteBooking = async () => {
    if (!deleteBookingId) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('supabase.auth.token');
      const booking = bookings.find(b => b.id === deleteBookingId);

      if (!booking) return;

      const response = await fetch(
        `http://localhost:3001/businesses/${booking.businessId}/bookings/${deleteBookingId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      setBookings(bookings.filter(b => b.id !== deleteBookingId));
      setShowDeleteConfirm(false);
      setDeleteBookingId(null);
    } catch (err) {
      console.error('Failed to delete booking:', err);
      setError('Failed to delete booking');
    } finally {
      setDeleting(false);
    }
  };

  const getBookingStatus = (date: string) => {
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return { status: 'completed', color: 'text-green-600', badge: 'completed' };
    } else if (bookingDate.toDateString() === today.toDateString()) {
      return { status: 'today', color: 'text-blue-600', badge: 'today' };
    } else {
      return { status: 'upcoming', color: 'text-orange-600', badge: 'upcoming' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Manage Bookings
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and manage all booking across your websites
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {bookings.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {bookings.filter(b => new Date(b.date) >= new Date()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {bookings.filter(b => new Date(b.date) < new Date()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings List */}
        {loading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">Loading bookings...</p>
            </CardContent>
          </Card>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100 dark:bg-gray-700">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Bookings from your websites will appear here
              </p>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                All Bookings
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {bookings.map((booking) => {
                  const { badge, color } = getBookingStatus(booking.date);
                  const bookingDate = new Date(booking.date);
                  const formattedDate = bookingDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={booking.id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {booking.name}
                            </h3>
                            <Badge className={`${color} bg-opacity-10`}>
                              {badge}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            From: {booking.businessName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteBookingId(booking.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {formattedDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {booking.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a
                            href={`mailto:${booking.email}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {booking.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-sm w-full">
              <CardContent className="py-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Booking?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this booking? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteBooking}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
