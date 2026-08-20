import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const FALLBACK_EXERCISES = [
  { id: 1, name: "Glute Bridge", target_muscle: "Glúteos", equipment: "Solo peso corporal", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Glute-Bridge.gif" },
  { id: 2, name: "Clamshell", target_muscle: "Glúteos", equipment: "Bandas elásticas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2022/02/Clamshell.gif" },
  { id: 3, name: "Band Hip Thrust", target_muscle: "Glúteos", equipment: "Bandas elásticas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/09/Resistance-Band-Hip-Thrust.gif" },
  { id: 4, name: "Bodyweight Squat", target_muscle: "Piernas", equipment: "Solo peso corporal", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/05/bodyweight-squat.gif" },
  { id: 5, name: "Dumbbell Goblet Squat", target_muscle: "Piernas", equipment: "Mancuernas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Goblet-Squat.gif" },
  { id: 6, name: "Dumbbell Romanian Deadlift", target_muscle: "Piernas", equipment: "Mancuernas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Romanian-Deadlift.gif" },
  { id: 7, name: "Band Pull Apart", target_muscle: "Espalda", equipment: "Bandas elásticas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/04/Band-Pull-Apart.gif" },
  { id: 8, name: "Resistance Band Seated Row", target_muscle: "Espalda", equipment: "Bandas elásticas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Resistance-Band-Seated-Row.gif" },
  { id: 9, name: "Dumbbell Bent Over Row", target_muscle: "Espalda", equipment: "Mancuernas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bent-Over-Dumbbell-Row.gif" },
  { id: 10, name: "Superman", target_muscle: "Espalda", equipment: "Solo peso corporal", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/05/Superman-exercise.gif" },
  { id: 11, name: "Plank", target_muscle: "Abdomen / Core", equipment: "Solo peso corporal", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif" },
  { id: 12, name: "Bird Dog", target_muscle: "Abdomen / Core", equipment: "Solo peso corporal", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bird-Dog.gif" },
  { id: 13, name: "Dead Bug", target_muscle: "Abdomen / Core", equipment: "Solo peso corporal", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/05/Dead-Bug.gif" },
  { id: 14, name: "Band Paloff Press", target_muscle: "Abdomen / Core", equipment: "Bandas elásticas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Band-Pallof-Press.gif" },
  { id: 15, name: "Push Up", target_muscle: "Pecho", equipment: "Solo peso corporal", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif" },
  { id: 16, name: "Incline Push Up", target_muscle: "Pecho", equipment: "Silla / Soporte", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Incline-Push-Up.gif" },
  { id: 17, name: "Dumbbell Bench Press", target_muscle: "Pecho", equipment: "Mancuernas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Press.gif" },
  { id: 18, name: "Band Lateral Raise", target_muscle: "Hombros", equipment: "Bandas elásticas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Band-Lateral-Raise.gif" },
  { id: 19, name: "Dumbbell Shoulder Press", target_muscle: "Hombros", equipment: "Mancuernas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif" },
  { id: 20, name: "Dumbbell Bicep Curl", target_muscle: "Brazos", equipment: "Mancuernas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif" },
  { id: 21, name: "Band Bicep Curl", target_muscle: "Brazos", equipment: "Bandas elásticas", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Resistance-Band-Bicep-Curl.gif" },
  { id: 22, name: "Chair Tricep Dips", target_muscle: "Brazos", equipment: "Silla / Soporte", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Chair-Dips.gif" },
  { id: 23, name: "Foam Roller Thoracic Extension", target_muscle: "Espalda", equipment: "Rodillo (Foam Roller)", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2022/11/Foam-Roller-Thoracic-Extension.gif" },
  { id: 24, name: "Foam Roller Quadriceps", target_muscle: "Piernas", equipment: "Rodillo (Foam Roller)", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2022/11/Foam-Roller-Quadriceps.gif" },
  { id: 25, name: "Foam Roller Glutes", target_muscle: "Glúteos", equipment: "Rodillo (Foam Roller)", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2022/11/Foam-Roller-Glutes.gif" },
  { id: 26, name: "Foam Roller Upper Back", target_muscle: "Espalda", equipment: "Rodillo (Foam Roller)", gif_url: "https://fitnessprogramer.com/wp-content/uploads/2022/11/Foam-Roller-Upper-Back.gif" }
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { age, zones, equipment, goal, level } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ success: false, error: "Falta GEMINI_API_KEY" }, { status: 400 });

    let exercisesPool = FALLBACK_EXERCISES;
    try {
      const { data: dbExercises } = await supabase.from("exercises").select("*");
      if (dbExercises && dbExercises.length > 0) exercisesPool = dbExercises;
    } catch (e) {
      console.warn("Usando catálogo local.");
    }

    const catalogSummary = exercisesPool.map((e) => ({
      id: e.id,
      name: e.name,
      target_muscle: e.target_muscle,
      equipment: e.equipment,
    }));

    const prompt = `Actúa como entrenador personal y fisiólogo deportivo.
Diseña una sesión estructurada con estos parámetros:
- Edad: ${age}
- Zonas: ${zones?.join(", ") || "Cuerpo completo"}
- Equipamiento: ${equipment?.join(", ") || "Solo peso corporal"}
- Objetivo: ${goal}
- Nivel: ${level}

CATÁLOGO PERMITIDO (Usa ÚNICAMENTE nombres exactos de esta lista):
${JSON.stringify(catalogSummary, null, 2)}

INSTRUCCIONES CLAVE:
1. "feedback_overview": Redacta una guía integral de ejecución (máximo 120-150 palabras) explicando cómo abordar la sesión (calentamiento, tempo controlado, respiración y progresión semanal para esta edad).
2. "exercises": Lista de 3 a 5 ejercicios ordenados lógicamente (primero activación/movilidad, luego fuerza principal y estabilidad al final).
3. Devuelve ÚNICAMENTE un JSON válido con esta estructura:
{
  "routine_title": "Título de la rutina",
  "feedback_overview": "Guía completa del entrenador (calentamiento, cadencia y ejecución integral en menos de 150 palabras)",
  "exercises": [
    {
      "order": 1,
      "name": "Nombre exacto del catálogo",
      "target_muscle": "Zona trabajada",
      "sets": 3,
      "reps": "10-12 reps",
      "rest": "45s",
      "cue": "Consejo técnico rápido"
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
      plan.exercises = plan.exercises.map((item: any, index: number) => {
        const match = exercisesPool.find(
          (ex) => ex.name.toLowerCase() === item.name?.toLowerCase() || ex.name.toLowerCase().includes(item.name?.toLowerCase())
        );
        return {
          ...item,
          order: item.order || index + 1,
          gif_url: match ? match.gif_url : "https://fitnessprogramer.com/wp-content/uploads/2021/05/Superman-exercise.gif",
          target_muscle: match ? match.target_muscle : item.target_muscle,
        };
      });
    }

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Error backend:", error);
    return NextResponse.json({ success: false, error: error.message || "Error al procesar rutina" }, { status: 500 });
  }
}
