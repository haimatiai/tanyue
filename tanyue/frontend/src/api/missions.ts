import type { Mission, Stats } from "../types/mission";

const BASE = "/api";

export async function fetchAllMissions(): Promise<{ us: Mission[]; cn: Mission[] }> {
  const res = await fetch(`${BASE}/missions`);
  return res.json();
}

export async function fetchUSMissions(): Promise<Mission[]> {
  const res = await fetch(`${BASE}/missions/us`);
  return res.json();
}

export async function fetchCNMissions(): Promise<Mission[]> {
  const res = await fetch(`${BASE}/missions/cn`);
  return res.json();
}

export async function fetchMission(id: string): Promise<Mission> {
  const res = await fetch(`${BASE}/missions/${id}`);
  if (!res.ok) throw new Error("任务不存在");
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE}/stats`);
  return res.json();
}
