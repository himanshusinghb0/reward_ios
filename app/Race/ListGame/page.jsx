"use client";
import React from "react";
import { ListGame } from "../components/ListGame";

export default function ListGamePage() {
    return (
        <div className="flex flex-col w-full min-h-screen bg-black">
            <ListGame />
        </div>
    );
}
