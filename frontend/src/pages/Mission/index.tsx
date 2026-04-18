import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import SpacecraftViewer from "../../components/SpacecraftViewer";
import { fetchMission } from "../../api/missions";
import type { Mission } from "../../types/mission";

export default function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const from: string = (location.state as any)?.from ?? "/history";
  const backLabel: Record<string, string> = {
    "/history": "奔月简史",
    "/china": "中国探月",
    "/usa": "美国探月",
  };
  const [mission, setMission] = useState<Mission | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchMission(id).then(setMission).catch(() => setError(true));
  }, [id]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      <div className="text-center">
        <p className="text-2xl mb-4">任务不存在</p>
        <Link to="/" className="text-blue-400 hover:underline">返回首页</Link>
      </div>
    </div>
  );

  if (!mission) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
    </div>
  );

  const isUS = mission.country === "US";
  const accent = isUS ? "blue" : "red";

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back */}
        <Link
          to={from}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          ← 返回{backLabel[from] ?? "奔月简史"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Title */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs px-3 py-1 rounded-full bg-${accent}-500/20 text-${accent}-300 font-medium`}>
                  {mission.program}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  mission.status === "完成" ? "bg-emerald-500/20 text-emerald-300" :
                  mission.status.includes("运行") ? "bg-blue-500/20 text-blue-300" :
                  "bg-amber-500/20 text-amber-300"
                }`}>
                  {mission.status}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white">{mission.name}</h1>
              <p className="text-slate-500 mt-1">{mission.english_name} · {mission.agency}</p>
            </div>

            {/* Summary */}
            <p className="text-slate-300 leading-relaxed text-base mb-6">{mission.summary}</p>

            {/* Key facts */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "发射日期", value: mission.launch_date },
                { label: "结束日期", value: mission.end_date ?? "进行中" },
                { label: "运载火箭", value: mission.launch_vehicle },
                { label: "任务类型", value: mission.type },
                ...(mission.landing_site ? [{ label: "着陆地点", value: mission.landing_site }] : []),
                ...(mission.mass_kg ? [{ label: "发射质量", value: `${mission.mass_kg.toLocaleString()} kg` }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="bg-space-800 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">{label}</div>
                  <div className="text-sm text-white font-medium">{value}</div>
                </div>
              ))}
            </div>

            {/* Crew */}
            {mission.crew && mission.crew[0] !== "待定" && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">宇航员</h3>
                <div className="flex flex-wrap gap-2">
                  {mission.crew.map((name) => (
                    <span key={name} className="bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm px-3 py-1 rounded-full">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {mission.achievements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">主要成就</h3>
                <ul className="space-y-2">
                  {mission.achievements.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-${accent}-400`} />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Right: 3D model + specs */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {/* 3D Spacecraft */}
            <div className={`bg-space-800 border border-${accent}-500/20 rounded-2xl overflow-hidden mb-6`}>
              <div className="h-72">
                <SpacecraftViewer modelType={mission.model_type} />
              </div>
              <p className="text-center text-xs text-slate-600 py-2">拖动旋转 · 滚轮缩放</p>
            </div>

            {/* Technical specs */}
            {Object.keys(mission.specs).length > 0 && (
              <div className={`bg-space-800 border border-${accent}-500/20 rounded-2xl p-5`}>
                <h3 className="text-sm font-semibold text-slate-400 mb-4">技术参数</h3>
                <div className="space-y-3">
                  {Object.entries(mission.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-start gap-4">
                      <span className="text-xs text-slate-500 shrink-0">{key}</span>
                      <span className="text-sm text-white text-right">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Landing coords */}
            {mission.landing_coords && (
              <div className={`mt-4 bg-space-800 border border-${accent}-500/20 rounded-xl p-4`}>
                <h3 className="text-xs text-slate-500 mb-2">着陆坐标</h3>
                <div className="flex gap-6 text-sm text-white font-mono">
                  <span>纬度 {mission.landing_coords.lat.toFixed(3)}°</span>
                  <span>经度 {mission.landing_coords.lon.toFixed(3)}°</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
