"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Circular Progress Tracker Component
 * Displays steps progress in a circular dial format with character animation
 */
export const CircularProgressTracker = ({
    totalSteps = 0,
    currentLevel = 1,
    levelProgress = 0,
    levelMax = 3,
    nextMilestone = null,
    milestones = [],
    rewardsClaimed = [],
}) => {
    const [animatedSteps, setAnimatedSteps] = useState(0);
    const [progressArc, setProgressArc] = useState(0);

    // Calculate progress percentage
    const maxMilestone = milestones.length > 0
        ? Math.max(...milestones.map(m => m.stepMilestone))
        : 10000;
    const progressPercentage = Math.min((totalSteps / maxMilestone) * 100, 100);

    // Animate steps count
    useEffect(() => {
        const duration = 1;
        const start = animatedSteps;
        const end = totalSteps;
        const steps = Math.abs(end - start);
        const increment = steps / (duration * 60); // 60fps

        if (start === end) return;

        const timer = setInterval(() => {
            setAnimatedSteps((prev) => {
                const diff = end - prev;
                if (Math.abs(diff) < Math.abs(increment)) {
                    clearInterval(timer);
                    return end;
                }
                return prev + (increment > 0 ? Math.ceil(increment) : Math.floor(increment));
            });
        }, 16); // ~60fps

        return () => clearInterval(timer);
    }, [totalSteps]);

    // Animate progress arc
    useEffect(() => {
        const targetProgress = progressPercentage / 100;
        const duration = 1500; // 1.5 seconds
        const startTime = Date.now();
        const startProgress = progressArc;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            const currentProgress = startProgress + (targetProgress - startProgress) * easeOut;

            setProgressArc(currentProgress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [progressPercentage]);

    // Position milestones around the circle
    const getMilestonePosition = (milestone, index, total) => {
        const angle = (360 / total) * index - 90; // Start from top
        const radius = 140; // Distance from center
        const radian = (angle * Math.PI) / 180;
        const x = Math.cos(radian) * radius;
        const y = Math.sin(radian) * radius;
        return { x, y, angle };
    };

    // Determine which milestones to show around the circle
    const visibleMilestones = milestones.slice(0, 8); // Show max 8 milestones

    return (
        <div className="relative w-full flex items-center justify-center py-8">
            <div className="relative w-[320px] h-[320px]">
                {/* Background Circle */}
                <svg
                    className="absolute inset-0 w-full h-full transform -rotate-90"
                    viewBox="0 0 200 200"
                >
                    {/* Background track */}
                    <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#2A2A2A"
                        strokeWidth="8"
                        className="opacity-30"
                    />
                    {/* Progress arc */}
                    <motion.circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#FF6B35"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 90}
                        strokeDashoffset={2 * Math.PI * 90 * (1 - progressArc)}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progressArc }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{
                            filter: "drop-shadow(0 0 8px rgba(255, 107, 53, 0.5))",
                        }}
                    />
                </svg>

                {/* Milestone markers and numbers around circle */}
                {visibleMilestones.map((milestone, index) => {
                    const pos = getMilestonePosition(index, index, visibleMilestones.length);
                    const isReached = totalSteps >= milestone.stepMilestone;
                    const isClaimed = rewardsClaimed.includes(milestone.stepMilestone);

                    return (
                        <div
                            key={milestone.stepMilestone}
                            className="absolute"
                            style={{
                                left: `calc(50% + ${pos.x}px)`,
                                top: `calc(50% + ${pos.y}px)`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1, type: "spring" }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${isClaimed
                                    ? "bg-green-500"
                                    : isReached
                                        ? "bg-orange-500"
                                        : "bg-gray-600"
                                    }`}
                            >
                                {isClaimed && (
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-white text-xs"
                                    >
                                        ✓
                                    </motion.span>
                                )}
                            </motion.div>
                            {/* Milestone number */}
                            <div
                                className={`absolute -mt-10 text-xs font-semibold whitespace-nowrap ${isReached ? "text-orange-400" : "text-gray-500"
                                    }`}
                                style={{
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                }}
                            >
                                {milestone.stepMilestone >= 1000
                                    ? `${milestone.stepMilestone / 1000}k`
                                    : milestone.stepMilestone}
                            </div>
                        </div>
                    );
                })}

                {/* Center Character/Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Character/Mascot (animated panda or placeholder) */}
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="mb-4"
                    >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center relative overflow-hidden">
                            {/* Character placeholder - can be replaced with image */}
                            <motion.div
                                animate={{
                                    y: [0, -5, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="text-4xl"
                            >
                                🐼
                            </motion.div>
                            {/* Pulsing glow effect */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-orange-400 opacity-20"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.2, 0.4, 0.2],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Level Display */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <span className="text-white text-sm font-medium">Lvl {currentLevel}</span>
                        <span className="text-gray-400 text-sm">
                            {levelProgress}/{levelMax}
                        </span>
                        {levelProgress >= levelMax && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-green-400 text-lg"
                            >
                                ⭐
                            </motion.span>
                        )}
                    </motion.div>

                    {/* Steps Count */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="text-white text-5xl font-bold mb-1"
                    >
                        {animatedSteps.toLocaleString()}
                    </motion.div>

                    {/* Conversion Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-gray-400 text-xs"
                    >
                        {nextMilestone
                            ? `${nextMilestone.stepMilestone - totalSteps} to next milestone`
                            : "Max milestone reached!"}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

