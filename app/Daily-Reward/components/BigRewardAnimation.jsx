"use client";

import React, { useState, useEffect } from "react";

export const BigRewardAnimation = ({ isEligible, onAnimationComplete }) => {
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        if (isEligible) {
            setShowAnimation(true);
            const timer = setTimeout(() => {
                setShowAnimation(false);
                onAnimationComplete?.();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isEligible, onAnimationComplete]);

    if (!showAnimation) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <div className="text-4xl mb-2 text-yellow-400 font-bold animate-pulse">
                    BIG REWARD UNLOCKED!
                </div>
                <div className="text-xl text-white">
                    Perfect 7-day streak achieved!
                </div>
                <div className="text-2xl mt-4 text-yellow-300">
                    🏆 GOLDEN TREASURE CHEST 🏆
                </div>
            </div>
        </div>
    );
};
