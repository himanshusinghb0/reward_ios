"use client";
import React, { useState, useMemo, useCallback } from "react";
import { XPPointsModal } from "../../../components/XPPointsModal";
import { useWalletUpdates } from "@/hooks/useWalletUpdates";

const XPTierTracker = ({ stats, token }) => {
    const [isXPModalOpen, setIsXPModalOpen] = useState(false);
    const { realTimeXP } = useWalletUpdates(token);
    const xpCurrent = realTimeXP;

    // OPTIMIZED: Memoize tier goals and calculations
    const tierGoals = useMemo(() => ({ junior: 0, mid: 5000, senior: 10000 }), []);

    const progressData = useMemo(() => {
        console.log("🔍 [XPTierTracker] Stats:", stats);
        const currentXp = stats?.currentXP ?? 2592;
        const totalXpGoal = tierGoals.senior;
        const progressPercentage = Math.min((currentXp / totalXpGoal) * 100, 100);

        return {
            title: "You're off to a great start!",
            currentXP: currentXp,
            totalXP: totalXpGoal,
            levels: ["Junior", "Mid-level", "Senior"],
            progressPercentage: progressPercentage,
        };
    }, [stats?.currentXP, tierGoals]);

    // OPTIMIZED: Memoize event handler
    const handleModalOpen = useCallback(() => {
        setIsXPModalOpen(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsXPModalOpen(false);
    }, []);

    return (
        <div
            className="flex flex-col items-center relative"
            data-model-id="4001:7762"
        >
            <section className="relative w-[335px] h-[155px] bg-black rounded-[10px] border border-solid border-neutral-700">
                <div className="absolute w-[304px] h-6 top-[84px] left-3.5">
                    <div className="relative w-full h-6">
                        {/* Progress bar background */}
                        <div className="absolute w-full h-[19px] top-0.5 left-0 bg-[#373737] rounded-[32px] border-4 border-solid border-[#ffffff33]" />

                        {/* Progress bar fill */}
                        <div
                            className="absolute h-[11px] top-1.5 left-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-[32px]"
                            style={{
                                width: `${Math.min((progressData.progressPercentage / 100) * 288, 288)}px`,
                            }}
                        />

                        {/* Current progress indicator */}
                        <div
                            className="absolute w-6 h-6 top-0 bg-white rounded-full border-2 border-[#FFD700]"
                            style={{
                                left: `${Math.min((progressData.progressPercentage / 100) * 278, 278)}px`,
                            }}
                        />

                    </div>
                </div>

                <h2 className="absolute w-[210px] h-6 top-4 left-[62px] [font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-6">
                    {progressData.title}
                </h2>

                <button
                    className="absolute w-10 h-8 top-[15px] left-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleModalOpen}
                    aria-label="Open XP Points information"
                >
                    <img
                        className="w-full h-full"
                        alt="XP icon"
                        src="https://c.animaapp.com/mHRmJGe1/img/pic.svg"
                    />
                </button>

                <div className="absolute w-[153px] h-[21px] top-[113px] left-[18px] flex items-center">
                    <div className="font-medium text-[#d2d2d2] leading-[normal] [font-family:'Poppins',Helvetica] text-sm tracking-[0]">
                        {xpCurrent}
                    </div>

                    <img
                        className="w-5 h-[18px] mx-1"
                        alt="XP points icon"
                        src="https://c.animaapp.com/mHRmJGe1/img/pic-1.svg"
                    />

                    <div className="font-medium text-[#dddddd] leading-[normal] [font-family:'Poppins',Helvetica] text-sm tracking-[0]">
                        out of {progressData.totalXP.toLocaleString()}
                    </div>
                </div>

                <nav className="absolute w-[303px] h-[15px] top-[63px] left-4">
                    {progressData.levels.map((level, index) => (
                        <div
                            key={level}
                            className={`h-3.5 font-light text-[#FFFFFF] leading-[14px] whitespace-nowrap absolute -top-px [font-family:'Poppins',Helvetica] text-[13px] tracking-[0] ${index === 0
                                ? "left-0"
                                : index === 1
                                    ? "left-[114px]"
                                    : "left-[259px]"
                                }`}
                        >
                            {level}
                        </div>
                    ))}
                </nav>
            </section>

            <XPPointsModal
                isOpen={isXPModalOpen}
                onClose={handleModalClose}
            />
        </div>
    );
};

export default XPTierTracker;
