import BingoCard from "./components/BingoCard";
import { SettingsProvider } from "./components/SettingsContext";

export default function Home() {
  return (
    <SettingsProvider>
      <main>
        <div className="font-sans items-center justify-items-center sm:p-8">
          <BingoCard />
        </div>
      </main>
    </SettingsProvider>
  );
}
