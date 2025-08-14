const express = require('express');
const cors = require('cors');

const app = express();
const allowedOrigins = ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

const users = [];

// Basic routes
app.get('/', (req, res) => res.send('Cologne Social API running'));
app.get('/test', (req, res) => res.send('Test route working!'));

// Signup/Login
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
  if (users.find(u => u.username === username)) return res.status(409).json({ message: 'Username taken' });
  users.push({ username, password, collection: [] });
  res.status(201).json({ message: 'User created successfully' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid username or password' });
  res.status(200).json({ message: 'Login successful' });
});

// Get colognes for a user
app.get('/colognes/:username', (req, res) => {
  const { username } = req.params;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ collection: user.collection.map(c => ({ ...c, owner: username })) });
});

// Add cologne
app.post('/colognes/:username', (req, res) => {
  const { username } = req.params;
  const { name, brand, notes } = req.body;
  if (!name || !brand) return res.status(400).json({ message: 'Name and brand required' });

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const id = Date.now();
  const newCologne = { id, name, brand, notes: notes || '', forTrade: false, forSale: false, price: null, requests: [] };
  user.collection.push(newCologne);
  res.status(201).json({ message: 'Cologne added', cologne: newCologne });
});

// Update cologne
app.put('/colognes/:username/:id', (req, res) => {
  const { username, id } = req.params;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const cologne = user.collection.find(c => c.id === parseInt(id));
  if (!cologne) return res.status(404).json({ message: 'Cologne not found' });

  const { forTrade, forSale, price } = req.body;
  if (forTrade !== undefined) cologne.forTrade = forTrade;
  if (forSale !== undefined) cologne.forSale = forSale;
  if (price !== undefined) cologne.price = price;

  res.json({ message: 'Cologne updated', cologne });
});

// Delete cologne
app.delete('/colognes/:username/:id', (req, res) => {
  const { username, id } = req.params;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const index = user.collection.findIndex(c => c.id === parseInt(id));
  if (index === -1) return res.status(404).json({ message: 'Cologne not found' });

  user.collection.splice(index, 1);
  res.json({ message: 'Cologne deleted' });
});

// REQUEST ROUTE (Buy/Trade)
app.post('/colognes/:username/:id/request', (req, res) => {
  const { username, id } = req.params;
  const { requester, type } = req.body; // 'trade' or 'buy'

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const cologne = user.collection.find(c => c.id === parseInt(id));
  if (!cologne) return res.status(404).json({ message: 'Cologne not found' });

  if (!cologne.requests) cologne.requests = [];
  cologne.requests.push({ requester, type, status: 'pending' });

  res.json({ message: 'Request sent', cologne });
});

// Get all requests for a user
app.get('/requests/:username', (req, res) => {
  const { username } = req.params;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const requests = [];
  user.collection.forEach(c => {
    if (c.requests && c.requests.length > 0) {
      c.requests.forEach(r => {
        requests.push({
          id: `${c.id}-${r.requester}`,
          cologneId: c.id,
          cologneName: c.name,
          requester: r.requester,
          type: r.type,
          status: r.status
        });
      });
    }
  });

  res.json({ requests });
});

// Accept request
app.put('/requests/:reqId/accept', (req, res) => {
  const [cologneIdStr, requester] = req.params.reqId.split('-');
  const cologneId = parseInt(cologneIdStr);

  let found = false;
  users.forEach(user => {
    const cologne = user.collection.find(c => c.id === cologneId);
    if (cologne && cologne.requests) {
      const r = cologne.requests.find(req => req.requester === requester);
      if (r) {
        r.status = 'accepted';
        found = true;
      }
    }
  });

  if (!found) return res.status(404).json({ message: 'Request not found' });
  res.json({ message: 'Request accepted' });
});

// Decline request
app.put('/requests/:reqId/decline', (req, res) => {
  const [cologneIdStr, requester] = req.params.reqId.split('-');
  const cologneId = parseInt(cologneIdStr);

  let found = false;
  users.forEach(user => {
    const cologne = user.collection.find(c => c.id === cologneId);
    if (cologne && cologne.requests) {
      const r = cologne.requests.find(req => req.requester === requester);
      if (r) {
        r.status = 'declined';
        found = true;
      }
    }
  });

  if (!found) return res.status(404).json({ message: 'Request not found' });
  res.json({ message: 'Request declined' });
});

const PORT = 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));