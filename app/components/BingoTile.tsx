"use client";
import React from "react";
import { TileStatus } from "../interface/IBingoBoard";

interface BingoTileProps {
    tile: TileStatus;
    onClick: () => void;
}

export default function BingoTile({ tile, onClick }: BingoTileProps) {
    const handleClick = () => {
        if (!tile.isLocked) {
            onClick();
        }
    };

    return (
        <div
            className={`group min-h-0
                ${tile.isChecked ? "bg-habs-red" : "hover:bg-habs-blue"} 
                select-none cursor-pointer place-content-center
                outline-3 sm:outline-7 outline-solid outline-offset-2 outline-(--habs-blue)`}
            onClick={handleClick}
        >
            <p
                className={`bingo-tile-text leading-[1.1] sm:leading-tight text-[clamp(0.75rem,3.5vw,1rem)] sm:text-base ${tile.isChecked ? "text-gray-100" : "text-foreground"} font-bold text-center group-hover:text-gray-100 break-words hyphens-auto sm:hyphens-none px-0.5`}
                lang="en"
            >
                {tile.text}
            </p>
        </div>
    );
}
