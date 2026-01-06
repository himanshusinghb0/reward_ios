"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Milestone Celebration Component
 * Shows celebration animation when user reaches a new milestone
 */
export const MilestoneCelebration = ({ milestones = [], onClose }) => {
    const [visibleMilestones, setVisibleMilestones] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (milestones && milestones.length > 0) {
            setVisibleMilestones(milestones);
            setCurrentIndex(0);

            // Auto-close after showing all milestones
            const timer = setTimeout(() => {
                onClose?.();
            }, milestones.length * 3000); // 3 seconds per milestone

            return () => clearTimeout(timer);
        }
    }, [milestones, onClose]);

    if (!visibleMilestones || visibleMilestones.length === 0) {
        return null;
    }

    const currentMilestone = visibleMilestones[currentIndex];

    return (
        <AnimatePresence>
            {currentMilestone && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    onClick={() => {
                        if (currentIndex < visibleMilestones.length - 1) {
                            setCurrentIndex(currentIndex + 1);
                        } else {
                            onClose?.();
                        }
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 max-w-sm mx-4 text-center"
                    >
                        {/* Confetti/Sparkles */}
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    y: [0, -50, 0],
                                    opacity: [1, 0, 1],
                                    scale: [1, 0.5, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                }}
                            />
                        ))}

                        {/* Milestone Icon */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: 3,
                            }}
                            className="text-6xl mb-4"
                        >
                            🎉
                        </motion.div>

                        {/* Milestone Title */}
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-white text-2xl font-bold mb-2"
                        >
                            Milestone Reached!
                        </motion.h2>

                        {/* Milestone Description */}
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/90 text-lg mb-4"
                        >
                            {currentMilestone.description || `${currentMilestone.stepMilestone} Steps`}
                        </motion.p>

                        {/* XP Reward */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="bg-yellow-400/20 border-2 border-yellow-400 rounded-xl p-4 mb-4"
                        >
                            <p className="text-yellow-300 text-sm mb-1">You earned</p>
                            <p className="text-yellow-400 text-4xl font-bold">
                                +{currentMilestone.xpReward} XP
                            </p>
                        </motion.div>

                        {/* Progress Indicator */}
                        {visibleMilestones.length > 1 && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-white/70 text-sm"
                            >
                                {currentIndex + 1} of {visibleMilestones.length} milestones
                            </motion.p>
                        )}

                        {/* Tap to continue */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-white/60 text-xs mt-4"
                        >
                            Tap to {currentIndex < visibleMilestones.length - 1 ? "continue" : "close"}
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


