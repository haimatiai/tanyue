import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchAllMissions } from "../../api/missions";
import type { Mission } from "../../types/mission";

type Filter = "all" | "CN" | "US";

const STATUS_DOT: Record<string, string> = {
  "完成": "bg-emerald-400",
  "在轨运行": "bg-blue-400 animate-pulse",
  "运行中": "bg-blue-400 animate-pulse",
  "计划中": "bg-amber-400",
  "完成（紧急返回）": "bg-orange-400",
  "完成（着陆器仍在工作）": "bg-teal-400",
};
function getDot(status: string) {
  return STATUS_DOT[status] ?? "bg-slate-400";
}

export default function History() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const location = useLocation();

  useEffect(() => {
    fetchAllMissions().then(({ us, cn }) =>
      setMissions([...us, ...cn].sort((a, b) => b.launch_date.localeCompare(a.launch_date)))
    );
  }, []);

  const filtered = filter === "all" ? missions : missions.filter((m) => m.country === filter);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">奔月简史</h1>
          <p className="text-slate-400 mb-8">人类探月全记录 · 按时间倒序</p>

          {/* Filter */}
          <div className="flex gap-2 mb-10">
            {(["all", "CN", "US"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-4 py-1.5 rounded-full transition-all ${
                  filter === f
                    ? f === "CN" ? "bg-red-500 text-white"
                      : f === "US" ? "bg-blue-500 text-white"
                      : "bg-white/15 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {f === "all" ? "全部" : f === "CN" ? "🇨🇳 中国" : "🇺🇸 美国"}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-600 self-center">{filtered.length} 个任务</span>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent" />

          <div className="space-y-2 pl-12">
            {filtered.map((mission, i) => {
              const isUS = mission.country === "US";
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative"
                >
                  <div className={`absolute -left-9 top-5 w-3 h-3 rounded-full border-2 border-space-900 ${getDot(mission.status)}`} />
                  <div className="absolute -left-8 top-6 w-4 h-px bg-slate-700" />

                  <Link
                    to={`/mission/${mission.id}`}
                    state={{ from: location.pathname }}
                  >
                    <div className={`group bg-space-800 border rounded-xl p-4 transition-all hover:-translate-y-0.5 ${
                      isUS ? "border-slate-700/50 hover:border-blue-500/40" : "border-slate-700/50 hover:border-red-500/40"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-semibold">{mission.name}</span>
                            <span className="text-slate-500 text-xs">{mission.english_name}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                            <span>{mission.launch_date.slice(0, 7)}</span>
                            <span className={isUS ? "text-blue-400" : "text-red-400"}>{mission.program}</span>
                            <span>{mission.type}</span>
                          </div>
                        </div>
                        <span className={`shrink-0 text-xs font-medium ${
                          mission.status === "完成" ? "text-emerald-400" :
                          mission.status.includes("运行") ? "text-blue-400" :
                          mission.status === "计划中" ? "text-amber-400" : "text-slate-400"
                        }`}>
                          {mission.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {mission.summary}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
