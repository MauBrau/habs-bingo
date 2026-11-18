import BingoCard from "./components/BingoCard";
import ClientDateDisplay from "./components/ClientDateDisplay";
import { SettingsProvider } from "./components/SettingsContext";
import fs from "fs";
import path from "path";

export default function Home() {
  let lastUpdated = '';
  try {
    const filePath = path.join(process.cwd(), 'app', 'assets', 'bingo-board.json');
    const stats = fs.statSync(filePath);
    lastUpdated = stats.mtime.toISOString();
  } catch (e) {
    console.error("Could not read bingo-board.json stats", e);
  }

  return (
    <SettingsProvider>
      <main>
        <div className="font-sans items-center justify-items-center sm:p-2">
          {lastUpdated && <ClientDateDisplay isoString={lastUpdated} />}
          <BingoCard version={lastUpdated} />
        </div>
      </main>
    </SettingsProvider>
  );
}
