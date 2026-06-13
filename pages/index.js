import { useState } from 'react';

const COLORS = {
  morning: { bg: '#FFF8E1', border: '#F9A825', icon: '🌅', label: 'Mañana' },
  afternoon: { bg: '#E3F2FD', border: '#1976D2', icon: '☀️', label: 'Tarde' },
  evening: { bg: '#EDE7F6', border: '#7B1FA2', icon: '🌙', label: 'Noche' },
};

function DayCard({ day, data }) {
  const [open, setOpen] = useState(day === 1);
  return (
    <div style={{
      border: '1px solid #e0e0e0', borderRadius: 14, overflow: 'hidden',
      marginBottom: 12, background: '#fff'
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: open ? '#F3E5F5' : '#fafafa',
        border: 'none', cursor: 'pointer'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: '#7B1FA2', color: '#fff', borderRadius: '50%',
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700
          }}>D{day}</span>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{data.title}</span>
        </div>
        <span style={{ fontSize: 20, color: '#7B1FA2' }}>{open ? '⌃' : '⌄'}</span>
      </button>
      {open && (
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['morning', 'afternoon', 'evening'].map(period => {
            const block = data[period];
            if (!block) return null;
            const c = COLORS[period];
            return (
              <div key={period} style={{
                background: c.bg, borderLeft: `4px solid ${c.border}`,
                borderRadius: 10, padding: '12px 14px'
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: c.border, marginBottom: 6 }}>
                  {c.icon} {c.label}
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.6 }}>{block.activity}</p>
                {block.meal && (
                  <div style={{
                    background: '#ffffffcc', borderRadius: 8, padding: '8px 10px', marginTop: 6
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 2 }}>
                      🍽️ ¿Dónde comer?
                    </div>
                    <div style={{ fontSize: 13 }}>{block.meal}</div>
                  </div>
                )}
              </div>
            );
          })}
          {data.tip && (
            <div style={{
              background: '#FFF9C4', borderRadius: 10, padding: '10px 14px',
              display: 'flex', gap: 8
            }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{data.tip}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(5);
  const [itinerary, setItinerary] = useState(null);
  const [tripTitle, setTripTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!destination.trim()) { setError('Ingresa un destino.'); return; }
    setError('');
    setLoading(true);
    setItinerary(null);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, days })
      });
      if (!res.ok) throw new Error('Error en el servidor');
      const data = await res.json();
      setTripTitle(data.tripTitle || `${destination} · ${days} días`);
      setItinerary(data.days);
    } catch (e) {
      setError('Error generando el itinerario. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>✈️ Planificador de Vacaciones</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Dinos a dónde quieres ir y la IA generará tu itinerario perfecto.
      </p>

      <div style={{
        background: '#fff', border: '1px solid #e0e0e0',
        borderRadius: 14, padding: 20
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 6 }}>
              Destino
            </label>
            <input
              type="text" value={destination}
              onChange={e => setDestination(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generate()}
              placeholder="ej: Roma, Tokio, Tenerife..."
              style={{
                width: '100%', padding: '10px 12px', fontSize: 15,
                border: '1px solid #ccc', borderRadius: 8
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 6 }}>
              Días
            </label>
            <input
              type="number" value={days}
              onChange={e => setDays(Math.min(21, Math.max(1, parseInt(e.target.value) || 1)))}
              min={1} max={21}
              style={{
                width: 72, padding: '10px 12px', fontSize: 15,
                border: '1px solid #ccc', borderRadius: 8, textAlign: 'center'
              }}
            />
          </div>
        </div>

        {error && <p style={{ color: '#c0392b', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}

        <button
          onClick={generate}
          disabled={loading}
          style={{
            width: '100%', padding: '11px 0',
            background: loading ? '#ccc' : '#7B1FA2',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generando...' : '🗺️ Planificar mis vacaciones'}
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: 16 }}>
          <div style={{
            width: 48, height: 48,
            border: '4px solid #e0e0e0', borderTop: '4px solid #7B1FA2',
            borderRadius: '50%', animation: 'spin 0.9s linear infinite'
          }} />
          <p style={{ color: '#888' }}>Generando tu itinerario...</p>
        </div>
      )}

      {itinerary && !loading && (
        <div style={{ marginTop: 28 }}>
          <div style={{
            background: 'linear-gradient(135deg, #7B1FA2 0%, #4527A0 100%)',
            borderRadius: 14, padding: '20px 22px', marginBottom: 20, color: '#fff'
          }}>
            <div style={{ fontSize: 12, color: '#CE93D8', fontWeight: 500, marginBottom: 4 }}>
              TU ITINERARIO
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{tripTitle}</div>
          </div>

          {itinerary.map(d => <DayCard key={d.day} day={d.day} data={d} />)}

          <button
            onClick={() => { setItinerary(null); setDestination(''); }}
            style={{
              marginTop: 8, width: '100%', padding: '10px 0',
              background: 'transparent', border: '1px solid #ccc',
              borderRadius: 10, fontSize: 14, color: '#666', cursor: 'pointer'
            }}
          >
            Planificar otro viaje
          </button>
        </div>
      )}
    </div>
  );
}