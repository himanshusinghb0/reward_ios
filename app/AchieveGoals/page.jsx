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
        <div className="flex flex-col overflow-x-hidden w-full h-full gap-4 items-center justify-center px-4 pb-3 pt-1 bg-black max-w-[390px] mx-auto relative">
            <Header />
            <GoalProgressSection />
            <TaskListSection />
            <BannerSection />
            <section className="mb-5  ">
                <div className="w-full max-w-[335px] sm:max-w-[375px] mx-auto">
                    <div className="w-full p-4 sm:p-6 rounded-lg bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.1)_50%,rgba(0,0,0,0.9)_100%)] shadow-lg border border-white/20">
                        <div className="flex flex-col justify-start gap-2">
                            <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-[#f4f3fc] text-[14px] sm:text-[14px] ">
                                Disclaimer
                            </h2>
                            <p className="[font-family:'Poppins',Helvetica] font-light text-[#FFFFFF] text-[13px] sm:text-base text-start leading-5 sm:leading-6">
                                Jackson Coins and XP Points are loyalty rewards for in-app activity.These do not represent real currency or offer cash value. 
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}