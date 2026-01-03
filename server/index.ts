// ====================================
// IMPORTACIONES
// ====================================
import express from 'express';
import type { Request, Response } from 'express'; //  Type-only import
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

// ====================================
// INICIALIZACIÓN
// ====================================
const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    message: 'FinAI Server is running!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ====================================
// RUTA DE ANÁLISIS CON GPT-4
// ====================================
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { transactions } = req.body as AnalyzeRequest; // Type assertion

    console.log(' Analizando transacciones:', transactions.length);

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({ 
        error: 'No se enviaron transacciones para analizar' 
      });
    }

    // Prepara el prompt para GPT-4
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

    console.log(' Enviando a GPT-4o-mini...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un asesor financiero experto. Siempre respondes en JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    //  Acceso seguro con validación
    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      console.error('No se recibió respuesta de la IA');
      return res.status(500).json({ 
        error: 'La IA no generó una respuesta',
        details: 'Empty response from OpenAI'
      });
    }

    console.log(' Respuesta de GPT-4o-mini:', aiResponse);

    // Parsea el JSON
    let analysis;
    try {
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(' Error parseando JSON:', parseError);
      return res.status(500).json({ 
        error: 'Error al procesar la respuesta de la IA',
        details: aiResponse 
      });
    }

    // Envía la respuesta al frontend
    res.json({
      success: true,
      analysis,
      tokensUsed: completion.usage?.total_tokens || 0
    });

  } catch (error) {
    //  Type guard para error
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
 Server running on http://localhost:${PORT}
 API endpoint: http://localhost:${PORT}/api/analyze
  `);
});