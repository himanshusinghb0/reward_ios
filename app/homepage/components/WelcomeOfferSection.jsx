"use client";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { WelcomeOffer } from "../../../components/WelcomeOffer";
import { QuestCard } from "../../../components/QuestCard";

const WelcomeOfferSection = () => {
    // OPTIMIZED: Memoize selector to prevent unnecessary re-renders
    const inProgressGames = useSelector((state) => state.games.inProgressGames);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const containerRef = useRef(null);

    // OPTIMIZED: Memoize expensive calculations
    const gameData = useMemo(() => {
        const hasDownloadedGames = inProgressGames && inProgressGames.length > 0;
        const allGames = hasDownloadedGames ? inProgressGames : [];

        return {
            hasDownloadedGames,
            allGames
        };
    }, [inProgressGames]);

    // Handle touch events for swipe functionality
    const handleTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && currentCardIndex < gameData.allGames.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        }
        if (isRightSwipe && currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
        }
    };

    // Reset card index when games change
    useEffect(() => {
        setCurrentCardIndex(0);
    }, [gameData.allGames.length]);

    return (
        <div className="flex flex-col items-start gap-4 relative w-full">
            <div className="flex w-full items-center ml-[5.5px] justify-between ">
                <p className="text-[#F4F3FC] [font-family:'Poppins',Helvetica] font-semibold text-[19px] tracking-[0] leading-[normal] text-nowrap ">
                    💸💸Fast Fun, Real Rewards!💸💸
                </p>
            </div>

            {/* Conditional Rendering with Swipeable Cards */}
            <div className="relative w-full overflow-visible">
                {gameData.hasDownloadedGames ? (
                    <div className="relative">
                        {/* Swipeable Quest Cards */}
                        <div
                            ref={containerRef}
                            className="relative w-full flex items-center justify-center"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <QuestCard game={gameData.allGames[currentCardIndex]} />
                        </div>

                        {/* Card Navigation Indicators */}
                        {gameData.allGames.length > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-4">
                                <button
                                    onClick={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentCardIndex === 0}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${currentCardIndex === 0
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                >
                                    ← Prev
                                </button>

                                {/* Dots indicator */}
                                <div className="flex gap-1">
                                    {gameData.allGames.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentCardIndex(index)}
                                            className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentCardIndex
                                                ? 'bg-purple-500 scale-125'
                                                : 'bg-gray-400 hover:bg-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentCardIndex(prev => Math.min(gameData.allGames.length - 1, prev + 1))}
                                    disabled={currentCardIndex === gameData.allGames.length - 1}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${currentCardIndex === gameData.allGames.length - 1
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                >
                                    Next →
                                </button>
                            </div>
                        )}

                        {/* Card Counter */}
                        {gameData.allGames.length > 1 && (
                            <div className="text-center mt-2">
                                <span className="text-sm text-gray-400 [font-family:'Poppins',Helvetica]">
                                    {currentCardIndex + 1} of {gameData.allGames.length} games
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <WelcomeOffer />
                )}
            </div>
        </div>
    );
};

export default WelcomeOfferSection;
