import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Mission } from "../../types/mission";

const FirstPersonView = lazy(() => import("../FirstPersonView"));

interface TimeCapsuleProps {
  missions: Mission[];
  onSelectMission: (mission: Mission) => void;
}

type ViewMode = "era" | "tech";
type EraFilter = "all" | "1960s" | "1970s" | "1990s" | "2000s" | "2010s" | "2020s";
type TechFilter = "all" | "unmanned" | "manned" | "sample" | "base";

interface EraConfig {
  id: EraFilter;
  label: string;
  yearRange: [number, number];
  theme: {
    name: string;
    filter: string;
    bgGradient: string;
    accentColor: string;
    fontFamily: string;
  };
  audio: {
    type: string;
    description: string;
  };
}

interface TechConfig {
  id: TechFilter;
  label: string;
  filter: (mission: Mission) => boolean;
  theme: {
    name: string;
    filter: string;
    bgGradient: string;
    accentColor: string;
  };
}

const ERA_CONFIGS: EraConfig[] = [
  {
    id: "1960s",
    label: "60年代 · 太空竞赛",
    yearRange: [1960, 1969],
    theme: {
      name: "vintage-film",
      filter: "sepia(0.4) contrast(1.1) saturate(0.8)",
      bgGradient: "from-amber-950 via-slate-900 to-black",
      accentColor: "#d4a574",
      fontFamily: "'Courier New', monospace",
    },
    audio: {
      type: "apollo-comm",
      description: "阿波罗登月通讯原声",
    },
  },
  {
    id: "1970s",
    label: "70年代 · 阿波罗时代",
    yearRange: [1970, 1979],
    theme: {
      name: "classic-film",
      filter: "sepia(0.2) contrast(1.05) saturate(0.9)",
      bgGradient: "from-slate-800 via-slate-900 to-black",
      accentColor: "#94a3b8",
      fontFamily: "'Courier New', monospace",
    },
    audio: {
      type: "apollo-comm",
      description: "阿波罗任务通讯",
    },
  },
  {
    id: "1990s",
    label: "90年代 · 重启探索",
    yearRange: [1990, 1999],
    theme: {
      name: "early-digital",
      filter: "contrast(1.1) saturate(1.1)",
      bgGradient: "from-blue-950 via-slate-900 to-black",
      accentColor: "#60a5fa",
      fontFamily: "system-ui, sans-serif",
    },
    audio: {
      type: "space-ambient",
      description: "太空环境音",
    },
  },
  {
    id: "2000s",
    label: "00年代 · 嫦娥启程",
    yearRange: [2000, 2009],
    theme: {
      name: "modern-digital",
      filter: "saturate(1.2)",
      bgGradient: "from-red-950 via-slate-900 to-black",
      accentColor: "#f87171",
      fontFamily: "system-ui, sans-serif",
    },
    audio: {
      type: "rocket-launch",
      description: "嫦娥一号发射",
    },
  },
  {
    id: "2010s",
    label: "10年代 · 深空探测",
    yearRange: [2010, 2019],
    theme: {
      name: "hd-modern",
      filter: "saturate(1.3) contrast(1.05)",
      bgGradient: "from-purple-950 via-slate-900 to-black",
      accentColor: "#c084fc",
      fontFamily: "system-ui, sans-serif",
    },
    audio: {
      type: "mission-control",
      description: "任务控制中心",
    },
  },
  {
    id: "2020s",
    label: "20年代 · 重返月球",
    yearRange: [2020, 2029],
    theme: {
      name: "ultra-hd",
      filter: "saturate(1.4) contrast(1.1)",
      bgGradient: "from-cyan-950 via-slate-900 to-black",
      accentColor: "#22d3ee",
      fontFamily: "system-ui, sans-serif",
    },
    audio: {
      type: "future-ambient",
      description: "未来太空氛围",
    },
  },
];

const TECH_CONFIGS: TechConfig[] = [
  {
    id: "unmanned",
    label: "无人探测",
    filter: (m) => m.type.includes("探测器") || m.type.includes("轨道器") || m.type.includes("着陆器"),
    theme: {
      name: "tech-unmanned",
      filter: "hue-rotate(180deg) saturate(1.2)",
      bgGradient: "from-blue-900 via-slate-900 to-black",
      accentColor: "#3b82f6",
    },
  },
  {
    id: "manned",
    label: "载人登月",
    filter: (m) => m.type.includes("载人") || (m.crew && m.crew.length > 0) || false,
    theme: {
      name: "tech-manned",
      filter: "sepia(0.3) saturate(1.3)",
      bgGradient: "from-amber-900 via-slate-900 to-black",
      accentColor: "#f59e0b",
    },
  },
  {
    id: "sample",
    label: "采样返回",
    filter: (m) => m.type.includes("采样") || m.achievements.some(a => a.includes("采样") || a.includes("返回")),
    theme: {
      name: "tech-sample",
      filter: "saturate(1.4) hue-rotate(30deg)",
      bgGradient: "from-green-900 via-slate-900 to-black",
      accentColor: "#10b981",
    },
  },
  {
    id: "base",
    label: "基地建设",
    filter: (m) => m.program.includes("阿尔忒弥斯") || m.program.includes("嫦娥") && m.name.includes("八号"),
    theme: {
      name: "tech-base",
      filter: "saturate(1.5) contrast(1.1)",
      bgGradient: "from-purple-900 via-slate-900 to-black",
      accentColor: "#8b5cf6",
    },
  },
];

// 模拟音效（实际项目中使用真实音频文件）
const AUDIO_DESCRIPTIONS: Record<string, string> = {
  "apollo-comm": "📻 休斯顿，这里是静海基地...",
  "space-ambient": "🌌 深空环境音",
  "rocket-launch": "🚀 点火！起飞！",
  "mission-control": "📡 任务控制中心正在追踪",
  "future-ambient": "✨ 未来太空探索",
};

export default function TimeCapsule({ missions, onSelectMission }: TimeCapsuleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("era");
  const [selectedEra, setSelectedEra] = useState<EraFilter>("all");
  const [selectedTech, setSelectedTech] = useState<TechFilter>("all");
  const [currentTheme, setCurrentTheme] = useState<EraConfig["theme"] | TechConfig["theme"] | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioText, setAudioText] = useState("");
  const [firstPersonMission, setFirstPersonMission] = useState<Mission | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 检查任务是否有第一人称视角彩蛋
  const hasFirstPersonView = useCallback((mission: Mission): boolean => {
    const missionId = mission.id.toLowerCase();
    const missionName = mission.name.toLowerCase();
    
    // 支持的任务ID或名称匹配
    const supportedPatterns = [
      // 阿波罗任务
      "apollo-11", "apollo11", "apollo_11",
      "apollo-12", "apollo12", "apollo_12",
      "apollo-14", "apollo14", "apollo_14",
      "apollo-15", "apollo15", "apollo_15",
      "apollo-16", "apollo16", "apollo_16",
      "apollo-17", "apollo17", "apollo_17",
      // 嫦娥任务
      "change-6", "change6", "chang'e6", "嫦娥六号",
      "change-3", "change3", "chang'e3", "嫦娥三号",
      "change-4", "change4", "chang'e4", "嫦娥四号",
      "change-5", "change5", "chang'e5", "嫦娥五号",
    ];
    
    return supportedPatterns.some(pattern => 
      missionId.includes(pattern) || missionName.includes(pattern)
    );
  }, []);

  // 根据年代过滤任务
  const filterByEra = useCallback((mission: Mission, era: EraFilter): boolean => {
    if (era === "all") return true;
    const config = ERA_CONFIGS.find(e => e.id === era);
    if (!config) return true;
    const year = parseInt(mission.launch_date.slice(0, 4));
    return year >= config.yearRange[0] && year <= config.yearRange[1];
  }, []);

  // 根据技术类型过滤任务
  const filterByTech = useCallback((mission: Mission, tech: TechFilter): boolean => {
    if (tech === "all") return true;
    const config = TECH_CONFIGS.find(t => t.id === tech);
    if (!config) return true;
    return config.filter(mission);
  }, []);

  // 获取过滤后的任务
  const filteredMissions = missions.filter(m => {
    if (viewMode === "era") {
      return filterByEra(m, selectedEra);
    } else {
      return filterByTech(m, selectedTech);
    }
  }).sort((a, b) => a.launch_date.localeCompare(b.launch_date));

  // 更新主题
  useEffect(() => {
    if (viewMode === "era" && selectedEra !== "all") {
      const config = ERA_CONFIGS.find(e => e.id === selectedEra);
      if (config) setCurrentTheme(config.theme);
    } else if (viewMode === "tech" && selectedTech !== "all") {
      const config = TECH_CONFIGS.find(t => t.id === selectedTech);
      if (config) setCurrentTheme(config.theme);
    } else {
      setCurrentTheme(null);
    }
  }, [viewMode, selectedEra, selectedTech]);

  // 播放音效提示
  const playAudioEffect = useCallback((type: string) => {
    setAudioText(AUDIO_DESCRIPTIONS[type] || "🔊 播放音效...");
    setAudioPlaying(true);
    setTimeout(() => setAudioPlaying(false), 3000);
  }, []);

  // 处理年代选择
  const handleEraSelect = (era: EraFilter) => {
    setSelectedEra(era);
    if (era !== "all") {
      const config = ERA_CONFIGS.find(e => e.id === era);
      if (config) playAudioEffect(config.audio.type);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative min-h-screen transition-all duration-1000 ${
        currentTheme ? `bg-gradient-to-br ${currentTheme.bgGradient}` : "bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#050508]"
      }`}
      style={{
        filter: currentTheme?.filter || "none",
        fontFamily: (currentTheme as EraConfig["theme"])?.fontFamily || "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 高级暗黑科技风背景网格 */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />
      
      {/* 动态光晕背景 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />

      {/* 视觉风格叠加层 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 胶片颗粒效果 */}
        {currentTheme?.name?.includes("film") && (
          <div 
            className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        )}
        {/* 扫描线效果 */}
        {currentTheme?.name?.includes("vintage") && (
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)",
            }}
          />
        )}
        {/* 数字噪点效果 */}
        {currentTheme?.name?.includes("digital") && (
          <div 
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: "6px 6px",
            }}
          />
        )}
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* 标题 */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-3xl -z-10" />
          <h1 
            className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
            style={{ 
              color: currentTheme?.accentColor || "#fff",
              textShadow: currentTheme?.accentColor ? `0 0 40px ${currentTheme.accentColor}60` : '0 0 40px rgba(255,255,255,0.2)'
            }}
          >
            月球时间舱
          </h1>
          <p className="text-slate-400/80 text-lg md:text-xl font-light tracking-wide">
            穿越时空 <span className="mx-2 text-slate-600">|</span> 探索人类探月历程
          </p>
        </motion.div>

        {/* 视角切换器 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="flex justify-center mb-12"
        >
          <div className="bg-[#1a1a24]/80 backdrop-blur-xl rounded-full p-1.5 flex gap-1 border border-white/5 shadow-2xl">
            <button
              onClick={() => setViewMode("era")}
              className={`px-8 py-2.5 rounded-full transition-all duration-300 font-medium text-sm tracking-wide ${
                viewMode === "era" 
                  ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              📅 年代视角
            </button>
            <button
              onClick={() => setViewMode("tech")}
              className={`px-8 py-2.5 rounded-full transition-all duration-300 font-medium text-sm tracking-wide ${
                viewMode === "tech" 
                  ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              🔬 技术视角
            </button>
          </div>
        </motion.div>

        {/* 年代选择器 */}
        <AnimatePresence mode="wait">
          {viewMode === "era" && (
            <motion.div
              key="era-selector"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-16"
            >
              <button
                onClick={() => handleEraSelect("all")}
                className={`px-5 py-2 rounded-xl border transition-all duration-300 font-medium tracking-wide text-sm ${
                  selectedEra === "all"
                    ? "bg-white/10 border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    : "border-white/5 bg-[#12121a]/80 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                全部年代
              </button>
              {ERA_CONFIGS.map((era) => (
                <button
                  key={era.id}
                  onClick={() => handleEraSelect(era.id)}
                  className={`px-5 py-2 rounded-xl border transition-all duration-300 font-medium tracking-wide text-sm ${
                    selectedEra === era.id
                      ? "bg-white/10 text-white"
                      : "border-white/5 bg-[#12121a]/80 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                  style={{
                    borderColor: selectedEra === era.id ? era.theme.accentColor : undefined,
                    boxShadow: selectedEra === era.id ? `0 0 20px ${era.theme.accentColor}30` : undefined,
                  }}
                >
                  {era.label}
                </button>
              ))}
            </motion.div>
          )}

          {/* 技术选择器 */}
          {viewMode === "tech" && (
            <motion.div
              key="tech-selector"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-16"
            >
              <button
                onClick={() => setSelectedTech("all")}
                className={`px-5 py-2 rounded-xl border transition-all duration-300 font-medium tracking-wide text-sm ${
                  selectedTech === "all"
                    ? "bg-white/10 border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    : "border-white/5 bg-[#12121a]/80 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                全部技术
              </button>
              {TECH_CONFIGS.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => {
                    setSelectedTech(tech.id);
                    playAudioEffect("mission-control");
                  }}
                  className={`px-5 py-2 rounded-xl border transition-all duration-300 font-medium tracking-wide text-sm ${
                    selectedTech === tech.id
                      ? "bg-white/10 text-white"
                      : "border-white/5 bg-[#12121a]/80 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                  style={{
                    borderColor: selectedTech === tech.id ? tech.theme.accentColor : undefined,
                    boxShadow: selectedTech === tech.id ? `0 0 20px ${tech.theme.accentColor}30` : undefined,
                  }}
                >
                  {tech.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 音效提示 */}
        <AnimatePresence>
          {audioPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#12121a]/95 backdrop-blur-2xl px-8 py-4 rounded-2xl border border-white/10 z-50 shadow-2xl"
            >
              <span className="text-white flex items-center gap-3">
                <span className="animate-pulse text-lg">🔊</span>
                <span className="text-sm tracking-wide">{audioText}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 时间舱展示区 */}
        <div className="relative">
          {/* 时间线 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          
          {/* 时间线发光效果 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent blur-[1px]" />

          {/* 任务卡片 */}
          <div className="space-y-12">
            {filteredMissions.map((mission, index) => {
              const isLeft = index % 2 === 0;
              const year = mission.launch_date.slice(0, 4);
              const month = mission.launch_date.slice(5, 7);
              
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.6, ease: "easeOut" }}
                  className={`relative flex ${isLeft ? "justify-start" : "justify-end"}`}
                >
                  {/* 时间线节点 */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: "28px" }}>
                    <div 
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{ 
                        borderColor: currentTheme?.accentColor || "rgba(255,255,255,0.3)",
                        backgroundColor: "#12121a",
                        boxShadow: currentTheme?.accentColor ? `0 0 20px ${currentTheme.accentColor}50` : "0 0 20px rgba(255,255,255,0.1)",
                      }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: currentTheme?.accentColor || "rgba(255,255,255,0.5)" }}
                      />
                    </div>
                  </div>

                  {/* 连接线 */}
                  <div 
                    className={`absolute top-[36px] h-[1px] bg-gradient-to-r ${isLeft ? "left-[50%] right-[55%]" : "left-[55%] right-[50%]"}`}
                    style={{
                      background: isLeft 
                        ? `linear-gradient(to right, ${currentTheme?.accentColor || "rgba(255,255,255,0.3)"}, transparent)`
                        : `linear-gradient(to left, ${currentTheme?.accentColor || "rgba(255,255,255,0.3)"}, transparent)`
                    }}
                  />

                  {/* 卡片 */}
                  <div 
                    className={`w-[46%] ${isLeft ? "pr-10" : "pl-10"}`}
                    onClick={() => onSelectMission(mission)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, y: -6 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="bg-[#12121a]/80 backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-6 cursor-pointer group hover:border-white/[0.15] hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-500"
                      style={{
                        boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)",
                      }}
                    >
                      {/* 日期标签 */}
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="text-xs font-mono px-3 py-1 rounded-lg"
                          style={{ 
                            color: currentTheme?.accentColor || "#94a3b8",
                            backgroundColor: `${currentTheme?.accentColor || "#94a3b8"}15`,
                            border: `1px solid ${currentTheme?.accentColor || "#94a3b8"}30`,
                          }}
                        >
                          {year}.{month}
                        </div>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                      </div>

                      {/* 任务名称 */}
                      <h3 className="text-xl font-semibold text-white mb-1.5 group-hover:text-white transition-colors tracking-wide">
                        {mission.name}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 font-mono tracking-wider uppercase">{mission.english_name}</p>

                      {/* 任务类型标签 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span 
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ 
                            backgroundColor: `${currentTheme?.accentColor || "#3b82f6"}15`,
                            color: currentTheme?.accentColor || "#94a3b8",
                            border: `1px solid ${currentTheme?.accentColor || "#3b82f6"}25`,
                          }}
                        >
                          {mission.type}
                        </span>
                        <span className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 border border-white/5">
                          {mission.program}
                        </span>
                      </div>

                      {/* 简介 */}
                      <p className="text-sm text-slate-400/80 line-clamp-2 leading-relaxed">
                        {mission.summary}
                      </p>

                      {/* 成就标签 */}
                      {mission.achievements.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {mission.achievements.slice(0, 2).map((achievement, i) => (
                            <span 
                              key={i}
                              className="text-xs text-slate-500 bg-white/[0.03] px-2 py-1 rounded border border-white/[0.04]"
                            >
                              ✦ {achievement}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 第一人称视角彩蛋入口 */}
                      {hasFirstPersonView(mission) && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFirstPersonMission(mission);
                          }}
                          className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/40 hover:to-purple-600/40 text-white text-sm font-medium transition-all duration-300 flex items-center justify-center gap-3 group/btn border border-white/10 hover:border-white/20"
                        >
                          <span className="group-hover/btn:animate-pulse text-base">👨‍🚀</span>
                          <span className="tracking-wide">进入第一人称视角</span>
                          <span className="text-xs opacity-50 bg-white/10 px-2 py-0.5 rounded">彩蛋</span>
                        </motion.button>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 空状态 */}
          {filteredMissions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-3xl opacity-50">🌑</span>
              </div>
              <p className="text-slate-400 text-lg font-light">该时期暂无探月任务记录</p>
              <p className="text-slate-600 text-sm mt-3">请选择其他年代或技术类型</p>
            </motion.div>
          )}
        </div>

        {/* 统计信息 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-24 text-center"
        >
          <div className="inline-flex gap-10 bg-[#12121a]/80 backdrop-blur-2xl rounded-3xl px-12 py-6 border border-white/[0.06] shadow-2xl">
            <div className="text-center">
              <div 
                className="text-4xl font-bold mb-1"
                style={{ color: currentTheme?.accentColor || "#fff" }}
              >
                {filteredMissions.length}
              </div>
              <div className="text-xs text-slate-500 tracking-wider uppercase">任务数量</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div 
                className="text-4xl font-bold mb-1"
                style={{ color: currentTheme?.accentColor || "#fff" }}
              >
                {new Set(filteredMissions.map(m => m.program)).size}
              </div>
              <div className="text-xs text-slate-500 tracking-wider uppercase">探测计划</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div 
                className="text-4xl font-bold mb-1"
                style={{ color: currentTheme?.accentColor || "#fff" }}
              >
                {filteredMissions.filter(m => m.country === "US").length}
              </div>
              <div className="text-xs text-slate-500 tracking-wider uppercase">美国任务</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div 
                className="text-4xl font-bold mb-1"
                style={{ color: currentTheme?.accentColor || "#fff" }}
              >
                {filteredMissions.filter(m => m.country === "CN").length}
              </div>
              <div className="text-xs text-slate-500 tracking-wider uppercase">中国任务</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 第一人称视角彩蛋 */}
      <AnimatePresence>
        {firstPersonMission && (
          <Suspense fallback={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            >
              <div className="text-white text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p>正在进入第一人称视角...</p>
              </div>
            </motion.div>
          }>
            <FirstPersonView
              mission={firstPersonMission}
              onClose={() => setFirstPersonMission(null)}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
