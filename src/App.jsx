import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";

const CATEGORIES = [
  { id: "finance", label: "Finances", icon: "💰", color: "#C9A84C" },
  { id: "home", label: "Vie commune", icon: "🏡", color: "#7BAE7F" },
  { id: "love", label: "Relation", icon: "💑", color: "#E07B8A" },
  { id: "adventure", label: "Aventures", icon: "🌍", color: "#5B8DC9" },
  { id: "growth", label: "Croissance", icon: "🧘", color: "#9B72CF" },
];

const OWNERS = [
  { id: "both", label: "Nous", icon: "💞" },
  { id: "A", label: "Lui", icon: "👤" },
  { id: "B", label: "Elle", icon: "👤" },
];

const STATUSES = {
  active: { label: "Actif", icon: "🎯", color: "#5B8DC9", bg: "#E6F1FB", text: "#185FA5" },
  done: { label: "Atteint", icon: "🏆", color: "#639922", bg: "#EAF3DE", text: "#3B6D11" },
  paused: { label: "En pause", icon: "⏸", color: "#BA7517", bg: "#FAEEDA", text: "#854F0B" },
  archived: { label: "Archivé", icon: "📦", color: "#888780", bg: "#F1EFE8", text: "#5F5E5A" },
};

const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];
const MOODS = ["🌟","💪","😊","😐","😔","🔥","💕","🌱"];

const INITIAL_GOALS = [
  { id: 1, title: "Épargner 6 000€", category: "finance", owner: "both", deadline: "2026-12-31", progress: 35, status: "active", completedDate: null, motivA: 8, motivB: 9, notes: "Réduire abonnements inutiles", feelingA: "Motivé 💪", feelingB: "Confiante ✨", milestones: [{ id: 11, label: "Atteindre 1 000€", date: "2026-03-31", done: true }, { id: 12, label: "Atteindre 3 000€", date: "2026-07-31", done: false }, { id: 13, label: "Atteindre 6 000€", date: "2026-12-31", done: false }] },
  { id: 2, title: "Week-end à Lisbonne", category: "adventure", owner: "both", deadline: "2026-08-15", progress: 60, status: "active", completedDate: null, motivA: 9, motivB: 10, notes: "Regarder les vols en avril", feelingA: "Impatient 🌞", feelingB: "Excitée 🎉", milestones: [{ id: 21, label: "Réserver le vol", date: "2026-04-15", done: true }, { id: 22, label: "Réserver l'hôtel", date: "2026-06-30", done: false }] },
  { id: 3, title: "1 soirée sans écrans / semaine", category: "love", owner: "both", deadline: "2026-06-01", progress: 75, status: "active", completedDate: null, motivA: 7, motivB: 8, notes: "Jeux de société, cuisine ensemble", feelingA: "Bien 🙂", feelingB: "Heureuse 💕", milestones: [{ id: 31, label: "4 semaines consécutives", date: "2026-06-01", done: false }] },
  { id: 4, title: "Apprendre l'espagnol", category: "growth", owner: "B", deadline: "2026-12-31", progress: 20, status: "paused", completedDate: null, motivA: 6, motivB: 9, notes: "App Duolingo le soir", feelingA: "Hésitant 😅", feelingB: "Très motivée 🔥", milestones: [{ id: 41, label: "Terminer niveau A1", date: "2026-09-30", done: false }] },
];

const INITIAL_REVIEWS = [
  { id: 1, date: "2026-01-15", mood: "🌟", note: "Super mois, bien avancé sur l'épargne !", snapshots: { 1: 10, 2: 20, 3: 30, 4: 5 }, highlights: "On a ouvert notre livret épargne commun 🎉", challenges: "Du mal à maintenir les soirées sans écrans", nextActions: "Réserver le vol Lisbonne avant fin février" },
  { id: 2, date: "2026-02-15", mood: "💪", note: "Mois intense mais on reste alignés.", snapshots: { 1: 20, 2: 40, 3: 50, 4: 10 }, highlights: "Vol Lisbonne réservé ! ✈️", challenges: "L'espagnol un peu mis de côté", nextActions: "Reprendre Duolingo ensemble le soir" },
  { id: 3, date: "2026-03-15", mood: "😊", note: "Beau progrès sur la relation !", snapshots: { 1: 28, 2: 50, 3: 65, 4: 15 }, highlights: "3 soirées sans écrans réussies 🕯️", challenges: "Épargne légèrement en dessous", nextActions: "Revoir le budget mensuel ensemble" },
];

const DEFAULT_SETTINGS = { nameA: "Lui", nameB: "Elle", reminderDay: 15 };
const emptyGoal = () => ({ title: "", category: "finance", owner: "both", deadline: "", progress: 0, status: "active", completedDate: null, motivA: 5, motivB: 5, notes: "", feelingA: "", feelingB: "", milestones: [] });

/* ---------- Petits composants visuels ---------- */
function ProgressRing({ value, color }) {
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <svg width="70" height="70" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="35" cy="35" r={r} fill="none" stroke="#F0EBE3" strokeWidth="6" />
      <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ - (value / 100) * circ} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
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
  const pts = data.map((v, i) => `${pad + (i / (data.length - 1)) * (w - pad * 2)},${h - pad - (v / max) * (h - pad * 2)}`);
  return (
    <svg width={w} height={h}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length-1].split(",")[0]} cy={pts[pts.length-1].split(",")[1]} r="3.5" fill={color} />
    </svg>
  );
}

/* ---------- Confirmation de suppression (BLOC 1) ---------- */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(60,30,10,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#FFFCF7", borderRadius: 20, padding: 28, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(100,50,20,0.3)", textAlign: "center" }}>
        <div style={{ fontSize: 34, marginBottom: 10 }}>🗑️</div>
        <div style={{ fontSize: 16, color: "#3D2C1E", fontWeight: 600, marginBottom: 6 }}>Confirmer la suppression</div>
        <div style={{ fontSize: 13, color: "#A89080", marginBottom: 22, lineHeight: 1.5 }}>{message}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 11, borderRadius: 12, border: "1.5px solid #E8DDD0", background: "none", color: "#A89080", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Annuler</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 11, borderRadius: 12, border: "none", background: "#E24B4A", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Carte objectif ---------- */
function GoalCard({ goal, reviews, settings, onEdit, onDelete, onSetStatus, onToggleMilestone }) {
  const cat = CATEGORIES.find(c => c.id === goal.category);
  const owner = OWNERS.find(o => o.id === goal.owner);
  const st = STATUSES[goal.status];
  const gap = Math.abs(goal.motivA - goal.motivB);
  const deadline = goal.deadline ? new Date(goal.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const sparkData = [...reviews.map(r => r.snapshots?.[goal.id]).filter(v => v !== undefined), goal.progress];
  const ownerLabel = goal.owner === "A" ? settings.nameA : goal.owner === "B" ? settings.nameB : "Nous";
  const isInactive = goal.status === "paused" || goal.status === "archived";

  return (
    <div style={{ background: "#FFFCF7", borderRadius: 20, padding: "22px 24px", boxShadow: "0 2px 16px rgba(180,140,100,0.10)", border: goal.status === "done" ? "1.5px solid #C0DD97" : `1.5px solid ${cat.color}22`, display: "flex", flexDirection: "column", gap: 14, transition: "transform 0.2s, box-shadow 0.2s", opacity: isInactive ? 0.72 : 1 }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${cat.color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 16px rgba(180,140,100,0.10)"; }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: cat.color, background: `${cat.color}18`, borderRadius: 99, padding: "3px 9px" }}>{cat.icon} {cat.label}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#8A7060", background: "#F0EBE3", borderRadius: 99, padding: "3px 9px" }}>{owner.icon} {ownerLabel}</span>
            {goal.status !== "active" && <span style={{ fontSize: 11, fontWeight: 600, color: st.text, background: st.bg, borderRadius: 99, padding: "3px 9px" }}>{st.icon} {st.label}</span>}
          </div>
          <div style={{ fontSize: 17, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#3D2C1E", lineHeight: 1.3 }}>{goal.title}</div>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <button onClick={() => onEdit(goal)} aria-label="Modifier l'objectif" title="Modifier" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.4, padding: 4 }}>✏️</button>
          <button onClick={() => onDelete(goal)} aria-label="Supprimer l'objectif" title="Supprimer" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.4, padding: 4 }}>🗑️</button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ProgressRing value={goal.progress} color={goal.status === "done" ? "#639922" : cat.color} />
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(90deg)", fontSize: 12, fontWeight: 800, color: goal.status === "done" ? "#639922" : cat.color }}>{goal.progress}%</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#A89080", marginBottom: 4, fontWeight: 700, letterSpacing: 0.5 }}>{goal.status === "done" && goal.completedDate ? "ATTEINT LE" : "ÉCHÉANCE"}</div>
          <div style={{ fontSize: 13, color: "#5C4030", fontWeight: 600 }}>{goal.status === "done" && goal.completedDate ? "🏆 " + new Date(goal.completedDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "📅 " + deadline}</div>
        </div>
        {sparkData.length >= 2 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <SparkLine data={sparkData} color={cat.color} />
            <span style={{ fontSize: 9, color: "#B0986A", fontWeight: 600 }}>évolution</span>
          </div>
        )}
      </div>

      {/* Jalons multiples (BLOC 4) */}
      {goal.milestones && goal.milestones.length > 0 && (
        <div style={{ background: "#FAF5EE", borderRadius: 12, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: "#A89080", fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>JALONS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {goal.milestones.map(m => {
              const overdue = m.date && !m.done && new Date(m.date) < new Date(new Date().toDateString());
              const mDate = m.date ? new Date(m.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : null;
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => onToggleMilestone(goal.id, m.id)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", flex: 1 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 6, border: m.done ? "none" : `1.5px solid ${cat.color}66`, background: m.done ? cat.color : "transparent", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>{m.done ? "✓" : ""}</span>
                    <span style={{ fontSize: 12, color: m.done ? "#A89080" : "#5C4030", textDecoration: m.done ? "line-through" : "none" }}>{m.label}</span>
                  </button>
                  {mDate && <span style={{ fontSize: 10, fontWeight: 600, color: m.done ? "#B0A898" : overdue ? "#C0504D" : "#A89080", background: overdue ? "#FFF0EF" : "#F0EBE3", borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap", flexShrink: 0 }}>{overdue ? "⚠️ " : "📅 "}{mDate}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ background: "#FAF5EE", borderRadius: 12, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, color: "#A89080", fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>THERMOMÈTRE DE MOTIVATION</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div><span style={{ fontSize: 11, color: "#7A6050" }}>👤 {settings.nameA} &nbsp;</span><MotivBar value={goal.motivA} color={cat.color} /></div>
          <div><span style={{ fontSize: 11, color: "#7A6050" }}>👤 {settings.nameB} &nbsp;</span><MotivBar value={goal.motivB} color={cat.color} /></div>
        </div>
        {gap > 3 && <div style={{ marginTop: 8, fontSize: 11, color: "#C0504D", fontWeight: 600, background: "#FFF0EF", borderRadius: 8, padding: "4px 8px" }}>⚠️ Écart élevé — à discuter ensemble !</div>}
      </div>

      {(goal.feelingA || goal.feelingB) && (
        <div style={{ display: "flex", gap: 8 }}>
          {goal.feelingA && <div style={{ flex: 1, background: `${cat.color}10`, borderRadius: 10, padding: "7px 10px", fontSize: 12, color: "#5C4030" }}>{settings.nameA} : {goal.feelingA}</div>}
          {goal.feelingB && <div style={{ flex: 1, background: `${cat.color}10`, borderRadius: 10, padding: "7px 10px", fontSize: 12, color: "#5C4030" }}>{settings.nameB} : {goal.feelingB}</div>}
        </div>
      )}
      {goal.notes && <div style={{ fontSize: 12, color: "#A08060", borderLeft: `3px solid ${cat.color}`, paddingLeft: 10, fontStyle: "italic" }}>📝 {goal.notes}</div>}

      {/* Actions de statut (BLOC 2) */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", borderTop: "0.5px solid #EFE7DC", paddingTop: 12 }}>
        {goal.status !== "done" && <button onClick={() => onSetStatus(goal.id, "done")} style={statusBtn("#EAF3DE", "#3B6D11")}>🏆 Atteint</button>}
        {goal.status !== "paused" && goal.status !== "done" && <button onClick={() => onSetStatus(goal.id, "paused")} style={statusBtn("#FAEEDA", "#854F0B")}>⏸ Pause</button>}
        {goal.status !== "archived" && <button onClick={() => onSetStatus(goal.id, "archived")} style={statusBtn("#F1EFE8", "#5F5E5A")}>📦 Archiver</button>}
        {goal.status !== "active" && <button onClick={() => onSetStatus(goal.id, "active")} style={statusBtn("#E6F1FB", "#185FA5")}>↻ Réactiver</button>}
      </div>
    </div>
  );
}
const statusBtn = (bg, color) => ({ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 99, border: "none", cursor: "pointer", background: bg, color });

/* ---------- Carte bilan ---------- */
function ReviewCard({ review, goals, settings, onEdit, onDelete }) {
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
        <div style={{ display: "flex", gap: 2 }}>
          <button onClick={() => onEdit(review)} aria-label="Modifier le bilan" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.4, padding: 4 }}>✏️</button>
          <button onClick={() => onDelete(review)} aria-label="Supprimer le bilan" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.4, padding: 4 }}>🗑️</button>
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
        {review.highlights && <div style={{ background: "#F0F7F0", borderRadius: 12, padding: "10px 12px" }}><div style={{ fontSize: 10, color: "#7BAE7F", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>🌟 VICTOIRES</div><div style={{ fontSize: 12, color: "#3D5C3E" }}>{review.highlights}</div></div>}
        {review.challenges && <div style={{ background: "#FFF5F0", borderRadius: 12, padding: "10px 12px" }}><div style={{ fontSize: 10, color: "#E07B8A", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>⚡ DÉFIS</div><div style={{ fontSize: 12, color: "#5C3030" }}>{review.challenges}</div></div>}
      </div>
      {review.nextActions && <div style={{ background: "#F5F0FF", borderRadius: 12, padding: "10px 12px" }}><div style={{ fontSize: 10, color: "#9B72CF", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>🎯 ACTIONS DU MOIS PROCHAIN</div><div style={{ fontSize: 12, color: "#3D2C5C" }}>{review.nextActions}</div></div>}
    </div>
  );
}

/* ---------- Évolution (BLOC 1 : crash + gain négatif corrigés) ---------- */
function EvolutionChart({ goals, reviews }) {
  const [selectedGoal, setSelectedGoal] = useState(goals[0]?.id);
  useEffect(() => {
    if (!goals.find(g => g.id === selectedGoal)) setSelectedGoal(goals[0]?.id);
  }, [goals, selectedGoal]);

  const goal = goals.find(g => g.id === selectedGoal);
  const cat = goal ? CATEGORIES.find(c => c.id === goal.category) : null;
  if (!goal) return <div style={{ background: "#FFFCF7", borderRadius: 20, padding: 24, border: "1.5px solid #E8DDD0", textAlign: "center", color: "#C0A890", fontStyle: "italic" }}>Ajoutez un objectif pour voir son évolution.</div>;

  const points = [...reviews.map(r => {
    const d = new Date(r.date);
    return { label: `${MONTHS_FR[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, value: r.snapshots?.[selectedGoal] ?? null };
  }).filter(p => p.value !== null), { label: "Auj.", value: goal.progress }];
  const totalGain = points.length >= 2 ? points[points.length-1].value - points[0].value : 0;
  const gainStr = `${totalGain >= 0 ? "+" : ""}${totalGain}%`;

  return (
    <div style={{ background: "#FFFCF7", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(180,140,100,0.10)", border: "1.5px solid #E8DDD0" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#3D2C1E", marginBottom: 16 }}>📈 Évolution dans le temps</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
        {goals.map(g => {
          const c = CATEGORIES.find(x => x.id === g.category);
          return <button key={g.id} onClick={() => setSelectedGoal(g.id)} style={{ padding: "6px 12px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: selectedGoal === g.id ? c.color : `${c.color}18`, color: selectedGoal === g.id ? "#FFF" : c.color }}>{c.icon} {g.title.length > 20 ? g.title.slice(0,20)+"…" : g.title}</button>;
        })}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140, padding: "0 4px" }}>
        {points.map((p, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: cat.color }}>{p.value}%</div>
            <div style={{ width: "100%", borderRadius: "8px 8px 0 0", background: i === points.length-1 ? cat.color : `${cat.color}55`, height: `${(p.value / 100) * 110}px`, minHeight: 4, transition: "height 0.6s ease" }} />
            <div style={{ fontSize: 10, color: "#A89080", fontWeight: 600 }}>{p.label}</div>
          </div>
        ))}
      </div>
      {points.length >= 2 && (
        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[{ label: "Départ", value: `${points[0].value}%`, color: "#A89080" }, { label: "Aujourd'hui", value: `${points[points.length-1].value}%`, color: cat.color }, { label: "Gain total", value: gainStr, color: totalGain >= 0 ? "#7BAE7F" : "#C0504D" }].map(s => (
            <div key={s.label} style={{ flex: 1, background: "#FAF5EE", borderRadius: 12, padding: "10px 14px", minWidth: 80 }}>
              <div style={{ fontSize: 10, color: "#A89080", fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Calendrier régularité (BLOC 1 : année dynamique) ---------- */
function StreakCalendar({ reviews }) {
  const years = [...new Set(reviews.map(r => new Date(r.date).getFullYear()))];
  const [year, setYear] = useState(years.length ? Math.max(...years) : new Date().getFullYear());
  const allYears = [...new Set([...years, new Date().getFullYear()])].sort();
  const count = reviews.filter(r => new Date(r.date).getFullYear() === year).length;
  return (
    <div style={{ background: "#FFFCF7", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(180,140,100,0.10)", border: "1.5px solid #E8DDD0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#3D2C1E" }}>🔥 Régularité des bilans</div>
        {allYears.length > 1 && (
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ fontSize: 13, padding: "4px 10px", borderRadius: 8, border: "1.5px solid #E8DDD0", background: "#FFFCF7", color: "#5C4030", fontFamily: "inherit" }}>
            {allYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>
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
      <div style={{ marginTop: 14, fontSize: 13, color: "#7BAE7F", fontWeight: 600 }}>{count} bilan{count > 1 ? "s" : ""} en {year} — {count >= 6 ? "Incroyable régularité ! 🏆" : count >= 3 ? "Continuez comme ça ! 🌟" : "Beau départ ! 🌱"}</div>
    </div>
  );
}

/* ---------- Mur de victoires (BLOC 3) ---------- */
function VictoryWall({ goals, reviews }) {
  const done = goals.filter(g => g.status === "done").sort((a, b) => new Date(b.completedDate || 0) - new Date(a.completedDate || 0));
  const celebrated = reviews.filter(r => r.highlights).sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg, #EAF3DE, #E1F5EE)", borderRadius: 20, padding: 24, border: "1.5px solid #C0DD97", textAlign: "center" }}>
        <div style={{ fontSize: 38 }}>🏆</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#3B6D11" }}>{done.length} objectif{done.length > 1 ? "s" : ""} atteint{done.length > 1 ? "s" : ""}</div>
        <div style={{ fontSize: 13, color: "#639922" }}>Votre album de fierté commun</div>
      </div>
      {done.length === 0 && celebrated.length === 0 ? (
        <div style={{ textAlign: "center", color: "#C0A890", padding: 40, fontSize: 14, fontStyle: "italic" }}>Aucune victoire encore — marquez un objectif comme "Atteint" pour le voir apparaître ici ! 🌱</div>
      ) : (
        <>
          {done.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
              {done.map(g => {
                const cat = CATEGORIES.find(c => c.id === g.category);
                return (
                  <div key={g.id} style={{ background: "#FFFCF7", borderRadius: 16, padding: "18px 20px", border: "1.5px solid #C0DD97", boxShadow: "0 2px 12px rgba(99,153,34,0.10)" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{cat.icon}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#3D2C1E", marginBottom: 4 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: "#639922", fontWeight: 600 }}>🏆 Atteint {g.completedDate ? "le " + new Date(g.completedDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""}</div>
                  </div>
                );
              })}
            </div>
          )}
          {celebrated.length > 0 && (
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#3D2C1E", marginBottom: 12 }}>🌟 Moments célébrés</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {celebrated.map(r => {
                  const d = new Date(r.date);
                  return (
                    <div key={r.id} style={{ background: "#FFFCF7", borderRadius: 14, padding: "12px 16px", border: "1.5px solid #E8DDD0", display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ fontSize: 22 }}>{r.mood}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "#3D5C3E" }}>{r.highlights}</div>
                        <div style={{ fontSize: 11, color: "#A89080", marginTop: 2 }}>{MONTHS_FR[d.getMonth()]} {d.getFullYear()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- Modale objectif (BLOC 1 validation + BLOC 4 owner/jalons) ---------- */
function GoalModal({ goal, settings, onSave, onClose }) {
  const [form, setForm] = useState({ ...goal, milestones: goal.milestones || [] });
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, isNaN(v) ? lo : v));

  const addMilestone = () => setForm(f => ({ ...f, milestones: [...f.milestones, { id: Date.now(), label: "", date: "", done: false }] }));
  const updateMilestone = (id, key, value) => setForm(f => ({ ...f, milestones: f.milestones.map(m => m.id === id ? { ...m, [key]: value } : m) }));
  const removeMilestone = (id) => setForm(f => ({ ...f, milestones: f.milestones.filter(m => m.id !== id) }));

  const submit = () => {
    if (!form.title.trim()) { setError("Le titre est obligatoire."); return; }
    const cleaned = { ...form, title: form.title.trim(), progress: clamp(Number(form.progress), 0, 100), motivA: clamp(Number(form.motivA), 1, 10), motivB: clamp(Number(form.motivB), 1, 10), milestones: form.milestones.filter(m => m.label.trim()) };
    onSave(cleaned);
  };

  const iStyle = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E8DDD0", fontSize: 14, color: "#3D2C1E", background: "#FFFCF7", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lStyle = { fontSize: 11, fontWeight: 700, color: "#A89080", letterSpacing: 0.5, marginBottom: 4, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(60,30,10,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#FFFCF7", borderRadius: 24, padding: 32, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(100,50,20,0.3)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#3D2C1E", marginBottom: 24 }}>{goal.id ? "✏️ Modifier" : "✨ Nouvel objectif"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={lStyle}>TITRE *</label><input style={{ ...iStyle, borderColor: error && !form.title.trim() ? "#E24B4A" : "#E8DDD0" }} value={form.title} onChange={e => { set("title", e.target.value); setError(""); }} placeholder="Ex: Partir en voyage au Japon" /></div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={lStyle}>CATÉGORIE</label><select style={iStyle} value={form.category} onChange={e => set("category", e.target.value)}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></div>
            <div style={{ flex: 1 }}><label style={lStyle}>OBJECTIF DE</label><select style={iStyle} value={form.owner} onChange={e => set("owner", e.target.value)}>
              <option value="both">💞 Nous</option><option value="A">👤 {settings.nameA}</option><option value="B">👤 {settings.nameB}</option>
            </select></div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={lStyle}>DATE BUTOIR</label><input style={iStyle} type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={lStyle}>AVANCEMENT (%)</label><input style={iStyle} type="number" min={0} max={100} value={form.progress} onChange={e => set("progress", e.target.value)} /></div>
          </div>
          <div>
            <label style={lStyle}>JALONS</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {form.milestones.map(m => (
                <div key={m.id} style={{ display: "flex", gap: 6 }}>
                  <input style={{ ...iStyle, flex: 2 }} value={m.label} onChange={e => updateMilestone(m.id, "label", e.target.value)} placeholder="Ex: Atteindre 1 000€" />
                  <input style={{ ...iStyle, flex: 1, padding: "9px 8px" }} type="date" value={m.date || ""} onChange={e => updateMilestone(m.id, "date", e.target.value)} aria-label="Échéance du jalon" />
                  <button onClick={() => removeMilestone(m.id)} aria-label="Retirer le jalon" style={{ background: "#FCEBEB", border: "none", borderRadius: 10, color: "#A32D2D", cursor: "pointer", padding: "0 12px", fontSize: 16, flexShrink: 0 }}>−</button>
                </div>
              ))}
              <button onClick={addMilestone} style={{ background: "#F0EBE3", border: "none", borderRadius: 10, color: "#8A7060", cursor: "pointer", padding: "8px", fontSize: 12, fontWeight: 600 }}>+ Ajouter un jalon</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={lStyle}>MOTIVATION {settings.nameA.toUpperCase()} (1-10)</label><input style={iStyle} type="number" min={1} max={10} value={form.motivA} onChange={e => set("motivA", e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={lStyle}>MOTIVATION {settings.nameB.toUpperCase()} (1-10)</label><input style={iStyle} type="number" min={1} max={10} value={form.motivB} onChange={e => set("motivB", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={lStyle}>RESSENTI {settings.nameA.toUpperCase()}</label><input style={iStyle} value={form.feelingA} onChange={e => set("feelingA", e.target.value)} placeholder="Motivé 💪" /></div>
            <div style={{ flex: 1 }}><label style={lStyle}>RESSENTI {settings.nameB.toUpperCase()}</label><input style={iStyle} value={form.feelingB} onChange={e => set("feelingB", e.target.value)} placeholder="Confiante ✨" /></div>
          </div>
          <div><label style={lStyle}>NOTES</label><textarea style={{ ...iStyle, resize: "vertical", minHeight: 60 }} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
        </div>
        {error && <div style={{ color: "#A32D2D", fontSize: 12, marginTop: 12, fontWeight: 600 }}>⚠️ {error}</div>}
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1.5px solid #E8DDD0", background: "none", color: "#A89080", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Annuler</button>
          <button onClick={submit} style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #C9A84C, #E07B8A)", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Enregistrer ✓</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Modale bilan (BLOC 1 validation + BLOC 3 synchro) ---------- */
function ReviewModal({ review, goals, existingDates, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState(review?.id ? { ...review } : { date: today, mood: "🌟", note: "", highlights: "", challenges: "", nextActions: "", snapshots: Object.fromEntries(goals.map(g => [g.id, g.progress])) });
  const [syncProgress, setSyncProgress] = useState(true);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSnap = (id, v) => setForm(f => ({ ...f, snapshots: { ...f.snapshots, [id]: Math.max(0, Math.min(100, isNaN(Number(v)) ? 0 : Number(v))) } }));

  const submit = () => {
    if (!form.date) { setError("La date du bilan est obligatoire."); return; }
    const monthKey = form.date.slice(0, 7);
    const dup = existingDates.some(e => e.id !== form.id && e.date.slice(0, 7) === monthKey);
    if (dup) { setError("Un bilan existe déjà pour ce mois-ci."); return; }
    onSave(form, syncProgress);
  };

  const iStyle = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E8DDD0", fontSize: 14, color: "#3D2C1E", background: "#FFFCF7", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lStyle = { fontSize: 11, fontWeight: 700, color: "#A89080", letterSpacing: 0.5, marginBottom: 4, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(60,30,10,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#FFFCF7", borderRadius: 24, padding: 32, width: "100%", maxWidth: 520, maxHeight: "93vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(100,50,20,0.3)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#3D2C1E", marginBottom: 4 }}>📅 {review?.id ? "Modifier le bilan" : "Nouveau bilan mensuel"}</div>
        <p style={{ fontSize: 13, color: "#A89080", margin: "0 0 22px" }}>Prenez 20 min ensemble pour faire le point 🍷</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={lStyle}>DATE DU BILAN *</label><input style={iStyle} type="date" value={form.date} onChange={e => { set("date", e.target.value); setError(""); }} /></div>
            <div style={{ flex: 1 }}>
              <label style={lStyle}>HUMEUR DU MOIS</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{MOODS.map(m => <button key={m} onClick={() => set("mood", m)} style={{ fontSize: 20, background: form.mood === m ? "#F0EBE3" : "none", border: form.mood === m ? "2px solid #C9A84C" : "2px solid transparent", borderRadius: 8, padding: "3px 5px", cursor: "pointer" }}>{m}</button>)}</div>
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
                    <input type="number" min={0} max={100} value={form.snapshots[g.id] ?? 0} onChange={e => setSnap(g.id, e.target.value)} style={{ width: 58, padding: "4px 8px", borderRadius: 8, border: `1.5px solid ${cat.color}`, textAlign: "center", fontSize: 13, fontWeight: 700, color: cat.color, background: `${cat.color}10`, outline: "none", fontFamily: "inherit" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: cat.color }}>%</span>
                  </div>
                );
              })}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12, color: "#5C4030", cursor: "pointer" }}>
              <input type="checkbox" checked={syncProgress} onChange={e => setSyncProgress(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#7BAE7F" }} />
              Mettre à jour l'avancement des objectifs avec ces valeurs
            </label>
          </div>
          <div><label style={lStyle}>NOTE DU MOIS</label><textarea style={{ ...iStyle, resize: "vertical", minHeight: 60 }} value={form.note} onChange={e => set("note", e.target.value)} placeholder="Comment s'est passé ce mois ?" /></div>
          <div><label style={lStyle}>🌟 VICTOIRES À CÉLÉBRER</label><textarea style={{ ...iStyle, resize: "vertical", minHeight: 55 }} value={form.highlights} onChange={e => set("highlights", e.target.value)} placeholder="Qu'est-ce qu'on a bien réussi ?" /></div>
          <div><label style={lStyle}>⚡ DÉFIS RENCONTRÉS</label><textarea style={{ ...iStyle, resize: "vertical", minHeight: 55 }} value={form.challenges} onChange={e => set("challenges", e.target.value)} placeholder="Qu'est-ce qui a été difficile ?" /></div>
          <div><label style={lStyle}>🎯 ACTIONS DU MOIS PROCHAIN</label><textarea style={{ ...iStyle, resize: "vertical", minHeight: 55 }} value={form.nextActions} onChange={e => set("nextActions", e.target.value)} placeholder="Que va-t-on faire le mois prochain ?" /></div>
        </div>
        {error && <div style={{ color: "#A32D2D", fontSize: 12, marginTop: 12, fontWeight: 600 }}>⚠️ {error}</div>}
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1.5px solid #E8DDD0", background: "none", color: "#A89080", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Annuler</button>
          <button onClick={submit} style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7BAE7F, #5B8DC9)", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Enregistrer le bilan ✓</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Modale réglages (BLOC 4 : prénoms + rappel + export) ---------- */
function SettingsModal({ settings, code, onSave, onClose, onExport, onDisconnect }) {
  const [form, setForm] = useState({ ...settings });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const iStyle = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E8DDD0", fontSize: 14, color: "#3D2C1E", background: "#FFFCF7", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lStyle = { fontSize: 11, fontWeight: 700, color: "#A89080", letterSpacing: 0.5, marginBottom: 4, display: "block" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(60,30,10,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#FFFCF7", borderRadius: 24, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(100,50,20,0.3)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#3D2C1E", marginBottom: 24 }}>⚙️ Réglages</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={lStyle}>PRÉNOM 1</label><input style={iStyle} value={form.nameA} onChange={e => set("nameA", e.target.value)} placeholder="Lui" /></div>
            <div style={{ flex: 1 }}><label style={lStyle}>PRÉNOM 2</label><input style={iStyle} value={form.nameB} onChange={e => set("nameB", e.target.value)} placeholder="Elle" /></div>
          </div>
          <div><label style={lStyle}>JOUR DU RAPPEL MENSUEL</label><input style={iStyle} type="number" min={1} max={28} value={form.reminderDay} onChange={e => set("reminderDay", Math.max(1, Math.min(28, Number(e.target.value) || 1)))} /><div style={{ fontSize: 11, color: "#B0986A", marginTop: 4 }}>Un rappel s'affichera chaque mois à partir de ce jour si aucun bilan n'est fait.</div></div>
          <button onClick={onExport} style={{ background: "#F0EBE3", border: "none", borderRadius: 12, color: "#5C4030", cursor: "pointer", padding: "11px", fontSize: 13, fontWeight: 600 }}>💾 Exporter mes données (JSON)</button>
          <div style={{ background: "#FAF5EE", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#A89080", letterSpacing: 0.5, marginBottom: 4 }}>CODE COUPLE PARTAGÉ</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#5C4030", letterSpacing: 2 }}>{code}</div>
            <div style={{ fontSize: 11, color: "#B0986A", marginTop: 4 }}>Communiquez ce code à votre partenaire pour qu'il/elle accède au même tableau.</div>
            <button onClick={onDisconnect} style={{ marginTop: 10, background: "none", border: "1.5px solid #E8DDD0", borderRadius: 10, color: "#A89080", cursor: "pointer", padding: "8px 12px", fontSize: 12, fontWeight: 600 }}>↩ Se déconnecter / changer de code</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1.5px solid #E8DDD0", background: "none", color: "#A89080", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Annuler</button>
          <button onClick={() => onSave({ ...form, nameA: form.nameA.trim() || "Lui", nameB: form.nameB.trim() || "Elle" })} style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #C9A84C, #E07B8A)", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Enregistrer ✓</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Écran de connexion : code couple (partage Supabase) ---------- */
function CodeGate({ onConnect }) {
  const [code, setCode] = useState("");
  const submit = () => { const c = code.trim().toUpperCase(); if (c.length >= 3) onConnect(c); };
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #3D2C1E 0%, #6B3F2A 50%, #9B6B4A 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ background: "#FFFCF7", borderRadius: 28, padding: 36, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.35)", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>💕</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#3D2C1E", margin: "0 0 8px" }}>Notre Tableau de Couple</h1>
        <p style={{ fontSize: 14, color: "#A89080", margin: "0 0 24px", lineHeight: 1.5 }}>Entrez le <strong>même code couple</strong> sur vos deux téléphones pour partager le même tableau.</p>
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Ex : NOUS2026"
          style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid #E8DDD0", fontSize: 18, fontWeight: 700, letterSpacing: 2, textAlign: "center", color: "#3D2C1E", background: "#FAF5EE", outline: "none", boxSizing: "border-box", textTransform: "uppercase", fontFamily: "inherit" }}
        />
        <button onClick={submit} style={{ width: "100%", marginTop: 16, padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #C9A84C, #E07B8A)", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
          Accéder à notre tableau →
        </button>
        <p style={{ fontSize: 12, color: "#C0A890", margin: "18px 0 0", lineHeight: 1.5 }}>
          🔒 Choisissez un code personnel et difficile à deviner. Toute personne connaissant ce code peut voir votre tableau.
        </p>
      </div>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [code, setCode] = useState(() => { try { return localStorage.getItem("cg_code") || ""; } catch { return ""; } });
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("ready"); // ready | saving | offline
  const applyingRemote = useRef(false);
  const loaded = useRef(false);

  /* Chargement initial + écoute temps réel */
  useEffect(() => {
    if (!code) { setLoading(false); return; }
    let active = true;
    loaded.current = false;
    setLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase.from("tableaux").select("*").eq("id", code).maybeSingle();
        if (!active) return;
        if (error) throw error;
        if (data) {
          applyingRemote.current = true;
          setGoals(data.goals ?? INITIAL_GOALS);
          setReviews(data.reviews ?? INITIAL_REVIEWS);
          setSettings(data.settings ?? DEFAULT_SETTINGS);
          setTimeout(() => { applyingRemote.current = false; }, 60);
        } else {
          await supabase.from("tableaux").insert({ id: code, goals: INITIAL_GOALS, reviews: INITIAL_REVIEWS, settings: DEFAULT_SETTINGS });
        }
        loaded.current = true;
        setSyncStatus("ready");
      } catch (e) {
        setSyncStatus("offline");
      } finally {
        if (active) setLoading(false);
      }
    })();

    const channel = supabase.channel("tableau-" + code)
      .on("postgres_changes", { event: "*", schema: "public", table: "tableaux", filter: "id=eq." + code }, payload => {
        const row = payload.new;
        if (!row) return;
        applyingRemote.current = true;
        setGoals(row.goals ?? []);
        setReviews(row.reviews ?? []);
        setSettings(row.settings ?? DEFAULT_SETTINGS);
        setTimeout(() => { applyingRemote.current = false; }, 60);
      })
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [code]);

  /* Sauvegarde automatique (debounce) */
  useEffect(() => {
    if (!code || !loaded.current || applyingRemote.current) return;
    setSyncStatus("saving");
    const t = setTimeout(async () => {
      try {
        const { error } = await supabase.from("tableaux").update({ goals, reviews, settings, updated_at: new Date().toISOString() }).eq("id", code);
        setSyncStatus(error ? "offline" : "ready");
      } catch { setSyncStatus("offline"); }
    }, 600);
    return () => clearTimeout(t);
  }, [goals, reviews, settings, code]);

  const connect = (c) => { try { localStorage.setItem("cg_code", c); } catch {} setCode(c); };
  const disconnect = () => { try { localStorage.removeItem("cg_code"); } catch {} setCode(""); setGoals(INITIAL_GOALS); setReviews(INITIAL_REVIEWS); setSettings(DEFAULT_SETTINGS); loaded.current = false; };

  const [tab, setTab] = useState("goals");
  const [filter, setFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [goalModal, setGoalModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [settingsModal, setSettingsModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [reminderDismissed, setReminderDismissed] = useState(false);

  const activeGoals = goals.filter(g => g.status === "active");
  const filtered = goals.filter(g =>
    (statusFilter === "all" || g.status === statusFilter) &&
    (filter === "all" || g.category === filter) &&
    (ownerFilter === "all" || g.owner === ownerFilter)
  );
  const avgProgress = activeGoals.length ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length) : 0;
  const sortedReviews = [...reviews].sort((a, b) => new Date(a.date) - new Date(b.date));
  const doneCount = goals.filter(g => g.status === "done").length;

  /* Rappel mensuel (BLOC 3) */
  const now = new Date();
  const reviewThisMonth = reviews.some(r => { const d = new Date(r.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const reminderDue = !reviewThisMonth && now.getDate() >= settings.reminderDay && !reminderDismissed;

  const saveGoal = (form) => { setGoals(gs => form.id ? gs.map(g => g.id === form.id ? form : g) : [...gs, { ...form, id: Date.now() }]); setGoalModal(null); };
  const setStatus = (id, status) => setGoals(gs => gs.map(g => g.id === id ? { ...g, status, completedDate: status === "done" ? (g.completedDate || new Date().toISOString().slice(0,10)) : g.completedDate, progress: status === "done" ? 100 : g.progress } : g));
  const toggleMilestone = (goalId, mId) => setGoals(gs => gs.map(g => g.id === goalId ? { ...g, milestones: g.milestones.map(m => m.id === mId ? { ...m, done: !m.done } : m) } : g));

  const saveReview = (form, sync) => {
    setReviews(rs => form.id ? rs.map(r => r.id === form.id ? form : r) : [...rs, { ...form, id: Date.now() }]);
    if (sync) setGoals(gs => gs.map(g => form.snapshots[g.id] !== undefined ? { ...g, progress: form.snapshots[g.id], status: form.snapshots[g.id] >= 100 && g.status === "active" ? "done" : g.status, completedDate: form.snapshots[g.id] >= 100 && !g.completedDate ? form.date : g.completedDate } : g));
    setReviewModal(null);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ goals, reviews, settings, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `tableau-couple-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const TABS = [{ id: "goals", label: "🎯 Objectifs" }, { id: "reviews", label: "📅 Bilans" }, { id: "evolution", label: "📈 Évolution" }, { id: "victories", label: "🏆 Victoires" }];
  const STATUS_FILTERS = [
    { id: "active", label: `Actifs (${goals.filter(g=>g.status==="active").length})` },
    { id: "paused", label: `En pause (${goals.filter(g=>g.status==="paused").length})` },
    { id: "done", label: `Atteints 🏆 (${doneCount})` },
    { id: "archived", label: `Archivés (${goals.filter(g=>g.status==="archived").length})` },
    { id: "all", label: `Tous (${goals.length})` },
  ];

  if (!code) return <CodeGate onConnect={connect} />;
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#FDF8F2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", color: "#A89080" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 36 }}>💕</div><div style={{ marginTop: 8, fontSize: 14 }}>Chargement de votre tableau…</div></div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FDF8F2", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ background: "linear-gradient(135deg, #3D2C1E 0%, #6B3F2A 50%, #9B6B4A 100%)", padding: "40px 24px 50px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(201,168,76,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(224,123,138,0.15) 0%, transparent 40%)" }} />
        <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 8, alignItems: "center", zIndex: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#FFF8EE", background: "rgba(255,248,238,0.12)", border: "1px solid rgba(255,248,238,0.2)", borderRadius: 10, padding: "7px 11px", display: "flex", alignItems: "center", gap: 5 }}>
            {syncStatus === "saving" ? "⏳ Sauvegarde…" : syncStatus === "offline" ? "⚠️ Hors ligne" : "☁️ Synchronisé"}
          </span>
          <button onClick={() => setSettingsModal(true)} aria-label="Réglages" style={{ background: "rgba(255,248,238,0.12)", border: "1px solid rgba(255,248,238,0.2)", borderRadius: 12, color: "#FFF8EE", cursor: "pointer", padding: "8px 12px", fontSize: 16 }}>⚙️</button>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: "#C9A84C", fontWeight: 700, marginBottom: 8 }}>NOS OBJECTIFS À DEUX</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, color: "#FFF8EE", margin: "0 0 8px", lineHeight: 1.15 }}>Notre Tableau<br />de Couple 💕</h1>
          <p style={{ color: "#C9A0804D", fontSize: 13, margin: "0 0 28px" }}>{settings.nameA} & {settings.nameB} — construire ensemble</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            {[{ label: "Objectifs actifs", value: activeGoals.length, icon: "🎯" }, { label: "Progression moy.", value: `${avgProgress}%`, icon: "📈" }, { label: "Atteints", value: doneCount, icon: "🏆" }, { label: "Bilans", value: reviews.length, icon: "📅" }].map(s => (
              <div key={s.label} style={{ background: "rgba(255,248,238,0.10)", borderRadius: 14, padding: "12px 18px", border: "1px solid rgba(255,248,238,0.12)" }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#FFF8EE" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#C9A08066", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rappel mensuel */}
      {reminderDue && (
        <div style={{ margin: "16px 20px 0", background: "linear-gradient(135deg, #FAEEDA, #FAF0E6)", border: "1.5px solid #FAC775", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 26 }}>📅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#854F0B" }}>C'est l'heure de votre bilan mensuel !</div>
            <div style={{ fontSize: 12, color: "#A0742A" }}>Vous n'avez pas encore fait le point ce mois-ci. 20 min ensemble ? 🍷</div>
          </div>
          <button onClick={() => { setTab("reviews"); setReviewModal({}); }} style={{ background: "#854F0B", color: "#FFF", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }}>Faire le bilan</button>
          <button onClick={() => setReminderDismissed(true)} aria-label="Ignorer" style={{ background: "none", border: "none", color: "#A0742A", cursor: "pointer", fontSize: 18, padding: 4 }}>×</button>
        </div>
      )}

      <div style={{ padding: "16px 20px 0", position: "relative", zIndex: 2 }}>
        <div style={{ background: "#FFFCF7", borderRadius: 18, padding: "8px", boxShadow: "0 4px 20px rgba(100,50,20,0.10)", display: "flex", gap: 4 }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 4px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.2s", background: tab === t.id ? "linear-gradient(135deg, #C9A84C, #E07B8A)" : "none", color: tab === t.id ? "#FFF" : "#A89080" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ padding: "20px 20px 40px" }}>
        {tab === "goals" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {STATUS_FILTERS.map(s => <button key={s.id} onClick={() => setStatusFilter(s.id)} style={{ padding: "7px 14px", borderRadius: 99, border: "none", background: statusFilter === s.id ? "#5C4030" : "#F0EBE3", color: statusFilter === s.id ? "#FFF" : "#8A7060", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>{s.label}</button>)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button onClick={() => setFilter("all")} style={chip(filter === "all", "linear-gradient(135deg, #C9A84C, #E07B8A)")}>Toutes</button>
                {CATEGORIES.map(c => <button key={c.id} onClick={() => setFilter(c.id)} style={chip(filter === c.id, c.color)}>{c.icon} {c.label}</button>)}
                <span style={{ width: 1, background: "#E8DDD0", margin: "0 4px" }} />
                <button onClick={() => setOwnerFilter("all")} style={chip(ownerFilter === "all", "#8A7060")}>Tous</button>
                {OWNERS.map(o => <button key={o.id} onClick={() => setOwnerFilter(o.id)} style={chip(ownerFilter === o.id, "#8A7060")}>{o.icon} {o.id === "A" ? settings.nameA : o.id === "B" ? settings.nameB : "Nous"}</button>)}
              </div>
              <button onClick={() => setGoalModal(emptyGoal())} style={{ padding: "9px 18px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #C9A84C, #E07B8A)", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}>+ Ajouter</button>
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", color: "#C0A890", padding: 50, fontSize: 14, fontStyle: "italic" }}>Aucun objectif ne correspond à ces filtres 🌱</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                {filtered.map(g => <GoalCard key={g.id} goal={g} reviews={sortedReviews} settings={settings} onEdit={setGoalModal} onDelete={(goal) => setConfirm({ type: "goal", item: goal })} onSetStatus={setStatus} onToggleMilestone={toggleMilestone} />)}
              </div>
            )}
          </>
        )}

        {tab === "reviews" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#3D2C1E" }}>Nos bilans mensuels</div>
              <button onClick={() => setReviewModal({})} style={{ padding: "9px 18px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7BAE7F, #5B8DC9)", color: "#FFF", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>+ Nouveau bilan</button>
            </div>
            {sortedReviews.length === 0 ? <div style={{ textAlign: "center", color: "#C0A890", padding: 60, fontSize: 14, fontStyle: "italic" }}>Aucun bilan encore — faites votre premier rituel mensuel ensemble ! 🍷</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{[...sortedReviews].reverse().map(r => <ReviewCard key={r.id} review={r} goals={goals} settings={settings} onEdit={setReviewModal} onDelete={(rev) => setConfirm({ type: "review", item: rev })} />)}</div>}
          </>
        )}

        {tab === "evolution" && <div style={{ display: "flex", flexDirection: "column", gap: 20 }}><EvolutionChart goals={goals} reviews={sortedReviews} /><StreakCalendar reviews={reviews} /></div>}
        {tab === "victories" && <VictoryWall goals={goals} reviews={reviews} />}
      </div>

      {goalModal && <GoalModal goal={goalModal} settings={settings} onSave={saveGoal} onClose={() => setGoalModal(null)} />}
      {reviewModal !== null && <ReviewModal review={reviewModal} goals={goals} existingDates={reviews} onSave={saveReview} onClose={() => setReviewModal(null)} />}
      {settingsModal && <SettingsModal settings={settings} code={code} onSave={(s) => { setSettings(s); setSettingsModal(false); }} onClose={() => setSettingsModal(false)} onExport={exportData} onDisconnect={() => { setSettingsModal(false); disconnect(); }} />}
      {confirm && <ConfirmDialog message={confirm.type === "goal" ? `Supprimer définitivement « ${confirm.item.title} » ?` : "Supprimer ce bilan mensuel ?"} onCancel={() => setConfirm(null)} onConfirm={() => { if (confirm.type === "goal") setGoals(gs => gs.filter(x => x.id !== confirm.item.id)); else setReviews(rs => rs.filter(x => x.id !== confirm.item.id)); setConfirm(null); }} />}
    </div>
  );
}
const chip = (active, color) => ({ padding: "7px 14px", borderRadius: 99, border: "none", background: active ? color : "#F0EBE3", color: active ? "#FFF" : "#8A7060", fontWeight: 600, cursor: "pointer", fontSize: 12 });
