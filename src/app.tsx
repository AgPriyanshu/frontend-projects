import "./app.css";
import { ThemeToggle } from "./components/theme-toggle";
import { type ReactNode } from "react";
import { Navigation } from "./components/navigation";

interface AppProps {
  children: ReactNode;
}

export const App = ({ children }: AppProps) => {
  return (
    <div className="h-full flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Apps</h1>
          <div className="flex items-center gap-4">
            <Navigation />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="h-full flex flex-col">{children}</div>
      </main>
    </div>
  );
};
