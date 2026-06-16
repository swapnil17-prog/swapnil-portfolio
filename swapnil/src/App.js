import { useState, useEffect, useRef } from "react";

// ── Neural Canvas ──────────────────────────────────────────────────────────
function NeuralCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const nodes = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(108,99,255,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,212,255,0.45)";
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />;
}

// ── Typewriter ─────────────────────────────────────────────────────────────
function Typewriter({ strings, speed = 80, pause = 1800 }) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = strings[idx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) setTimeout(() => setDeleting(true), pause);
        else setCharIdx(c => c + 1);
      } else {
        setDisplay(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) { setDeleting(false); setIdx(i => (i + 1) % strings.length); setCharIdx(0); }
        else setCharIdx(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, strings, speed, pause]);
  return (
    <span style={{ color: "var(--accent-color)" }}>
      {display}<span style={{ animation: "blink 1s step-end infinite", borderRight: "2px solid var(--accent-color)" }}>&nbsp;</span>
    </span>
  );
}

// ── Skill Bar ──────────────────────────────────────────────────────────────
function SkillBar({ label, pct }) {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setW(pct); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct]);
  return (
    <div ref={ref} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 5 }}>
        <span>{label}</span><span>{pct}%</span>
      </div>
      <div style={{ background: "var(--border-color)", borderRadius: 999, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${w}%`, height: "100%", background: "linear-gradient(90deg, var(--accent-color), #00D4FF)", borderRadius: 999, transition: "width 1.2s cubic-bezier(.22,1,.36,1)" }} />
      </div>
    </div>
  );
}

// ── Tech Icon ──────────────────────────────────────────────────────────────
function TechIcon({ name, url }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 72,
        height: 72,
        background: hovered ? "rgba(108, 99, 255, 0.08)" : "rgba(13, 15, 30, 0.45)",
        border: `1px solid ${hovered ? "var(--accent-color)" : "var(--border-color)"}`,
        borderRadius: 16,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        transform: hovered ? "translateY(-6px) scale(1.05)" : "none",
        boxShadow: hovered ? "0 10px 24px var(--glow-color), inset 0 0 10px rgba(108, 99, 255, 0.15)" : "none",
      }}
    >
      <img
        src={url}
        alt={name}
        style={{
          width: 38,
          height: 38,
          objectFit: "contain",
          filter: hovered ? "grayscale(0%) brightness(1.1)" : "grayscale(15%) brightness(0.9)",
          transition: "all 0.3s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "100%",
          marginBottom: 10,
          padding: "6px 12px",
          background: "var(--card-bg)",
          border: "1px solid var(--accent-color)",
          borderRadius: 8,
          color: "var(--text-color)",
          fontSize: 12,
          fontWeight: 500,
          fontFamily: "Space Grotesk, sans-serif",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 10,
          boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
      >
        {name}
      </div>
    </div>
  );
}

// ── Agent Process Simulator ────────────────────────────────────────────────
function AgentProcessLoop() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { label: "Goal Formulation", desc: "User request is translated into structured tasks and clear parameters." },
    { label: "Task Planning", desc: "Agent breaks the objective down into a logical checklist using tool specs." },
    { label: "Reasoning Loop", desc: "The agent analyzes options, cross-references files, and reasons on errors." },
    { label: "Tool Execution", desc: "Performs file modifications, builds packages, and runs live operations." },
    { label: "Evaluation", desc: "Runs regression checks, builds code, and verifies execution matches plan." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(s => (s + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, marginBottom: 28, position: "relative", zIndex: 2 }}>
        {steps.map((s, idx) => {
          const isActive = idx === activeStep;
          return (
            <div
              key={s.label}
              onClick={() => setActiveStep(idx)}
              style={{
                flex: 1,
                minWidth: 140,
                textAlign: "center",
                cursor: "pointer",
                padding: "16px 8px",
                borderRadius: 12,
                background: isActive ? "rgba(108, 99, 255, 0.08)" : "transparent",
                border: `1px solid ${isActive ? "var(--accent-color)" : "transparent"}`,
                transform: isActive ? "scale(1.03)" : "scale(1)",
                transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)"
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: isActive ? "var(--accent-color)" : "var(--border-color)",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: isActive ? "0 0 16px var(--accent-color)" : "none",
                  transition: "all 0.4s ease"
                }}
              >
                {idx + 1}
              </div>
              <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "var(--text-color)" : "var(--text-muted)", fontFamily: "Space Grotesk, sans-serif" }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "20px 24px", background: "rgba(13, 15, 30, 0.3)", borderRadius: 12, border: "1px solid var(--border-color)" }}>
        <h4 style={{ fontFamily: "Space Grotesk, sans-serif", color: "var(--accent-color)", marginBottom: 8, fontSize: 16 }}>
          Step {activeStep + 1}: {steps[activeStep].label}
        </h4>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
          {steps[activeStep].desc}
        </p>
      </div>
    </div>
  );
}

// ── Floating Navbar ────────────────────────────────────────────────────────
function FloatingNavbar({ active, onChange, theme, toggleTheme }) {
  const menuItems = [
    { id: "home", label: "Home", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
    { id: "about", label: "About", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
    { id: "work", label: "Work", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
    { id: "articles", label: "Articles", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
    { id: "timeline", label: "Timeline", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg> }
  ];

  return (
    <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 1000, pointerEvents: "auto" }}>
      <nav style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(18px)",
        border: "1px solid var(--border-color)",
        borderRadius: 999,
        padding: "6px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
        whiteSpace: "nowrap"
      }}>
        {/* Home Button (Icon Only) */}
        <button
          onClick={() => onChange("home")}
          style={{
            background: active === "home" ? "var(--nav-active-pill)" : "transparent",
            border: "none",
            borderRadius: "50%",
            width: 38,
            height: 38,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: active === "home" ? "var(--accent-color)" : "var(--text-muted)",
            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
          }}
          title="Home"
        >
          {menuItems[0].icon}
        </button>

        <div style={{ width: 1, height: 20, background: "var(--border-color)", margin: "0 4px" }} />

        {/* Core Nav items */}
        {menuItems.slice(1).map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              style={{
                background: isActive ? "var(--nav-active-pill)" : "transparent",
                border: "none",
                borderRadius: 999,
                padding: "8px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: isActive ? "var(--text-color)" : "var(--text-muted)",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", color: isActive ? "var(--accent-color)" : "inherit" }}>
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}

        <div style={{ width: 1, height: 20, background: "var(--border-color)", margin: "0 4px" }} />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: "transparent",
            border: "none",
            borderRadius: "50%",
            width: 38,
            height: 38,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            transition: "all 0.2s ease"
          }}
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          )}
        </button>
      </nav>
    </div>
  );
}

// ── Shared UI Components ───────────────────────────────────────────────────
function Section({ children, style = {} }) {
  return (
    <section style={{ padding: "80px 0", maxWidth: 1100, margin: "0 auto", paddingInline: 28, ...style }}>
      {children}
    </section>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
      <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, letterSpacing: "0.22em", color: "var(--accent-color)", textTransform: "uppercase" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--border-color), transparent)" }} />
    </div>
  );
}

function ProjectCard({ title, tags, bullets }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "var(--card-hover-bg)" : "var(--card-bg)",
        border: `1px solid ${hov ? "var(--accent-color)" : "var(--border-color)"}`,
        borderRadius: 16,
        padding: 28,
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        boxShadow: hov ? "0 10px 30px var(--glow-color)" : "none",
        cursor: "default"
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif", color: "var(--text-color)", marginBottom: 12 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {tags.map(t => (
          <span key={t} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "rgba(108, 99, 255, 0.08)", color: "var(--accent-color)", border: "1px solid var(--border-color)", fontFamily: "Space Grotesk, sans-serif" }}>{t}</span>
        ))}
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 18px", color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.7 }}>
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );
}

// Data Sets
const techCategories = [
  // Row 1 (6 items)
  [
    { name: "Python", url: "https://cdn.simpleicons.org/python" },
    { name: "Java", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
    { name: "FastAPI", url: "https://cdn.simpleicons.org/fastapi" },
    { name: "Flask", url: "https://cdn.simpleicons.org/flask/ffffff" },
    { name: "React", url: "https://cdn.simpleicons.org/react" },
    { name: "MongoDB", url: "https://cdn.simpleicons.org/mongodb" }
  ],
  // Row 2 (6 items)
  [
    { name: "MySQL", url: "https://cdn.simpleicons.org/mysql" },
    { name: "HTML5", url: "https://cdn.simpleicons.org/html5" },
    { name: "CSS3", url: "https://cdn.simpleicons.org/css" },
    { name: "JavaScript", url: "https://cdn.simpleicons.org/javascript" },
    { name: "Windows", url: process.env.PUBLIC_URL + "/windows.png" },
    { name: "Linux", url: "https://cdn.simpleicons.org/linux" }
  ],
  // Row 3 (6 items)
  [
    { name: "GitHub", url: "https://cdn.simpleicons.org/github/ffffff" },
    { name: "WSO2", url: process.env.PUBLIC_URL + "/wso2.png" },
    { name: "Google Gemini", url: "https://cdn.simpleicons.org/googlegemini" },
    { name: "Claude / Anthropic", url: "https://cdn.simpleicons.org/anthropic" },
    { name: "ChatGPT / OpenAI", url: process.env.PUBLIC_URL + "/openai.png" },
    { name: "Bash / Terminal", url: "https://cdn.simpleicons.org/gnubash" }
  ]
];

const projectsData = [
  {
    title: "AI-Powered Resume Screening System",
    category: "AI/ML",
    tags: ["FastAPI", "spaCy", "React", "MongoDB", "Firebase"],
    bullets: [
      "Developed a full-stack AI system to automate resume classification and candidate analysis",
      "Backend built using FastAPI, Scikit-learn, and spaCy for resume categorization",
      "Integrated MongoDB for secure user-specific data storage",
      "Built React.js frontend with Material-UI and Firebase Authentication",
      "Integrated LLM APIs for resume summarization, keyword extraction, and improvement suggestions"
    ]
  },
  {
    title: "QuizMaster Pro",
    category: "AI/ML",
    tags: ["Flask", "Gemini API", "OAuth 2.0", "SQLAlchemy", "Bootstrap 5"],
    bullets: [
      "AI-powered adaptive quiz platform with dynamic question generation via Google Gemini",
      "Smart 70/30 recommendation algorithm balancing new content vs weak-area reinforcement",
      "Full auth: email verification, OAuth (Google/GitHub), Bcrypt session security",
      "Gamified UI with 3D flip cards, glassmorphism, streaks, badges, and leaderboard"
    ]
  },
  {
    title: "AI Personal Finance Dashboard",
    category: "AI/ML",
    tags: ["FastAPI", "Prophet", "scikit-learn", "GPT-4", "Chart.js"],
    bullets: [
      "Prophet time-series forecasting for 3-month cash flow with runway estimation",
      "Burn rate calculator, spending velocity meter, and period-over-period analytics",
      "Automated subscription detection via fuzzy matching + AI cancellation suggestions",
      "Income diversity analyzer with concentration risk scoring and side-hustle AI suggestions"
    ]
  },
  {
    title: "SCCC AI Pricing Advisor",
    category: "Full-Stack",
    tags: ["FastAPI", "Generative AI", "REST API", "JSON Processing"],
    bullets: [
      "Conversational AI assistant for cloud service pricing (ECS, OSS, TDSQL)",
      "Prompt-based intelligent data extraction for missing user inputs",
      "Session-aware backend with structured JSON validation and cost optimization logic",
      "Real-time pricing adjustments and interactive cost comparison UI"
    ]
  },
  {
    title: "Dubai Municipality — WSO2 IAM Demo",
    category: "Full-Stack",
    tags: ["WSO2 Identity Server", "OAuth 2.0", "OpenID Connect", "RBAC", "SSO"],
    bullets: [
      "Developed and presented a live demo for Dubai Municipality showcasing enterprise Identity & Access Management using WSO2 Identity Server.",
      "Demonstrated Single Sign-On (SSO) across multiple applications and configured Role-Based Access Control (RBAC).",
      "Showcased secure authentication flows including MFA, session management, and token-based authorization."
    ]
  }
];

const skillsData = [
  { label: "Python", pct: 92 },
  { label: "Machine Learning / Deep Learning", pct: 85 },
  { label: "Generative AI & Prompt Engineering", pct: 88 },
  { label: "FastAPI / Flask", pct: 84 },
  { label: "React.js", pct: 75 },
  { label: "NLP & spaCy", pct: 78 },
  { label: "TensorFlow / scikit-learn", pct: 80 },
  { label: "SQL / MongoDB", pct: 76 }
];

const articlesData = [
  {
    id: 1,
    title: "The Rise of Agentic AI: From Prompts to Autonomous Action",
    summary: "Large Language Models are evolving from conversational interfaces into autonomous agents capable of dynamic planning, reasoning, tool usage, and reflection.",
    content: "Large Language Models are shifting from simple reactive message-passers to proactive agentic entities. Traditional AI models process inputs and provide immediate, static responses. In contrast, Agentic AI acts autonomously based on high-level goals. \n\nBy equipping agents with memory (short-term conversational logs and long-term vector embeddings), tool access (APIs, calculators, and file systems), and self-reflection validation loops, we enable them to plan multi-step workflows. If a compiler throws an error, the agent doesn't stop—it reads the stack trace, reasons on the bug, and rewrites its own code until success is achieved.",
    date: "Jun 2026",
    readTime: "4 min read"
  },
  {
    id: 2,
    title: "Orchestrating Multi-Agent Systems with Group Chat Managers",
    summary: "How complex software tasks can be solved by specialized agent teams communicating through hierarchical and conversational network patterns.",
    content: "When building complex applications, a single agent often encounters limits. Enter Multi-Agent Orchestration. By breaking down tasks and assigning them to specialized agents (e.g., a software architect, a programmer, and a validation QA tester), we can model complex workflows as conversational chats.\n\nUsing a Group Chat Manager, conversational states are checked, and the manager directs turn-taking. The QA agent executes tests and feeds back error traces directly to the programmer agent. This feedback loop resolves bugs in-flight without user intervention, representing a major leap in developer productivity.",
    date: "May 2026",
    readTime: "5 min read"
  },
  {
    id: 3,
    title: "Adaptive Intelligence: The Convergence of ML and Personalized EdTech",
    summary: "Analyzing the integration of time-series student performance metrics and real-time content recommendation engines to construct personalized learning paths.",
    content: "Personalized education platforms require dynamic adjustment of difficulty. Using modern recommendation algorithms, systems can estimate a user's knowledge parameters (such as using Bayesian Knowledge Tracing or Item Response Theory).\n\nBy serving 70% content within the student's mastery zone and 30% focusing on weak conceptual nodes, cognitive overload is avoided. When combined with Generative AI feedback that synthesizes custom examples and interactive flip-cards, these platforms create incredibly sticky and effective learning environments.",
    date: "Apr 2026",
    readTime: "3 min read"
  }
];

const educationData = [
  { type: "edu", title: "B.Tech — Computer Science & Engineering", sub: "ITER, SOA University", date: "2022 – 2026", grade: "CGPA 7.98" },
  { type: "edu", title: "12th Grade — CBSE Board", sub: "DAV Public School, Chandrasekharpur", date: "2021 – 2022", grade: "Aggregate: 85%" },
  { type: "edu", title: "10th Grade — CBSE Board", sub: "DAV Public School, Chandrasekharpur", date: "2019 – 2020", grade: "Aggregate: 92%" }
];

const experienceData = [
  { type: "work", title: "Intern — Generative AI & Machine Learning", sub: "Centroxy Solution Pvt. Ltd.", date: "Jun 2025 – Feb 2026", details: "Designed GenAI pipelines, built secure authentication architectures using WSO2 Identity Server (OIDC/SAML), and trained custom models." }
];

const certificationsData = [
  { type: "cert", title: "Complete Generative AI Course with LangChain & Hugging Face", sub: "Udemy", date: "Jan 2026" },
  { type: "cert", title: "OCI 2025 Certified AI Foundations Associate", sub: "Oracle University", date: "Jan 2026" },
  { type: "cert", title: "TensorFlow Developer Professional Certificate", sub: "DeepLearning.AI", date: "Dec 2025" },
  { type: "cert", title: "Associate Cloud Engineer Certificate", sub: "Google Cloud", date: "Aug 2025" },
  { type: "cert", title: "AWS Certified Cloud Practitioner", sub: "Amazon Web Services", date: "Jun 2025" },
  { type: "cert", title: "Generative AI Fundamentals Certificate", sub: "Google Cloud Skills Boost", date: "Mar 2025" }
];

// ── Home Tab ───────────────────────────────────────────────────────────────
function HomeTab({ onChangeView }) {
  return (
    <div className="fade-up">
      <Section style={{ paddingTop: 60 }}>
        {/* Hero */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 60 }}>
          <div style={{ display: "inline-block", alignSelf: "flex-start", fontSize: 11, letterSpacing: "0.22em", color: "var(--accent-color)", textTransform: "uppercase", fontFamily: "Space Grotesk, sans-serif", border: "1px solid var(--border-color)", padding: "6px 16px", borderRadius: 999, background: "rgba(108, 99, 255, 0.06)" }}>
            Available for opportunities
          </div>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 800, lineHeight: 1.07, letterSpacing: "-0.03em", color: "var(--text-color)" }}>
            Swapnil Das
          </h1>
          <div style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, minHeight: 40 }}>
            <Typewriter strings={["AI/ML Engineer", "Generative AI Developer", "Full-Stack Builder", "Software Engineer"]} />
          </div>
          <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 540, lineHeight: 1.75 }}>
            Building scalable, intelligent systems at the intersection of machine learning, generative AI, and modern full-stack development.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
            <button onClick={() => onChangeView("work")} style={{ padding: "13px 32px", borderRadius: 10, background: "linear-gradient(135deg, var(--accent-color), #4f46d4)", border: "none", color: "#fff", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", letterSpacing: "0.02em" }}>
              Explore Projects
            </button>
            <button onClick={() => onChangeView("about")} style={{ padding: "13px 32px", borderRadius: 10, background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-color)", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", letterSpacing: "0.02em" }}>
              More About Me
            </button>
          </div>
        </div>

        {/* AI Focus Card */}
        <div style={{ marginBottom: 64 }}>
          <SectionLabel>AI Specialization & Core Process</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 32, alignItems: "center", flexWrap: "wrap", marginBottom: 36 }}>
            <div>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-color)", marginBottom: 16 }}>
                Shaping the Era of <br /><span style={{ color: "var(--accent-color)" }}>Agentic Systems</span>
              </h3>
              <p style={{ fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.8 }}>
                AI is moving beyond text chats. I specialize in designing autonomous workflows where model agents utilize tool APIs, maintain recursive system memories, run self-reflection validation loops, and collaborate in multi-agent environments to solve complex operations.
              </p>
            </div>
            <AgentProcessLoop />
          </div>
        </div>

        {/* Technologies Grid */}
        <div style={{ marginBottom: 64 }}>
          <SectionLabel>Technologies I Work With</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {techCategories.map((row, rowIdx) => (
              <div key={rowIdx} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
                {row.map(tech => (
                  <TechIcon key={tech.name} {...tech} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Featured Projects Preview */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700 }}>Featured Projects</h3>
            <button onClick={() => onChangeView("work")} style={{ background: "none", border: "none", color: "var(--accent-color)", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              All Projects &rarr;
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {projectsData.slice(0, 2).map(p => <ProjectCard key={p.title} {...p} />)}
          </div>
        </div>

        {/* Articles Preview */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700 }}>Recent Articles</h3>
            <button onClick={() => onChangeView("articles")} style={{ background: "none", border: "none", color: "var(--accent-color)", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Read More &rarr;
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {articlesData.slice(0, 2).map(art => (
              <div
                key={art.id}
                onClick={() => onChangeView("articles")}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 16,
                  padding: 24,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "none"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-color)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.transform = "none"; }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "var(--accent-color)", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>{art.date} · {art.readTime}</div>
                  <h4 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-color)", marginBottom: 10 }}>{art.title}</h4>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{art.summary}</p>
                </div>
                <div style={{ fontSize: 12, color: "var(--accent-color)", fontWeight: 600, marginTop: 14, fontFamily: "Space Grotesk, sans-serif" }}>Read article &rarr;</div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

// ── About Tab ──────────────────────────────────────────────────────────────
function AboutTab() {
  const [imgHovered, setImgHovered] = useState(false);

  return (
    <div className="fade-up">
      <Section style={{ paddingTop: 60 }}>
        <SectionLabel>About Me</SectionLabel>

        {/* Bio */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 48, alignItems: "start", marginBottom: 64 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
              {/* Circular Profile Image */}
              <div
                onMouseEnter={() => setImgHovered(true)}
                onMouseLeave={() => setImgHovered(false)}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: imgHovered ? "2px solid var(--accent-color)" : "2px solid var(--border-color)",
                  boxShadow: imgHovered ? "0 0 20px var(--glow-color)" : "none",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  flexShrink: 0,
                  cursor: "pointer"
                }}
              >
                <img
                  src={process.env.PUBLIC_URL + "/swapnil.jpg"}
                  alt="Swapnil Das"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 15%",
                    transition: "transform 0.4s ease",
                    transform: imgHovered ? "scale(1.08)" : "scale(1)"
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 32, fontWeight: 800, color: "var(--text-color)", marginBottom: 6 }}>
                  Swapnil Das
                </h2>
                <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 600, color: "var(--accent-color)", letterSpacing: "0.03em", textTransform: "uppercase", lineHeight: 1.3 }}>
                  Engineering Systems with Cognitive Intelligence
                </h3>
              </div>
            </div>

            <p style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
              I'm a Full-Stack Developer specialized in Artificial Intelligence, Machine Learning, and Generative AI frameworks.
            </p>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: 15, marginBottom: 16 }}>
              During my internship at Centroxy Solution Pvt. Ltd., I focused on building secure full-stack applications, managing machine learning pipelines, and deploying Identity & Access Management (IAM) SSO solutions using WSO2 Identity Server and Accops systems.
            </p>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: 15 }}>
              Outside of training neural architectures and software development, I am a passionate cricketer. I represented Bhubaneswar District in Under-19 state championships, helping secure runners-up in the Odisha Inter-District Tournament.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["📧", "swapnildas018@gmail.com"],
              ["📞", "+91-9337728929"],
              ["📍", "Bhubaneswar, Odisha"],
              ["🎓", "B.Tech CSE — ITER, SOA University"],
              ["💼", "Intern @ Centroxy Solution Pvt. Ltd."]
            ].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 10, fontSize: 14, color: "var(--text-muted)" }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Education & Experience & Certs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start", marginBottom: 64 }}>
          {/* Left Column: Skills & Experience */}
          <div>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 24, color: "var(--text-color)" }}>Technical Skills</h3>
            <div style={{ marginBottom: 40 }}>
              {skillsData.map(s => <SkillBar key={s.label} {...s} />)}
            </div>

            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 20, color: "var(--text-color)" }}>Work Experience</h3>
            {experienceData.map(e => (
              <div key={e.title} style={{ padding: 24, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--accent-color)" }}>
                  <span>{e.date}</span>
                </div>
                <h4 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-color)", marginBottom: 4 }}>{e.title}</h4>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>{e.sub}</div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{e.details}</p>
              </div>
            ))}
          </div>

          {/* Right Column: Studies & Certifications */}
          <div>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 24, color: "var(--text-color)" }}>Studies</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
              {educationData.map(deg => (
                <div key={deg.title} style={{ padding: 20, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--accent-color)", fontWeight: 600, marginBottom: 4 }}>
                    <span>{deg.date}</span>
                  </div>
                  <h4 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-color)", marginBottom: 4 }}>{deg.title}</h4>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{deg.sub} · <span style={{ fontWeight: 600 }}>{deg.grade}</span></div>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 20, color: "var(--text-color)" }}>Certifications</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
              {certificationsData.map(c => (
                <div key={c.title} style={{ padding: "14px 18px", background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-color)", fontFamily: "Space Grotesk, sans-serif" }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.sub}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--accent-color)", fontWeight: 600, background: "rgba(108, 99, 255, 0.08)", padding: "3px 8px", borderRadius: 4 }}>{c.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ── Work Tab ───────────────────────────────────────────────────────────────
function WorkTab() {
  const [filter, setFilter] = useState("All");
  const filteredProjects = filter === "All" ? projectsData : projectsData.filter(p => p.category === filter);

  return (
    <div className="fade-up">
      <Section style={{ paddingTop: 60 }}>
        <SectionLabel>Projects</SectionLabel>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 36, justifyContent: "center" }}>
          {["All", "AI/ML", "Full-Stack"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                border: "1px solid var(--border-color)",
                background: filter === f ? "var(--accent-color)" : "var(--card-bg)",
                color: filter === f ? "#fff" : "var(--text-muted)",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28 }}>
          {filteredProjects.map(p => (
            <ProjectCard key={p.title} {...p} />
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Articles Tab ───────────────────────────────────────────────────────────
function ArticlesTab() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedArticle]);

  return (
    <div className="fade-up">
      <Section style={{ paddingTop: 60 }}>
        <SectionLabel>Articles & Insights</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28 }}>
          {articlesData.map(art => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: 16,
                padding: 28,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "none"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-color)"; e.currentTarget.style.transform = "translateY(-6px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.transform = "none"; }}
            >
              <div>
                <div style={{ fontSize: 11, color: "var(--accent-color)", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>{art.date} · {art.readTime}</div>
                <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-color)", marginBottom: 12 }}>{art.title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{art.summary}</p>
              </div>
              <div style={{ fontSize: 13, color: "var(--accent-color)", fontWeight: 600, marginTop: 20, fontFamily: "Space Grotesk, sans-serif" }}>Read full article &rarr;</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Reader Modal Overlay */}
      {selectedArticle && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(5, 8, 16, 0.85)", backdropFilter: "blur(12px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: 20,
            maxWidth: 720,
            width: "100%",
            maxHeight: "85vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            animation: "fadeUp 0.3s ease forwards"
          }}>
            {/* Modal Header */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--accent-color)", fontWeight: 600, textTransform: "uppercase", fontFamily: "Space Grotesk, sans-serif" }}>{selectedArticle.date} · {selectedArticle.readTime}</div>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-color)",
                  cursor: "pointer",
                  fontSize: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  hover: "background: var(--border-color)"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--border-color)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div ref={scrollRef} style={{ padding: "28px 32px", overflowY: "auto", flex: 1 }}>
              <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-color)", marginBottom: 20, lineHeight: 1.3 }}>{selectedArticle.title}</h2>
              <p style={{ fontSize: 15, color: "var(--text-color)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{selectedArticle.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Timeline Tab ───────────────────────────────────────────────────────────
function TimelineTab() {
  const mergedTimeline = [
    { type: "work", title: "Intern — Generative AI & Machine Learning", sub: "Centroxy Solution Pvt. Ltd.", date: "Jun 2025 – Feb 2026", details: "Designed GenAI pipelines, built secure authentication architectures using WSO2 Identity Server (OIDC/SAML), and trained custom models." },
    { type: "cert", title: "Complete Generative AI Course with LangChain & Hugging Face", sub: "Udemy", date: "Jan 2026", details: "Completed 57.5 hours of deep hands-on learning on LangChain, Hugging Face, LLM orchestration, and RAG architectures." },
    { type: "cert", title: "OCI 2025 Certified AI Foundations Associate", sub: "Oracle University", date: "Jan 2026", details: "Certified in cloud AI foundations, machine learning concepts, and OCI AI service architectures." },
    { type: "cert", title: "TensorFlow Developer Professional Certificate", sub: "DeepLearning.AI", date: "Dec 2025" },
    { type: "cert", title: "Associate Cloud Engineer Certificate", sub: "Google Cloud", date: "Aug 2025" },
    { type: "cert", title: "AWS Certified Cloud Practitioner", sub: "Amazon Web Services", date: "Jun 2025" },
    { type: "cert", title: "Generative AI Fundamentals Certificate", sub: "Google Cloud Skills Boost", date: "Mar 2025" },
    { type: "edu", title: "B.Tech — Computer Science & Engineering", sub: "ITER, SOA University", date: "2022 – 2026", details: "Graduated B.Tech in CSE with focus on Artificial Intelligence and Machine Learning. CGPA: 7.98." },
    { type: "edu", title: "12th Grade — CBSE Board", sub: "DAV Public School, Chandrasekharpur", date: "2021 – 2022", details: "Aggregate score of 85%." },
    { type: "edu", title: "10th Grade — CBSE Board", sub: "DAV Public School, Chandrasekharpur", date: "2019 – 2020", details: "Aggregate score of 92%." }
  ];

  return (
    <div className="fade-up">
      <Section style={{ paddingTop: 60 }}>
        <SectionLabel>Timeline</SectionLabel>

        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto", paddingLeft: 32 }}>
          {/* Vertical central line */}
          <div style={{ position: "absolute", left: 7, top: 10, bottom: 10, width: 2, background: "var(--border-color)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {mergedTimeline.map((item, idx) => {
              const colors = {
                work: "#6C63FF",
                edu: "#00D4FF",
                cert: "#10b981"
              };
              const dotColor = colors[item.type];

              return (
                <div key={idx} style={{ position: "relative" }}>
                  {/* Glowing connector node */}
                  <div style={{
                    position: "absolute",
                    left: -32,
                    top: 6,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: dotColor,
                    boxShadow: `0 0 10px ${dotColor}`,
                    zIndex: 2
                  }} />

                  {/* Card Container */}
                  <div
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--border-color)",
                      borderRadius: 14,
                      padding: 24,
                      transition: "all 0.3s ease",
                      cursor: "default"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = dotColor; e.currentTarget.style.boxShadow = `0 6px 20px ${dotColor}11`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: dotColor, letterSpacing: "0.05em" }}>{item.type}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{item.date}</span>
                    </div>

                    <h4 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-color)", marginBottom: 4 }}>{item.title}</h4>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8, fontWeight: 500 }}>{item.sub}</div>
                    {item.details && <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{item.details}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
}

// ── Main App Component ─────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab onChangeView={setActiveTab} />;
      case "about":
        return <AboutTab />;
      case "work":
        return <WorkTab />;
      case "articles":
        return <ArticlesTab />;
      case "timeline":
        return <TimelineTab />;
      default:
        return <HomeTab onChangeView={setActiveTab} />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
        
        :root {
          --bg-color: #050810;
          --text-color: #E8EAFF;
          --text-muted: #8890BB;
          --card-bg: #080a17;
          --card-hover-bg: #0e1128;
          --border-color: #1a1d35;
          --accent-color: #6C63FF;
          --accent-hover: #4f46d4;
          --glow-color: rgba(108, 99, 255, 0.15);
          --nav-bg: rgba(5, 8, 16, 0.72);
          --nav-active-pill: rgba(255, 255, 255, 0.08);
        }
        
        [data-theme="light"] {
          --bg-color: #f8fafc;
          --text-color: #0f172a;
          --text-muted: #475569;
          --card-bg: #ffffff;
          --card-hover-bg: #f1f5f9;
          --border-color: #e2e8f0;
          --accent-color: #4f46d4;
          --accent-hover: #3730a3;
          --glow-color: rgba(79, 70, 212, 0.08);
          --nav-bg: rgba(255, 255, 255, 0.85);
          --nav-active-pill: rgba(15, 23, 42, 0.08);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          background: var(--bg-color); 
          color: var(--text-color); 
          font-family: 'Inter', sans-serif; 
          scroll-behavior: smooth;
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        ::selection { background: var(--accent-color); color: #fff; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: var(--bg-color); } 
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
        
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(18px); } 
          to { opacity: 1; transform: none; } 
        }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @media (max-width: 640px) {
          .nav-label {
            display: none;
          }
        }
      `}</style>

      <FloatingNavbar active={activeTab} onChange={setActiveTab} theme={theme} toggleTheme={toggleTheme} />

      {/* Background Neural Canvas - only on Home Tab */}
      {activeTab === "home" && <NeuralCanvas />}

      <div style={{ paddingTop: 88, minHeight: "100vh", position: "relative", zIndex: 1 }}>
        {renderContent()}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border-color)", padding: "28px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: 12, fontFamily: "Space Grotesk, sans-serif" }}>
        <span>© 2026 Swapnil Das</span>
        <span>Built with React · Bhubaneswar, India</span>
      </div>
    </>
  );
}