export interface LandingCoords {
  lat: number;
  lon: number;
}

export interface Mission {
  id: string;
  name: string;
  english_name: string;
  country: "US" | "CN";
  agency: string;
  program: string;
  type: string;
  status: string;
  launch_date: string;
  end_date: string | null;
  launch_vehicle: string;
  crew?: string[];
  mass_kg: number | null;
  landing_site: string | null;
  landing_coords: LandingCoords | null;
  summary: string;
  achievements: string[];
  specs: Record<string, string | number>;
  image: string | null;
  model_type: string;
}

export interface Stats {
  us_total: number;
  cn_total: number;
  us_landings: number;
  cn_landings: number;
  us_samples_kg: number;
}
