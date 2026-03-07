"use client";
import React, { useEffect, useState } from "react";
import { TileStatus } from "../interface/IBingoBoard";

interface BingoTileProps {
  tile: TileStatus;
  onClick: () => void;
}

export default function BingoTile({ tile, onClick }: BingoTileProps) {
    const [isSelected, setIsSelected] = useState<boolean>(tile.isChecked);

    const handleClick = () => {
        if (!tile.isLocked) {
            setIsSelected((prevState) => !prevState);
            onClick();
        }
    };

    return (
        <div
            className={`group
                ${isSelected ? "bg-habs-red" : "hover:bg-habs-blue"} 
                select-none cursor-pointer place-content-center
                outline-3 sm:outline-7 outline-solid outline-offset-2 outline-(--habs-blue)`}
            onClick={handleClick}
        >
            <p
                className={`leading-5 ${isSelected ? "text-gray-100" : "text-black"} font-bold text-center group-hover:text-gray-100 wrap-anywhere hyphens-auto sm:hyphens-none `}
                lang="en"
            >
                {tile.text}
            </p>
        </div>
    );
}
