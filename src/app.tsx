import "./app.css";
import { ThemeToggle } from "./components/theme-toggle";
import { type ReactNode } from "react";

interface AppProps {
  children: ReactNode;
}

export const App = ({ children }: AppProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Apps</h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="app flex flex-col items-center justify-center w-full gap-6">
          {children}
        </div>
      </main>
    </div>
  );
};
