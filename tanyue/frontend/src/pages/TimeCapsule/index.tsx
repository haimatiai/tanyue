import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TimeCapsule from "../../components/TimeCapsule";
import { fetchAllMissions } from "../../api/missions";
import type { Mission } from "../../types/mission";

export default function TimeCapsulePage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllMissions()
      .then(({ us, cn }) => {
        setMissions([...us, ...cn]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelectMission = (mission: Mission) => {
    navigate(`/mission/${mission.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <TimeCapsule missions={missions} onSelectMission={handleSelectMission} />
    </div>
  );
}
