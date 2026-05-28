import { useState } from "react";

const CATEGORIES = [
  { id: "finance", label: "Finances", icon: "💰", color: "#C9A84C" },
  { id: "home", label: "Vie commune", icon: "🏡", color: "#7BAE7F" },
  { id: "love", label: "Relation", icon: "💑", color: "#E07B8A" },
  { id: "adventure", label: "Aventures", icon: "🌍", color: "#5B8DC9" },
  { id: "growth", label: "Croissance", icon: "🧘", color: "#9B72CF" },
];

const INITIAL_GOALS = [
  { id: 1, title: "Épargner 6 000€", category: "finance", deadline: "2026-12-31", progress: 35, motivA: 8, motivB: 9, nextMilestone: "Atteindre 3 000€", notes: "Réduire abonnements inutiles", feelingA: "Motivé 💪", feelingB: "Confiante ✨" },
  { id: 2, title: "Week-end à Lisbonne", category: "adventure", deadline: "2026-08-15", progress: 60, motivA: 9, motivB: 10, nextMilestone: "Réserver l'hôtel", notes: "Regarder les vols en avril", feelingA: "Impatient 🌞", feelingB: "Excitée 🎉" },
  { id: 3, title: "1 soirée sans écrans / semaine", category: "love", deadline: "2026-06-01", progress: 75, motivA: 7, motivB: 8, nextMilestone: "4 semaines consécutives", notes: "Jeux de société, cuisine ensemble", feelingA: "Bien 🙂", feelingB: "Heureuse 💕" },
  { id: 4, title: "Apprendre l'espagnol", category: "growth", deadline: "2026-12-31", progress: 20, motivA: 6, motivB: 9, nextMilestone: "Terminer niveau A1", notes: "App Duolingo le soir", feelingA: "Hésitant 😅", feelingB: "Très motivée 🔥" },
];

const INITIAL_REVIEWS = [
  { id: 1, date: "2026-01-15", mood: "🌟", note: "Super mois, bien avancé sur l'épargne !", snapshots: { 1: 10, 2: 20, 3: 30, 4: 5 }, highlights: "On a ouvert notre livret épargne commun 🎉", challenges: "Du mal à maintenir les soirées sans écrans", nextActions: "Réserver le vol Lisbonne avant fin février" },
  { id: 2, date: "2026-02-15", mood: "💪", note: "Mois intense mais on reste alignés.", snapshots: { 1: 20, 2: 40, 3: 50, 4: 10 }, highlights: "Vol Lisbonne réservé ! ✈️", challenges: "L'espagnol un peu mis de côté", nextActions: "Reprendre Duolingo ensemble le soir" },
  { id: 3, date: "2026-03-15", mood: "😊", note: "Beau progrès sur la relation !", snapshots: { 1: 28, 2: 50, 3: 65, 4: 15 }, highlights: "3 soirées sans écrans réussies 🕯️", challenges: "Épargne légèrement en dessous", nextActions: "Revoir le budget mensuel ensemble" },
];

const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];
const MOODS = ["🌟","💪","😊","😐","😔","🔥","💕","🌱"];
const EMPTY_GOAL = { title: "", category: "finance", deadline: "", progress: 0, motivA: 5, motivB: 5, nextMilestone: "", notes: "", feelingA: "", feelingB: "" };

function ProgressRing({ value, color }) {
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <svg width="70" height="70" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="35" cy="35" r={r} fill="none" stroke="#F0EBE3" strokeWidth="6" />
      <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ - (value / 100) * circ}
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

function MotivBar({ value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: "#F0EBE3", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${value * 10}%`, height: "100%", background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 18 }}>{value}</span>
    </div>
  );
}

function SparkLine({ data, color }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 72, h = 30, pad = 3;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length-1].split(",")[0]} cy={pts[pts.length-1].split(",")[1]} r="3.5" fill={color} />
    </svg>
  );
}

function GoalCard({ goal, reviews, onEdit, onDelete }) {
  const cat = CATEGORIES.find(c => c.id === goal.category);
  const gap = Math.abs(goal.motivA - goal.motivB);
  const deadline = goal.deadline ? new Date(goal.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const sparkData = [...reviews.map(r => r.snapshots?.[goal.id]).filter(v => v !== undefined), goal.progress];

  return (
    <div style={{ background: "#FFFCF7", borderRadius: 20, padding: "22px 24px", boxShadow: "0 2px 16px rgba(180,140,100,0.10)", border: `1.5px solid ${cat.color}22`, display: "flex", flexDirection: "column", gap: 14, transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${cat.color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 16px rgba(180,140,100,0.10)"; }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: cat.color, background: `${cat.color}18`, borderRadius: 99, padding: "3px 10px", marginBottom: 6 }}>{cat.icon} {cat.label}</span>
          <div style={{ fontSize: 17, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#3D2C1E", lineHeight: 1.3 }}>{goal.title}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => onEdit(goal)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.4, padding: 4 }}>✏️</button>
          <button onClick={() => onDelete(goal.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.4, padding: 4 }}>🗑️</button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ProgressRing value={goal.progress} color={cat.color} />
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(90deg)", fontSize: 12, fontWeight: 800, color: cat.color }}>{goal.progress}%</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#A89080", marginBottom: 4, fontWeight: 700, letterSpacing: 0.5 }}>PROCHAIN JALON</div>
          <div style={{ fontSize: 13, color: "#5C4030", fontWeight: 600 }}>🏁 {goal.nextMilestone}</div>
          <div style={{ fontSize: 11, color: "#B0986A", marginTop: 5 }}>📅 {deadline}</div>
        </div>
        {sparkData.length >= 2 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <SparkLine data={sparkData} color={cat.color} />
            <span style={{ fontSize: 9, color: "#B0986A", fontWeight: 600 }}>évolution</span>
          </div>
        )}
      </div>

      <div style={{ background: "#FAF5EE", borderRadius: 12, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, color: "#A89080", fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>THERMOMÈTRE DE MOTIVATION</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div><span style={{ fontSize: 11, color: "#7A6050" }}>👤 Lui &nbsp;</span><MotivBar value={goal.motivA} color={cat.color} /></div>
          <div><span style={{ fontSize: 11, color: "#7A6050" }}>👤 Elle &nbsp;</span><MotivBar value={goal.motivB} color={cat.color} /></div>
        </div>
        {gap > 3 && <div style={{ marginTop: 8, fontSize: 11, color: "#C0504D", fontWeight: 600, background: "#FFF0EF", borderRadius: 8, padding: "4px 8px" }}>⚠️ Écart élevé — à discuter ensemble !</div>}
      </div>

      {(goal.feelingA || goal.feelingB) && (
        <div style={{ display: "flex", gap: 8 }}>
          {goal.feelingA && <div style={{ flex: 1, background: `${cat.color}10`, borderRadius: 10, padding: "7px 10px", fontSize: 12, color: "#5C4030" }}>Lui : {goal.feelingA}</div>}
          {goal.feelingB && <div style={{ flex: 1, background: `${cat.color}10`, borderRadius: 10, padding: "7px 10px", fontSize: 12, color: "#5C4030" }}>Elle : {goal.feelingB}</div>}
        </div>
      )}
      {goal.notes && <div style={{ fontSize: 12, color: "#A08060", borderLeft: `3px solid ${cat.color}`, paddingLeft: 10, fontStyle: "italic" }}>📝 {goal.notes}</div>}
    </div>
  );
}

function ReviewCard({ review, goals, onEdit, onDelete }) {
  const d = new Date(review.date);
  const label = `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
  return (
    <div style={{ background: "#FFFCF7", borderRadius: 20, padding: "22px 24px", boxShadow: "0 2px 16px rgba(180,140,100,0.10)", border: "1.5px solid #E8DDD0", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #C9A84C22, #E07B8A22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{review.mood}</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#3D2C1E" }}>Bilan de {label}</div>
            <div style={{ fontSize: 12, color: "#A89080" }}>{d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => onEdit(review)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.4, padding: 4 }}>✏️</button>
          <button onClick={() => onDelete(review.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.4, padding: 4 }}>🗑️</button>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {goals.map(g => {
          const snap = review.snapshots?.[g.id];
          if (snap === undefined) return null;
          const cat = CATEGORIES.find(c => c.id === g.category);
          return (
            <div key={g.id} style={{ background: `${cat.color}12`, borderRadius: 10, padding: "5px 11px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13 }}>{cat.icon}</span>
              <span style={{ fontSize: 12, color: "#5C4030", fontWeight: 600 }}>{g.title.length > 18 ? g.title.slice(0,18)+"…" : g.title}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: cat.color }}>{snap}%</span>
            </div>
          );
        })}
      </div>

      {review.note && <div style={{ fontSize: 13, color: "#5C4030", fontStyle: "italic", borderLeft: "3px solid #C9A84C", paddingLeft: 10 }}>"{review.note}"</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {review.highlights && (
          <div style={{ background: "#F0F7F0", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#7BAE7F", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>🌟 VICTOIRES</div>
            <div style={{ fontSize: 12, color: "#3D5C3E" }}>{review.highlights}</div>
          </div>
        )}
        {review.challenges && (
          <div style={{ background: "#FFF5F0", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#E07B8A", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>⚡ DÉFIS</div>
            <div style={{ fontSize: 12, color: "#5C3030" }}>{review.challenges}</div>
          </div>
        )}
      </div>
      {review.nextActions && (
        <div style={{ background: "#F5F0FF", borderRadius: 12, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, color: "#9B72CF", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>🎯 ACTIONS DU MOIS PROCHAIN</div>
          <div style={{ fontSize: 12, color: "#3D2C5C" }}>{review.nextActions}</div>
        </div>
      )}
    </div>
  );
}

function EvolutionChart({ goals, reviews }) {
  const [selectedGoal, setSelectedGoal] = useState(goals[0]?.id);
  const goal = goals.find(g => g.id === selectedGoal);
  const cat = goal ? CATEGORIES.find(c => c.id === goal.category) : null;
  const points = [...reviews.map(r => {
    const d = new Date(r.date);
    return { label: `${MONTHS_FR[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, value: r.snapshots?.[selectedGoal] ?? null };
  }).filter(p => p.value !== null), goal ? { label: "Auj.", value: goal.progress } : null].filter(Boolean);

  const maxVal = Math.max(...points.map(p => p.value), 10);
  const totalGain = points.length >= 2 ? points[points.length-1].value - points[0].value : 0;

  return (
    <div style={{ background: "#FFFCF7", borderRadius: 20, padding: "24px", boxShadow: "0 2px 16px rgba(180,140,100,0.10)", border: "1.5px solid #E8DDD0" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#3D2C1E", marginBottom: 16 }}>📈 Évolution dans le temps</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
        {goals.map(g => {
          const c = CATEGORIES.find(x => x.id === g.category);
          return (
            <button key={g.id} onClick={() => setSelectedGoal(g.id)} style={{ padding: "6px 12px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: selectedGoal === g.id ? c.color : `${c.color}18`, color: selectedGoal === g.id ? "#FFF" : c.color }}>
              {c.icon} {g.title.length > 20 ? g.title.slice(0,20)+"…" : g.title}
            </button>
          );
        })}
      </div>

      {points.length === 0 ? (
        <div style={{ textAlign: "center", color: "#C0A890", padding: 30, fontSize: 13, fontStyle: "italic" }}>Aucune donnée — faites votre premier bilan mensuel !</div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140, padding: "0 4px" }}>
            {points.map((p, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: cat?.color }}>{p.value}%</div>
                <div style={{ width: "100%", borderRadius: "8px 8px 0 0", background: i === points.length-1 ? cat?.color : `${cat?.color}55`, height: `${(p.value / 100) * 110}px`, minHeight: 4, transition: "height 0.6s ease" }} />
                <div style={{ fontSize: 10, color: "#A89080", fontWeight: 600 }}>{p.label}</div>
              </div>
            ))}
          </div>
          {points.length >= 2 && (
            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Départ", value: `${points[0].value}%`, color: "#A89080" },
                { label: "Aujourd'hui", value: `${points[points.length-1].value}%`, color: cat?.color },
                { label: "Gain total", value: `+${totalGain}%`, color: "#7BAE7F" },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, background: "#FAF5EE", borderRadius: 12, padding: "10px 14px", minWidth: 80 }}>
                  <div style={{ fontSize: 10, color: "#A89080", fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StreakCalendar({ reviews }) {
  const year = 2026;
  return (
    <div style={{ background: "#FFFCF7", borderRadius: 20, padding: "24px", boxShadow: "0 2px 16px rgba(180,140,100,0.10)", border: "1.5px solid #E8DDD0" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#3D2C1E", marginBottom: 6 }}>🔥 Régularité des bilans mensuels</div>
      <p style={{ fontSize: 12, color: "#A89080", margin: "0 0 16px" }}>Un bilan par mois = la clé du succès à long terme</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {MONTHS_FR.map((m, i) => {
          const done = reviews.some(r => new Date(r.date).getMonth() === i && new Date(r.date).getFullYear() === year);
          const isFuture = new Date(year, i) > new Date();
          return (
            <div key={i} style={{ width: 54, height: 54, borderRadius: 14, background: done ? "linear-gradient(135deg, #7BAE7F, #5B8DC9)" : isFuture ? "#F8F4EE" : "#F0EBE3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, border: done ? "none" : "1.5px dashed #DDD5C8" }}>
              <div style={{ fontSize: done ? 18 : 11, color: done ? "#FFF" : isFuture ? "#D5C8B8" : "#C0A890" }}>{done ? "✓" : "·"}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: done ? "#FFF" : isFuture ? "#D5C8B8" : "#C0A890" }}>{m}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, fontSize: 13, color: "#7BAE7F", fontWeight: 600 }}>
        {reviews.length} bilan{reviews.length > 1 ? "s" : ""} réalisé{reviews.length > 1 ? "s" : ""} — {reviews.length >= 6 ? "Incroyable régularité ! 🏆" : reviews.length >= 3 ? "Continuez comme ça ! 🌟" : "Beau départ ! 🌱"}
      </div>
    </div>
  );
}

function GoalModal({ goal, onSave, onClose }) {
  const [form, setForm] = useState({ ...goal });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const iStyle = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E8DDD0", fontSize: 14, color: "#3D2C1E", background: "#FFFCF7", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lStyle = { fontSize: 11, fontWeight: 700, color: "#A89080", letterSpacing: 0.5, marginBottom: 4, display: "block" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(60,30,10,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#FFFCF7", borderRadius: 24, padding: 32, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(100,50,20,0.3)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#3D2C1E", marginBottom: 24 }}>{goal.id ? "✏️ Modifier" : "✨ Nouvel objectif"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={lStyle}>TITRE</label><input style={iStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Partir en voyage au Japon" /></div>
          <div><label style={lStyle}>CATÉGORIE</label>
            <select style={iStyle} value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={lStyle}>DATE BUTOIR</label><input style={iStyle} type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={lStyle}>AVANCEMENT (%)</label><input style={iStyle} type="number" min={0} max={100} value={form.progress} onChange={e => set("progress", Number(e.target.value))} /></div>
          </div>
          <div><label style={lStyle}>PROCHAIN JALON</label><input style={iStyle} value={form.nextMilestone} onChange={e => set("nextMilestone", e.target.value)} /></div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={lStyle}>MOTIVATION LUI (1-10)</label><input style={iStyle} type="number" min={1} max={10} value={form.motivA} onChange={e => set("motivA", Number(e.target.value))} /></div>
            <div style={{ flex: 1 }}><label style={lStyle}>MOTIVATION ELLE (1-10)</label><input style={iStyle} type="number" min={1} max={10} value={form.motivB} onChange={e => set("motivB", Number(e.target.value))} /></div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={lStyle}>RESSENTI LUI</label><input style={iStyle} value={form.feelingA} onChange={e => set("feelingA", e.target.value)} placeholder="Motivé 💪" /></div>
            <div style={{ flex: 1 }}><label style={lStyle}>RESSENTI ELLE</label><input style={iStyle} value={form.feelingB} onChange={e => set("feelingB", e.target.value)} placeholder="Confiante ✨" /></div>
          </div>
          <div><label style={lStyle}>NOTES</label><textarea style={{ ...iStyle, resize: "vertical", minHeight: 60 }} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1.5px solid #E8DDD0", background: "none", color: "#A89080", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Annuler</button>
          <button onClick={() => onSave(form)} style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #C9A84C, #E07B8A)", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Enregistrer ✓</button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ review, goals, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState(review?.id ? { ...review } : {
    date: today, mood: "🌟", note: "", highlights: "", challenges: "", nextActions: "",
    snapshots: Object.fromEntries(goals.map(g => [g.id, g.progress])),
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSnap = (id, v) => setForm(f => ({ ...f, snapshots: { ...f.snapshots, [id]: Number(v) } }));
  const iStyle = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E8DDD0", fontSize: 14, color: "#3D2C1E", background: "#FFFCF7", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lStyle = { fontSize: 11, fontWeight: 700, color: "#A89080", letterSpacing: 0.5, marginBottom: 4, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(60,30,10,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#FFFCF7", borderRadius: 24, padding: 32, width: "100%", maxWidth: 520, maxHeight: "93vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(100,50,20,0.3)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#3D2C1E", marginBottom: 4 }}>📅 {review?.id ? "Modifier le bilan" : "Nouveau bilan mensuel"}</div>
        <p style={{ fontSize: 13, color: "#A89080", margin: "0 0 22px" }}>Prenez 20 min ensemble pour faire le point 🍷</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={lStyle}>DATE DU BILAN</label><input style={iStyle} type="date" value={form.date} onChange={e => set("date", e.target.value)} /></div>
            <div style={{ flex: 1 }}>
              <label style={lStyle}>HUMEUR DU MOIS</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {MOODS.map(m => <button key={m} onClick={() => set("mood", m)} style={{ fontSize: 20, background: form.mood === m ? "#F0EBE3" : "none", border: form.mood === m ? "2px solid #C9A84C" : "2px solid transparent", borderRadius: 8, padding: "3px 5px", cursor: "pointer" }}>{m}</button>)}
              </div>
            </div>
          </div>

          <div>
            <label style={lStyle}>AVANCEMENT DES OBJECTIFS CE MOIS</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {goals.map(g => {
                const cat = CATEGORIES.find(c => c.id === g.category);
                return (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#FAF5EE", borderRadius: 10, padding: "8px 12px" }}>
                    <span>{cat.icon}</span>
                    <span style={{ flex: 1, fontSize: 12, color: "#5C4030", fontWeight: 600 }}>{g.title.length > 22 ? g.title.slice(0,22)+"…" : g.title}</span>
                    <input type="number" min={0} max={100} value={form.snapshots[g.id] ?? 0}
                      onChange={e => setSnap(g.id, e.target.value)}
                      style={{ width: 58, padding: "4px 8px", borderRadius: 8, border: `1.5px solid ${cat.color}`, textAlign: "center", fontSize: 13, fontWeight: 700, color: cat.color, background: `${cat.color}10`, outline: "none", fontFamily: "inherit" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: cat.color }}>%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div><label style={lStyle}>NOTE DU MOIS</label><textarea style={{ ...iStyle, resize: "vertical", minHeight: 60 }} value={form.note} onChange={e => set("note", e.target.value)} placeholder="Comment s'est passé ce mois ?" /></div>
          <div><label style={lStyle}>🌟 VICTOIRES À CÉLÉBRER</label><textarea style={{ ...iStyle, resize: "vertical", minHeight: 55 }} value={form.highlights} onChange={e => set("highlights", e.target.value)} placeholder="Qu'est-ce qu'on a bien réussi ?" /></div>
          <div><label style={lStyle}>⚡ DÉFIS RENCONTRÉS</label><textarea style={{ ...iStyle, resize: "vertical", minHeight: 55 }} value={form.challenges} onChange={e => set("challenges", e.target.value)} placeholder="Qu'est-ce qui a été difficile ?" /></div>
          <div><label style={lStyle}>🎯 ACTIONS DU MOIS PROCHAIN</label><textarea style={{ ...iStyle, resize: "vertical", minHeight: 55 }} value={form.nextActions} onChange={e => set("nextActions", e.target.value)} placeholder="Que va-t-on faire le mois prochain ?" /></div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1.5px solid #E8DDD0", background: "none", color: "#A89080", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Annuler</button>
          <button onClick={() => onSave(form)} style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7BAE7F, #5B8DC9)", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Enregistrer le bilan ✓</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [tab, setTab] = useState("goals");
  const [filter, setFilter] = useState("all");
  const [goalModal, setGoalModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);

  const filtered = filter === "all" ? goals : goals.filter(g => g.category === filter);
  const avgProgress = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
  const sortedReviews = [...reviews].sort((a, b) => new Date(a.date) - new Date(b.date));

  const saveGoal = (form) => { setGoals(gs => form.id ? gs.map(g => g.id === form.id ? form : g) : [...gs, { ...form, id: Date.now() }]); setGoalModal(null); };
  const saveReview = (form) => { setReviews(rs => form.id ? rs.map(r => r.id === form.id ? form : r) : [...rs, { ...form, id: Date.now() }]); setReviewModal(null); };

  const TABS = [
    { id: "goals", label: "🎯 Objectifs" },
    { id: "reviews", label: "📅 Bilans" },
    { id: "evolution", label: "📈 Évolution" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FDF8F2", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ background: "linear-gradient(135deg, #3D2C1E 0%, #6B3F2A 50%, #9B6B4A 100%)", padding: "40px 24px 50px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(201,168,76,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(224,123,138,0.15) 0%, transparent 40%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: "#C9A84C", fontWeight: 700, marginBottom: 8 }}>NOS OBJECTIFS À DEUX</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, color: "#FFF8EE", margin: "0 0 8px", lineHeight: 1.15 }}>Notre Tableau<br />de Couple 💕</h1>
          <p style={{ color: "#C9A0804D", fontSize: 13, margin: "0 0 28px" }}>Construire ensemble, célébrer ensemble</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Objectifs", value: goals.length, icon: "🎯" },
              { label: "Progression moy.", value: `${avgProgress}%`, icon: "📈" },
              { label: "Bilans réalisés", value: reviews.length, icon: "📅" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,248,238,0.10)", borderRadius: 14, padding: "12px 20px", backdropFilter: "blur(10px)", border: "1px solid rgba(255,248,238,0.12)" }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#FFF8EE" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#C9A08066", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px", marginTop: -20, position: "relative", zIndex: 2 }}>
        <div style={{ background: "#FFFCF7", borderRadius: 18, padding: "8px", boxShadow: "0 4px 20px rgba(100,50,20,0.10)", display: "flex", gap: 6 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 6px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.2s", background: tab === t.id ? "linear-gradient(135deg, #C9A84C, #E07B8A)" : "none", color: tab === t.id ? "#FFF" : "#A89080" }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 20px 40px" }}>
        {tab === "goals" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button onClick={() => setFilter("all")} style={{ padding: "7px 14px", borderRadius: 99, border: "none", background: filter === "all" ? "linear-gradient(135deg, #C9A84C, #E07B8A)" : "#F0EBE3", color: filter === "all" ? "#FFF" : "#8A7060", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>Tous ({goals.length})</button>
                {CATEGORIES.map(c => <button key={c.id} onClick={() => setFilter(c.id)} style={{ padding: "7px 14px", borderRadius: 99, border: "none", background: filter === c.id ? c.color : "#F0EBE3", color: filter === c.id ? "#FFF" : "#8A7060", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>{c.icon} {c.label}</button>)}
              </div>
              <button onClick={() => setGoalModal({ ...EMPTY_GOAL })} style={{ padding: "9px 18px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #C9A84C, #E07B8A)", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}>+ Ajouter</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map(g => <GoalCard key={g.id} goal={g} reviews={sortedReviews} onEdit={setGoalModal} onDelete={id => setGoals(gs => gs.filter(x => x.id !== id))} />)}
            </div>
          </>
        )}

        {tab === "reviews" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#3D2C1E" }}>Nos bilans mensuels</div>
              <button onClick={() => setReviewModal({})} style={{ padding: "9px 18px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7BAE7F, #5B8DC9)", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>+ Nouveau bilan</button>
            </div>
            {sortedReviews.length === 0
              ? <div style={{ textAlign: "center", color: "#C0A890", padding: 60, fontSize: 14, fontStyle: "italic" }}>Aucun bilan encore — faites votre premier rituel mensuel ensemble ! 🍷</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{[...sortedReviews].reverse().map(r => <ReviewCard key={r.id} review={r} goals={goals} onEdit={setReviewModal} onDelete={id => setReviews(rs => rs.filter(x => x.id !== id))} />)}</div>
            }
          </>
        )}

        {tab === "evolution" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <EvolutionChart goals={goals} reviews={sortedReviews} />
            <StreakCalendar reviews={reviews} />
          </div>
        )}
      </div>

      {goalModal && <GoalModal goal={goalModal} onSave={saveGoal} onClose={() => setGoalModal(null)} />}
      {reviewModal !== null && <ReviewModal review={reviewModal} goals={goals} onSave={saveReview} onClose={() => setReviewModal(null)} />}
    </div>
  );
}
