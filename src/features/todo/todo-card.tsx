import { Link } from "@tanstack/react-router";

export const TodoCard = () => {
  return (
    <Link
      to="/todo-list"
      className="block p-6 bg-card text-card-foreground rounded-lg border border-border hover:border-primary transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Todo List</h2>
          <p className="text-muted-foreground">
            Manage your tasks and stay organized
          </p>
        </div>
      </div>
    </Link>
  );
};
