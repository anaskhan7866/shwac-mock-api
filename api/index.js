// SHWAC Mock API - Zero dependencies (pure Node.js)
// Works on Vercel Serverless & standalone (node api/index.js)

const http = require('http');

// In-memory data store for live demo interaction
let addresses = [
  {
    id: 201,
    label: 'Home',
    line1: 'Flat 402, Royal Palms, Civil Lines',
    line2: 'Near Gandhi Circle',
    landmark: 'Opposite State Bank',
    city: 'Jaipur',
    state_code: '08',
    pincode: '302001',
    is_default: true
  }
];

let products = [
  {
    id: 101,
    brand: 'Kent',
    product_name: 'Grand Plus RO + UV + UF',
    serial_no: 'KG-2024-89765',
    warranty_until: '2027-04-15'
  }
];

let bookings = [
  {
    id: 401,
    number: 'BK-2026-015',
    status: 'confirmed',
    scheduled_date: '2026-10-26',
    time_slot: '12:00 PM - 03:00 PM',
    service: {
      id: 1,
      name: 'Complete RO Service & Deep Cleaning'
    },
    jobs: [
      {
        id: 401,
        technician: {
          id: 2,
          name: 'Ramesh Kumar'
        }
      }
    ]
  }
];

let complaints = [
  {
    id: 301,
    number: 'CMP-2026-0089',
    subject: 'Low flow / slow water filling',
    status: 'en_route',
    category: 'low_flow',
    created_at: '2026-10-25T09:30:00.000Z',
    sla_resolution_due_at: '2026-10-25T18:00:00.000Z',
    assignee: {
      id: 2,
      name: 'Ramesh Kumar',
      phone: '9876501234'
    },
    updates: [
      {
        body: 'Complaint registered. Ticket assigned to Ramesh Kumar',
        created_at: '2026-10-25T09:35:00.000Z',
        type: 'assignment'
      }
    ],
    jobs: [
      {
        id: 401,
        status_logs: [
          {
            to_status: 'en_route',
            created_at: '2026-10-25T10:15:00.000Z'
          }
        ]
      }
    ]
  }
];

const catalog = {
  time_slots: ['09:00 AM - 12:00 PM', '12:00 PM - 03:00 PM', '03:00 PM - 06:00 PM', '06:00 PM - 08:00 PM'],
  categories: [
    {
      id: 1,
      name: 'RO Water Purifier Services',
      services: [
        {
          id: 1,
          name: 'Complete RO Service & Deep Cleaning',
          price: 499,
          price_incl_tax: 588.82,
          tax_rate: 18,
          duration_minutes: 45,
          description: 'Full sanitization, sediment & carbon filter flushing, TDS check, and tube leakage test.',
          form_schema: [
            {
              key: 'tds_level',
              label: 'Approximate Raw Water TDS (if known)',
              type: 'select',
              options: ['Below 300 ppm', '300 - 800 ppm', 'Above 800 ppm (Borewell)', 'Not sure'],
              required: false
            },
            {
              key: 'purifier_age',
              label: 'Age of Purifier',
              type: 'select',
              options: ['Less than 1 year', '1 - 3 years', 'More than 3 years'],
              required: false
            }
          ]
        },
        {
          id: 2,
          name: 'RO Filter & Membrane Replacement',
          price: 1499,
          price_incl_tax: 1768.82,
          tax_rate: 18,
          duration_minutes: 60,
          description: 'Genuine RO membrane + active carbon + sediment filter replacement with 6 months warranty.',
          form_schema: []
        },
        {
          id: 3,
          name: 'RO Installation / Uninstallation',
          price: 399,
          price_incl_tax: 470.82,
          tax_rate: 18,
          duration_minutes: 40,
          description: 'Professional wall mounting, inlet valve connection, pre-filter fitting and TDS calibration.',
          form_schema: []
        }
      ]
    },
    {
      id: 2,
      name: 'Annual Maintenance Contracts (AMC)',
      services: [
        {
          id: 4,
          name: 'Comprehensive AMC (1 Year)',
          price: 2999,
          price_incl_tax: 3538.82,
          tax_rate: 18,
          duration_minutes: 60,
          description: 'Includes 3 routine services, free filter replacements, electrical parts cover, and unlimited breakdown visits.',
          form_schema: []
        }
      ]
    }
  ]
};

const invoices = [
  {
    id: 501,
    number: 'INV-2026-0042',
    status: 'issued',
    invoice_date: '2026-10-24',
    due_date: '2026-10-31',
    subtotal: 1200,
    tax_amount: 216,
    total: 1416,
    balance_due: 1416,
    supply_type: 'intra',
    upi_intent: 'upi://pay?pa=shwac@okaxis&pn=Shree%20Hargangeshwar%20Water%20Care&am=1416.00&tr=INV0042&cu=INR',
    items: [
      { description: 'Complete RO Service & Deep Cleaning', quantity: 1, unit_price: 499, tax_rate: 18, total: 588.82 },
      { description: 'Sediment Filter Replacement', quantity: 1, unit_price: 701, tax_rate: 18, total: 827.18 }
    ],
    payments: []
  }
];

// Technician sample jobs
let techJobs = [
  {
    id: 601,
    number: 'JOB-2026-0158',
    status: 'assigned',
    scheduled_date: '2026-10-25',
    time_slot: '12:00 PM - 03:00 PM',
    distance_km: 2.4,
    customer: { id: 1, name: 'Demo Customer', phone: '9876543210' },
    address: {
      line1: 'Flat 402, Royal Palms, Civil Lines',
      city: 'Jaipur',
      pincode: '302001',
      lat: 26.9124,
      lng: 75.7873
    },
    service: { id: 1, name: 'Complete RO Service & Deep Cleaning' },
    branch: { id: 1, name: 'Jaipur Central', state_code: '08' },
    messages: []
  }
];

// Helper to parse JSON body
function getBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (_) {
        resolve({});
      }
    });
  });
}

// Main handler
async function handler(req, res) {
  // Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Idempotency-Key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '');
  const method = req.method.toUpperCase();
  const body = await getBody(req);

  function json(data, status = 200) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  }

  // --- Auth Endpoints ---
  if (pathname === '/api/v1/auth/otp/request' && method === 'POST') {
    return json({ message: 'OTP sent on WhatsApp.', code: '123456', expires_in: 300 });
  }

  if (pathname === '/api/v1/auth/otp/verify' && method === 'POST') {
    const phone = body.phone || '9876543210';
    const name = body.name || 'Demo Customer';
    return json({
      token: 'shwac_demo_token_123456',
      user: {
        id: 1,
        name: name,
        phone: phone,
        email: 'customer@shwacindia.com',
        user_type: 'customer',
        customer_id: 1
      }
    });
  }

  if (pathname === '/api/v1/auth/login' && method === 'POST') {
    return json({
      token: 'shwac_tech_token_123456',
      user: {
        id: 2,
        name: 'Ramesh Kumar (Technician)',
        phone: '9876501234',
        email: 'tech@shwacindia.com',
        user_type: 'technician'
      }
    });
  }

  if (pathname === '/api/v1/auth/me' && method === 'GET') {
    return json({
      id: 1,
      name: 'Demo Customer',
      phone: '9876543210',
      user_type: 'customer',
      customer_id: 1
    });
  }

  if (pathname === '/api/v1/auth/logout' && method === 'POST') {
    return json({ message: 'Logged out.' });
  }

  // --- Catalog ---
  if (pathname === '/api/v1/catalog' && method === 'GET') {
    return json(catalog);
  }

  const serviceMatch = pathname.match(/^\/api\/v1\/catalog\/services\/(\d+)$/);
  if (serviceMatch && method === 'GET') {
    const id = parseInt(serviceMatch[1], 10);
    for (const cat of catalog.categories) {
      const s = cat.services.find((x) => x.id === id);
      if (s) return json(s);
    }
    return json(catalog.categories[0].services[0]);
  }

  // --- Customer Profile ---
  if (pathname === '/api/v1/customer/profile') {
    if (method === 'GET') {
      return json({
        id: 1,
        name: 'Demo Customer',
        phone: '9876543210',
        email: 'customer@shwacindia.com',
        whatsapp_opt_in: true,
        products: products,
        addresses: addresses
      });
    }
    if (method === 'PATCH') {
      return json({ message: 'Profile updated successfully.' });
    }
  }

  if (pathname === '/api/v1/customer/addresses' && method === 'POST') {
    const newAddr = {
      id: Date.now(),
      label: body.label || 'Home',
      line1: body.line1 || 'Main Street',
      line2: body.line2 || '',
      landmark: body.landmark || '',
      city: body.city || 'Jaipur',
      state_code: body.state_code || '08',
      pincode: body.pincode || '302001',
      is_default: false
    };
    addresses.push(newAddr);
    return json(newAddr, 201);
  }

  if (pathname === '/api/v1/customer/products' && method === 'POST') {
    const newProd = {
      id: Date.now(),
      brand: body.brand || 'Kent',
      product_name: body.product_name || 'RO Purifier',
      serial_no: body.serial_no || '',
      warranty_until: body.warranty_until || '2027-01-01'
    };
    products.push(newProd);
    return json(newProd, 201);
  }

  // --- Bookings ---
  if (pathname === '/api/v1/customer/bookings') {
    if (method === 'GET') {
      return json({ data: bookings });
    }
    if (method === 'POST') {
      const sId = body.service_id || 1;
      let sName = 'RO Service';
      for (const cat of catalog.categories) {
        const found = cat.services.find((x) => x.id === sId);
        if (found) sName = found.name;
      }
      const newBooking = {
        id: Date.now(),
        number: `BK-2026-0${bookings.length + 16}`,
        status: 'confirmed',
        scheduled_date: body.scheduled_date || '2026-10-27',
        time_slot: body.time_slot || '10:00 AM - 01:00 PM',
        service: { id: sId, name: sName },
        jobs: [{ id: 402, technician: { id: 2, name: 'Ramesh Kumar' } }]
      };
      bookings.unshift(newBooking);
      return json(newBooking, 201);
    }
  }

  const bookingDetailMatch = pathname.match(/^\/api\/v1\/customer\/bookings\/(\d+)$/);
  if (bookingDetailMatch && method === 'GET') {
    const id = parseInt(bookingDetailMatch[1], 10);
    const b = bookings.find((x) => x.id === id) || bookings[0];
    return json(b);
  }

  const bookingCancelMatch = pathname.match(/^\/api\/v1\/customer\/bookings\/(\d+)\/cancel$/);
  if (bookingCancelMatch && method === 'POST') {
    const id = parseInt(bookingCancelMatch[1], 10);
    const b = bookings.find((x) => x.id === id);
    if (b) b.status = 'cancelled';
    return json({ message: 'Booking cancelled.' });
  }

  // --- Complaints ---
  if (pathname === '/api/v1/customer/complaints') {
    if (method === 'GET') {
      return json({ data: complaints });
    }
    if (method === 'POST') {
      const newCmp = {
        id: Date.now(),
        number: `CMP-2026-00${complaints.length + 90}`,
        subject: body.subject || 'Water leakage issue',
        status: 'open',
        category: body.category || 'leakage',
        created_at: new Date().toISOString(),
        sla_resolution_due_at: new Date(Date.now() + 86400000).toISOString(),
        assignee: { id: 2, name: 'Ramesh Kumar', phone: '9876501234' },
        updates: [{ body: 'Complaint registered. We are assigning a technician.', created_at: new Date().toISOString(), type: 'system' }],
        jobs: []
      };
      complaints.unshift(newCmp);
      return json(newCmp, 201);
    }
  }

  const complaintDetailMatch = pathname.match(/^\/api\/v1\/customer\/complaints\/(\d+)$/);
  if (complaintDetailMatch && method === 'GET') {
    const id = parseInt(complaintDetailMatch[1], 10);
    const c = complaints.find((x) => x.id === id) || complaints[0];
    return json(c);
  }

  const complaintCommentMatch = pathname.match(/^\/api\/v1\/customer\/complaints\/(\d+)\/comments$/);
  if (complaintCommentMatch && method === 'POST') {
    const id = parseInt(complaintCommentMatch[1], 10);
    const c = complaints.find((x) => x.id === id) || complaints[0];
    c.updates.push({ body: body.body || 'Message received', created_at: new Date().toISOString(), type: 'customer' });
    return json(c);
  }

  // --- Invoices ---
  if (pathname === '/api/v1/customer/invoices' && method === 'GET') {
    return json({ data: invoices });
  }

  const invoiceDetailMatch = pathname.match(/^\/api\/v1\/customer\/invoices\/(\d+)$/);
  if (invoiceDetailMatch && method === 'GET') {
    const id = parseInt(invoiceDetailMatch[1], 10);
    const inv = invoices.find((x) => x.id === id) || invoices[0];
    return json(inv);
  }

  const invoiceUpiClaimMatch = pathname.match(/^\/api\/v1\/customer\/invoices\/(\d+)\/upi-claim$/);
  if (invoiceUpiClaimMatch && method === 'POST') {
    return json({ message: 'Payment reference submitted. We will verify and update receipt.' });
  }

  const invoicePayLinkMatch = pathname.match(/^\/api\/v1\/customer\/invoices\/(\d+)\/payment-link$/);
  if (invoicePayLinkMatch && method === 'POST') {
    return json({ short_url: 'https://shwacindia.com' });
  }

  // --- Technician Endpoints ---
  if (pathname === '/api/v1/technician/today' && method === 'GET') {
    return json({
      attendance: { check_in_at: '2026-10-25T09:00:00Z', check_out_at: null },
      location_consent: true,
      jobs: { active: techJobs.length, completed_today: 1 },
      expenses_today: 150
    });
  }

  if (pathname === '/api/v1/technician/consent' && method === 'POST') {
    return json({ message: 'Consent recorded.' });
  }

  if (pathname === '/api/v1/technician/jobs' && method === 'GET') {
    return json({ data: techJobs, route_total_km: 7.8 });
  }

  const techJobMatch = pathname.match(/^\/api\/v1\/technician\/jobs\/(\d+)$/);
  if (techJobMatch && method === 'GET') {
    const id = parseInt(techJobMatch[1], 10);
    const j = techJobs.find((x) => x.id === id) || techJobs[0];
    return json(j);
  }

  if (pathname.match(/^\/api\/v1\/technician\/jobs\/\d+\/status$/) && method === 'POST') {
    const to = body.status || 'in_progress';
    techJobs[0].status = to;
    return json({ ...techJobs[0], status: to });
  }

  if (pathname === '/api/v1/technician/van' && method === 'GET') {
    return json({
      items: [
        { quantity: '4.00', product: { id: 1, name: 'Sediment Filter 10"', sku: 'FLT-SED-10', sale_price: 350, tax_rate: 18, van_min_level: 2 } },
        { quantity: '3.00', product: { id: 2, name: 'Pre-Carbon Block 10"', sku: 'FLT-CARB-10', sale_price: 450, tax_rate: 18, van_min_level: 2 } },
        { quantity: '2.00', product: { id: 3, name: 'RO Membrane 75 GPD', sku: 'MEM-RO-75', sale_price: 1450, tax_rate: 18, van_min_level: 1 } },
        { quantity: '6.00', product: { id: 4, name: 'RO Elbow Connector 1/4"', sku: 'FIT-ELB-14', sale_price: 40, tax_rate: 18, van_min_level: 5 } }
      ]
    });
  }

  if (pathname === '/api/v1/technician/attendance' && method === 'GET') {
    return json({
      data: [
        { date: '2026-10-25', check_in_at: '2026-10-25T09:00:00Z', check_out_at: null, worked_minutes: 270 },
        { date: '2026-10-24', check_in_at: '2026-10-24T08:55:00Z', check_out_at: '2026-10-24T18:10:00Z', worked_minutes: 555 }
      ]
    });
  }

  if (pathname === '/api/v1/technician/expenses') {
    if (method === 'GET') {
      return json({
        data: [{ id: 1, category: 'fuel', amount: 150, date: '2026-10-25', description: 'Petrol for bike', status: 'approved' }]
      });
    }
    if (method === 'POST') {
      return json({ id: Date.now(), category: body.category || 'other', amount: body.amount || 100, status: 'pending' }, 201);
    }
  }

  if (pathname === '/api/v1/technician/location' && method === 'POST') {
    return json({ message: 'Pings saved.' });
  }

  if (pathname === '/api/v1/technician/attendance/check-in' && method === 'POST') {
    return json({ message: 'Checked in.' });
  }

  if (pathname === '/api/v1/technician/attendance/check-out' && method === 'POST') {
    return json({ message: 'Checked out.' });
  }

  // Fallback for root / health check
  if (pathname === '/' || pathname === '/api' || pathname === '/api/v1') {
    return json({
      status: 'online',
      message: 'SHWAC Mock API is running',
      version: '1.0.0',
      routes: [
        '/api/v1/catalog',
        '/api/v1/customer/profile',
        '/api/v1/customer/bookings',
        '/api/v1/customer/complaints',
        '/api/v1/customer/invoices'
      ]
    });
  }

  return json({ message: `Route ${method} ${pathname} not found.` }, 404);
}

// Export for Vercel
module.exports = handler;

// Standalone mode: run with "node api/index.js"
if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  const server = http.createServer(handler);
  server.listen(PORT, () => {
    console.log(`\n🚀 SHWAC Mock API listening on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/v1`);
    console.log(`📱 Test catalog: http://localhost:${PORT}/api/v1/catalog\n`);
  });
}
