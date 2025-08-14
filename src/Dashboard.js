import React, { useState, useEffect } from 'react';
import CologneList from './CologneList';

export default function Dashboard({ username }) {
  const [colognes, setColognes] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5050/colognes/${username}`)
      .then(res => res.json())
      .then(data => setColognes(data))
      .catch(err => console.error(err));
  }, [username]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5050/colognes/${username}/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');

      // Remove deleted cologne from state without refresh
      setColognes(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>{username}'s Cologne Collection</h2>
      <CologneList colognes={colognes} onDelete={handleDelete} />
    </div>
  );
}
