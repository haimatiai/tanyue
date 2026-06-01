# 探月 · Lunar Explorer

> 用中文讲述人类奔月的故事——从第一个脚印到重返南极。

**探月**是一个开源的月球探测科普网站，致力于让更多中国人了解当前人类探月的最新进展。从1960年代的阿波罗计划，到2024年着陆月球背面的嫦娥六号，再到正在进行的阿尔忒弥斯载人登月计划——这里用可交互的方式把这些故事讲清楚。

**在线体验：** [待补充] · **代码仓库：** [github.com/haimatiai/tanyue](https://github.com/haimatiai/tanyue)

---

## 为什么做这个

人类正处于第二次探月热潮。美国、中国、日本、印度的探测器接连奔赴月球，登月竞赛再度开启——而这些消息在中文互联网上往往零散、不系统。

探月希望做一件事：**把最新、最准确的探月信息，用好看、易懂的方式呈现给中文读者**，让更多人对太空探索感兴趣。

---

## 功能

- **交互式 3D 月球**——所有历史着陆点标注在月球表面，点击查看任务详情
- **美国探月完整时间线**——从先驱者计划、阿波罗登月到阿尔忒弥斯计划
- **中国嫦娥工程全览**——四期工程进度、嫦娥一号到嫦娥八号
- **任务详情页**——技术参数、主要成就、宇航员名单、3D 飞船模型
- **全中文界面**

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 后端 | Python · FastAPI |
| 前端 | React · TypeScript · Vite |
| 3D 渲染 | Three.js · React Three Fiber |
| 样式 | Tailwind CSS · Framer Motion |

---

## 本地运行

**要求：** Python 3.10+，Node.js 18+

```bash
# 克隆项目
git clone https://github.com/haimatiai/tanyue.git
cd tanyue

# 启动后端
cd backend
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 启动前端（新终端）
cd frontend
npm install
npm run dev
```

浏览器打开 http://localhost:5173

---

## 贡献指南

非常欢迎任何形式的贡献——无论是补充任务数据、修正错误、改进翻译，还是新功能开发。

**最容易上手的贡献方式：补充或修正任务数据。**

所有任务数据存放在：
- `backend/data/us_missions.json` — 美国探月任务
- `backend/data/cn_missions.json` — 中国探月任务

每条任务的数据结构：

```json
{
  "id": "唯一标识符",
  "name": "任务中文名",
  "english_name": "Mission Name",
  "country": "US 或 CN",
  "agency": "NASA / CNSA",
  "program": "所属计划",
  "type": "任务类型",
  "status": "完成 / 在轨运行 / 计划中",
  "launch_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD 或 null",
  "launch_vehicle": "运载火箭",
  "mass_kg": 数字或null,
  "landing_site": "着陆地点或null",
  "landing_coords": { "lat": 纬度, "lon": 经度 },
  "summary": "任务简介",
  "achievements": ["成就1", "成就2"],
  "specs": { "参数名": "参数值" }
}
```

提交流程：Fork → 修改 → Pull Request。

**目前最需要补充的内容：**
- 2024–2025 年商业探月任务（Intuitive Machines IM-1/IM-2、Firefly Blue Ghost）
- JAXA SLIM（日本精准着陆任务）
- 各任务的真实图片 URL（NASA/JAXA 公开图片）
- 印度月船三号（Chandrayaan-3）

---

## 数据来源

- [NASA Solar System Exploration](https://solarsystem.nasa.gov/)
- [NASA Science Moon Missions](https://science.nasa.gov/moon/)
- [中国国家航天局 CNSA](http://www.cnsa.gov.cn/)
- [NASA 3D Resources](https://nasa3d.arc.nasa.gov/)
- 月球纹理：NASA SVS LROC Color Map

---

## 联系

问题与建议：[haimati@haimati.ai](mailto:haimati@haimati.ai)

---

## 协议

[MIT License](LICENSE) · 数据与内容均来自公开资料，欢迎自由使用与二次传播。
