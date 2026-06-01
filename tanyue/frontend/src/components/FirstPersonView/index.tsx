import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import type { Mission } from "../../types/mission";

interface FirstPersonViewProps {
  mission: Mission;
  onClose: () => void;
}

// ==================== 超写实纹理生成器 ====================

// 静海基地 - 细腻平坦的月壤（阿波罗11号着陆点特征）
const createTranquilityTexture = () => {
  const size = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  
  // 基础色 - 静海的浅灰色细尘
  ctx.fillStyle = "#7a7a75";
  ctx.fillRect(0, 0, size, size);
  
  // 细腻的月壤颗粒 - 多层噪声
  for (let layer = 0; layer < 3; layer++) {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    const scale = Math.pow(2, layer);
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % size;
      const y = Math.floor((i / 4) / size);
      const noise = (Math.sin(x / (20 * scale)) + Math.sin(y / (20 * scale))) * 15 / scale;
      const random = (Math.random() - 0.5) * 10;
      const base = 122 + noise + random;
      data[i] = Math.max(100, Math.min(145, base));
      data[i + 1] = Math.max(98, Math.min(143, base - 2));
      data[i + 2] = Math.max(95, Math.min(140, base - 5));
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }
  
  // 静海特征 - 小型次级陨石坑 - 更真实的阴影
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 15 + 4;
    
    // 陨石坑内部阴影
    const craterGrad = ctx.createRadialGradient(x - r*0.3, y - r*0.3, 0, x, y, r);
    craterGrad.addColorStop(0, "#3a3a35");
    craterGrad.addColorStop(0.4, "#4a4a45");
    craterGrad.addColorStop(0.7, "#6a6a65");
    craterGrad.addColorStop(0.9, "#8a8a85");
    craterGrad.addColorStop(1, "#9a9a95");
    ctx.fillStyle = craterGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    
    // 陨石坑边缘凸起
    ctx.strokeStyle = "#a5a5a0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.95, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // 宇航员的脚印痕迹 - 更真实
  for (let i = 0; i < 12; i++) {
    const x = 300 + i * 70 + Math.random() * 15;
    const y = 500 + Math.sin(i * 0.4) * 40 + Math.random() * 10;
    const rotation = Math.random() * 0.4 - 0.2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    // 鞋底纹路
    ctx.fillStyle = "#5a5a55";
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 纹路细节
    ctx.fillStyle = "#4a4a45";
    for (let j = -2; j <= 2; j++) {
      ctx.fillRect(-6, j * 6, 12, 2);
    }
    
    ctx.restore();
  }
  
  // 添加细微的月尘纹理
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 1.5;
    ctx.fillStyle = Math.random() > 0.5 ? "#8a8a85" : "#6a6a65";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = 16;
  return tex;
};

// 南极-艾特肯盆地 - 崎岖深色的月背地表
const createAitkenTexture = () => {
  const size = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  
  // 深色的月背地表
  ctx.fillStyle = "#2a2a28";
  ctx.fillRect(0, 0, size, size);
  
  // 粗糙的岩石纹理 - 多层
  for (let layer = 0; layer < 4; layer++) {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    const scale = Math.pow(2.5, layer);
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % size;
      const y = Math.floor((i / 4) / size);
      const noise = (Math.sin(x / (15 * scale)) * Math.cos(y / (15 * scale))) * 40 / scale;
      const random = (Math.random() - 0.5) * 20;
      const base = 42 + noise + random;
      data[i] = Math.max(20, Math.min(85, base));
      data[i + 1] = Math.max(18, Math.min(83, base - 2));
      data[i + 2] = Math.max(15, Math.min(80, base - 5));
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }
  
  // 大型古老撞击坑 - 更真实的深度
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 80 + 30;
    
    // 撞击坑深度渐变
    const craterGrad = ctx.createRadialGradient(x - r*0.4, y - r*0.4, 0, x, y, r);
    craterGrad.addColorStop(0, "#0a0a08");
    craterGrad.addColorStop(0.3, "#1a1a18");
    craterGrad.addColorStop(0.5, "#2a2a28");
    craterGrad.addColorStop(0.75, "#3a3a38");
    craterGrad.addColorStop(0.9, "#4a4a48");
    craterGrad.addColorStop(1, "#5a5a58");
    ctx.fillStyle = craterGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    
    // 撞击坑边缘的碎石堆 - 更多细节
    for (let j = 0; j < 50; j++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = r * (0.85 + Math.random() * 0.2);
      const sx = x + Math.cos(angle) * dist;
      const sy = y + Math.sin(angle) * dist;
      const sr = Math.random() * 6 + 2;
      const brightness = 55 + Math.random() * 30;
      ctx.fillStyle = `rgb(${brightness}, ${brightness - 2}, ${brightness - 5})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
      
      // 石块阴影
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.arc(sx + 1, sy + 1, sr * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // 散落的岩石
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 8 + 3;
    const brightness = 50 + Math.random() * 25;
    ctx.fillStyle = `rgb(${brightness}, ${brightness - 2}, ${brightness - 5})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = 16;
  return tex;
};

// ==================== 阿波罗11号 - 极致写实登月舱视角 ====================
function Apollo11RealisticView() {
  const { camera, scene } = useThree();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [flagPlanted, setFlagPlanted] = useState(false);
  const [showArmstrong, setShowArmstrong] = useState(false);
  const [showReflection, setShowReflection] = useState(true);
  const timeRef = useRef(0);
  const breathingRef = useRef(0);
  const blinkRef = useRef(0);
  
  const quotes = [
    { 
      text: "休斯顿，这里是静海基地。鹰号已着陆。", 
      author: "尼尔·阿姆斯特朗", 
      time: "1969.07.20 20:17 UTC",
      audio: "Houston, Tranquility Base here. The Eagle has landed."
    },
    { 
      text: "这是我个人的一小步，却是人类的一大步。", 
      author: "尼尔·阿姆斯特朗", 
      time: "1969.07.21 02:56 UTC",
      audio: "That's one small step for man, one giant leap for mankind."
    },
    { 
      text: "这里的景色非常壮观，简直令人难以置信。", 
      author: "巴兹·奥尔德林", 
      time: "1969.07.21 03:15 UTC",
      audio: "Magnificent desolation."
    },
  ];
  
  const texture = useMemo(() => createTranquilityTexture(), []);
  
  useEffect(() => {
    camera.position.set(0, 1.62, 0.15);
    camera.fov = 65;
    scene.fog = new THREE.FogExp2(0x000000, 0.012);
  }, [camera, scene]);
  
  useFrame((_, delta) => {
    timeRef.current += delta;
    breathingRef.current += delta * 0.4;
    blinkRef.current += delta;
    
    // 真实的宇航服呼吸节奏 - 更自然
    const breath = Math.sin(breathingRef.current) * 0.003 + Math.sin(breathingRef.current * 0.67) * 0.0015;
    camera.position.y = 1.62 + breath;
    
    // 极轻微的手部自然抖动 - 模拟肌肉疲劳
    const fatigue = Math.sin(timeRef.current * 0.1) * 0.5 + 0.5;
    camera.rotation.z = Math.sin(timeRef.current * 0.25) * 0.00015 * fatigue;
    camera.rotation.x = Math.sin(timeRef.current * 0.18) * 0.0001;
    
    // 偶尔眨眼效果
    if (blinkRef.current > 3 + Math.random() * 2) {
      blinkRef.current = 0;
    }
  });
  
  return (
    <>
      {/* 真实光照 - 无大气散射的硬阴影 */}
      <ambientLight intensity={0.025} />
      <directionalLight 
        position={[15, 10, 8]} 
        intensity={1.55} 
        color="#fff8e0"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-near={0.1}
        shadow-camera-far={200}
        shadow-bias={-0.0001}
      />
      {/* 地球反光 - 微弱的蓝色补光 */}
      <directionalLight position={[-8, 3, -8]} intensity={0.06} color="#4a6a8a" />
      {/* 舱内微弱的环境光 */}
      <pointLight position={[0, 2, 0.5]} intensity={0.02} color="#ffaa77" distance={5} />
      
      {/* 星空 - 真实分布 */}
      <Stars radius={200} depth={80} count={8000} factor={6} saturation={0} fade speed={0.05} />
      
      {/* 静海表面 - 更真实的地形 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.62, 0]} receiveShadow>
        <planeGeometry args={[300, 300, 128, 128]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.99} 
          metalness={0.002}
          color="#ffffff"
          displacementScale={0.5}
        />
      </mesh>
      
      {/* 远处的地球 - 真实大小和位置 */}
      <mesh position={[20, 12, -100]}>
        <sphereGeometry args={[7, 128, 128]} />
        <meshStandardMaterial 
          color="#2a4a6b"
          emissive="#0a1a2a"
          emissiveIntensity={0.12}
          roughness={0.22}
          metalness={0.08}
        />
      </mesh>
      
      <Html center>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* 鹰号登月舱舷窗 - 极致写实 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[99vw] h-[98vh]">
              {/* 外框 - 厚重金属 - 多层结构 */}
              <div 
                className="absolute inset-0"
                style={{ 
                  border: '32px solid #0a0a0a',
                  boxShadow: 'inset 0 0 150px rgba(0,0,0,0.98), 0 0 100px rgba(0,0,0,0.95)',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #050505 50%, #0a0a0a 100%)'
                }}
              >
                {/* 内框隔热层 */}
                <div 
                  className="absolute inset-2"
                  style={{
                    border: '16px solid #0f0f0f',
                    background: 'linear-gradient(180deg, #151515 0%, #050505 100%)',
                    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
                  }}
                />
                
                {/* 金属磨损痕迹 */}
                <div className="absolute top-4 left-1/4 w-32 h-1 bg-gradient-to-r from-transparent via-[#3a3a3a] to-transparent opacity-50" />
                <div className="absolute bottom-8 right-1/3 w-24 h-0.5 bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent opacity-40" />
                
                {/* 多层强化玻璃 */}
                <div className="absolute inset-8 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/2" />
                <div className="absolute inset-8 bg-gradient-to-t from-black/50 via-transparent to-black/15" />
                
                {/* 玻璃反光 - 动态 */}
                <AnimatePresence>
                  {showReflection && (
                    <motion.div 
                      className="absolute inset-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.02) 100%)'
                      }}
                    />
                  )}
                </AnimatePresence>
                
                {/* 窗格加强筋 - 更厚重 */}
                <div className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent -translate-y-1/2" />
                <div className="absolute left-1/2 top-8 bottom-8 w-1 bg-gradient-to-b from-transparent via-[#2a2a2a] to-transparent -translate-x-1/2" />
                
                {/* 角落加强 */}
                <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[#3a3a3a]/50" />
                <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[#3a3a3a]/50" />
                <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-[#3a3a3a]/50" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[#3a3a3a]/50" />
              </div>
              
              {/* 钛合金螺栓 - 真实十字槽 - 更多细节 */}
              {[
                [12, 8], [30, 5], [50, 4], [70, 5], [88, 8],
                [5, 30], [95, 30],
                [4, 50], [96, 50],
                [5, 70], [95, 70],
                [8, 92], [30, 95], [50, 96], [70, 95], [92, 92]
              ].map(([x, y], i) => (
                <div 
                  key={i} 
                  className="absolute w-8 h-8 rounded-full"
                  style={{ 
                    left: `${x}%`, 
                    top: `${y}%`, 
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle at 25% 25%, #b0b0b0, #707070, #3a3a3a, #1a1a1a)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.3), inset 0 -2px 3px rgba(0,0,0,0.6)'
                  }}
                >
                  {/* 螺栓边缘 */}
                  <div className="absolute inset-1 rounded-full border border-[#0a0a0a]/80" />
                  {/* 十字槽 */}
                  <div className="absolute top-1/2 left-1/2 w-4 h-1 bg-[#0a0a0a] -translate-x-1/2 -translate-y-1/2 rotate-45" />
                  <div className="absolute top-1/2 left-1/2 w-4 h-1 bg-[#0a0a0a] -translate-x-1/2 -translate-y-1/2 -rotate-45" />
                  {/* 十字槽深度 */}
                  <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-[#2a2a2a] -translate-x-1/2 -translate-y-1/2 rotate-45" />
                  <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-[#2a2a2a] -translate-x-1/2 -translate-y-1/2 -rotate-45" />
                </div>
              ))}
              
              {/* 玻璃边缘高光 */}
              <div 
                className="absolute inset-8 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 30px rgba(255,255,255,0.03), inset 0 0 60px rgba(255,255,255,0.015)'
                }}
              />
              
              {/* 舱内结构阴影 */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-black/50 to-transparent" />
              <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-black/50 to-transparent" />
            </div>
          </div>
          
          {/* 真实HUD - 鹰号控制面板 - 更精细 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-3">
              {/* LM状态 */}
              <div 
                className="bg-black/80 backdrop-blur-2xl px-5 py-3 rounded-lg border border-green-500/50"
                style={{ boxShadow: '0 0 40px rgba(0,255,0,0.15), inset 0 0 30px rgba(0,255,0,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_#22c55e]" />
                  <span className="text-green-400 font-mono text-sm font-bold tracking-[0.15em]">LM-5 EAGLE</span>
                </div>
                <div className="text-green-300/50 font-mono text-[9px] tracking-wider">SEA OF TRANQUILITY</div>
                <div className="text-green-300/40 font-mono text-[9px] tracking-wider">LAT: 0.67408° N</div>
                <div className="text-green-300/40 font-mono text-[9px] tracking-wider">LON: 23.47297° E</div>
              </div>
              
              {/* 任务时间 */}
              <div 
                className="bg-black/80 backdrop-blur-2xl px-6 py-3 rounded-lg border border-yellow-500/50 text-center"
                style={{ boxShadow: '0 0 40px rgba(255,193,7,0.15)' }}
              >
                <div className="text-yellow-500/50 font-mono text-[7px] mb-0.5 tracking-wider">MISSION ELAPSED TIME</div>
                <div className="text-yellow-400 font-mono text-2xl font-bold tracking-[0.2em]">
                  {String(Math.floor(timeRef.current / 3600)).padStart(2, '0')}:
                  {String(Math.floor((timeRef.current % 3600) / 60)).padStart(2, '0')}:
                  {String(Math.floor(timeRef.current % 60)).padStart(2, '0')}
                </div>
                <div className="text-yellow-500/30 font-mono text-[8px] mt-1 tracking-wider">GET: 102:45:12</div>
              </div>
              
              {/* 宇航服环境 */}
              <div 
                className="bg-black/80 backdrop-blur-2xl px-5 py-3 rounded-lg border border-cyan-500/50"
                style={{ boxShadow: '0 0 40px rgba(0,255,255,0.15)' }}
              >
                <div className="text-cyan-400/50 font-mono text-[8px] mb-1 tracking-wider">SUIT ENVIRONMENT</div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-1">
                  <span className="text-cyan-300/60 font-mono text-xs">O₂</span>
                  <span className="text-cyan-300 font-mono text-xs">98.2%</span>
                  <span className="text-cyan-300/60 font-mono text-xs">TEMP</span>
                  <span className="text-cyan-300 font-mono text-xs">-23°C</span>
                  <span className="text-cyan-300/60 font-mono text-xs">PRESS</span>
                  <span className="text-cyan-300 font-mono text-xs">3.8 psi</span>
                  <span className="text-cyan-300/60 font-mono text-xs">CO₂</span>
                  <span className="text-cyan-300 font-mono text-xs">0.05%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 插旗按钮 - 更真实 */}
          <AnimatePresence>
            {!flagPlanted && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => { setFlagPlanted(true); setTimeout(() => setShowArmstrong(true), 500); }}
                className="absolute top-1/2 right-16 -translate-y-1/2 pointer-events-auto group"
              >
                <div 
                  className="relative px-6 py-4 rounded-xl overflow-hidden transition-transform active:scale-95"
                  style={{
                    background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 30%, #172554 100%)',
                    boxShadow: '0 8px 30px rgba(30,64,175,0.6), inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -2px 2px rgba(0,0,0,0.4)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* 按钮纹理 */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)'
                  }} />
                  <span className="relative text-white font-bold text-sm flex items-center gap-3">
                    <span className="text-xl">🇺🇸</span>
                    PLANT FLAG
                  </span>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* 美国国旗 - 更真实 */}
          <AnimatePresence>
            {flagPlanted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, y: 150 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-[30%] left-[28%] pointer-events-none"
              >
                <div className="relative">
                  {/* 旗杆 */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 h-32 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600" />
                  {/* 国旗 */}
                  <motion.div 
                    className="text-8xl filter drop-shadow-2xl"
                    animate={{ 
                      rotateY: [0, 5, 0, -3, 0],
                      scaleX: [1, 0.98, 1, 0.99, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🇺🇸
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 宇航员剪影 - 更真实 */}
          <AnimatePresence>
            {showArmstrong && (
              <motion.div
                initial={{ opacity: 0, x: -80 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 1.2 }}
                className="absolute bottom-[28%] left-[22%] pointer-events-none"
              >
                <div className="relative">
                  {/* 头盔反光 */}
                  <div className="absolute -top-4 left-2 w-6 h-6 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-sm" />
                  {/* 身体轮廓 */}
                  <div className="w-20 h-40 bg-gradient-to-t from-white/25 via-white/15 to-transparent rounded-full blur-md" />
                  {/* 背包 */}
                  <div className="absolute top-4 -left-4 w-8 h-20 bg-gradient-to-r from-white/20 to-transparent rounded-lg blur-sm" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 通讯语录 - 真实磁带录音机风格 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIdx}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4"
            >
              <div 
                className="relative bg-gradient-to-b from-[#06060a]/98 to-[#020203]/98 backdrop-blur-2xl p-8 rounded-2xl border border-blue-500/30"
                style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.95), inset 0 1px 1px rgba(255,255,255,0.06)' }}
              >
                {/* 音频波形 - 更精细 */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex gap-[3px] h-8 items-end">
                    {Array.from({length: 40}).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] bg-gradient-to-t from-blue-700 to-blue-400 rounded-full"
                        animate={{ 
                          height: [4, 10 + Math.random() * 20, 4],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{ 
                          duration: 0.3 + Math.random() * 0.2, 
                          repeat: Infinity, 
                          delay: i * 0.015 
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-blue-400/60 text-[10px] font-mono tracking-wider">LIVE TRANSMISSION</span>
                  </div>
                </div>
                
                <div className="text-blue-100/95 text-lg leading-relaxed mb-5 font-light tracking-wide">
                  &ldquo;{quotes[quoteIdx].text}&rdquo;
                </div>
                
                <div className="flex justify-between items-end border-t border-blue-500/20 pt-5">
                  <div>
                    <span className="text-blue-400 font-semibold text-sm">{quotes[quoteIdx].author}</span>
                    <span className="text-blue-500/50 text-xs ml-4 font-mono italic">&ldquo;{quotes[quoteIdx].audio}&rdquo;</span>
                  </div>
                  <span className="text-blue-500/50 text-xs font-mono">{quotes[quoteIdx].time}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* 切换按钮 */}
          <button
            onClick={() => setQuoteIdx((p) => (p + 1) % quotes.length)}
            className="absolute bottom-16 right-12 pointer-events-auto group"
          >
            <div 
              className="relative px-5 py-3 rounded-xl transition-all active:scale-95"
              style={{
                background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.12)'
              }}
            >
              <span className="text-gray-300 text-xs font-medium group-hover:text-white transition-colors tracking-wider">
                NEXT TRANSMISSION ↻
              </span>
            </div>
          </button>
          
          {/* 胶片颗粒效果 - 增强 */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }} 
          />
          
          {/* 镜头眩光 - 更真实 */}
          <div className="absolute top-[15%] right-[20%] w-48 h-48 rounded-full bg-gradient-radial from-white/10 via-white/3 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute top-[25%] right-[30%] w-24 h-24 rounded-full bg-gradient-radial from-white/5 to-transparent blur-2xl pointer-events-none" />
          
          {/* 扫描线效果 */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)'
            }}
          />
        </div>
      </Html>
    </>
  );
}

// ==================== 嫦娥六号 - 极致写实月背采样视角 ====================
function ChangE6RealisticView() {
  const { camera } = useThree();
  const [isDrilling, setIsDrilling] = useState(false);
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const [showSample, setShowSample] = useState(false);
  const [cameraShake, setCameraShake] = useState(0);
  const drillRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const vibrationRef = useRef(0);
  
  const texture = useMemo(() => createAitkenTexture(), []);
  
  useEffect(() => {
    camera.position.set(0, 0.35, 0.5);
    camera.lookAt(0, -0.15, -0.4);
    camera.fov = 52;
  }, [camera]);
  
  useFrame((_, dt) => {
    timeRef.current += dt;
    if (isDrilling) {
      vibrationRef.current += dt * 100;
      const vibration = Math.sin(vibrationRef.current) * 0.005 * (pct / 100 + 0.5);
      camera.position.x = vibration + Math.sin(timeRef.current * 50) * 0.001;
      camera.position.y = 0.35 + Math.abs(vibration) * 0.5;
      setCameraShake(vibration * 100);
      if (drillRef.current) {
        drillRef.current.position.y = 0.08 + Math.sin(timeRef.current * 30) * 0.008;
        drillRef.current.rotation.z = Math.sin(timeRef.current * 35) * 0.015;
      }
    }
  });
  
  useEffect(() => {
    if (isDrilling) {
      setPct(0);
      const iv = setInterval(() => {
        setPct(p => {
          if (p >= 100) { clearInterval(iv); return 100; }
          return p + 0.8;
        });
      }, 50);
      setTimeout(() => { 
        setIsDrilling(false); 
        setDone(true);
        setTimeout(() => setShowSample(true), 600);
      }, 6200);
      return () => clearInterval(iv);
    }
  }, [isDrilling]);
  
  return (
    <>
      {/* 月背光照 - 更暗更冷 */}
      <ambientLight intensity={0.015} />
      <directionalLight 
        position={[12, 8, 6]} 
        intensity={1.25} 
        color="#fff2d0"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 2, -5]} intensity={0.04} color="#2a3a4a" />
      
      <Stars radius={150} depth={60} count={5000} factor={5} saturation={0} fade speed={0.06} />
      
      {/* 崎岖的月背表面 */}
      <mesh rotation={[-Math.PI / 2 - 0.1, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
        <planeGeometry args={[200, 200, 64, 64]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.995} 
          metalness={0.001}
          color="#eeeeee"
        />
      </mesh>
      
      {/* 精密钻取机械臂 - 更详细 */}
      <group position={[0, 0.02, -0.28]}>
        {/* 钻杆 */}
        <mesh ref={drillRef} position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.006, 0.005, 0.15, 12]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.99} roughness={0.06} />
        </mesh>
        {/* 螺旋纹路 - 更精细 */}
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0, 0.02 + i * 0.015, 0]} rotation={[0, i * 0.8, 0]}>
            <boxGeometry args={[0.014, 0.003, 0.003]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}
        {/* 电机外壳 */}
        <mesh position={[0, 0.16, 0]} castShadow>
          <boxGeometry args={[0.04, 0.08, 0.04]} />
          <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* 散热鳍片 */}
        {[-0.03, -0.01, 0.01, 0.03].map((y, i) => (
          <mesh key={i} position={[0, 0.16 + y, 0]}>
            <boxGeometry args={[0.07, 0.004, 0.07]} />
            <meshStandardMaterial color="#252525" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {/* 液压管线 */}
        <mesh position={[0.025, 0.1, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 0.12, 6]} />
          <meshStandardMaterial color="#8b0000" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* 采集的月壤样本 */}
      <AnimatePresence>
        {showSample && (
          <motion.mesh
            initial={{ scale: 0, y: -1.25 }}
            animate={{ scale: 1, y: -1.22 }}
            transition={{ type: "spring", stiffness: 180, damping: 12 }}
            position={[0.12, 0, -0.22]}
            castShadow
          >
            <cylinderGeometry args={[0.02, 0.02, 0.06, 16]} />
            <meshStandardMaterial 
              color="#d4a520" 
              metalness={0.75} 
              roughness={0.22}
              emissive="#7a5c10"
              emissiveIntensity={0.12}
            />
          </motion.mesh>
        )}
      </AnimatePresence>
      
      <Html center>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* 科学相机取景框 - 专业级 - 更精细 */}
          <div 
            className="absolute inset-4"
            style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)' }}
          >
            {/* 主边框 */}
            <div className="absolute inset-0 border-[4px] border-red-500/40" />
            
            {/* 内边框 */}
            <div className="absolute inset-2 border-2 border-red-500/20" />
            
            {/* 专业测距刻度 - 更精细 */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-[3px]">
              {Array.from({length: 51}).map((_, i) => (
                <div 
                  key={i} 
                  className="w-px bg-red-500/60" 
                  style={{ height: i % 10 === 0 ? '20px' : i % 5 === 0 ? '14px' : '8px' }} 
                />
              ))}
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-[3px]">
              {Array.from({length: 51}).map((_, i) => (
                <div 
                  key={i} 
                  className="w-px bg-red-500/60" 
                  style={{ height: i % 10 === 0 ? '20px' : i % 5 === 0 ? '14px' : '8px' }} 
                />
              ))}
            </div>
            <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-[3px]">
              {Array.from({length: 31}).map((_, i) => (
                <div 
                  key={i} 
                  className="h-px bg-red-500/60" 
                  style={{ width: i % 5 === 0 ? '20px' : '10px' }} 
                />
              ))}
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-[3px]">
              {Array.from({length: 31}).map((_, i) => (
                <div 
                  key={i} 
                  className="h-px bg-red-500/60" 
                  style={{ width: i % 5 === 0 ? '20px' : '10px' }} 
                />
              ))}
            </div>
            
            {/* 中心十字准星 - 更精细 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-[2px] bg-red-500/90" />
              <div className="w-[2px] h-12 bg-red-500/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="w-3 h-3 border-2 border-red-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="w-16 h-16 border border-red-500/40 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="w-24 h-24 border border-red-500/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            {/* 距离标记 */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 text-red-500/70 font-mono text-xs">
              <div>0.5m</div>
              <div className="mt-8">1.0m</div>
              <div className="mt-8">1.5m</div>
            </div>
            
            {/* 角落标记 - 更精细 */}
            {[[0,0], [0,1], [1,0], [1,1]].map(([x,y], i) => (
              <div 
                key={i}
                className={`absolute w-8 h-8 ${x ? 'right-6' : 'left-6'} ${y ? 'bottom-6' : 'top-6'}`}
              >
                <div className={`absolute ${x ? 'right-0' : 'left-0'} ${y ? 'bottom-0' : 'top-0'} w-full h-[3px] bg-red-500/70`} />
                <div className={`absolute ${x ? 'right-0' : 'left-0'} ${y ? 'bottom-0' : 'top-0'} w-[3px] h-full bg-red-500/70`} />
                {/* 角落小方块 */}
                <div className={`absolute ${x ? 'right-1' : 'left-1'} ${y ? 'bottom-1' : 'top-1'} w-2 h-2 bg-red-500/50`} />
              </div>
            ))}
            
            {/* 网格线 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/3 left-0 right-0 h-px bg-red-500" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-red-500" />
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-red-500" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-red-500" />
            </div>
          </div>
          
          {/* 中国航天HUD - 专业级 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-4">
              <div 
                className="bg-black/70 backdrop-blur-2xl px-6 py-3 rounded-xl border border-red-500/60"
                style={{ boxShadow: '0 0 60px rgba(220,38,38,0.3)' }}
              >
                <div className="flex items-center gap-4 mb-1">
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]" />
                    <span className="text-[8px] text-red-400/80 mt-1 font-mono font-bold">LIVE</span>
                  </div>
                  <div>
                    <span className="text-red-100 font-mono text-lg font-bold tracking-[0.2em]">嫦娥六号</span>
                    <span className="text-red-500/70 text-sm ml-3 font-mono">CE-6</span>
                  </div>
                </div>
                <div className="text-red-200/60 font-mono text-[11px] flex gap-3 tracking-wider">
                  <span>月球背面</span>
                  <span className="text-red-500/40">|</span>
                  <span>南极-艾特肯盆地</span>
                  <span className="text-red-500/40">|</span>
                  <span>钻取采样</span>
                </div>
              </div>
              
              {/* 系统状态 */}
              <div 
                className="bg-black/70 backdrop-blur-2xl px-5 py-3 rounded-xl border border-yellow-500/50"
                style={{ boxShadow: '0 0 40px rgba(234,179,8,0.2)' }}
              >
                <div className="text-[10px] text-yellow-500/70 font-mono mb-1 tracking-wider">SYSTEM STATUS</div>
                <div className={`text-base font-mono font-bold tracking-wider ${isDrilling ? 'text-yellow-400 animate-pulse' : done ? 'text-green-400' : 'text-cyan-400'}`}>
                  {isDrilling ? '◉ SAMPLING' : done ? '✓ COMPLETE' : '◉ STANDBY'}
                </div>
              </div>
            </div>
          </div>
          
          {/* 钻取参数 - 详细 */}
          <div className="absolute top-4 left-6">
            <div 
              className="bg-black/60 backdrop-blur-2xl px-5 py-4 rounded-xl border-l-[4px] border-red-500/70"
              style={{ boxShadow: '0 0 40px rgba(0,0,0,0.6)' }}
            >
              <div className="text-[10px] text-red-400/70 font-mono mb-3 tracking-wider">DRILL PARAMETERS</div>
              <div className="space-y-2">
                <div className="flex justify-between gap-12">
                  <span className="text-red-300/70 font-mono text-sm">DEPTH</span>
                  <span className="text-red-200 font-mono text-sm">{(pct * 0.025).toFixed(3)} m</span>
                </div>
                <div className="flex justify-between gap-12">
                  <span className="text-red-300/70 font-mono text-sm">ROTATION</span>
                  <span className="text-red-200 font-mono text-sm">{isDrilling ? '2850' : '0'} RPM</span>
                </div>
                <div className="flex justify-between gap-12">
                  <span className="text-red-300/70 font-mono text-sm">TORQUE</span>
                  <span className="text-red-200 font-mono text-sm">{isDrilling ? '48.3' : '0.0'} N·m</span>
                </div>
                <div className="flex justify-between gap-12">
                  <span className="text-red-300/70 font-mono text-sm">TEMP</span>
                  <span className="text-red-200 font-mono text-sm">{isDrilling ? '127' : '23'} °C</span>
                </div>
                <div className="flex justify-between gap-12">
                  <span className="text-red-300/70 font-mono text-sm">PRESS</span>
                  <span className="text-red-200 font-mono text-sm">{isDrilling ? '2.1' : '1.0'} kPa</span>
                </div>
                <div className="flex justify-between gap-12">
                  <span className="text-red-300/70 font-mono text-sm">VIBRATION</span>
                  <span className="text-red-200 font-mono text-sm">{cameraShake.toFixed(1)} μm</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 环形进度条 - 专业级 */}
          <AnimatePresence>
            {isDrilling && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2"
              >
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="82" fill="none" stroke="#1a1a1a" strokeWidth="14" />
                    <circle 
                      cx="96" cy="96" r="82" fill="none" 
                      stroke="url(#grad2)" strokeWidth="14"
                      strokeDasharray={`${pct * 5.15} 515`}
                      strokeLinecap="round"
                      className="transition-all duration-100"
                    />
                    <defs>
                      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#991b1b" />
                        <stop offset="50%" stopColor="#dc2626" />
                        <stop offset="100%" stopColor="#fca5a5" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-red-400 font-mono">{Math.floor(pct)}%</span>
                    <span className="text-xs text-red-400/70 font-mono mt-2 tracking-wider">SAMPLING</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 启动按钮 - 工业级 */}
          <AnimatePresence>
            {!isDrilling && !done && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={() => setIsDrilling(true)}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto group"
              >
                <div 
                  className="relative px-14 py-5 rounded-2xl overflow-hidden transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
                    boxShadow: '0 10px 40px rgba(220,38,38,0.7), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* 按钮纹理 */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 8px)'
                  }} />
                  <span className="relative text-white font-bold text-lg tracking-[0.25em] flex items-center gap-4">
                    <motion.span 
                      className="w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.9)]"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    启动钻取
                  </span>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* 完成提示 - 专业级 */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2"
              >
                <div 
                  className="bg-gradient-to-b from-green-900/98 to-green-800/98 backdrop-blur-2xl px-12 py-7 rounded-2xl border border-green-400/60"
                  style={{ boxShadow: '0 25px 70px rgba(0,0,0,0.8), 0 0 50px rgba(34,197,94,0.4)' }}
                >
                  <div className="flex items-center gap-6">
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-16 h-16 rounded-full bg-green-500/30 flex items-center justify-center border-2 border-green-400/70"
                    >
                      <span className="text-4xl">✓</span>
                    </motion.div>
                    <div>
                      <div className="text-green-100 font-bold text-2xl tracking-wide">采样完成</div>
                      <div className="text-green-300/80 text-base tracking-wider">Sample Collection Complete</div>
                      <div className="text-green-400/70 text-xs font-mono mt-3 tracking-wider">
                        MASS: 1.731 kg | DEPTH: 2.500 m | TIME: 102s
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 数字噪点效果 */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }} 
          />
        </div>
      </Html>
    </>
  );
}

// ==================== 通用月球行走 - 极致写实 ====================
function GenericRealisticView({ mission }: { mission: Mission }) {
  const { camera } = useThree();
  const t = useRef(0);
  const isFarSide = mission.landing_coords && mission.landing_coords.lat < 0;
  const isApollo = mission.program.includes("阿波罗");
  const isChangE = mission.program.includes("嫦娥");
  
  const texture = useMemo(() => createTranquilityTexture(), []);
  
  useEffect(() => {
    camera.position.set(0, 1.65, 0.8);
    camera.lookAt(0, -0.2, -8);
    camera.fov = 58;
  }, [camera]);
  
  useFrame((_, dt) => {
    t.current += dt * 0.1;
    // 真实的低重力行走 - 缓慢、飘浮感
    camera.position.x = Math.sin(t.current) * 0.15;
    camera.position.z = 0.8 + Math.cos(t.current * 0.6) * 0.08;
    camera.position.y = 1.65 + Math.abs(Math.sin(t.current)) * 0.02;
    // 轻微的头部晃动
    camera.rotation.z = Math.sin(t.current * 0.5) * 0.002;
  });
  
  const themeColor = isApollo ? "#f59e0b" : isChangE ? "#ef4444" : "#3b82f6";
  const quote = isApollo 
    ? "We came in peace for all mankind." 
    : isChangE 
    ? "追逐梦想，勇于探索。" 
    : "Exploring the final frontier...";
  
  return (
    <>
      <ambientLight intensity={0.03} />
      <directionalLight position={[12, 10, 8]} intensity={1.35} color="#fff6e0" castShadow />
      <directionalLight position={[-6, 3, -6]} intensity={0.06} color="#4a5a6a" />
      
      <Stars radius={200} depth={80} count={6000} factor={5} saturation={0} fade speed={0.08} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.65, 0]} receiveShadow>
        <planeGeometry args={[300, 300, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.98} metalness={0.005} />
      </mesh>
      
      {!isFarSide && (
        <mesh position={[15, 12, -80]}>
          <sphereGeometry args={[6, 128, 128]} />
          <meshStandardMaterial 
            color="#2a4a6b"
            emissive="#0a1a2a"
            emissiveIntensity={0.08}
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>
      )}
      
      <Html center>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-6 left-6">
            <div 
              className="bg-black/70 backdrop-blur-2xl px-6 py-4 rounded-xl border-l-[4px]"
              style={{ borderLeftColor: themeColor, boxShadow: '0 0 50px rgba(0,0,0,0.6)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                <span className="text-white/95 font-mono text-lg font-bold tracking-wider">{mission.name}</span>
              </div>
              <div className="text-white/40 font-mono text-sm tracking-wider">{mission.english_name}</div>
              <div className="text-white/30 font-mono text-xs mt-2 tracking-wider">
                {mission.landing_site || "Lunar Surface"}
              </div>
              {mission.landing_coords && (
                <div className="text-white/25 font-mono text-[10px] mt-1 tracking-wider">
                  {Math.abs(mission.landing_coords.lat).toFixed(4)}°{mission.landing_coords.lat > 0 ? 'N' : 'S'} | 
                  {Math.abs(mission.landing_coords.lon).toFixed(4)}°{mission.landing_coords.lon > 0 ? 'E' : 'W'}
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute top-6 right-6">
            <div className="bg-black/60 backdrop-blur-2xl px-6 py-4 rounded-xl text-right">
              <div className="text-white/40 font-mono text-[10px] mb-2 tracking-wider">ENVIRONMENT</div>
              <div className="text-white/80 font-mono text-base">1.62 m/s²</div>
              <div className="text-white/35 font-mono text-[10px] tracking-wider">LUNAR GRAVITY</div>
              <div className="text-white/80 font-mono text-base mt-3">-173°C / 127°C</div>
              <div className="text-white/35 font-mono text-[10px] tracking-wider">TEMPERATURE</div>
              <div className="text-white/80 font-mono text-base mt-3">10⁻¹² Torr</div>
              <div className="text-white/35 font-mono text-[10px] tracking-wider">PRESSURE</div>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 3 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center"
          >
            <div className="bg-gradient-to-t from-black/95 via-black/60 to-transparent px-16 py-10 rounded-2xl">
              <p className="text-white/60 text-xl italic font-light tracking-widest" style={{ textShadow: '0 2px 25px rgba(0,0,0,0.95)' }}>
                &ldquo;{quote}&rdquo;
              </p>
              <p className="text-white/25 text-sm mt-5 tracking-[0.5em] uppercase">
                {isApollo ? "Apollo Program" : isChangE ? "Chinese Lunar Exploration" : "Human Space Exploration"}
              </p>
            </div>
          </motion.div>
          
          {/* 胶片颗粒 */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }} 
          />
        </div>
      </Html>
    </>
  );
}

// ==================== 场景选择 ====================
function Scene({ mission }: { mission: Mission }) {
  const id = mission.id.toLowerCase();
  const name = mission.name.toLowerCase();
  
  if (id.includes("apollo-11") || id.includes("apollo11") || name.includes("阿波罗11")) {
    return <Apollo11RealisticView />;
  }
  if (id.includes("change-6") || id.includes("change6") || name.includes("嫦娥六")) {
    return <ChangE6RealisticView />;
  }
  return <GenericRealisticView mission={mission} />;
}

export default function FirstPersonView({ mission, onClose }: FirstPersonViewProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 bg-black"
    >
      <Canvas
        camera={{ fov: 58, near: 0.05, far: 500 }}
        gl={{ 
          antialias: true, 
          alpha: false, 
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        dpr={[1, 2]}
      >
        <Scene mission={mission} />
      </Canvas>
      
      <motion.button 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onClose}
        className="absolute top-6 right-6 z-10 bg-black/60 backdrop-blur-2xl border border-white/20 hover:border-white/40 text-white/70 hover:text-white px-6 py-3 rounded-xl transition-all"
      >
        <span className="text-sm font-medium tracking-wider">✕ EXIT</span>
      </motion.button>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-8 left-8 z-10 bg-black/70 backdrop-blur-2xl px-8 py-5 rounded-xl border-l-[3px] border-white/30"
      >
        <h3 className="text-white font-medium text-xl tracking-wide">{mission.name}</h3>
        <p className="text-white/40 text-sm uppercase tracking-[0.2em] mt-1">{mission.english_name}</p>
        <div className="flex gap-3 mt-4">
          <span className="text-xs px-4 py-1.5 rounded-lg bg-white/10 text-white/60 border border-white/10">
            {mission.program}
          </span>
          <span className="text-xs px-4 py-1.5 rounded-lg bg-white/10 text-white/60 border border-white/10">
            {mission.launch_date}
          </span>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 right-8 z-10 text-white/15 text-sm font-mono tracking-wider"
      >
        PRESS ESC TO EXIT
      </motion.div>
    </motion.div>
  );
}
