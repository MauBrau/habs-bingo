"use client";
import React, { useEffect, useState } from "react";

export default function ClientDateDisplay({ isoString }: { isoString: string }) {
    const [dateString, setDateString] = useState<string>("");

    useEffect(() => {
        if (isoString) {
            const date = new Date(isoString);
            setDateString(date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short'
            }));
        }
    }, [isoString]);

    if (!dateString) return null;

    return (
        <p className="text-center text-xs text-(--outline) mt-2 pb-4 font-mono">
           Line-up last updated: {dateString}
        </p>
    );
}
