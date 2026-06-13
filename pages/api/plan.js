export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination, days } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY no configurada');
    return res.status(500).json({ error: 'API key no configurada' });
  }

  const prompt = `Eres un experto planificador de viajes. Crea un itinerario detallado y emocionante para un viaje a "${destination}" de ${days} día(s).

El viajero quiere un mix de turismo cultural, aventura/naturaleza, gastronomía y relax.

Responde ÚNICAMENTE con un JSON válido, sin backticks ni texto adicional, con este formato exacto:
{
  "tripTitle": "Título inspirador del viaje",
  "days": [
    {
      "day": 1,
      "title": "Título del día",
      "morning": {
        "activity": "Descripción detallada de qué hacer en la mañana",
        "meal": "Nombre y tipo de restaurante para desayunar/almorzar"
      },
      "afternoon": {
        "activity": "Descripción detallada de actividad de tarde",
        "meal": "Sugerencia de almuerzo o merienda"
      },
      "evening": {
        "activity": "Descripción de la actividad nocturna",
        "meal": "Recomendación de cena"
      },
      "tip": "Consejo local o dato curioso"
    }
  ]
}

Genera exactamente ${days} día(s). Usa nombres reales de lugares de ${destination}.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const rawText = await response.text();
    console.log('Status Anthropic:', response.status);
    console.log('Respuesta cruda:', rawText.substring(0, 500));

    if (!response.ok) {
      return res.status(500).json({ 
        error: 'Error en API de Anthropic',
        detail: rawText.substring(0, 300)
      });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error('No se pudo parsear respuesta de Anthropic:', rawText);
      return res.status(500).json({ error: 'Respuesta inválida de la API' });
    }

    const raw = data.content?.find(b => b.type === 'text')?.text || '';
    if (!raw) {
      console.error('Respuesta sin contenido de texto:', data);
      return res.status(500).json({ error: 'Sin contenido en la respuesta' });
    }

    const clean = raw.replace(/```json|```/g, '').trim();
    
    try {
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch (e) {
      console.error('Error parseando JSON del modelo:', clean.substring(0, 500));
      return res.status(500).json({ error: 'El modelo no devolvió JSON válido' });
    }
  } catch (e) {
    console.error('Error general:', e);
    return res.status(500).json({ error: 'Error generando itinerario', detail: e.message });
  }
}
