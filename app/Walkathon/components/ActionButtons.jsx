"use client";
import React from "react";
import { motion } from "framer-motion";

/**
 * Action Buttons Component
 * Displays Join Now or Claim Reward buttons based on user status
 */
export const ActionButtons = ({
    isJoined = false,
    hasAvailableRewards = false,
    availableRewards = [],
    onJoin,
    onClaimAll,
    isJoining = false,
    isClaiming = false,
    nextMilestone = null,
    totalSteps = 0,
}) => {
    // Debug logging helper
    const logAction = (label, data) => {
        console.log(`[🔘 ACTION] ${label}`, data);
    };
    const getButtonText = () => {
        if (!isJoined) {
            return "Join Now";
        }
        if (hasAvailableRewards && availableRewards.length > 0) {
            const totalXP = availableRewards.reduce(
                (sum, reward) => sum + (reward.xpReward || 0),
                0
            );
            return `Claim ${availableRewards.length} Reward${availableRewards.length > 1 ? "s" : ""} (+${totalXP} XP)`;
        }
        if (nextMilestone) {
            const stepsNeeded = nextMilestone.stepMilestone - totalSteps;
            return `${stepsNeeded.toLocaleString()} steps to next milestone`;
        }
        return "Keep Walking!";
    };

    const handleClick = () => {
        if (!isJoined) {
            logAction("Join Button Clicked", { timestamp: new Date().toISOString() });
            onJoin?.();
        } else if (hasAvailableRewards && availableRewards.length > 0) {
            logAction("Claim All Button Clicked", {
                availableRewardsCount: availableRewards.length,
                totalXP: availableRewards.reduce((sum, r) => sum + (r.xpReward || 0), 0),
                timestamp: new Date().toISOString()
            });
            onClaimAll?.();
        }
    };

    const isButtonActive =
        !isJoined || (hasAvailableRewards && availableRewards.length > 0);

    return (
        <div className="w-full px-4 space-y-3">
            {/* Main Action Button */}
            <motion.button
                whileHover={isButtonActive ? { scale: 1.02 } : {}}
                whileTap={isButtonActive ? { scale: 0.98 } : {}}
                onClick={handleClick}
                disabled={!isButtonActive || isJoining || isClaiming}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isButtonActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    } ${isJoining || isClaiming ? "opacity-50 cursor-wait" : ""}`}
            >
                {isJoining ? (
                    <span className="flex items-center justify-center gap-2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Joining...
                    </span>
                ) : isClaiming ? (
                    <span className="flex items-center justify-center gap-2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Claiming Rewards...
                    </span>
                ) : (
                    getButtonText()
                )}
            </motion.button>

            {/* Progress Info */}
            {isJoined && nextMilestone && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-3"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Next Milestone:</span>
                        <span className="text-white font-semibold">
                            {nextMilestone.stepMilestone.toLocaleString()} steps
                        </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-400 text-sm">Reward:</span>
                        <span className="text-yellow-400 font-semibold">
                            +{nextMilestone.xpReward} XP
                        </span>
                    </div>
                </motion.div>
            )}
        </div>
    );
};


