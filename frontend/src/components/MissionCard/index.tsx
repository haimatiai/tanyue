import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import type { Mission } from "../../types/mission";

const STATUS_COLOR: Record<string, string> = {
  完成: "text-emerald-400 bg-emerald-400/10",
  "运行中": "text-blue-400 bg-blue-400/10",
  "在轨运行": "text-blue-400 bg-blue-400/10",
  "计划中": "text-amber-400 bg-amber-400/10",
  "完成（紧急返回）": "text-orange-400 bg-orange-400/10",
  "完成（着陆器仍在工作）": "text-teal-400 bg-teal-400/10",
};

function getStatusColor(status: string): string {
  return STATUS_COLOR[status] ?? "text-slate-400 bg-slate-400/10";
}

export default function MissionCard({
  mission,
  index = 0,
}: {
  mission: Mission;
  index?: number;
}) {
  const location = useLocation();
  const isUS = mission.country === "US";
  const accentColor = isUS ? "border-blue-500/30 hover:border-blue-400/60" : "border-red-500/30 hover:border-red-400/60";
  const tagColor = isUS ? "bg-blue-500/20 text-blue-300" : "bg-red-500/20 text-red-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={`/mission/${mission.id}`} state={{ from: location.pathname }} aria-label={`查看${mission.name}任务详情`}>
        <div className={`mission-card bg-space-800/90 border rounded-xl p-5 ${accentColor} ${
          isUS ? "glow-blue" : "glow-red"
        } backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-lg font-bold text-white">{mission.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{mission.english_name}</p>
            </div>
            <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(mission.status)}`}>
              {mission.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${tagColor}`}>{mission.program}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300">{mission.type}</span>
            {mission.crew && mission.crew[0] !== "待定" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                载人 · {mission.crew.length}人
              </span>
            )}
          </div>

          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{mission.summary}</p>

          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span>🚀 {mission.launch_date.slice(0, 7)}</span>
            {mission.landing_site && <span>📍 {mission.landing_site}</span>}
            {mission.mass_kg && <span>⚖️ {(mission.mass_kg / 1000).toFixed(0)}t</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
