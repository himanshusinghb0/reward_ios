"use client";
import React, { useState, useMemo, useCallback, useRef } from "react";
import { XPPointsModal } from "../../../components/XPPointsModal";
import { useWalletUpdates } from "@/hooks/useWalletUpdates";

const XPTierTracker = ({ stats, token }) => {
    const [isXPModalOpen, setIsXPModalOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const buttonRef = useRef(null);
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

    // OPTIMIZED: Memoize event handler with smooth animation
    const handleModalOpen = useCallback(() => {
        setIsXPModalOpen(true);
        // Small delay to ensure DOM is updated before animation starts
        setTimeout(() => {
            setIsAnimating(true);
        }, 100);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsAnimating(false);
        // Delay closing to allow animation to complete
        setTimeout(() => {
            setIsXPModalOpen(false);
        }, 500);
    }, []);

    // Handle click outside to close modal
    const handleClickOutside = useCallback((e) => {
        if (isXPModalOpen && !e.target.closest('.xp-modal-content')) {
            handleModalClose();
        }
    }, [isXPModalOpen, handleModalClose]);

    return (
        <div
            className="flex flex-col items-center relative"
            data-model-id="4001:7762"
            onClick={handleClickOutside}
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
                        <div
                            className="absolute w-6 h-6 top-0 bg-white rounded-full border-5 border-[#FFD700]"
                            style={{ left: "280px" }}
                        />

                        {/* Current progress indicator */}
                        <div
                            className="absolute w-6 h-6 top-0 bg-white rounded-full border-5 border-[#FFD700]"
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
                    ref={buttonRef}
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

            {/* Custom Dropdown Modal */}
            {isXPModalOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-[-96px]">
                    <div
                        className={`xp-modal-content w-[335px] mx-auto bg-black rounded-[20px] border border-solid border-[#ffffff80] bg-[linear-gradient(0deg,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_100%)] overflow-hidden transform transition-all duration-500 ease-out ${isAnimating
                            ? 'translate-y-0 opacity-100 scale-100'
                            : 'translate-y-[-30px] opacity-0 scale-95'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Content */}
                        <div className="relative p-6">
                            {/* Decorative Stars */}
                            <img
                                className="absolute w-[19px] h-[19px] top-[44px] left-[248px] pointer-events-none"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-2.svg"
                                aria-hidden="true"
                            />
                            <img
                                className="absolute w-[19px] h-[19px] top-[125px] left-[12px] pointer-events-none"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-2.svg"
                                aria-hidden="true"
                            />
                            <img
                                className="absolute w-[19px] h-[19px] top-[219px] left-[213px] pointer-events-none"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-2.svg"
                                aria-hidden="true"
                            />
                            <img
                                className="absolute w-[19px] h-[19px] top-[54px] left-[16px] pointer-events-none"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-5.svg"
                                aria-hidden="true"
                            />
                            <img
                                className="absolute w-[19px] h-[19px] top-[104px] left-[312px] pointer-events-none"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-7.svg"
                                aria-hidden="true"
                            />
                            <img
                                className="absolute w-[19px] h-[19px] top-[33px] left-[79px] pointer-events-none"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-8.svg"
                                aria-hidden="true"
                            />

                            {/* Additional decorative elements */}
                            <img
                                className="absolute w-3 h-[13px] top-[214px] left-[271px] pointer-events-none"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-4.svg"
                                aria-hidden="true"
                            />
                            <img
                                className="absolute w-3 h-[13px] top-[214px] left-[13px] pointer-events-none"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-5.svg"
                                aria-hidden="true"
                            />

                            {/* Close Button */}
                            <button
                                className="absolute w-[31px] h-[31px] top-6 right-6 cursor-pointer hover:opacity-80 transition-opacity z-10"
                                aria-label="Close dialog"
                                type="button"
                                onClick={handleModalClose}
                            >
                                <img alt="Close" src="https://c.animaapp.com/rTwEmiCB/img/close.svg" />
                            </button>

                            {/* Main Logo */}
                            <div className="flex justify-center mb-4 mt-2">
                                <img
                                    className="w-[125px] h-[108px]"
                                    alt="XP Points Logo"
                                    src="https://c.animaapp.com/rTwEmiCB/img/pic.svg"
                                />
                            </div>

                            {/* Header Section */}
                            <header className="flex flex-col items-center mb-6">
                                <div className="flex items-center ml-4 gap-2">
                                    <h1
                                        className="text-white [font-family:'Poppins',Helvetica] font-bold text-[32px] tracking-[0] leading-8 whitespace-nowrap"
                                    >
                                        XP Points
                                    </h1>
                                    <img
                                        className="w-[19px] h-[19px]"
                                        alt=""
                                        src="https://c.animaapp.com/rTwEmiCB/img/vector-8.svg"
                                        aria-hidden="true"
                                    />
                                </div>
                            </header>

                            {/* Description */}
                            <div className="mb-8">
                                <p className="w-full [font-family:'Poppins',Helvetica] font-light text-white text-sm text-center tracking-[0] leading-5 px-4">
                                    Play more, level up, and multiply your rewards with XP Points.
                                </p>
                            </div>

                            {/* Levels Section */}
                            <section className="flex flex-col w-full items-start gap-3 mb-8">
                                <div className="flex items-center justify-around gap-2.5 pt-0 pb-3 px-0 w-full border-b [border-bottom-style:solid] border-[#383838]">
                                    <h2 className="flex-1 [font-family:'Poppins',Helvetica] font-semibold text-white text-sm text-center tracking-[0] leading-5">
                                        Levels
                                    </h2>
                                </div>

                                <div className="flex items-start justify-between w-full">
                                    {[
                                        { name: "Junior", reward: "Reward:", width: "98px" },
                                        { name: "Mid-level", reward: "1.2x", width: "61px" },
                                        { name: "Senior", reward: "1.5x", width: "66px" }
                                    ].map((level, index) => (
                                        <div key={index} className="inline-flex flex-col items-start gap-1">
                                            <div className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[15px] tracking-[0] leading-[normal]">
                                                {level.name}
                                            </div>
                                            <div className="flex items-center">
                                                <div
                                                    className="h-[28.52px] rounded-[19.01px] bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-between px-2"
                                                    style={{ width: level.width }}
                                                >
                                                    <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-[15.6px] tracking-[0] leading-[16.9px] whitespace-nowrap">
                                                        {level.reward}
                                                    </div>
                                                    <img
                                                        className="w-[18px] h-[19px] aspect-[0.97] flex-shrink-0"
                                                        alt=""
                                                        src={`https://c.animaapp.com/rTwEmiCB/img/image-3937-${index + 3}@2x.png`}
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Example Section */}
                            <section className="flex flex-col w-full items-start gap-3">
                                <div className="flex items-center gap-2.5 pt-0 pb-3 px-0 w-full border-b [border-bottom-style:solid] border-[#383838]">
                                    <h2 className="flex-1 [font-family:'Poppins',Helvetica] font-semibold text-white text-sm text-center tracking-[0] leading-5">
                                        Example
                                    </h2>
                                </div>

                                <p className="w-full [font-family:'Poppins',Helvetica] font-light text-white text-sm text-center tracking-[0] leading-5 mb-4">
                                    If you&apos;re playing game say &quot;Fortnite&quot; &amp; the task is
                                    complete 5 levels of the game. Here&apos;s how XP Points benefits you
                                </p>

                                <div className="flex items-start justify-between w-full">
                                    {[
                                        { name: "Junior", points: "5", width: "49px" },
                                        { name: "Mid-level", points: "8", width: "90px" },
                                        { name: "Senior", points: "10", width: "54px" },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-start gap-1"
                                            style={{ width: item.width }}
                                        >
                                            <div className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[15px] tracking-[0] leading-[normal]">
                                                {item.name}
                                            </div>
                                            <div className="flex items-center">
                                                <div
                                                    className="h-7 rounded-[18.64px] bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-center px-1.5"
                                                    style={{ width: item.width }}
                                                >
                                                    <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-[15.3px] tracking-[0] leading-[16.5px] flex items-center gap-[4px] whitespace-nowrap">
                                                        <span>{item.points}</span>
                                                        <img
                                                            className="w-[16px] h-[16px] mb-1 object-contain"
                                                            alt=""
                                                            src="/dollor.png"
                                                            aria-hidden="true"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default XPTierTracker;
