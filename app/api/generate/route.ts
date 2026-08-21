import { NextResponse } from "next/server";

// Catálogo con enlaces directos e ilustraciones verificadas por grupo muscular
const EXERCISES_DATABASE = [
  // ABDOMEN Y CORE
  { id: 1, name: "Plank (Plancha Frontal)", target_muscle: "Abdomen / Core", equipment: "Solo peso corporal", img_url: "https://images.unsplash.com/photo-1566241134883-13eb2393a3cc?w=600&auto=format&fit=crop&q=80" },
  { id: 2, name: "Bird Dog (Pájaro Perro)", target_muscle: "Abdomen / Core", equipment: "Solo peso corporal", img_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80" },
  { id: 3, name: "Dead Bug (Bicho Muerto)", target_muscle: "Abdomen / Core", equipment: "Solo peso corporal", img_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80" },
  { id: 4, name: "Band Pallof Press", target_muscle: "Abdomen / Core", equipment: "Bandas elásticas", img_url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80" },

  // ESPALDA
  { id: 5, name: "Superman", target_muscle: "Espalda", equipment: "Solo peso corporal", img_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80" },
  { id: 6, name: "Band Pull Apart", target_muscle: "Espalda", equipment: "Bandas elásticas", img_url: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&auto=format&fit=crop&q=80" },
  { id: 7, name: "Remo Sentado con Banda", target_muscle: "Espalda", equipment: "Bandas elásticas", img_url: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop&q=80" },
  { id: 8, name: "Remo con Mancuerna", target_muscle: "Espalda", equipment: "Mancuernas", img_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80" },

  // GLÚTEOS Y PIERNAS
  { id: 9, name: "Puente de Glúteo (Glute Bridge)", target_muscle: "Glúteos", equipment: "Solo peso corporal", img_url: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&auto=format&fit=crop&q=80" },
  { id: 10, name: "Clamshell (Almeja con Banda)", target_muscle: "Glúteos", equipment: "Bandas elásticas", img_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80" },
  { id: 11, name: "Sentadilla Libre (Bodyweight Squat)", target_muscle: "Piernas", equipment: "Solo peso corporal", img_url: "https://images.unsplash.com/photo-1574680088814-c9e8a10d8a4d?w=600&auto=format&fit=crop&q=80" },
  { id: 12, name: "Goblet Squat con Mancuerna", target_muscle: "Piernas", equipment: "Mancuernas", img_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80" },

  // PECHO, HOMBROS Y BRAZOS
  { id: 13, name: "Flexiones / Push Ups", target_muscle: "Pecho", equipment: "Solo peso corporal", img_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80" },
  { id: 14, name: "Flexiones Inclinadas en Silla", target_muscle: "Pecho", equipment: "Silla / Soporte", img_url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80" },
  { id: 15, name: "Elevaciones Laterales con Banda", target_muscle: "Hombros", equipment: "Bandas elásticas", img_url: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&auto=format&fit=crop&q=80" },
  { id: 16, name: "Fondos de Tríceps en Silla", target_muscle: "Brazos", equipment: "Silla / Soporte", img_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80" },

  // RODILLO / FOAM ROLLER
  { id: 17, name: "Extensión Torácica con Rodillo", target_muscle: "Espalda", equipment: "Rodillo (Foam Roller)", img_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80" },
  { id: 18, name: "Liberación Miofascial de Glúteos", target_muscle: "Glúteos", equipment: "Rodillo (Foam Roller)", img_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80" },
  { id: 19, name: "Descarga de Cuádriceps con Rodillo", target_muscle: "Piernas", equipment: "Rodillo (Foam Roller)", img_url: "https://images.unsplash.com/photo-1566241134883-13eb2393a3cc?w=600&auto=format&fit=crop&q=80" }
];

export async function POST(req: Request) {
  try {
    const { age, zones, equipment, goal, level } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Falta GEMINI_API_KEY" }, { status: 400 });
    }

    const availableNames = EXERCISES_DATABASE.map(e => `${e.name} [Zona: ${e.target_muscle} | Eq: ${e.equipment}]`).join(" // ");

    const prompt = `Actúa como entrenador personal y fisiólogo del ejercicio.
Diseña una rutina personalizada de 3 a 5 ejercicios con estos datos:
- Rango de edad: ${age}
- Zonas musculares: ${zones?.join(", ") || "Cuerpo completo"}
- Equipamiento: ${equipment?.join(", ") || "Solo peso corporal"}
- Objetivo: ${goal}
- Nivel: ${level}

CATÁLOGO ESTRICTO DE EJERCICIOS PERMITIDOS:
${availableNames}

INSTRUCCIONES:
1. Elige ÚNICAMENTE ejercicios del catálogo anterior que encajen con las zonas y el equipo disponible.
2. "feedback_overview": Proporciona una explicación metodológica completa (entre 80 y 140 palabras) explicando cómo calentar, el ritmo de respiración, la técnica postural y la progresión recomendada para personas de ${age}.
3. Ordena los ejercicios con lógica: 1º Activación/Movilidad, 2º Ejercicio central, 3º Estabilidad/Core.

Devuelve ÚNICAMENTE un JSON válido con esta estructura:
{
  "routine_title": "Título claro de la sesión",
  "feedback_overview": "Texto del feedback metodológico completo",
  "exercises": [
    {
      "order": 1,
      "name": "Nombre exacto como aparece en el catálogo",
      "target_muscle": "Zona muscular",
      "sets": 3,
      "reps": "10-12 reps",
      "rest": "45s",
      "cue": "Consejo técnico rápido de postura"
    }
  ]
}`;

    const generateRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    const generateData = await generateRes.json();
    if (generateData.error) throw new Error(generateData.error.message);

    const rawText = generateData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const plan = JSON.parse(cleanJson);

    if (plan.exercises && Array.isArray(plan.exercises)) {
      plan.exercises = plan.exercises.map((item: any, idx: number) => {
        const found = EXERCISES_DATABASE.find(
          ex => ex.name.toLowerCase().includes(item.name?.toLowerCase()) || item.name?.toLowerCase().includes(ex.name.toLowerCase())
        );
        return {
          ...item,
          order: item.order || idx + 1,
          img_url: found ? found.img_url : "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80",
          target_muscle: found ? found.target_muscle : item.target_muscle
        };
      });
    }

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Error backend:", error);
    return NextResponse.json({ success: false, error: error.message || "Error al procesar rutina" }, { status: 500 });
  }
}
