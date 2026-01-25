import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  message?: string;
  createdAt: string;
}

const leads: Lead[] = [];

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/leads', (req, res) => {
  const { name, email, company, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const lead: Lead = {
    id: Date.now().toString(),
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
