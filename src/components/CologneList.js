import React, { useState } from 'react';

export default function CologneList({ colognes, onDelete, onUpdate, onTradeOrBuy, isOwner }) {
  const [editingId, setEditingId] = useState(null);
  const [editForTrade, setEditForTrade] = useState(false);
  const [editForSale, setEditForSale] = useState(false);
  const [editPrice, setEditPrice] = useState('');

  if (colognes.length === 0) return <p>No colognes in this collection.</p>;

  return (
    <ul>
      {colognes.map(cologne => (
        <li key={cologne.id} style={{marginBottom: '15px'}}>
          <div>
            <strong>{cologne.name}</strong> by {cologne.brand}
            {cologne.notes && <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>Notes: {cologne.notes}</div>}
            {cologne.forTrade && <div style={{ fontSize: '12px', color: '#28a745' }}>Available for Trade</div>}
            {cologne.forSale && <div style={{ fontSize: '12px', color: '#007bff' }}>For Sale: ${cologne.price}</div>}
          </div>

          {isOwner ? (
            editingId === cologne.id ? (
              <div style={{ marginTop: '5px' }}>
                <label>
                  <input type="checkbox" checked={editForTrade} onChange={e => setEditForTrade(e.target.checked)} />
                  For Trade
                </label>
                <label>
                  <input type="checkbox" checked={editForSale} onChange={e => setEditForSale(e.target.checked)} />
                  For Sale
                </label>
                {editForSale && (
                  <input
                    type="number"
                    placeholder="Price"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                  />
                )}
                <button onClick={() => {
                  onUpdate(cologne.id, { forTrade: editForTrade, forSale: editForSale, price: editPrice || null });
                  setEditingId(null);
                }}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <div style={{ marginTop: '5px' }}>
                <button onClick={() => {
                  setEditingId(cologne.id);
                  setEditForTrade(cologne.forTrade);
                  setEditForSale(cologne.forSale);
                  setEditPrice(cologne.price || '');
                }}>Edit</button>
                <button onClick={() => onDelete(cologne.id)}>Delete</button>
              </div>
            )
          ) : (
            // Viewing another user's colognes
            (cologne.forTrade || cologne.forSale) && (
              <button style={{ marginTop: '5px' }} onClick={() => onTradeOrBuy(cologne)}>
                {cologne.forTrade ? 'Request Trade' : 'Buy'}
              </button>
            )
          )}
        </li>
      ))}
    </ul>
  );
}
