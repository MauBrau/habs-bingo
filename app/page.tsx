import BingoCard from "./components/BingoCard";
import { SettingsProvider } from "./components/SettingsContext";
import fs from "fs";
import path from "path";

export default function Home() {
  let lastUpdated = '';
  try {
    const filePath = path.join(process.cwd(), 'app', 'assets', 'bingo-board.json');
    const stats = fs.statSync(filePath);
    lastUpdated = stats.mtime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch (e) {
    console.error("Could not read bingo-board.json stats", e);
  }

  return (
    <SettingsProvider>
      <main>
        <div className="font-sans items-center justify-items-center sm:p-8">
          {lastUpdated && (
            <p className="text-center text-xs text-(--outline) mt-2 pb-4 font-mono">
              Line-up last updated: {lastUpdated}
            </p>
          )}
          <BingoCard />
        </div>
      </main>
    </SettingsProvider>
  );
}
