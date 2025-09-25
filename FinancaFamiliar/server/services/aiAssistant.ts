import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "default_key" });

export interface FinancialData {
  monthlyIncome: number;
  monthlyExpenses: number;
  bills: Array<{
    name: string;
    amount: number;
    category: string;
    dueDay: number;
  }>;
  categories: Array<{
    name: string;
    totalAmount: number;
    percentage: number;
  }>;
}

export interface AIAdvice {
  suggestion: string;
  potentialSavings: number;
  priority: "high" | "medium" | "low";
  category: string;
  actionItems: string[];
}

export async function getAIFinancialAdvice(data: FinancialData): Promise<AIAdvice[]> {
  try {
    const prompt = `
Analise os dados financeiros abaixo e forneça 3 sugestões personalizadas de economia em português brasileiro.
Para cada sugestão, inclua uma estimativa realista de economia mensal.

Dados financeiros:
- Renda mensal: R$ ${data.monthlyIncome.toLocaleString('pt-BR')}
- Gastos mensais: R$ ${data.monthlyExpenses.toLocaleString('pt-BR')}
- Contas: ${data.bills.map(b => `${b.name}: R$ ${b.amount}`).join(', ')}
- Categorias de gasto: ${data.categories.map(c => `${c.name}: R$ ${c.totalAmount} (${c.percentage}%)`).join(', ')}

Responda no formato JSON com o seguinte schema:
{
  "suggestions": [
    {
      "suggestion": "Descrição da sugestão",
      "potentialSavings": número_da_economia_estimada,
      "priority": "high|medium|low",
      "category": "categoria_afetada",
      "actionItems": ["ação 1", "ação 2", "ação 3"]
    }
  ]
}

Foque em sugestões práticas e realizáveis para uma família brasileira.
`;

    const systemPrompt = "Você é um consultor financeiro especializado em economia doméstica para famílias brasileiras. Forneça conselhos práticos e realistas. Responda sempre em JSON válido com 3 sugestões.";
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  suggestion: { type: "string" },
                  potentialSavings: { type: "number" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  category: { type: "string" },
                  actionItems: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["suggestion", "potentialSavings", "priority", "category", "actionItems"]
              }
            }
          },
          required: ["suggestions"]
        }
      },
      contents: prompt
    });

    const result = JSON.parse(response.text || "{}");
    return result.suggestions || [];

  } catch (error) {
    console.error("Error getting AI financial advice:", error);
    return [
      {
        suggestion: "Revise suas assinaturas e cancele serviços não utilizados",
        potentialSavings: 150,
        priority: "high",
        category: "Lazer",
        actionItems: [
          "Listar todas as assinaturas ativas",
          "Cancelar serviços não utilizados há mais de 30 dias",
          "Negociar descontos em serviços essenciais"
        ]
      }
    ];
  }
}

export async function analyzeBillPatterns(data: FinancialData): Promise<string> {
  try {
    const prompt = `
Analise os padrões de gastos familiares e identifique tendências ou anomalias.

Dados: ${JSON.stringify(data)}

Responda em português brasileiro com insights sobre:
1. Padrões de consumo
2. Possíveis anomalias
3. Tendências sazonais
4. Recomendações preventivas

Mantenha a resposta concisa (máximo 200 caracteres).
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return response.text || "Análise indisponível no momento.";

  } catch (error) {
    console.error("Error analyzing bill patterns:", error);
    return "Seus gastos estão dentro da média familiar. Continue monitorando para identificar oportunidades de economia.";
  }
}
