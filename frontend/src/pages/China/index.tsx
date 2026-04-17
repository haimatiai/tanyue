import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Timeline from "../../components/Timeline";
import MissionCard from "../../components/MissionCard";
import { fetchCNMissions } from "../../api/missions";
import type { Mission } from "../../types/mission";

const PHASES = ["全部", "嫦娥工程一期", "嫦娥工程二期", "嫦娥工程三期", "嫦娥工程四期"];
const VIEW_MODES = [
  { key: "timeline", label: "时间线" },
  { key: "grid", label: "卡片" },
];

export default function China() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filter, setFilter] = useState("全部");
  const [view, setView] = useState<"timeline" | "grid">("timeline");

  useEffect(() => {
    fetchCNMissions().then(setMissions);
  }, []);

  const filtered = filter === "全部" ? missions : missions.filter((m) => m.program === filter);

  const landingCount = missions.filter((m) => m.landing_site && !m.status.includes("计划")).length;
  const sampleReturn = missions.filter((m) => m.type.includes("采样返回") && m.status === "完成").length;

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🇨🇳</span>
            <div>
              <h1 className="text-4xl font-bold text-white">中国探月</h1>
              <p className="text-slate-400 mt-1">CNSA · 嫦娥工程 · 2007 — 至今</p>
            </div>
          </div>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            嫦娥工程是中国探月的核心战略项目，分四期推进：绕月、落月、采样返回，以及建立国际月球科研站。从嫦娥一号到嫦娥六号，中国在月球探测领域创造了多项世界第一。
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { v: missions.length, l: "任务总数" },
            { v: landingCount, l: "成功着陆" },
            { v: sampleReturn, l: "采样返回" },
          ].map(({ v, l }) => (
            <div key={l} className="bg-space-800 border border-red-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{v}</div>
              <div className="text-xs text-slate-500 mt-1">{l}</div>
            </div>
          ))}
        </div>

        {/* Phase roadmap */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { phase: "一期", desc: "绕月探测", years: "2007–2010", done: true },
            { phase: "二期", desc: "落月巡视", years: "2013–2019", done: true },
            { phase: "三期", desc: "采样返回", years: "2020", done: true },
            { phase: "四期", desc: "科研站建设", years: "2024–", done: false },
          ].map(({ phase, desc, years, done }) => (
            <div key={phase} className={`rounded-xl p-3 text-center border ${
              done ? "border-red-500/30 bg-red-950/20" : "border-amber-500/30 bg-amber-950/20"
            }`}>
              <div className={`text-sm font-bold ${done ? "text-red-400" : "text-amber-400"}`}>
                {phase}期
              </div>
              <div className="text-white text-xs font-medium mt-1">{desc}</div>
              <div className="text-slate-500 text-xs mt-0.5">{years}</div>
              <div className={`text-xs mt-1 ${done ? "text-emerald-400" : "text-amber-400"}`}>
                {done ? "✓ 完成" : "进行中"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-5xl mx-auto px-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-wrap gap-2 flex-1">
            {PHASES.map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  filter === p
                    ? "bg-red-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex bg-slate-800 rounded-lg p-0.5">
            {VIEW_MODES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key as "timeline" | "grid")}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                  view === key ? "bg-red-500 text-white" : "text-slate-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6">
        {view === "timeline" ? (
          <Timeline missions={filtered} country="CN" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((m, i) => (
              <MissionCard key={m.id} mission={m} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
