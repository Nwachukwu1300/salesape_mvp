import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { ThemeToggle } from '../components/ThemeToggle';
import { 
  ArrowLeft, 
  Eye, 
  Edit3, 
  ExternalLink, 
  Smartphone,
  Monitor,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  Settings
} from 'lucide-react';
import { CalendarIntegrationModal } from '../components/CalendarIntegrationModal';

export function WebsitePreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [editMode, setEditMode] = useState(false);
  const [business, setBusiness] = useState<any | null>(null);
  const [template, setTemplate] = useState<any | null>(null);
  const [showLeads, setShowLeads] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [editingContact, setEditingContact] = useState({ phone: '', address: '' });
  const [publishing, setPublishing] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [branding, setBranding] = useState<any | null>(null);
  const [desiredFeatures, setDesiredFeatures] = useState<string[]>([]);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    clientName: '',
    clientTitle: '',
    content: '',
    rating: 5,
    imageUrl: ''
  });
  const [loadingTestimonial, setLoadingTestimonial] = useState(false);

  const API_BASE = ((import.meta.env as any).VITE_API_URL || 'http://localhost:3001').replace(/\/+$/g, '');

  // Helper to check if a feature was selected
  const hasFeature = (feature: string) =>
    desiredFeatures.some(f => f.toLowerCase().includes(feature.toLowerCase()));

  // Helper to ensure template has all required style properties
  const getTemplateStyle = (tpl: any) => {
    const defaultStyle = {
      bgColor: '#ffffff',
      textColor: '#000000',
      accent: '#0066cc',
      secondary: '#f0f0f0',
      tertiary: '#333333',
      font: 'system-ui, -apple-system, sans-serif',
      headingFont: 'system-ui, -apple-system, sans-serif'
    };
    return tpl?.style ? { ...defaultStyle, ...tpl.style } : defaultStyle;
  };

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const token = localStorage.getItem('supabase.auth.token');
        console.log('🔍 Fetching business & templates...');
        console.log('Token present:', !!token);
        console.log('Business ID:', id);
        
        const [bizRes, tplRes] = await Promise.all([
          fetch(`${API_BASE}/businesses/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/businesses/${id}/template`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        console.log('📊 Response statuses - Business:', bizRes.status, 'Templates:', tplRes.status);
        
        if (bizRes.ok) {
          const b = await bizRes.json();
          console.log('✅ Business data received:', b?.name);
          setBusiness(b);
          setEditingContact({ phone: b.phone || '', address: b.address || '' });
        } else {
          console.error('❌ Business fetch failed:', bizRes.status, bizRes.statusText);
        }
        
        if (tplRes.ok) {
          const t = await tplRes.json();
          console.log('✅ Template response received');
          console.log('Full response:', t);
          console.log('Templates array length:', t.templates?.length);
          console.log('Template IDs:', t.templates?.map((tpl: any) => tpl.id));
          console.log('Testimonials received:', t.testimonials?.length || 0);
          console.log('Branding data:', t.branding);
          console.log('🎯 Desired features:', t.desiredFeatures);
          setTemplate(t.recommended || t.templates?.[0] || null);
          setAvailableTemplates(t.templates || []);
          setTestimonials(t.testimonials || []);
          setBranding(t.branding || null);
          setDesiredFeatures(t.desiredFeatures || []);
        } else {
          console.error('❌ Template fetch failed:', tplRes.status, tplRes.statusText);
          const errText = await tplRes.text();
          console.error('Error response:', errText);
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
      }
    }
    load();
  }, [id]);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Logo size="sm" className="md:hidden" />
              <Logo size="md" className="hidden md:block" />
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Badge variant="success">Live</Badge>
                <span>•</span>
                <span>{business?.publishedUrl || 'your-website.salesape.ai/web'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => {
                const url = business?.publishedUrl;
                if (url) {
                  window.open(url, '_blank');
                } else {
                  alert('This site is not yet published. Click the "Publish Site" button in the sidebar to make it live on the web.');
                }
              }}>
                <ExternalLink className="w-4 h-4" />
                <span className="hidden lg:inline">View Live</span>
              </Button>
              {/* Dev Preview Button - Will be removed in production */}
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex text-xs"
                style={{ borderColor: '#f724de', color: '#f724de' }}
                onClick={() => {
                  if (!id) return alert('Business ID not found');
                  const devUrl = `http://localhost:3001/public/business?id=${id}`;
                  window.open(devUrl, '_blank');
                }}
                title="Development preview - will be removed later"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden lg:inline text-xs">(DEV) Preview</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-73px)] overflow-y-auto">
              <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Preview Settings</h2>
            
            {/* View Controls */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Preview Mode
              </label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'desktop' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="flex-1"
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="flex-1"
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </Button>
              </div>
            </div>

            {/* Edit Toggle */}
            <div className="mb-6">
              <Button
                variant={editMode ? 'primary' : 'outline'}
                onClick={() => setEditMode(!editMode)}
                className="w-full"
              >
                <Edit3 className="w-4 h-4" />
                {editMode ? 'Editing Mode' : 'Enable Editing'}
              </Button>
            </div>

            {/* Template Selection - Stylish Design Studio */}
            {availableTemplates.length > 0 && (
              <Card className="mb-6 border-2" style={{ borderColor: '#f724de' }}>
                <CardContent className="p-4">
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white" style={{ color: '#f724de' }}>✨ Design Studio</h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {availableTemplates.length} premium template{availableTemplates.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableTemplates.map((tpl: any, idx: number) => (
                      <button
                        key={tpl.id}
                        onClick={() => setTemplate(tpl)}
                        className={`w-full px-4 py-3 text-left rounded-lg border-2 transition-all transform hover:scale-105 ${
                          template?.id === tpl.id
                            ? 'border-2'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                        style={{
                          backgroundColor: template?.id === tpl.id ? '#f724de20' : 'transparent',
                          borderColor: template?.id === tpl.id ? '#f724de' : 'inherit'
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 dark:text-white text-sm" style={{ color: template?.id === tpl.id ? '#f724de' : 'inherit' }}>
                              {idx + 1}. {tpl.name}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">{tpl.description}</div>
                          </div>
                          {template?.id === tpl.id && (
                            <div className="ml-2 text-lg">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Contact Info */}
            {editMode && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Info</h3>
                  <div className="space-y-2">
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={editingContact.phone}
                      onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={editingContact.address}
                      onChange={(e) => setEditingContact({ ...editingContact, address: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={async () => {
                        if (!id) return;
                        try {
                          const token = localStorage.getItem('supabase.auth.token');
                          const res = await fetch(`${API_BASE}/businesses/${id}`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(editingContact),
                          });
                          if (!res.ok) throw new Error('Failed to update');
                          const updated = await res.json();
                          setBusiness(updated);
                          alert('Contact info updated!');
                        } catch (err) {
                          console.error(err);
                          alert('Failed to save');
                        }
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Testimonials Management */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Testimonials</h3>
                  <span className="text-xs bg-violet-100 dark:bg-violet-900 text-violet-900 dark:text-violet-100 px-2 py-1 rounded">
                    {testimonials.length}
                  </span>
                </div>

                {/* Testimonials List */}
                {testimonials.length > 0 && (
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {testimonials.map((testimonial: any) => (
                      <div key={testimonial.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                        <div className="font-semibold text-gray-900 dark:text-white text-xs">{testimonial.clientName}</div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mt-1">"{testimonial.content}"</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">⭐ {testimonial.rating}/5</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={async () => {
                              if (!id) return;
                              if (!confirm('Delete this testimonial?')) return;
                              try {
                                const token = localStorage.getItem('supabase.auth.token');
                                const res = await fetch(
                                  `${API_BASE}/businesses/${id}/testimonials/${testimonial.id}`,
                                  {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` },
                                  }
                                );
                                if (!res.ok) throw new Error('Failed to delete');
                                setTestimonials(testimonials.filter((t: any) => t.id !== testimonial.id));
                              } catch (err) {
                                console.error(err);
                                alert('Failed to delete testimonial');
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Testimonial Form Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowTestimonialForm(!showTestimonialForm)}
                >
                  {showTestimonialForm ? '✕ Cancel' : '+ Add Testimonial'}
                </Button>

                {/* Add Testimonial Form */}
                {showTestimonialForm && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded space-y-2">
                    <input
                      type="text"
                      placeholder="Client Name"
                      value={newTestimonial.clientName}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, clientName: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <input
                      type="text"
                      placeholder="Client Title (e.g., CEO)"
                      value={newTestimonial.clientTitle}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, clientTitle: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <textarea
                      placeholder="Testimonial text"
                      value={newTestimonial.content}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      rows={2}
                    />
                    <select
                      value={newTestimonial.rating}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="5">⭐ 5 Stars</option>
                      <option value="4">⭐ 4 Stars</option>
                      <option value="3">⭐ 3 Stars</option>
                      <option value="2">⭐ 2 Stars</option>
                      <option value="1">⭐ 1 Star</option>
                    </select>
                    <input
                      type="url"
                      placeholder="Image URL (optional)"
                      value={newTestimonial.imageUrl}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, imageUrl: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={loadingTestimonial || !newTestimonial.clientName || !newTestimonial.content}
                      onClick={async () => {
                        if (!id) return;
                        setLoadingTestimonial(true);
                        try {
                          const token = localStorage.getItem('supabase.auth.token');
                          const res = await fetch(
                            `${API_BASE}/businesses/${id}/testimonials`,
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify(newTestimonial),
                            }
                          );
                          if (!res.ok) throw new Error('Failed to create');
                          const created = await res.json();
                          setTestimonials([...testimonials, created]);
                          setNewTestimonial({
                            clientName: '',
                            clientTitle: '',
                            content: '',
                            rating: 5,
                            imageUrl: '',
                          });
                          setShowTestimonialForm(false);
                        } catch (err) {
                          console.error(err);
                          alert('Failed to add testimonial');
                        } finally {
                          setLoadingTestimonial(false);
                        }
                      }}
                    >
                      {loadingTestimonial ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Views</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{business?.views || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Leads Captured</span>
                    <span className="font-semibold text-green-600">{business?.leads?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bookings</span>
                    <span className="font-semibold" style={{ color: '#f724de' }}>{business?.bookings?.length || 0}</span>
                  </div>
                  {business?.leads?.length && business?.bookings?.length ? (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {((business.bookings.length / business.leads.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Publish Button */}
            {!business?.isPublished && (
              <Button 
                variant="primary" 
                className="w-full mb-6" 
                disabled={publishing}
                onClick={async () => {
                  if (!id) return;
                  setPublishing(true);
                  try {
                    const token = localStorage.getItem('supabase.auth.token');
                    const res = await fetch(`${API_BASE}/businesses/${id}/publish`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                    });
                    if (!res.ok) throw new Error('Failed to publish');
                    const data = await res.json();
                    setBusiness(data);
                    alert(`Site published at: ${data.publishedUrl}`);
                  } catch (err: any) {
                    console.error(err);
                    alert('Failed to publish site');
                  } finally {
                    setPublishing(false);
                  }
                }}
              >
                {publishing ? 'Publishing...' : 'Publish Site'}
              </Button>
            )}
            {/* Quick Actions */}
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowCalendarModal(true)}>
                  <Calendar className="w-4 h-4" />
                  Calendar Settings
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={async () => {
                  if (!id) return;
                  try {
                    const token = localStorage.getItem('supabase.auth.token');
                    const res = await fetch(`${API_BASE}/businesses/${id}/leads`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error('Failed to fetch leads');
                    const data = await res.json();
                    setLeads(data || []);
                    setShowLeads(true);
                  } catch (err:any) {
                    console.error(err);
                    alert('Unable to load leads');
                  }
                }}>
                  <Mail className="w-4 h-4" />
                  View Leads
                </Button>
              </div>
          </div>
        </aside>

          <CalendarIntegrationModal isOpen={showCalendarModal} onClose={() => setShowCalendarModal(false)} />

        {/* Main Preview Area */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div
              className={`bg-white rounded-lg shadow-2xl transition-all duration-300 ${
                viewMode === 'mobile' ? 'max-w-[375px] mx-auto overflow-y-auto' : 'overflow-hidden'
              }`}
              style={{
                height: viewMode === 'mobile' ? '667px' : 'auto',
              }}
            >
                {/* Rendered Website Content (uses generated business/template when available) */}
              <div className="relative">
                {editMode && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="h-full w-full border-4 border-violet-500 border-dashed rounded-lg" />
                  </div>
                )}

                {/* Use template styles with fallbacks */}
                {template && (() => {
                  const templateStyle = getTemplateStyle(template);
                  return (
                    <>
                      {/* Hero Section - Template Specific */}
                      {template?.layout === 'modern' && (
                        <section className="relative bg-white text-gray-900 p-8 md:p-16">
                          <div className="max-w-4xl">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: templateStyle.accent }}>
                              {business?.name}
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                              {business?.description || 'Professional solutions for modern business'}
                            </p>
                            <Button variant="primary" size="lg">Get Started Today</Button>
                          </div>
                        </section>
                      )}
                      
                      {template?.layout === 'creative' && (
                        <section className="relative overflow-hidden p-0" style={{ backgroundColor: templateStyle.bgColor, minHeight: '500px' }}>
                          {/* Subtle accent gradient overlay */}
                          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${templateStyle.bgColor} 0%, ${templateStyle.secondary} 100%)` }} />
                          {/* Decorative accent line */}
                          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: templateStyle.accent }} />
                          <div className="relative p-12 md:p-20 flex flex-col justify-center h-full" style={{ minHeight: '500px' }}>
                            <h1 className="text-6xl md:text-7xl font-black mb-4 leading-tight" style={{ color: templateStyle.accent }}>
                              {business?.name}
                            </h1>
                            <p className="text-2xl mb-8 max-w-3xl" style={{ color: templateStyle.textColor }}>
                              {business?.description || 'Create. Inspire. Transform.'}
                            </p>
                            <div>
                              <Button variant="primary" size="lg" style={{ backgroundColor: templateStyle.accent, color: '#ffffff' }}>Explore Our Work</Button>
                            </div>
                          </div>
                        </section>
                      )}

                      {template?.layout === 'minimal' && (
                        <section className="relative p-16 md:p-24 text-center" style={{ backgroundColor: templateStyle.bgColor, color: templateStyle.textColor }}>
                          <div className="max-w-2xl mx-auto">
                            <p className="text-sm uppercase tracking-widest mb-6" style={{ color: templateStyle.accent }}>Welcome</p>
                            <h1 className="text-5xl md:text-6xl font-light mb-6" style={{ fontFamily: 'Georgia, serif', fontWeight: 300 }}>
                              {business?.name}
                            </h1>
                            <p className="text-xl mb-8 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                              {business?.description || 'Experience timeless elegance and sophistication'}
                            </p>
                            <Button variant="primary" size="lg">Begin</Button>
                          </div>
                        </section>
                      )}

                      {template?.layout === 'bold' && (
                        <section className="relative overflow-hidden p-8 md:p-16" style={{ backgroundColor: templateStyle.bgColor }}>
                          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full" style={{ backgroundColor: templateStyle.accent, opacity: 0.1 }} />
                          <div className="absolute -bottom-20 -left-40 w-96 h-96 rounded-full" style={{ backgroundColor: templateStyle.secondary, opacity: 0.1 }} />
                          <div className="relative max-w-4xl">
                            <h1 className="text-6xl md:text-7xl font-black mb-6" style={{ color: templateStyle.accent }}>
                              {business?.name}
                            </h1>
                            <p className="text-2xl mb-8 max-w-2xl" style={{ color: templateStyle.textColor }}>
                              {business?.description || 'Bold Ideas. Real Results. Your Success.'}
                            </p>
                            <div className="flex gap-4">
                              <Button variant="primary" size="lg" style={{ backgroundColor: templateStyle.accent }}>Get Started</Button>
                              <Button variant="outline" size="lg">Learn More</Button>
                            </div>
                          </div>
                        </section>
                      )}

                      {template?.layout === 'sleek' && (
                        <section className="relative p-12 md:p-20" style={{ backgroundColor: templateStyle.bgColor, background: `linear-gradient(135deg, ${templateStyle.secondary} 0%, ${templateStyle.bgColor} 100%)` }}>
                          <div className="max-w-3xl">
                            <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: templateStyle.secondary, color: templateStyle.accent }}>
                              Featured
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: templateStyle.accent }}>
                              {business?.name}
                            </h1>
                            <p className="text-lg mb-8" style={{ color: templateStyle.textColor }}>
                              {business?.description || 'Next-generation solutions for the modern world'}
                            </p>
                            <Button variant="primary" size="lg">Explore Now</Button>
                          </div>
                        </section>
                      )}

                      {/* Template Sections */}
                      <section className="p-8 md:p-12 border-b border-gray-100 relative">
                        {editMode && (
                          <div className="absolute top-4 right-4 z-20">
                            <Button size="sm" variant="secondary">
                              <Edit3 className="w-3 h-3" />
                              Edit About
                            </Button>
                          </div>
                        )}
                        <div className="max-w-3xl">
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {template?.sections?.[0]?.heading || 'About'}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                            {template?.sections?.[0]?.content || business?.description || 'A custom website generated for your business.'}
                          </p>
                        </div>
                      </section>

                      {/* Template-Specific Sections (skip first section which was already rendered above) */}
                      {template?.sections?.slice(1).map((s: any, idx: number) => {
                        const bgColor = s.type === 'cta-section' || s.type === 'cta-full' || s.type === 'cta-bold' || s.type === 'cta-tech' ? templateStyle.secondary : 'transparent';
                        const textColor = templateStyle.textColor || '#000';
                  
                  if (s.type === 'feature-grid') {
                    return (
                      <section key={idx} className="p-8 md:p-12" style={{ backgroundColor: bgColor }}>
                        <h2 className="text-4xl font-bold mb-2" style={{ color: template.style.accent }}>{s.heading}</h2>
                        <p className="text-lg mb-12">{s.content}</p>
                        <div className="grid md:grid-cols-3 gap-6">
                          {s.items?.map((item: string, i: number) => (
                            <div key={i} className="p-6 rounded-lg" style={{ backgroundColor: template.style.bgColor, border: `2px solid ${template.style.accent}` }}>
                              <p style={{ color: textColor }} className="font-semibold">{item}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }
                  
                  if (s.type === 'gallery-grid') {
                    // Only show if gallery/portfolio feature was selected
                    if (!hasFeature('gallery') && !hasFeature('portfolio')) return null;

                    const images = branding?.images || [];
                    // Show real images if available, otherwise show placeholders
                    const displayItems = images.length > 0 ? images : [1, 2, 3, 4, 5, 6];

                    return (
                      <section key={idx} className="p-8 md:p-12" style={{ backgroundColor: bgColor }}>
                        <h2 className="text-4xl font-bold mb-2" style={{ color: template.style.accent }}>{s.heading}</h2>
                        <p className="text-lg mb-12">{s.content}</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {displayItems.map((item: any, i: number) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: template.style.secondary }}>
                              {typeof item === 'object' && item.url ? (
                                <img
                                  src={item.url}
                                  alt={item.title || `Gallery ${i + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      const placeholder = document.createElement('div');
                                      placeholder.className = 'w-full h-full flex items-center justify-center text-gray-500';
                                      placeholder.textContent = item.title || `Gallery ${i + 1}`;
                                      parent.appendChild(placeholder);
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">Gallery Item {i + 1}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  if (s.type === 'testimonial-carousel') {
                    // Only show if testimonial feature was selected
                    if (!hasFeature('testimonial')) return null;

                    // Use real testimonials from API if available, otherwise use template items as fallback
                    const displayTestimonials = testimonials && testimonials.length > 0
                      ? testimonials
                      : (s.items || []).map((text: string, i: number) => ({
                          clientName: `Client ${i + 1}`,
                          content: text
                        }));

                    return (
                      <section key={idx} className="p-8 md:p-12" style={{ backgroundColor: bgColor }}>
                        <h2 className="text-3xl font-bold mb-12 text-center">{s.heading}</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                          {displayTestimonials.map((testimonial: any, i: number) => (
                            <div key={i} className="p-6 rounded-lg" style={{ backgroundColor: template.style.bgColor, borderLeft: `4px solid ${template.style.accent}` }}>
                              {testimonial.imageUrl && (
                                <div className="mb-4 flex justify-center">
                                  <img
                                    src={testimonial.imageUrl}
                                    alt={testimonial.clientName}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              <p style={{ color: textColor }} className="mb-4">"{testimonial.content || testimonial}"</p>
                              <p className="font-semibold" style={{ color: template.style.accent }}>{testimonial.clientName}</p>
                              {testimonial.clientTitle && (
                                <p style={{ color: textColor }} className="text-sm opacity-75">{testimonial.clientTitle}</p>
                              )}
                              {testimonial.rating && (
                                <p className="text-sm mt-2">⭐ {testimonial.rating}/5</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  if (s.type === 'feature-tech') {
                    return (
                      <section key={idx} className="p-8 md:p-12" style={{ backgroundColor: bgColor }}>
                        <h2 className="text-4xl font-bold mb-2" style={{ color: template.style.accent }}>{s.heading}</h2>
                        <div className="grid md:grid-cols-3 gap-8 mt-12">
                          {s.items?.map((feature: string, i: number) => (
                            <div key={i} className="text-center">
                              <div className="mb-4 flex justify-center">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: template.style.accent }}>
                                  <span style={{ color: template.style.bgColor }} className="text-2xl font-bold">{i + 1}</span>
                                </div>
                              </div>
                              <h3 className="text-xl font-semibold mb-2" style={{ color: textColor }}>{feature}</h3>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  if (s.type === 'benefit-cards') {
                    return (
                      <section key={idx} className="p-8 md:p-12" style={{ backgroundColor: bgColor }}>
                        <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: template.style.accent }}>{s.heading}</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                          {s.items?.map((benefit: any, i: number) => (
                            <div key={i} className="p-8 rounded-lg text-center" style={{ backgroundColor: template.style.secondary }}>
                              <div className="text-5xl mb-4">{benefit.icon}</div>
                              <h3 className="text-xl font-bold" style={{ color: textColor }}>{benefit.title}</h3>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  if (s.type === 'social-proof') {
                    return (
                      <section key={idx} className="p-8 md:p-12" style={{ backgroundColor: bgColor }}>
                        <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: template.style.accent }}>{s.heading}</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                          {s.stats?.map((stat: any, i: number) => (
                            <div key={i} className="text-center">
                              <p className="text-5xl font-bold mb-2" style={{ color: template.style.accent }}>{stat.number}</p>
                              <p style={{ color: textColor }} className="text-lg">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  if (s.type === 'quote-section') {
                    return (
                      <section key={idx} className="p-12 md:p-20 text-center" style={{ backgroundColor: bgColor }}>
                        <p className="text-3xl mb-6 italic" style={{ color: textColor, fontFamily: 'Georgia, serif' }}>"{s.content}"</p>
                        <p style={{ color: template.style.accent }} className="font-semibold">— {s.author}</p>
                      </section>
                    );
                  }

                  if (s.type === 'feature-minimal' || s.type === 'two-column' || s.type === 'timeline-section') {
                    return (
                      <section key={idx} className="p-8 md:p-12 border-b" style={{ borderColor: template.style.secondary }}>
                        <h2 className="text-3xl font-light mb-6" style={{ color: template.style.accent, fontFamily: 'Georgia, serif' }}>{s.heading}</h2>
                        {s.items ? (
                          <div className="space-y-4">
                            {s.items.map((item: string, i: number) => (
                              <p key={i} style={{ color: textColor }}>• {item}</p>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: textColor }}>{s.content}</p>
                        )}
                      </section>
                    );
                  }

                  if (s.type === 'pricing-table') {
                    // Only show if pricing feature was selected
                    if (!hasFeature('pricing')) return null;

                    return (
                      <section key={idx} className="p-8 md:p-12" style={{ backgroundColor: bgColor }}>
                        <h2 className="text-3xl font-bold mb-4 text-center" style={{ color: template.style.accent }}>{s.heading}</h2>
                        {s.content && <p className="text-center mb-12" style={{ color: textColor }}>{s.content}</p>}
                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: template.style.secondary }}>
                            <h3 className="text-xl font-bold mb-2" style={{ color: textColor }}>Basic</h3>
                            <p className="text-3xl font-bold mb-4" style={{ color: template.style.accent }}>$99</p>
                            <p style={{ color: textColor }} className="text-sm">Perfect for getting started</p>
                          </div>
                          <div className="p-6 rounded-lg text-center border-2" style={{ backgroundColor: template.style.bgColor, borderColor: template.style.accent }}>
                            <h3 className="text-xl font-bold mb-2" style={{ color: textColor }}>Professional</h3>
                            <p className="text-3xl font-bold mb-4" style={{ color: template.style.accent }}>$199</p>
                            <p style={{ color: textColor }} className="text-sm">Most popular choice</p>
                          </div>
                          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: template.style.secondary }}>
                            <h3 className="text-xl font-bold mb-2" style={{ color: textColor }}>Enterprise</h3>
                            <p className="text-3xl font-bold mb-4" style={{ color: template.style.accent }}>Custom</p>
                            <p style={{ color: textColor }} className="text-sm">Contact us for details</p>
                          </div>
                        </div>
                      </section>
                    );
                  }

                  if (s.type === 'blog-preview') {
                    // Only show if blog feature was selected
                    if (!hasFeature('blog')) return null;

                    return (
                      <section key={idx} className="p-8 md:p-12" style={{ backgroundColor: bgColor }}>
                        <h2 className="text-3xl font-bold mb-4 text-center" style={{ color: template.style.accent }}>{s.heading}</h2>
                        {s.content && <p className="text-center mb-12" style={{ color: textColor }}>{s.content}</p>}
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-lg overflow-hidden" style={{ backgroundColor: template.style.secondary }}>
                              <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300" />
                              <div className="p-4">
                                <p className="text-xs mb-2" style={{ color: template.style.accent }}>Blog Post</p>
                                <h3 className="font-bold mb-2" style={{ color: textColor }}>Article Title {i}</h3>
                                <p className="text-sm" style={{ color: textColor, opacity: 0.7 }}>A preview of your blog content will appear here...</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  if (s.type === 'live-chat') {
                    // Only show if live chat feature was selected
                    if (!hasFeature('chat')) return null;

                    return (
                      <section key={idx} className="p-8 md:p-12" style={{ backgroundColor: template.style.accent }}>
                        <div className="max-w-2xl mx-auto text-center text-white">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                            </svg>
                          </div>
                          <h2 className="text-2xl font-bold mb-2">{s.heading}</h2>
                          <p className="opacity-90 mb-4">{s.content}</p>
                          <p className="text-sm opacity-75">Live chat widget will appear in the bottom-right corner</p>
                        </div>
                      </section>
                    );
                  }

                  // Default section
                  return (
                    <section key={idx} className="p-8 md:p-12 border-b border-gray-100">
                      <div className="max-w-3xl">
                        <h3 className="text-2xl font-semibold mb-3">{s.heading}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{s.content}</p>
                      </div>
                    </section>
                  );
                })}

                {/* Lead Capture Form - only if Contact Form feature selected */}
                {hasFeature('contact') && (
                <section className="p-8 md:p-12 relative" style={{ backgroundColor: '#f4f0e5' }}>
                  {editMode && (
                    <div className="absolute top-4 right-4 z-20">
                      <Button size="sm" variant="secondary">
                        <Edit3 className="w-3 h-3" />
                        Edit Form
                      </Button>
                    </div>
                  )}
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {business?.name ? `Contact ${business.name}` : 'Join Our Mailing List'}
                      </h2>
                      <p className="text-gray-600">
                        {business?.contactEmail ? `Leads will be sent to ${business.contactEmail}` : 'Get exclusive offers and updates delivered to your inbox'}
                      </p>
                    </div>
                    
                    <Card>
                      <CardContent className="p-6">
                        <form className="space-y-4" onSubmit={async (e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget as HTMLFormElement);
                          const payload: any = {
                            name: `${fd.get('firstName') || ''} ${fd.get('lastName') || ''}`.trim(),
                            email: fd.get('email'),
                            company: fd.get('company'),
                            message: fd.get('message') || '',
                          };
                          try {
                            if (id) {
                              const token = localStorage.getItem('supabase.auth.token');
                              const res = await fetch(`${API_BASE}/businesses/${id}/leads`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: token ? `Bearer ${token}` : undefined,
                                },
                                body: JSON.stringify(payload),
                              });
                              if (!res.ok) throw new Error('Failed to submit lead');
                              alert('Thanks — your message was sent');
                            } else {
                              alert('This site is not available to receive leads yet');
                            }
                          } catch (err) {
                            console.error(err);
                            alert('Unable to send – try again later');
                          }
                        }}>
                          <div className="grid md:grid-cols-2 gap-4">
                            <input
                              name="firstName"
                              type="text"
                              placeholder="First Name"
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                            <input
                              name="lastName"
                              type="text"
                              placeholder="Last Name"
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                          </div>
                          <input
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                          <input
                            name="company"
                            type="text"
                            placeholder="Company (optional)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                          <textarea
                            name="message"
                            placeholder="Message"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 h-24"
                          />
                          <Button variant="primary" size="lg" className="w-full">
                            <CheckCircle className="w-5 h-5" />
                            Sign Me Up
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </section>
                )}

                {/* Booking Calendar Embed - only if Online Booking feature selected */}
                {hasFeature('booking') && (
                <section className="p-8 md:p-12 relative">
                  {editMode && (
                    <div className="absolute top-4 right-4 z-20">
                      <Button size="sm" variant="secondary">
                        <Edit3 className="w-3 h-3" />
                        Edit Calendar
                      </Button>
                    </div>
                  )}
                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                      Book Your Visit
                    </h2>
                    <Card>
                      <CardContent className="p-8">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">
                              {template?.name ? `${template.name} — Booking Widget` : 'Calendar Booking Widget'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {template ? 'Configured calendar integration.' : 'Integration with Google Calendar, Calendly, etc.'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>
                )}

                {/* Footer - Template Styled */}
                <footer style={{ backgroundColor: template?.style?.bgColor || '#1a202c', color: template?.style?.textColor || '#fff' }} className="p-8 md:p-12">
                  <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
                    <div>
                      <h3 className="font-bold mb-3" style={{ color: template?.style?.accent }}>Contact</h3>
                      <div className="space-y-2 text-sm" style={{ color: template?.style?.textColor }}>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{business?.phone || '(555) 123-4567'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{business?.contactEmail || 'hello@business.com'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold mb-3" style={{ color: template?.style?.accent }}>Hours</h3>
                      <div className="space-y-1 text-sm" style={{ color: template?.style?.textColor }}>
                        <p>Mon-Fri: 7am - 8pm</p>
                        <p>Sat-Sun: 8am - 9pm</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold mb-3" style={{ color: template?.style?.accent }}>Location</h3>
                      <p className="text-sm" style={{ color: template?.style?.textColor }}>
                        {business?.address ? (
                          <>{business.address}</>
                        ) : (
                          <>123 Main Street<br />Downtown, CA 90210</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="max-w-4xl mx-auto mt-8 pt-8" style={{ borderTopColor: template?.style?.secondary || '#333', borderTopWidth: 1 }}>
                    <p className="text-sm text-center" style={{ color: template?.style?.secondary || '#aaa' }}>
                      Powered by <span style={{ color: template?.style?.accent }} className="font-medium">SalesAPE.ai</span>
                    </p>
                  </div>
                </footer>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Leads drawer */}
      {showLeads && (
        <div className="fixed right-6 top-24 w-96 bg-white dark:bg-gray-800 border rounded shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Leads</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowLeads(false)}>Close</Button>
          </div>
          {leads.length === 0 ? (
            <div className="text-sm text-gray-500">No leads yet.</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto">
              {leads.map(l => (
                <div key={l.id} className="p-2 border rounded">
                  <div className="font-semibold">{l.name} — {l.email}</div>
                  <div className="text-sm text-gray-600">{l.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Fetch business and template when id changes
export default WebsitePreview;