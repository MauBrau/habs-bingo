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
            className={`group
                ${tile.isChecked ? "bg-habs-red" : "hover:bg-habs-blue"} 
                select-none cursor-pointer place-content-center
                outline-3 sm:outline-7 outline-solid outline-offset-2 outline-(--habs-blue)`}
            onClick={handleClick}
        >
            <p
                className={`leading-5 ${tile.isChecked ? "text-gray-100" : "text-black"} font-bold text-center group-hover:text-gray-100 wrap-anywhere hyphens-auto sm:hyphens-none `}
                lang="en"
            >
                {tile.text}
            </p>
        </div>
    );
}
