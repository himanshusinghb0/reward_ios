"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HomeIndicator } from "@/components/HomeIndicator";

export default function GameTipsDetailsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameTitle = searchParams.get('title') || "Game Tips";
    const gameImage = searchParams.get('image') || "https://c.animaapp.com/yIOjwo2q/img/frame-1000005235.svg";
    const gameCategory = searchParams.get('category') || 'Casual';

    const handleBack = () => {
        router.back();
    };

    // Game tips sections data - broken into individual tip cards matching Figma design
    const gameTips = [
        {
            id: 1,
            title: "Getting Started",
            content: "Fortnite is a fast-paced action game where survival and strategy matter. If you're new, begin by exploring the Creative Mode to get familiar with movement, weapons, and building mechanics."
        },
        {
            id: 2,
            title: "Pro Strategy: Build Like a Champ",
            content: "Master the art of building and strategy. Learn advanced techniques that will give you a competitive edge and help you climb the leaderboards faster. Practice building structures quickly in Creative Mode to improve your speed."
        },
        {
            id: 3,
            title: "XP & Leveling Tips",
            content: "Complete daily challenges and missions to maximize your XP gains. Focus on completing quests that offer the highest XP rewards to level up faster."
        },
        {
            id: 4,
            title: "Smart Landing: Better Start",
            content: "Choose your landing spot wisely at the beginning of each match. Avoid crowded areas if you're still learning, or land in popular spots if you want immediate action and faster skill development."
        },
        {
            id: 5,
            title: "Play Mindfully",
            content: "Take breaks between matches to maintain focus and performance. Playing while tired can hurt your gameplay. Stay hydrated and stretch regularly during long gaming sessions."
        }
    ];

    return (
        <div className="flex flex-col overflow-x-hidden w-full min-h-screen items-center justify-center px-4 pb-[150px] pt-1 bg-black max-w-[390px] mx-auto">
            {/* App Version */}
            <div className="absolute top-[8px] left-5 font-normal text-white text-[10px] leading-3 z-10">
                App Version: V0.0.1
            </div>

            {/* Header */}
            <div className="flex w-full items-center gap-6 px-2 py-4 relative mt-[40px]">
                <button
                    onClick={handleBack}
                    className="flex justify-center items-center w-8 h-8 rounded-full transition-colors hover:bg-gray-800"
                    aria-label="Go back"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex items-center">
                    <h1 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[20px] tracking-[0] leading-[normal]">
                        Game Tips & Tricks
                    </h1>
                </div>

                <div className="w-8 h-8" /> {/* Spacer for centering */}
            </div>

            {/* Game Banner Image - Same color spread as game details page */}
            <div className="flex w-[335px] items-center justify-center relative mt-4">
                <img
                    className="w-[335px] h-[164px] object-cover rounded-lg shadow-[0_14px_50px_-2px_rgba(113,106,231,0.5)]"
                    alt={`${gameTitle} Tips Banner`}
                    src={gameImage}
                    loading="eager"
                    onError={(e) => {
                        e.target.src = "https://c.animaapp.com/yIOjwo2q/img/frame-1000005235.svg";
                    }}
                />
            </div>

            {/* Game Info - Same as game details page */}
            <div className="flex flex-col w-[375px] items-start justify-center mt-3 px-6 py-2 relative">
                <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[20px]">
                    {gameTitle}
                </h2>
                <span className="[font-family:'Poppins',Helvetica] font-regular text-[#f4f3fc]  text-[13px]">
                    ( {gameCategory} )
                </span>
            </div>

            {/* Tips Cards - Individual cards with color spread like transaction UI */}
            <div className="flex flex-col w-[375px] items-start gap-4 mt-6 px-6">
                {gameTips.map((tip, index) => (
                    <article
                        key={tip.id}
                        className="relative w-full bg-[#1a1a1a] rounded-lg p-5 shadow-[0_0_10px_6px_rgba(255,255,255,0.15)]"
                    >
                        {/* Pushpin Icon - Top Right */}
                        <div className="absolute top-4 right-4 text-xl">
                            📌
                        </div>

                        {/* Title */}
                        <h3 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[16px] tracking-[0] leading-[normal] pr-10 mb-3">
                            {tip.title}
                        </h3>

                        {/* Description */}
                        <p className="[font-family:'Poppins',Helvetica] font-regular text-white text-[14px] tracking-[0] leading-6">
                            {tip.content}
                        </p>
                    </article>
                ))}
            </div>

            {/* Footer Button */}
            <div className="flex w-full items-center justify-center mt-8 px-6">
                <button
                    onClick={() => router.push('/DownloadGame')}
                    className="w-full h-[50px] bg-[linear-gradient(180deg,rgba(157,173,247,1)_0%,rgba(113,106,231,1)_100%)] rounded-lg [font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal] hover:opacity-90 transition-opacity"
                >
                    Explore More Games
                </button>
            </div>

            <HomeIndicator activeTab="home" />
        </div>
    );
}

