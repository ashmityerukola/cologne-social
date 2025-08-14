import React, { useState } from 'react';

export default function AddCologneForm({ username, onAdd }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const res = await fetch(`http://localhost:5050/colognes/${username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name, brand, notes }),
    });
  
    const data = await res.json();
  
    if (res.ok) {
      alert('Cologne added!');
      onAdd(data.cologne); // Update parent state with new cologne
      setName('');
      setBrand('');
      setNotes('');
    } else {
      alert(data.message);
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add New Cologne</h3>
      <input
        placeholder="Cologne Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        placeholder="Brand"
        value={brand}
        onChange={e => setBrand(e.target.value)}
        required
      />
      <input
        placeholder="Notes"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <button type="submit">Add Cologne</button>
    </form>
  );
}
