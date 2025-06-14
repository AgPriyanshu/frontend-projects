import { HomeCard } from "@/components/home-card";
import { Brain } from "lucide-react";

export const GadgetClassifierCard = () => {
  return (
    <HomeCard
      to="/gadget-classifier"
      icon={<Brain className="text-primary" size={24} />}
      title="Gadget Classifier"
      description="AI-powered device identification from images"
    />
  );
};
