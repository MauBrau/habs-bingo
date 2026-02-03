"use client";
import React, { useState } from "react";

interface TileProps {
    text: string;
}

export default function BingoTile({ text }: TileProps) {
    const [isChecked, setIsChecked] = useState<Boolean>(false);

    const handleClick = () => {
        setIsChecked((prevState) => !prevState);
    };
    return (
        <div
            className={`group
                ${isChecked ? "bg-habs-red" : "hover:bg-habs-blue"} 
                select-none cursor-pointer place-content-center
                outline-5 outline-solid`}
            onClick={handleClick}
        >
            <p
                className={`${isChecked ? 'text-gray-100' : 'text-gray-500'} text-center group-hover:text-gray-100`}
            >
                {text}
            </p>
        </div>
    );
}
