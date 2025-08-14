import React, { useState, useEffect } from 'react';
import './App.css';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import CologneList from './components/CologneList';
import AddCologneForm from './components/AddCologneForm';

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(true);
  const [colognes, setColognes] = useState([]);
  const [viewUsername, setViewUsername] = useState('');
  const [viewColognes, setViewColognes] = useState([]);
  const [requests, setRequests] = useState([]); // Incoming requests

  // Fetch user's colognes and requests
  useEffect(() => {
    if (user) {
      fetchUserColognes(user);
      fetchUserRequests(user);
    }
  }, [user]);

  const fetchUserColognes = async (username) => {
    const res = await fetch(`http://localhost:5050/colognes/${username}`);
    if (res.ok) {
      const data = await res.json();
      setColognes(data.collection || []);
    }
  };

  const fetchUserRequests = async (username) => {
    const res = await fetch(`http://localhost:5050/requests/${username}`);
    if (res.ok) {
      const data = await res.json();
      setRequests(data.requests || []);
    }
  };

  const handleAddCologne = (newCologne) => setColognes(prev => [...prev, newCologne]);

  const handleDeleteCologne = async (id) => {
    const res = await fetch(`http://localhost:5050/colognes/${user}/${id}`, { method: 'DELETE' });
    if (res.ok) setColognes(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateCologne = async (id, updatedFields) => {
    const res = await fetch(`http://localhost:5050/colognes/${user}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    });
    if (res.ok) {
      const data = await res.json();
      setColognes(prev => prev.map(c => c.id === id ? data.cologne : c));
    }
  };

  const handleViewColognes = async () => {
    if (!viewUsername) return;
    const res = await fetch(`http://localhost:5050/colognes/${viewUsername}`);
    if (res.ok) {
      const data = await res.json();
      const colognesWithOwner = (data.collection || []).map(c => ({ ...c, owner: viewUsername }));
      setViewColognes(colognesWithOwner);
    } else {
      setViewColognes([]);
      alert('User not found');
    }
  };

  // Fixed handleTradeOrBuy
  const handleTradeOrBuy = async (cologne, type) => {
    try {
      const res = await fetch(`http://localhost:5050/colognes/${cologne.owner}/${cologne.id}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester: user, type })
      });

      if (res.ok) {
        alert(`Request to ${type} sent!`);
      } else {
        const errorText = await res.text();
        alert(`Failed to send request: ${errorText}`);
      }
    } catch (err) {
      alert(`Failed to send request: ${err.message}`);
    }
  };

  const handleAcceptRequest = async (reqId) => {
    const res = await fetch(`http://localhost:5050/requests/${reqId}/accept`, { method: 'PUT' });
    if (res.ok) setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'accepted' } : r));
  };

  const handleDeclineRequest = async (reqId) => {
    const res = await fetch(`http://localhost:5050/requests/${reqId}/decline`, { method: 'PUT' });
    if (res.ok) setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'declined' } : r));
  };

  return (
    <div className="App">
      <header style={{textAlign: 'center', marginBottom: '30px'}}>
        <h1 style={{color: '#007bff', fontSize: '2.5rem', margin: 0}}>Cologne Social</h1>
        <p style={{color: '#666', fontSize: '1.1rem'}}>Track and share your fragrance collection</p>
      </header>

      {!user ? (
        <div>
          {showSignup ? (
            <>
              <SignupForm onSignup={setUser} />
              <p>Already have an account? <button onClick={() => setShowSignup(false)}>Login</button></p>
            </>
          ) : (
            <>
              <LoginForm onLogin={setUser} />
              <p>Don't have an account? <button onClick={() => setShowSignup(true)}>Signup</button></p>
            </>
          )}
        </div>
      ) : (
        <>
          <h2>Welcome, {user}!</h2>

          <AddCologneForm username={user} onAdd={handleAddCologne} />

          <h3>Your Collection</h3>
          <CologneList 
            colognes={colognes} 
            onDelete={handleDeleteCologne} 
            onUpdate={handleUpdateCologne} 
            isOwner={true} 
          />

          <h3>Incoming Requests</h3>
          {requests.length === 0 ? (
            <p>No requests yet</p>
          ) : (
            <ul>
              {requests.map(req => (
                <li key={req.id} style={{border: '1px solid #ccc', padding: '10px', margin: '5px 0'}}>
                  <strong>{req.requester}</strong> wants to {req.type} your cologne: <em>{req.cologneName}</em>
                  <div>Status: {req.status}</div>
                  {req.status === 'pending' && (
                    <div style={{marginTop: '5px'}}>
                      <button onClick={() => handleAcceptRequest(req.id)}>Accept</button>
                      <button onClick={() => handleDeclineRequest(req.id)}>Decline</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div style={{marginTop: '30px'}}>
            <h2>View Other User's Collection</h2>
            <input 
              placeholder="Enter username" 
              value={viewUsername} 
              onChange={e => setViewUsername(e.target.value)} 
            />
            <button onClick={handleViewColognes}>View</button>

            {viewColognes.length > 0 ? (
              <CologneList 
                colognes={viewColognes} 
                onTradeOrBuy={handleTradeOrBuy} 
                isOwner={false} 
              />
            ) : (
              viewUsername && <p>No colognes found for this user.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;