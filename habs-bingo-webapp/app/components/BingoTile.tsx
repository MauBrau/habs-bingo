'use client'
import React, { useState } from "react";

interface TileProps {
    text: String;
}

export default function BingoTile({ text } : TileProps) {
    const [isChecked, setIsChecked] = useState<Boolean>(false);

    return <div className="bg-white hover:bg-blue ">
        Bingo Tile - {text}
    </div>
}