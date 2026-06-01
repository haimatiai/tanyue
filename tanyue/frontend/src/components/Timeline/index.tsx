import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import type { Mission } from "../../types/mission";

const STATUS_DOT: Record<string, string> = {
  完成: "bg-emerald-400",
  "在轨运行": "bg-blue-400 animate-pulse",
  "运行中": "bg-blue-400 animate-pulse",
  "计划中": "bg-amber-400",
  "完成（紧急返回）": "bg-orange-400",
  "完成（着陆器仍在工作）": "bg-teal-400",
};

function getDot(status: string) {
  return STATUS_DOT[status] ?? "bg-slate-400";
}

export default function Timeline({ missions, country }: { missions: Mission[]; country: "US" | "CN" }) {
  const location = useLocation();
  const sorted = [...missions].sort((a, b) => b.launch_date.localeCompare(a.launch_date));
  const accent = country === "US" ? "border-blue-500" : "border-red-500";
  const accentText = country === "US" ? "text-blue-400" : "text-red-400";
  const accentBg = country === "US" ? "bg-blue-500" : "bg-red-500";

  // Group by program
  const programs = Array.from(new Set(missions.map((m) => m.program)));

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent" />

      <div className="space-y-2 pl-12">
        {sorted.map((mission, i) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative"
          >
            {/* Timeline dot */}
            <div className={`absolute -left-9 top-5 w-3 h-3 rounded-full ${getDot(mission.status)} border-2 border-space-900`} />
            {/* Connector */}
            <div className="absolute -left-8 top-6 w-4 h-px bg-slate-700" />

            <Link to={`/mission/${mission.id}`} state={{ from: location.pathname }}>
              <div className={`group bg-space-800 border border-slate-700/50 hover:${accent} rounded-xl p-4 transition-all hover:-translate-y-0.5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold">{mission.name}</span>
                      <span className="text-slate-500 text-xs">{mission.english_name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>{mission.launch_date.slice(0, 7)}</span>
                      <span className={`${accentText}`}>{mission.program}</span>
                      <span>{mission.type}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`text-xs font-medium ${
                      mission.status === "完成" ? "text-emerald-400" :
                      mission.status.includes("运行") ? "text-blue-400" :
                      mission.status === "计划中" ? "text-amber-400" : "text-slate-400"
                    }`}>
                      {mission.status}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {mission.summary}
                </p>

                {mission.achievements.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {mission.achievements.slice(0, 2).map((a, idx) => (
                      <span key={idx} className="text-xs bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full line-clamp-1 max-w-xs">
                        {a}
                      </span>
                    ))}
                    {mission.achievements.length > 2 && (
                      <span className="text-xs text-slate-600 px-1 py-0.5">+{mission.achievements.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
