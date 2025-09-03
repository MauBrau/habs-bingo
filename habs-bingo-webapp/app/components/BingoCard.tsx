'use client'

import BingoTile from "./BingoTile";

export default function BingoCard() {
    const ROW_AND_COL_COUNT = 5;
    const tiles = [];
    for (let i = 0; i < ROW_AND_COL_COUNT * ROW_AND_COL_COUNT; i++) {
        tiles.push(<BingoTile key={i} text={'Test'}/>);
    }
    return <div>
        Bingo Card
        <div className={`grid grid-cols-${ROW_AND_COL_COUNT} grid-rows-${ROW_AND_COL_COUNT} gap-4`}>
            { tiles }
        </div>
    </div>
}