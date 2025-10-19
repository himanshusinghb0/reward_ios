"use client";
import React, { useEffect, useRef, useState } from "react";
import { getDailyActivityStats } from "@/lib/api";

/**
 * ProgressSection Component
 * 
 * Displays the vertical scrollable streak tree with:
 * - 30 day ladder numbered 1-30 from bottom to top
 * - Visual progress indicators based on API data
 * - Completed day checkmarks
 * - Milestone reward badges
 * - Path decoration images
 * - Uses daily activity stats API to track user activity streak
 * 
 * @param {object} streakData - Complete streak data from API
 * @param {array} streakHistory - Streak history data
 * @param {array} leaderboard - Leaderboard data
 * @param {function} onRefresh - Refresh handler 
 */
export const ProgressSection = ({
    streakData = null,
    streakHistory = [],
    leaderboard = [],
    onRefresh = () => { }
}) => {
    const scrollContainerRef = useRef(null);
    const [activityStats, setActivityStats] = useState(null);
    const [activityLoading, setActivityLoading] = useState(false);

    // Extract data from API response - prioritize activity stats if available
    const currentStreak = activityStats?.currentStreak !== undefined ? activityStats.currentStreak : (streakData?.currentStreak || 0);
    const streakTree = streakData?.streakTree || [];
    const rewards = streakData?.rewards || [];
    const progress = streakData?.progress || { current: 0, target: 7, percentage: 0 };


    // Check if day is completed using API data
    const isDayCompleted = (day) => {
        const dayData = streakTree.find(d => d.day === day);
        return dayData?.isCompleted || false;
    };

    // Check if day is current day
    const isCurrentDay = (day) => {
        const dayData = streakTree.find(d => d.day === day);
        return dayData?.isCurrent || false;
    };

    // Get the next day to start (when currentStreak is 0)
    const getNextDayToStart = () => {
        if (currentStreak === 0) {
            return 1; // Start from day 1
        }
        return currentStreak + 1; // Next day after current streak
    };

    // Check if day is milestone
    const isMilestoneDay = (day) => {
        const dayData = streakTree.find(d => d.day === day);
        return dayData?.isMilestone || false;
    };

    // Get reward for milestone day
    const getMilestoneReward = (day) => {
        const dayData = streakTree.find(d => d.day === day);
        return dayData?.reward || null;
    };

    // Check if day should show chest box (special milestone days)
    const shouldShowChestBox = (day) => {
        return [7, 14, 21, 28].includes(day);
    };

    // Get the appropriate icon for each day
    const getDayIcon = (day) => {
        if (shouldShowChestBox(day)) {
            return {
                type: 'chest',
                src: 'https://c.animaapp.com/b23YVSTi/img/2211-w030-n003-510b-p1-510--converted--02-2@2x.png', // Using the actual treasure chest from ChallengeGroupSection
                alt: 'Treasure Chest'
            };
        } else {
            return {
                type: 'leaf',
                src: 'https://c.animaapp.com/1RFP1hGC/img/image-4016@2x.png', // Using the actual leaf icon from decorative images
                alt: 'Leaf with Tick'
            };
        }
    };

    // Generate all 30 days with proper spacing (50px between each day)
    const generateDays = () => {
        const days = [];
        const startTop = 50; // Start position from top - moved up
        const spacing = 50; // Space between days

        for (let i = 0; i < 30; i++) {
            const day = i + 1;
            // Reverse the order: Day 1 at bottom, Day 30 at top
            const top = startTop + ((29 - i) * spacing);

            days.push({
                day: day,
                top: top,
                left: 140, // Centered for mobile
                isCompleted: isDayCompleted(day),
                isCurrent: isCurrentDay(day),
                isMilestone: isMilestoneDay(day),
                reward: getMilestoneReward(day)
            });
        }
        return days;
    };

    const allDays = generateDays();

    // Fetch daily activity stats on component mount
    useEffect(() => {
        const fetchActivityStats = async () => {
            try {
                setActivityLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) return;

                const response = await getDailyActivityStats(token);
                if (response && response.success) {
                    setActivityStats(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch daily activity stats:', error);
            } finally {
                setActivityLoading(false);
            }
        };

        fetchActivityStats();
    }, []);

    // Auto-scroll to current day when data loads
    useEffect(() => {
        if (scrollContainerRef.current) {
            if (currentStreak > 0) {
                // Scroll to show current day in the middle of the viewport
                const scrollTo = Math.max(0, (currentStreak - 1) * 50 - 200);
                scrollContainerRef.current.scrollTo({
                    top: scrollTo,
                    behavior: 'smooth'
                });
            } else {
                // When currentStreak is 0, scroll to day 1 (start)
                scrollContainerRef.current.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentStreak]);

    // Decorative images removed - only small icons next to each day number will be shown

    // Path images (vines) - positioned for seamless 30 days ladder
    const pathImages = [
        { src: "https://c.animaapp.com/1RFP1hGC/img/image-3995@2x.png", top: 49, left: 68, width: 118, height: 350 },
        { src: "https://c.animaapp.com/1RFP1hGC/img/image-4010@2x.png", top: 349, left: 73, width: 110, height: 300 },
        { src: "https://c.animaapp.com/1RFP1hGC/img/image-4010@2x.png", top: 599, left: 73, width: 110, height: 300 },
        { src: "https://c.animaapp.com/1RFP1hGC/img/image-4014@2x.png", top: 849, left: 73, width: 110, height: 250 },
        { src: "https://c.animaapp.com/1RFP1hGC/img/image-4010@2x.png", top: 1049, left: 73, width: 110, height: 300 },
        { src: "https://c.animaapp.com/1RFP1hGC/img/image-4014@2x.png", top: 1299, left: 74, width: 110, height: 250 },
        { src: "https://c.animaapp.com/1RFP1hGC/img/image-4018@2x.png", top: 1499, left: 73, width: 110, height: 200 },
        // Added more path images for seamless connection
    ];

    return (
        <section
            ref={scrollContainerRef}
            className="w-full max-w-[375px] scrollbar-hide"
            aria-label="Progress tracker"
        >
            <div className="w-full min-h-[1300px] flex justify-center relative px-4 pt-0 ladder-3d">
                {/* Loading State */}
                {(!streakData || activityLoading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}

                {/* No Data State */}
                {streakData && streakTree.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white bg-black/50 rounded-lg p-6">
                            <div className="text-4xl mb-4">🌱</div>
                            <div className="text-lg font-semibold mb-2">Start Your Streak Journey!</div>
                            <div className="text-sm text-gray-300 mb-4">Complete daily challenges to build your streak</div>
                            <button
                                onClick={onRefresh}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                            >
                                🔄 Refresh
                            </button>
                        </div>
                    </div>
                )}

                {/* Path Images (Vines) */}
                {pathImages.map((image, index) => (
                    <img
                        key={`path-${index}`}
                        className="absolute pointer-events-none"
                        style={{
                            top: `${image.top}px`,
                            left: `${image.left}px`,
                            width: `${image.width}px`,
                            height: `${image.height}px`,
                        }}
                        alt=""
                        src={image.src}
                    />
                ))}

                {/* Connecting Lines - Fill gaps between path segments */}
                <div className="absolute left-[140px] top-[100px] w-1 h-[1500px] bg-gradient-to-b from-green-600 via-green-500 to-green-400 opacity-60 z-5"></div>

                {/* Decorative Images Removed - Only small icons next to day numbers are shown */}

                {/* All 30 Days - Generated from API data */}
                {allDays.map((dayData) => (
                    <div key={dayData.day}>
                        {/* Day Circle - Dynamic Yellow Background with Green Border */}
                        <div
                            className={`absolute w-[36px] h-[36px] rounded-full z-20 flex items-center justify-center transform transition-all duration-300 ease-out hover:scale-110 day-circle-3d cursor-pointer bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 shadow-[0_8px_16px_rgba(251,191,36,0.4),0_4px_8px_rgba(245,158,11,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)] border-2 border-green-500 hover:shadow-[0_12px_24px_rgba(251,191,36,0.6),0_6px_12px_rgba(245,158,11,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)]`}
                            style={{
                                top: `${dayData.top - 10}px`, // Shifted 5px up
                                left: `${dayData.left - 20}px`, // Shifted 18px to the left
                                animation: dayData.isCurrent ? 'float 3s ease-in-out infinite' : dayData.isCompleted ? 'float 4s ease-in-out infinite' : 'none'
                            }}
                        >
                            <div className="w-7 h-7 flex items-center justify-center [-webkit-text-stroke:1px_#1a1a1a] [font-family:'Passion_One',Helvetica] text-xl tracking-[0] leading-none font-bold text-black z-30 drop-shadow-lg">
                                {dayData.day}
                            </div>
                        </div>


                        {/* Milestone Reward Badge - Only show for completed milestone days */}
                        {dayData.isMilestone && dayData.reward && dayData.isCompleted && (
                            <div
                                className="absolute flex items-center gap-2 bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 rounded-full px-5 py-3 shadow-[0_8px_16px_rgba(251,191,36,0.5),0_4px_8px_rgba(245,158,11,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)] z-10 border-2 border-amber-200 transform hover:scale-105 transition-all duration-300 cursor-pointer"
                                style={{
                                    top: `${dayData.top - 28}px`,
                                    left: `${dayData.left + 110}px`,
                                    animation: 'glow 3s ease-in-out infinite'
                                }}
                            >
                                <span className="text-sm font-bold text-black drop-shadow-sm">{dayData.reward.coins}</span>
                                <img className="w-5 h-5 drop-shadow-sm" alt="coin" src="https://c.animaapp.com/hVj7UvM7/img/image-3938@2x.png" />
                            </div>
                        )}

                        {/* Day Icons - Show leaves progressively based on current streak */}
                        {/* Only show leaf if day is within current streak range */}
                        {/* Uses activity stats to track user activity streak */}
                        {(dayData.day <= currentStreak) && (
                            <div
                                className="absolute flex items-center z-30"
                                style={{
                                    top: `${dayData.top - 40}px`,
                                    left: `${dayData.left + 20}px`
                                }}
                            >
                                {/* Show leaf with treasure box for milestone days (7, 14, 21, 28) */}
                                {shouldShowChestBox(dayData.day) && dayData.day <= currentStreak ? (
                                    <div className="relative">
                                        {/* Leaf background */}
                                        <img
                                            className="w-30 h-16 drop-shadow-lg"
                                            src="https://c.animaapp.com/1RFP1hGC/img/image-4016@2x.png"
                                            alt="Leaf with Treasure Box"
                                        />
                                        {/* Treasure box overlay on the leaf */}
                                        <img
                                            className="absolute top-[2px] right-1 w-24 h-12 "
                                            src="https://c.animaapp.com/b23YVSTi/img/2211-w030-n003-510b-p1-510--converted--02-2@2x.png"
                                            alt="Treasure Chest"
                                        />
                                        {/* Show reward amount for milestone days */}
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full px-2 py-1 shadow-lg">
                                            <span className="text-xs font-bold text-black">
                                                {dayData.day === 7 ? '50' : dayData.day === 14 ? '100' : dayData.day === 21 ? '150' : '250'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Regular leaf for other days within streak range */
                                    <div className="relative">
                                        <img
                                            className="w-30 h-16 drop-shadow-lg"
                                            src="https://c.animaapp.com/1RFP1hGC/img/image-4016@2x.png"
                                            alt="Leaf with Tick"
                                        />
                                        {/* Show tick mark for completed days */}
                                        {dayData.isCompleted && (
                                            <div className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-700 rounded-full shadow-[0_6px_12px_rgba(16,185,129,0.5),0_3px_6px_rgba(5,150,105,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)]">
                                                ✓
                                            </div>
                                        )}
                                        {/* Show "Next" indicator for the current day
                                        {dayData.isCurrent && !dayData.isCompleted && (
                                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full px-2 py-1 shadow-lg">
                                                <span className="text-xs font-bold text-white">Next</span>
                                            </div>
                                        )} */}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Current Day Indicator - Dynamic Positioning */}
                        {(dayData.isCurrent || (currentStreak === 0 && dayData.day === 1)) && (
                            <div
                                className="absolute flex items-center gap-2 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-full px-6 py-4 shadow-[0_8px_16px_rgba(59,130,246,0.6),0_4px_8px_rgba(37,99,235,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] z-10 border-2 border-cyan-200 transform hover:scale-105 transition-all duration-300 cursor-pointer"
                                style={{
                                    top: `${dayData.top + 50}px`,
                                    left: `${dayData.left - 60}px`,
                                    animation: 'float 3s ease-in-out infinite, bounce 2s ease-in-out infinite'
                                }}
                            >
                                <span className="text-base font-bold text-white drop-shadow-sm">
                                    {dayData.isCompleted ? 'COMPLETED' : 'START'}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4), 0 4px 8px rgba(37, 99, 235, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 12px 24px rgba(59, 130, 246, 0.6), 0 6px 12px rgba(37, 99, 235, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 8px 16px rgba(251, 191, 36, 0.5), 0 4px 8px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4);
          }
          50% {
            box-shadow: 0 12px 24px rgba(251, 191, 36, 0.7), 0 6px 12px rgba(245, 158, 11, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.5);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .ladder-3d {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        
        .day-circle-3d {
          transform-style: preserve-3d;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .day-circle-3d:hover {
          transform: translateZ(10px) rotateX(5deg) rotateY(5deg);
        }
      `}</style>
        </section>
    );
};

