import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

interface Business {
  id: string;
  name: string;
  url: string;
  description?: string;
  logo?: string;
  createdAt: string;
  publishedUrl?: string;
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

interface Booking {
  id: string;
  businessId: string;
  name: string;
  email: string;
  date: string;
  time: string;
  createdAt: string;
}

const businesses: Business[] = [];
const leads: Lead[] = [];
const bookings: Booking[] = [];

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  auth: {
    user: process.env.EMAIL_USER || 'test',
    pass: process.env.EMAIL_PASS || 'test',
  },
});

const sendEmailNotification = async (lead: Lead, business: Business) => {
  try {
    if (process.env.EMAIL_ENABLED === 'true') {
      await transporter.sendMail({
        from: 'leads@salesape.com',
        to: process.env.ADMIN_EMAIL || 'admin@salesape.com',
        subject: `New Lead for ${business.name}: ${lead.name}`,
        html: `
          <h2>New Lead Received</h2>
          <p><strong>Business:</strong> ${business.name}</p>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
          ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ''}
          ${lead.message ? `<p><strong>Message:</strong> ${lead.message}</p>` : ''}
          <p><strong>Received:</strong> ${new Date(lead.createdAt).toLocaleString()}</p>
        `,
      });
    }
  } catch (err) {
    console.log(`[DEV] Email notification for ${lead.email} from ${business.name}`);
  }
};

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Create Business endpoint
app.post('/businesses', (req, res) => {
  const { url, name, description } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Website or Instagram URL is required' });
  }

  const business: Business = {
    id: Date.now().toString(),
    name: name || 'My Business',
    url,
    description,
    createdAt: new Date().toISOString(),
    publishedUrl: `//${Date.now().toString()}.localhost:3000/website`,
  };

  businesses.push(business);
  console.log(`[Business Created] ID: ${business.id}, Name: ${business.name}`);
  res.status(201).json(business);
});

// Get Business by ID
app.get('/businesses/:id', (req, res) => {
  console.log(`[Business Lookup] ID: ${req.params.id}, Total businesses: ${businesses.length}`);
  const business = businesses.find(b => b.id === req.params.id);
  if (!business) {
    console.log(`[Business Lookup] NOT FOUND - Available IDs: ${businesses.map(b => b.id).join(', ')}`);
    return res.status(404).json({ error: 'Business not found' });
  }
  console.log(`[Business Lookup] FOUND - ${business.name}`);
  res.json(business);
});

// Get all Businesses
app.get('/businesses', (_req, res) => {
  res.json(businesses);
});

// Create Lead for a Business
app.post('/businesses/:businessId/leads', async (req, res) => {
  const { businessId } = req.params;
  const { name, email, company, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const business = businesses.find(b => b.id === businessId);
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  const lead: Lead = {
    id: Date.now().toString(),
    businessId,
    name,
    email,
    company,
    message,
    createdAt: new Date().toISOString(),
  };

  leads.push(lead);
  await sendEmailNotification(lead, business);

  res.status(201).json(lead);
});

// Get Leads for a Business
app.get('/businesses/:businessId/leads', (req, res) => {
  const { businessId } = req.params;
  const businessLeads = leads.filter(l => l.businessId === businessId);
  res.json(businessLeads);
});

// Create Booking endpoint
app.post('/businesses/:businessId/bookings', (req, res) => {
  const { businessId } = req.params;
  const { name, email, date, time } = req.body;

  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Name, email, date, and time are required' });
  }

  const business = businesses.find(b => b.id === businessId);
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  const booking: Booking = {
    id: Date.now().toString(),
    businessId,
    name,
    email,
    date,
    time,
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

// Get Bookings for a Business
app.get('/businesses/:businessId/bookings', (req, res) => {
  const { businessId } = req.params;
  const businessBookings = bookings.filter(b => b.businessId === businessId);
  res.json(businessBookings);
});

// Legacy /leads endpoint for backward compatibility
app.post('/leads', async (req, res) => {
  const { name, email, company, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const lead: Lead = {
    id: Date.now().toString(),
    businessId: 'default',
    name,
    email,
    company,
    message,
    createdAt: new Date().toISOString(),
  };

  leads.push(lead);
  res.status(201).json(lead);
});

app.get('/leads', (_req, res) => {
  res.json(leads);
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Server is ready for connections');
});

server.on('error', (err: any) => {
  console.error('Server error:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
