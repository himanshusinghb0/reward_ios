"use client";
import React from "react";
import { ListGame } from "../components/ListGame";

export default function ListGamePage() {
    return (
        <div className="flex justify-center w-full">
            <div className="relative w-full max-w-md min-h-screen bg-black mx-auto">
                <ListGame />
            </div>
        </div>
    );
}
