// ====================================
// IMPORTACIONES
// ====================================
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

// ====================================
// INICIALIZACIÓN
// ====================================
const app = express();
const PORT = process.env.PORT || 3000;

//  MODO DEMO: Si no hay API key o DEMO_MODE=true, usa simulación
const DEMO_MODE = !process.env.GROQ_API_KEY || process.env.DEMO_MODE === 'true';

// Debug
console.log(' Configuración:');
console.log('  Groq API Key:', process.env.GROQ_API_KEY ? ' Configurada' : ' No configurada');
console.log('  DEMO_MODE variable:', process.env.DEMO_MODE);
console.log('  DEMO_MODE activo:', DEMO_MODE);

const groq = DEMO_MODE ? null : new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ====================================
// MIDDLEWARES
// ====================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// ====================================
// TIPOS DE DATOS
// ====================================
interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface AnalyzeRequest {
  transactions: Transaction[];
}

// ====================================
// RUTA PRINCIPAL - TEST
// ====================================
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: ' FinAI Server is running!',
    status: 'OK',
    mode: DEMO_MODE ? 'demo' : 'groq',
    timestamp: new Date().toISOString()
  });
});

// ====================================
// RUTA DE ANÁLISIS CON IA
// ====================================
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { transactions } = req.body as AnalyzeRequest;

    console.log(' Analizando transacciones:', transactions.length);

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({ 
        error: 'No se enviaron transacciones para analizar' 
      });
    }

    const prompt = `
Eres un asesor financiero experto. Analiza estas transacciones y proporciona:

TRANSACCIONES:
${transactions.map(t => `- ${t.description}: $${t.amount} (${t.category})`).join('\n')}

INSTRUCCIONES:
1. Identifica patrones de gasto
2. Detecta suscripciones duplicadas o innecesarias
3. Calcula el total gastado
4. Sugiere 4 insights accionables (máximo 100 caracteres cada uno)
5. Identifica áreas donde se puede ahorrar

FORMATO DE RESPUESTA (JSON estricto):
{
  "totalSpent": "número como string",
  "subscriptions": número de suscripciones encontradas,
  "subscriptionCost": "costo total de suscripciones como string",
  "predictions": {
    "nextMonth": "predicción del gasto del próximo mes",
    "savings": "ahorro potencial estimado"
  },
  "insights": [
    "insight 1",
    "insight 2",
    "insight 3",
    "insight 4"
  ],
  "duplicates": [
    {
      "name": "Nombre del grupo de servicios duplicados",
      "count": número de servicios,
      "saving": ahorro potencial en número
    }
  ]
}

RESPONDE ÚNICAMENTE CON EL JSON, SIN TEXTO ADICIONAL.
`;

    let aiResponse: string;
    let tokensUsed = 0;

    //  MODO DEMO - Análisis simulado inteligente
    if (DEMO_MODE) {
      console.log(' MODO DEMO - Generando análisis simulado...');
      
      const subscriptions = transactions.filter(t => t.category === 'Suscripción');
      const totalSpent = Math.abs(transactions.reduce((sum, t) => sum + t.amount, 0));
      const subscriptionCost = Math.abs(subscriptions.reduce((sum, t) => sum + t.amount, 0));
      
      aiResponse = JSON.stringify({
        totalSpent: totalSpent.toFixed(2),
        subscriptions: subscriptions.length,
        subscriptionCost: subscriptionCost.toFixed(2),
        predictions: {
          nextMonth: (totalSpent * 1.05).toFixed(2),
          savings: (subscriptionCost * 0.4).toFixed(2)
        },
        insights: [
          ` Detecté ${subscriptions.length} suscripciones activas por $${subscriptionCost.toFixed(2)}/mes`,
          ` Podrías ahorrar ${((subscriptionCost * 0.4 / totalSpent) * 100).toFixed(0)}% cancelando servicios que no usas`,
          ` Tu gasto mensual proyectado es $${(totalSpent * 1.05).toFixed(2)} si continúas así`,
          ` Recomiendo revisar suscripciones duplicadas de streaming y música`
        ],
        duplicates: [
          {
            name: subscriptions.length > 2 ? 'Servicios de Streaming' : 'Suscripciones',
            count: subscriptions.length,
            saving: parseFloat((subscriptionCost * 0.4).toFixed(2))
          }
        ]
      });
      tokensUsed = 0;
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } else {
      //  MODO REAL - GROQ (Llama 3.1)
      console.log(' Enviando a Groq (Llama 3.1)...');
      
      const completion = await groq!.chat.completions.create({
        model: "llama-3.3-70b-versatile", //  Modelo actualizado (Enero 2026)
        messages: [
          {
            role: "system",
            content: "Eres un asesor financiero experto. Siempre respondes en JSON válido sin markdown ni texto adicional."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      aiResponse = completion.choices[0]?.message?.content || '';
      tokensUsed = completion.usage?.total_tokens || 0;
      
      if (!aiResponse) {
        console.error(' No se recibió respuesta de la IA');
        return res.status(500).json({ 
          error: 'La IA no generó una respuesta',
          details: 'Empty response from Groq'
        });
      }
    }

    console.log(DEMO_MODE ? ' Análisis demo completado' : ' Respuesta de Groq recibida');

    // Parsea el JSON
    let analysis;
    try {
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(' Error parseando JSON:', parseError);
      console.error('Respuesta cruda:', aiResponse);
      return res.status(500).json({ 
        error: 'Error al procesar la respuesta de la IA',
        details: aiResponse 
      });
    }

    // Envía la respuesta al frontend
    res.json({
      success: true,
      analysis,
      tokensUsed,
      mode: DEMO_MODE ? 'demo' : 'groq',
      model: DEMO_MODE ? 'simulation' : 'llama-3.3-70b-versatile'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(' Error en el análisis:', error);
    res.status(500).json({ 
      error: 'Error al analizar las transacciones',
      details: errorMessage
    });
  }
});

// ====================================
// INICIA EL SERVIDOR
// ====================================
app.listen(PORT, () => {
  console.log(`
 FinAI Server corriendo
 Puerto: ${PORT}
 URL: http://localhost:${PORT}
 API: http://localhost:${PORT}/api/analyze
${DEMO_MODE ? ' MODO DEMO ACTIVADO (sin IA)' : ' MODO GROQ ACTIVADO (Llama 3.1)'}
  `);
});