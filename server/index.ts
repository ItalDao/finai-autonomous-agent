import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { PrismaClient, Prisma } from '@prisma/client';

dotenv.config();

// ====================================
// INICIALIZACIÓN
// ====================================
const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient({});

const DEMO_MODE = !process.env.GROQ_API_KEY || process.env.DEMO_MODE === 'true';

console.log(' Configuración:');
console.log('  Groq API Key:', process.env.GROQ_API_KEY ? '✅ Configurada' : '❌ No configurada');
console.log('  DEMO_MODE:', DEMO_MODE);
console.log('  Database:', ' SQLite conectada');

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
  date: Date;
  description: string;
  amount: number;
  category: string;
}

interface AnalyzeRequest {
  transactions: Transaction[];
}

// ====================================
// RUTAS
// ====================================

// GET / - Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: '🤖 FinAI Server is running!',
    status: 'OK',
    mode: DEMO_MODE ? 'demo' : 'groq',
    database: 'SQLite',
    timestamp: new Date().toISOString()
  });
});

// GET /api/transactions - Obtener todas las transacciones
app.get('/api/transactions', async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      transactions: transactions.map((t: Transaction) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        category: t.category,
        date: t.date.toISOString().split('T')[0]
      }))
    });
  } catch (error) {
    console.error('❌ Error obteniendo transacciones:', error);
    res.status(500).json({ 
      error: 'Error al obtener transacciones',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/transactions - Crear nueva transacción
app.post('/api/transactions', async (req: Request, res: Response) => {
  try {
    const { description, amount, category, date } = req.body;

    if (!description || !amount || !category || !date) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos' 
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount: parseFloat(amount),
        category,
        date: new Date(date)
      }
    });

    console.log('✅ Transacción creada:', transaction.id);

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('❌ Error creando transacción:', error);
    res.status(500).json({ 
      error: 'Error al crear transacción',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// DELETE /api/transactions/:id - Eliminar transacción
app.delete('/api/transactions/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    await prisma.transaction.delete({
      where: { id }
    });

    console.log('✅ Transacción eliminada:', id);

    res.json({
      success: true,
      message: 'Transacción eliminada'
    });
  } catch (error) {
    console.error('❌ Error eliminando transacción:', error);
    res.status(500).json({ 
      error: 'Error al eliminar transacción',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/analyses - Obtener historial de análisis
app.get('/api/analyses', async (req: Request, res: Response) => {
  try {
    const analyses = await prisma.analysis.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      analyses: analyses.map((a: Prisma.AnalysisGetPayload<object>) => ({
        id: a.id,
        totalSpent: a.totalSpent,
        subscriptions: a.subscriptions,
        savingsPotential: a.savingsPotential,
        createdAt: a.createdAt,
        insights: JSON.parse(a.insights),
        duplicates: JSON.parse(a.duplicates)
      }))
    });
  } catch (error) {
    console.error('❌ Error obteniendo análisis:', error);
    res.status(500).json({ 
      error: 'Error al obtener análisis',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/analyze - Análisis con IA
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { transactions } = req.body as AnalyzeRequest;

    console.log('📊 Analizando transacciones:', transactions.length);

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
4. Sugiere 4 insights accionables en ESPAÑOL
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
    "insight 1 en español",
    "insight 2 en español",
    "insight 3 en español",
    "insight 4 en español"
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

    if (DEMO_MODE) {
      console.log('🎭 MODO DEMO');
      
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
          `Detecté ${subscriptions.length} suscripciones activas por $${subscriptionCost.toFixed(2)}/mes`,
          `Podrías ahorrar ${((subscriptionCost * 0.4 / totalSpent) * 100).toFixed(0)}% cancelando servicios no usados`,
          `Tu gasto mensual proyectado es $${(totalSpent * 1.05).toFixed(2)}`,
          `Revisa suscripciones duplicadas de streaming y música`
        ],
        duplicates: [
          {
            name: 'Servicios detectados',
            count: subscriptions.length,
            saving: parseFloat((subscriptionCost * 0.4).toFixed(2))
          }
        ]
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } else {
      console.log('🚀 Enviando a Groq...');
      
      const completion = await groq!.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Eres un asesor financiero experto. Respondes en español y siempre en JSON válido."
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
        console.error('❌ No se recibió respuesta');
        return res.status(500).json({ 
          error: 'La IA no generó una respuesta'
        });
      }
    }

    console.log('✅ Respuesta recibida');

    // Parse JSON
    let analysis;
    try {
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError);
      return res.status(500).json({ 
        error: 'Error al procesar respuesta',
        details: aiResponse 
      });
    }

    // 💾 GUARDAR ANÁLISIS EN LA BASE DE DATOS
    const savedAnalysis = await prisma.analysis.create({
      data: {
        totalSpent: parseFloat(analysis.totalSpent),
        subscriptions: analysis.subscriptions,
        subscriptionCost: parseFloat(analysis.subscriptionCost),
        predictedNext: parseFloat(analysis.predictions.nextMonth),
        savingsPotential: parseFloat(analysis.predictions.savings),
        insights: JSON.stringify(analysis.insights),
        duplicates: JSON.stringify(analysis.duplicates),
        tokensUsed,
        model: DEMO_MODE ? 'demo' : 'llama-3.3-70b-versatile'
      }
    });

    console.log('💾 Análisis guardado en DB:', savedAnalysis.id);

    res.json({
      success: true,
      analysis,
      tokensUsed,
      mode: DEMO_MODE ? 'demo' : 'groq',
      model: DEMO_MODE ? 'simulation' : 'llama-3.3-70b-versatile',
      savedId: savedAnalysis.id
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al analizar',
      details: errorMessage
    });
  }
});

// ====================================
// SERVIDOR
// ====================================
app.listen(PORT, () => {
  console.log(`
 FinAI Server corriendo
 Puerto: ${PORT}
 URL: http://localhost:${PORT}
 API: http://localhost:${PORT}/api/analyze
 Database: SQLite (prisma/dev.db)
${DEMO_MODE ? '🎭 MODO DEMO' : '🚀 MODO GROQ'}
  `);
});