import { Link } from "@tanstack/react-router";

export const Navigation = () => {
  return (
    <nav className="flex items-center gap-4">
      <Link
        to="/"
        className="text-sm font-medium transition-colors hover:text-primary"
        activeProps={{ className: "text-primary" }}
      >
        Home
      </Link>
      <Link
        to="/map"
        className="text-sm font-medium transition-colors hover:text-primary"
        activeProps={{ className: "text-primary" }}
      >
        Map
      </Link>
      <Link
        to="/todo-list"
        className="text-sm font-medium transition-colors hover:text-primary"
        activeProps={{ className: "text-primary" }}
      >
        Todo List
      </Link>
    </nav>
  );
};
