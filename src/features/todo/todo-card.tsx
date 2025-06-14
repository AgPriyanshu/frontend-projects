import { HomeCard } from "@/components/home-card";
import { CheckSquare } from "lucide-react";

export const TodoCard = () => {
  return (
    <HomeCard
      className="flex-center"
      to="/todo-list"
      icon={<CheckSquare className="text-primary" size={24} />}
      title="Todo List"
      description="Manage your tasks and stay organized"
    />
  );
};
