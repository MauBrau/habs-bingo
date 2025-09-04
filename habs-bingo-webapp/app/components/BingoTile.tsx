'use client'
import React, { useState } from "react";

interface TileProps {
    text: String;
}

export default function BingoTile({ text } : TileProps) {
    const [isChecked, setIsChecked] = useState<Boolean>(false);

    const handleClick = () => {
        setIsChecked((prevState) => !prevState)
    }

    return <div className={`${isChecked ? 'bg-habs-red' : 'hover:bg-habs-blue'}`} onClick={handleClick}>
        <p className={`${isChecked}`}>{text}</p>
    </div>
}