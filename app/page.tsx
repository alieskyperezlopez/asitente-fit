"use client";
import { useState, useEffect } from "react";

const BODY_ZONES = ["Piernas", "Glúteos", "Espalda", "Pecho", "Hombros", "Brazos", "Abdomen / Core", "Cuerpo Completo"];
const EQUIPMENT_OPTIONS = ["Bandas elásticas", "Rodillo (Foam Roller)", "Mancuernas", "Silla / Soporte", "Solo peso corporal", "Gimnasio completo"];
const AGE_OPTIONS = ["+40 años", "+50 años", "+60 años", "+70 años"];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [age, setAge] = useState("+40 años");
  const [selectedZones, setSelectedZones] = useState<string[]>(["Abdomen / Core", "Espalda"]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(["Solo peso corporal"]);
  const [goal, setGoal] = useState("Salud & Movilidad");
  const [level, setLevel] = useState("Principiante");

  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"generator" | "saved">("generator");

  useEffect(() => {
    setMounted(true);
    const localData = localStorage.getItem("saved_workouts");
    if (localData) {
      try {
        setSavedPlans(JSON.parse(localData));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleZone = (zone: string) => {
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedZones.length === 0) {
      alert("Selecciona al menos una zona muscular.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          zones: selectedZones,
          equipment: selectedEquipment,
          goal,
          level,
        }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setCurrentPlan(data.plan);
      } else {
        alert("Error: " + (data.error || "No se pudo generar"));
      }
    } catch (err: any) {
      alert("Error de conexión");
    }
    setLoading(false);
  };

  const savePlanOffline = () => {
    if (!currentPlan) return;
    const updated = [{ ...currentPlan, id: Date.now(), date: new Date().toLocaleDateString() }, ...savedPlans];
    setSavedPlans(updated);
    localStorage.setItem("saved_workouts", JSON.stringify(updated));
    alert("¡Rutina guardada para ver sin conexión!");
  };

  const deletePlan = (id: number) => {
    const updated = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(updated);
    localStorage.setItem("saved_workouts", JSON.stringify(updated));
  };

  if (!mounted) return <div className="min-h-screen bg-zinc-950" />;

  return (
    <main className="max-w-md mx-auto min-h-screen p-4 bg-zinc-950 text-white pb-28 font-sans">
      <header className="py-4 text-center">
        <h1 className="text-2xl font-black tracking-tight text-red-500 uppercase">AI Workout Coach</h1>
        <p className="text-xs text-zinc-400 mt-1">Entrenamiento seguro adaptado a tu edad y equipo</p>
      </header>

      {/* Selector de pestañas */}
      <div className="flex bg-zinc-900 p-1 rounded-xl mb-6 border border-zinc-800">
        <button
          onClick={() => setActiveTab("generator")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === "generator" ? "bg-red-600 text-white shadow" : "text-zinc-400"
          }`}
        >
          Generar Plan
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === "saved" ? "bg-red-600 text-white shadow" : "text-zinc-400"
          }`}
        >
          Guardadas Offline ({savedPlans.length})
        </button>
      </div>

      {activeTab === "generator" ? (
        <>
          <form onSubmit={handleGenerate} className="space-y-5 bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 shadow-xl">
            {/* Rango de Edad */}
            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-zinc-400 mb-2">
                1. Rango de Edad
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AGE_OPTIONS.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setAge(item)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      age === item
                        ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Zonas del cuerpo */}
            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-zinc-400 mb-2">
                2. Zonas a trabajar (Múltiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {BODY_ZONES.map((zone) => {
                  const isSelected = selectedZones.includes(zone);
                  return (
                    <button
                      type="button"
                      key={zone}
                      onClick={() => toggleZone(zone)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                        isSelected
                          ? "bg-red-600 border-red-500 text-white shadow-sm"
                          : "bg-zinc-800/80 border-zinc-700 text-zinc-300"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {zone}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipamiento disponible */}
            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-zinc-400 mb-2">
                3. Equipamiento disponible (Múltiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((eq) => {
                  const isSelected = selectedEquipment.includes(eq);
                  return (
                    <button
                      type="button"
                      key={eq}
                      onClick={() => toggleEquipment(eq)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                        isSelected
                          ? "bg-amber-600 border-amber-500 text-white shadow-sm"
                          : "bg-zinc-800/80 border-zinc-700 text-zinc-300"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {eq}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Objetivo y Nivel */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase font-semibold tracking-wider text-zinc-400 mb-1.5">
                  Objetivo
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option>Salud & Movilidad</option>
                  <option>Tonificación & Fuerza</option>
                  <option>Pérdida de Grasa</option>
                  <option>Hipertrofia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold tracking-wider text-zinc-400 mb-1.5">
                  Nivel
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option>Principiante</option>
                  <option>Intermedio</option>
                  <option>Avanzado</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || selectedZones.length === 0}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 font-bold rounded-xl transition duration-200 disabled:opacity-50 text-sm tracking-wide shadow-lg shadow-red-600/30"
            >
              {loading ? "Diseñando entrenamiento..." : "Generar Rutina Personalizada"}
            </button>
          </form>

          {/* Rutina Generada */}
          {currentPlan && (
            <section className="mt-8 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h2 className="text-xl font-bold text-zinc-100">{currentPlan.routine_title}</h2>
                <button
                  onClick={savePlanOffline}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl transition shadow"
                >
                  💾 Salvar
                </button>
              </div>

              {/* Guía integral del Entrenador */}
              {currentPlan.feedback_overview && (
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/40 p-4 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">📋</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Guía de Ejecución & Feedback</h3>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {currentPlan.feedback_overview}
                  </p>
                </div>
              )}

              {/* Lista de ejercicios con imágenes individuales */}
              <div className="space-y-4">
                {currentPlan.exercises?.map((ex: any) => (
                  <div key={ex.order} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="bg-zinc-950 flex items-center justify-center p-2 min-h-[190px] border-b border-zinc-800/60">
                      <img 
                        src={ex.img_url} 
                        alt={ex.name} 
                        className="h-48 w-full object-cover rounded-xl" 
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                          <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md">
                            #{ex.order}
                          </span>
                          {ex.name}
                        </h3>
                        <span className="bg-red-950/70 text-red-400 border border-red-800/40 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                          {ex.target_muscle}
                        </span>
                      </div>
                      
                      {ex.cue && <p className="text-xs text-zinc-400 mt-2.5 italic">⚠️ {ex.cue}</p>}

                      <div className="mt-3.5 grid grid-cols-3 gap-2 text-center bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/60">
                        <div>
                          <p className="text-[10px] uppercase text-zinc-400 font-semibold">Series</p>
                          <p className="font-bold text-sm text-zinc-200">{ex.sets}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-zinc-400 font-semibold">Reps / Tiempo</p>
                          <p className="font-bold text-sm text-zinc-200">{ex.reps}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-zinc-400 font-semibold">Descanso</p>
                          <p className="font-bold text-sm text-zinc-200">{ex.rest}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        /* Pestaña Offline */
        <section className="space-y-4">
          {savedPlans.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-sm bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
              No tienes rutinas guardadas para ver sin conexión. Genera una y pulsa <strong>💾 Salvar</strong>.
            </div>
          ) : (
            savedPlans.map((saved) => (
              <div key={saved.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-4 shadow-lg">
                <div className="flex justify-between items-start border-b border-zinc-800 pb-2">
                  <div>
                    <h3 className="font-bold text-base text-zinc-100">{saved.routine_title}</h3>
                    <p className="text-[11px] text-zinc-400">Guardado el {saved.date}</p>
                  </div>
                  <button
                    onClick={() => deletePlan(saved.id)}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold p-1"
                  >
                    Eliminar
                  </button>
                </div>

                {saved.feedback_overview && (
                  <p className="text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/50">
                    💡 {saved.feedback_overview}
                  </p>
                )}

                <div className="space-y-3">
                  {saved.exercises?.map((ex: any) => (
                    <div key={ex.order || ex.name} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex gap-3 items-center">
                      <img 
                        src={ex.img_url} 
                        alt={ex.name} 
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          #{ex.order} {ex.name}
                        </p>
                        <p className="text-[11px] text-red-400">{ex.target_muscle}</p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {ex.sets} series × {ex.reps} | Descanso: {ex.rest}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </main>
  );
}
