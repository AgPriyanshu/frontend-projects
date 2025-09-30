import { HomeCard } from "@/components/home-card";
import { Map } from "lucide-react";

export const MapCard = () => {
  return (
    <HomeCard
      to="/map"
      icon={<Map className="text-primary" size={24} />}
      title="Interactive Map"
      description="Explore and draw on an interactive map"
    />
  );
};
