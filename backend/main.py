import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

DATA_DIR = Path(__file__).parent / "data"
STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(title="探月 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_json(filename: str) -> list:
    with open(DATA_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/missions")
def get_all_missions():
    us = load_json("us_missions.json")
    cn = load_json("cn_missions.json")
    return {"us": us, "cn": cn}


@app.get("/api/missions/us")
def get_us_missions():
    return load_json("us_missions.json")


@app.get("/api/missions/cn")
def get_cn_missions():
    return load_json("cn_missions.json")


@app.get("/api/missions/{mission_id}")
def get_mission(mission_id: str):
    for filename in ("us_missions.json", "cn_missions.json"):
        for mission in load_json(filename):
            if mission["id"] == mission_id:
                return mission
    raise HTTPException(status_code=404, detail="任务不存在")


@app.get("/api/stats")
def get_stats():
    us = load_json("us_missions.json")
    cn = load_json("cn_missions.json")
    return {
        "us_total": len(us),
        "cn_total": len(cn),
        "us_landings": sum(1 for m in us if m.get("landing_site") and m.get("status") == "完成"),
        "cn_landings": sum(1 for m in cn if m.get("landing_site") and m.get("status") not in ("计划中",)),
        "us_samples_kg": round(sum(
            float(m["specs"]["采样重量"].replace(" kg", "").replace(",", ""))
            for m in us
            if isinstance(m.get("specs", {}).get("采样重量"), str)
            and "kg" in m["specs"]["采样重量"]
        ), 1),
    }


if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
