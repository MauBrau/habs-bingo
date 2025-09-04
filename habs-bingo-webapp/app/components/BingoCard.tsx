'use client'
import BingoTile from "./BingoTile";
import { BingoBoard } from "../interface/IBingoBoard";

export default function BingoCard() {
    const bingoBoard : BingoBoard = require("../assets/bingo-board.json");
    const NUM_TILES = 25;
    const tiles = [];
    // TODO: Make an array of randomly selected bingo options. No duplicates if theyre generic.
    // Up to 1 dup if player specific
    for (let i = 0; i < NUM_TILES; i++) {
        // TODO: If player, pick a player from the active list and build the string with their name. They already have a white space
        tiles.push(<BingoTile key={i} text={'Test'}/>);
    }
    
    return <div className="items-center bg-white max-w-s p-6 rounded-lg">
        <div className={`h-200 w-200 grid grid-cols-5 grid-rows-5 gap-4`}>
            { tiles }
        </div>
    </div>
}