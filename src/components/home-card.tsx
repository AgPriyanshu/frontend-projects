import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import classnames from "classnames";

interface HomeCardProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const HomeCard = ({
  className,
  to,
  icon,
  title,
  description,
}: HomeCardProps) => {
  const customClassName = classnames(
    "block p-6 bg-card text-card-foreground rounded-lg border border-border hover:border-primary transition-colors self-center",
    className
  );

  return (
    <Link to={to} className={customClassName}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">{icon}</div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
};
