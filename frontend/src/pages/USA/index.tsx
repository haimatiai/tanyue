import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Timeline from "../../components/Timeline";
import MissionCard from "../../components/MissionCard";
import { fetchUSMissions } from "../../api/missions";
import type { Mission } from "../../types/mission";

const PROGRAMS = ["全部", "徘徊者计划", "勘测者计划", "阿波罗计划", "克莱门汀计划", "月球勘测轨道飞行器", "LCROSS", "阿尔忒弥斯计划"];
const VIEW_MODES = [
  { key: "timeline", label: "时间线" },
  { key: "grid", label: "卡片" },
];

export default function USA() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filter, setFilter] = useState("全部");
  const [view, setView] = useState<"timeline" | "grid">("timeline");

  useEffect(() => {
    fetchUSMissions().then(setMissions);
  }, []);

  const filtered = filter === "全部" ? missions : missions.filter((m) => m.program === filter);

  const landingCount = missions.filter((m) => m.landing_site && m.status === "完成").length;
  const crewedCount = missions.filter((m) => m.crew && m.status !== "计划中").length;
  const completedCount = missions.filter((m) => m.status === "完成").length;

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🇺🇸</span>
            <div>
              <h1 className="text-4xl font-bold text-white">美国探月</h1>
              <p className="text-slate-400 mt-1">NASA · 1958 — 至今</p>
            </div>
          </div>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            从冷战时期与苏联的太空竞赛，到阿波罗计划的辉煌登月，再到21世纪重返月球的阿尔忒弥斯计划——美国的探月历史是人类航天探索最壮阔的篇章之一。
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { v: missions.length, l: "任务总数" },
            { v: landingCount, l: "成功着陆" },
            { v: crewedCount, l: "载人任务" },
          ].map(({ v, l }) => (
            <div key={l} className="bg-space-800 border border-blue-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{v}</div>
              <div className="text-xs text-slate-500 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-5xl mx-auto px-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Program filter */}
          <div className="flex flex-wrap gap-2 flex-1">
            {PROGRAMS.map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  filter === p
                    ? "bg-blue-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {/* View toggle */}
          <div className="flex bg-slate-800 rounded-lg p-0.5">
            {VIEW_MODES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key as "timeline" | "grid")}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                  view === key ? "bg-blue-500 text-white" : "text-slate-400"
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
          <Timeline missions={filtered} country="US" />
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
