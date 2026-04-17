import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MoonGlobe from "../../components/MoonGlobe";
import { fetchAllMissions, fetchStats } from "../../api/missions";
import type { Mission, Stats } from "../../types/mission";

function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className={`bg-space-800/80 border border-${color}-500/20 rounded-xl p-4 text-center`}>
      <div className={`text-3xl font-bold text-${color}-400`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

export default function Home() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllMissions().then(({ us, cn }) => setMissions([...us, ...cn]));
    fetchStats().then(setStats);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-screen flex flex-col items-center justify-center">
        {/* Moon globe */}
        <div className="absolute inset-0">
          <MoonGlobe missions={missions} onMissionSelect={setSelectedMission} />
        </div>

        {/* Title overlay */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute top-24 text-center"
        >
          <h1 className="text-6xl font-bold tracking-[0.2em] text-white mb-2"
            style={{ textShadow: "0 0 40px rgba(200,191,170,0.4)" }}>
            探月
          </h1>
          <p className="text-slate-400 tracking-widest text-sm">人类奔月简史 · 从梦想到现实</p>
        </motion.div>

        {/* Selected mission popup */}
        {selectedMission && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 w-80"
          >
            <div className={`rounded-xl p-4 border cursor-pointer ${
              selectedMission.country === "US"
                ? "bg-blue-950/90 border-blue-500/40"
                : "bg-red-950/90 border-red-500/40"
            }`}
              onClick={() => navigate(`/mission/${selectedMission.id}`)}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-white">{selectedMission.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedMission.landing_site}</p>
                </div>
                <span className="text-xs text-slate-400">{selectedMission.launch_date.slice(0, 4)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{selectedMission.summary}</p>
              <p className="text-xs text-slate-500 mt-2">点击查看详情 →</p>
            </div>
          </motion.div>
        )}

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 text-slate-600 text-xs text-center"
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-slate-600 mx-auto mb-2" />
          向下探索
        </motion.div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="max-w-4xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-center text-slate-500 text-sm tracking-widest mb-8">数说探月</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard value={stats.us_total} label="美国任务总数" color="blue" />
              <StatCard value={stats.us_landings} label="美国着陆次数" color="blue" />
              <StatCard value={stats.cn_total} label="中国任务总数" color="red" />
              <StatCard value={stats.cn_landings} label="中国着陆次数" color="red" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Program Cards */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-center text-slate-500 text-sm tracking-widest mb-8">选择探索</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/usa">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-space-800 border border-blue-500/20 rounded-2xl p-8 glow-blue cursor-pointer"
            >
              <div className="text-4xl mb-4">🇺🇸</div>
              <h3 className="text-2xl font-bold text-white mb-2">美国探月</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                从1958年先驱者计划到阿波罗登月，再到正在进行的阿尔忒弥斯计划——
                美国半个多世纪的奔月历程。
              </p>
              <div className="mt-4 text-blue-400 text-sm">探索 {stats?.us_total ?? "…"} 个任务 →</div>
            </motion.div>
          </Link>

          <Link to="/china">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-space-800 border border-red-500/20 rounded-2xl p-8 glow-red cursor-pointer"
            >
              <div className="text-4xl mb-4">🇨🇳</div>
              <h3 className="text-2xl font-bold text-white mb-2">中国探月</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                从2007年嫦娥一号到首次月球背面采样返回——
                嫦娥工程书写了中国航天最辉煌的篇章之一。
              </p>
              <div className="mt-4 text-red-400 text-sm">探索 {stats?.cn_total ?? "…"} 个任务 →</div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
