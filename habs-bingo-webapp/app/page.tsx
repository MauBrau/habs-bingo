import Image from "next/image";
import BingoCard from "./components/BingoCard";

export default function Home() {
  return (
    <div>
      <main>
        <Image
          className="object-center"
          src="/unofficial-habs-bingo.svg"
          alt="Unofficial Habs Bingo logo"
          width={525}
          height={150}
          priority
        />
        <div className="font-sans items-center justify-items-center min-h-screen p-8">
          <BingoCard />
        </div>
      </main>
    </div>
  );
}
