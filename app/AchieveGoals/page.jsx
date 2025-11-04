"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { GoalProgressSection } from "./components/GoalProgressSection";
import { TaskListSection } from "./components/TaskListSection";
import { BannerSection } from "./components/BannerSection";
import { HomeIndicator } from "@/components/HomeIndicator";
import { Header } from "./components/Header";


export default function AchieveGoalsPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col w-full h-full  items-center gap-3 px-4 pt-1 bg-black text-white">
            <Header />
            <GoalProgressSection />
            <TaskListSection />
            <BannerSection />

        </div>
    );
}