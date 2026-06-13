import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Ensure dns resolution doesn't default to IPv6 only
dns.setDefaultResultOrder("ipv4first");

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI SDK safely on the server side
// Always check if GEMINI_API_KEY is available and configure User-Agent for telemetry
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment variables. Gemini features will run in mock mode.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const ai = getAiClient();

// API: Health status
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API: AI Chatbot Assistant for Buyers & Sellers
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!ai) {
      // Mock mode fallback if no API key is set
      return res.json({
        text: `[Guinée Market Pro Assistant] Bonjour! Merci pour votre message: "${message}". (Note: GEMINI_API_KEY n'est pas configuré, mode démonstration activé). Je suis là pour vous aider à acheter ou vendre en Guinée !`,
      });
    }

    const systemInstruction = 
      "Vous êtes 'Guinée Market Pro Assistant', un assistant expert et chaleureux pour la plus grande marketplace de Guinée. " +
      "Vous aidez les acheteurs à trouver des produits (électronique, alimentation, construction, etc.), négocier des prix de gros (GNF), conseiller sur la livraison (Conakry, Labé, Kankan, Nzérékoré, Siguiri, Mamou...) " +
      "et vous assistez les vendeurs pour gérer leur stock, fixer de bons prix et optimiser leurs ventes. " +
      "Répondez avec courtoisie, clarté, et tenez compte du contexte de l'utilisateur s'il est fourni (rôle du compte, panier, commandes).";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...(history || []).map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        })),
        { text: `Contexte actuel de la session: ${JSON.stringify(context || {})}\nMessage de l'utilisateur: ${message}` }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: "Erreur lors du traitement de la requête par l'IA", details: error.message });
  }
});

// API: Intelligent Search / Classification (Classify products and suggest metadata)
app.post("/api/ai/smart-search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    if (!ai) {
      return res.json({
        category: "Électronique",
        tags: ["guinée", "pro", "populaire"],
        suggestions: ["Téléphones", "Ordinateurs"],
      });
    }

    const prompt = 
      `Analyse la requête de recherche suivante pour une marketplace en Guinée : "${query}". ` +
      `Détermine la catégorie la plus appropriée (parmi : Électronique, Téléphones, Informatique, Mode, Beauté, Santé, Maison, Automobile, Agriculture, Construction, Alimentation, Services professionnels). ` +
      `Suggère également 3 à 5 tags pertinents et 2 catégories alternatives de suggestions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["category", "tags", "suggestions"],
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Smart Search Error:", error);
    res.json({ category: "Général", tags: ["recherche", "guinée"], suggestions: [] });
  }
});

// API: Price Suggestion Helper for Sellers
app.post("/api/ai/price-suggestion", async (req, res) => {
  try {
    const { productName, description, category } = req.body;
    if (!productName) {
      return res.status(400).json({ error: "Product name is required" });
    }

    if (!ai) {
      return res.json({
        suggestedMinPrice: 200000,
        suggestedMaxPrice: 450000,
        reasoning: "Gamme de prix typique basée sur des estimations en Frs Guinéens (GNF) en l'absence de clé de modèle active.",
      });
    }

    const prompt = 
      `Tu es un estimateur de prix de marché de Guinée Market Pro. Un vendeur souhaite lister : ` +
      `Nom: "${productName}", Description: "${description || 'N/A'}", Catégorie: "${category || 'Général'}". ` +
      `Estime une tranche de prix juste et équitable en Francs Guinéens (GNF) pour le marché guinéen local. ` +
      `Fournis le prix minimum suggéré, le prix maximum suggéré, et une brève explication analytique en français.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedMinPrice: { type: Type.NUMBER },
            suggestedMaxPrice: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
          },
          required: ["suggestedMinPrice", "suggestedMaxPrice", "reasoning"],
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Price Suggestion Error:", error);
    res.json({ suggestedMinPrice: 150000, suggestedMaxPrice: 300000, reasoning: "Estimation par défaut en GNF." });
  }
});

// API: Fraud Detection on listings or payments
app.post("/api/ai/fraud-detect", async (req, res) => {
  try {
    const { entityType, entityData } = req.body;
    if (!entityData) {
      return res.status(400).json({ error: "Entity data is required" });
    }

    if (!ai) {
      return res.json({
        riskScore: 5,
        isSuspicious: false,
        warnings: [],
        details: "Analyse simulée par IA (pas de clé API configurée).",
      });
    }

    const prompt = 
      `Analyse la fiche d'activité suivante sur la marketplace Guinée Market Pro : ` +
      `Type d'entité : ${entityType || 'produit/utilisateur'}. ` +
      `Données : ${JSON.stringify(entityData)}. ` +
      `Détecte s'il y a un risque de fraude, de contrefaçon évidente, de prix anormalement absurde, de descriptions suspectes ou d'activité hostile. ` +
      `Retourne un score de risque de 0 (sûr) à 100 (danger critique), si la fiche est suspecte, une liste d'avertissements et des détails.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            isSuspicious: { type: Type.BOOLEAN },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            details: { type: Type.STRING }
          },
          required: ["riskScore", "isSuspicious", "warnings", "details"],
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Fraud Detect Error:", error);
    res.json({ riskScore: 10, isSuspicious: false, warnings: [], details: "Aucun test concluant." });
  }
});

// API: Recommendation Engine based on buyer query/history and items catalog
app.post("/api/ai/recommendations", async (req, res) => {
  const { buyerHistory, catalogMini } = req.body;
  try {
    if (!catalogMini || !Array.isArray(catalogMini)) {
      return res.status(400).json({ error: "Catalog elements are required" });
    }

    if (!ai || catalogMini.length === 0) {
      return res.json({
        recommendedIds: catalogMini.slice(0, 3).map(item => item.id),
        explanation: "Recommandations standard basées sur l'ordre chronologique."
      });
    }

    const prompt = 
      `Voici l'historique ou le profil d'un acheteur : ${JSON.stringify(buyerHistory || {})}. \n` +
      `Voici un catalogue de produits simplifiés en stock : ${JSON.stringify(catalogMini)}. \n` +
      `Recommande les 3 à 5 meilleurs IDs de produits correspondants au profil de l'acheteur. ` +
      `Fournis également une explication en français sur pourquoi ces recommandations sont appropriées.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            explanation: { type: Type.STRING }
          },
          required: ["recommendedIds", "explanation"],
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Recommendations Error:", error);
    res.json({ recommendedIds: (catalogMini || []).slice(0, 3).map((i: any) => i.id), explanation: "Recommandations génériques d'accueil." });
  }
});

// API: Sales Forecasting & Stock analysis for seller dashboard
app.post("/api/ai/sales-forecast", async (req, res) => {
  try {
    const { salesHistory, catalogMini } = req.body;
    if (!salesHistory) {
      return res.status(400).json({ error: "Sales history is required" });
    }

    if (!ai) {
      return res.json({
        forecastText: "L'intelligence artificielle prévoit une forte demande pour les catégories Alimentation et Électronique lors des prochaines saisons en Guinée.",
        criticalStockIds: [],
        estimatedGrowthPercent: 12,
      });
    }

    const prompt = 
      `Analyse les ventes passées du vendeur : ${JSON.stringify(salesHistory)}. \n` +
      `Voici ses produits actuels en stock : ${JSON.stringify(catalogMini || [])}. \n` +
      `Agis en tant que conseiller d'affaires pour Guinée Market Pro. Analyse les tendances, prévois les besoins d'approvisionnement, ` +
      `identifie les IDs de produits qui risquent une rupture de stock critique, estime le pourcentage de croissance du mois prochain et ` +
      `fournis un texte d'analyse stratégique résumant tes suggestions de prévision.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            forecastText: { type: Type.STRING },
            criticalStockIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            estimatedGrowthPercent: { type: Type.NUMBER }
          },
          required: ["forecastText", "criticalStockIds", "estimatedGrowthPercent"],
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Sales Forecast Error:", error);
    res.json({
      forecastText: "Analyse indisponible pour le moment. Maintenir des stocks stables.",
      criticalStockIds: [],
      estimatedGrowthPercent: 5,
    });
  }
});

// Create and mount Vite middleware in development or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback handling
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Guinée Market Pro Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
