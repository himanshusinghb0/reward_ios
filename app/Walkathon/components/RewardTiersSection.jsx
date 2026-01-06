"use client";
import React from "react";
import { motion } from "framer-motion";

/**
 * Reward Tiers Section
 * Displays milestone cards with XP rewards
 */
export const RewardTiersSection = ({
    rewardTiers = [],
    milestonesReached = [],
    rewardsClaimed = [],
    onClaimReward,
    isClaiming = false,
}) => {
    const getStatus = (tier) => {
        // Handle both array of numbers and array of objects
        const milestoneValue = tier.stepMilestone || tier.milestone || 0;
        const isReached = milestonesReached.includes(milestoneValue);

        // Check if claimed - handle both number array and object array
        const isClaimed = rewardsClaimed.some(claimed => {
            if (typeof claimed === 'number') {
                return claimed === milestoneValue;
            }
            if (typeof claimed === 'object') {
                return claimed.milestone === milestoneValue || claimed === milestoneValue;
            }
            return false;
        });

        if (isClaimed) return "claimed";
        if (isReached) return "available";
        return "locked";
    };

    return (
        <div className="w-full px-4 space-y-3">
            <motion.h3
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-lg font-semibold mb-4"
            >
                Reward Milestones
            </motion.h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
                {rewardTiers.map((tier, index) => {
                    const status = getStatus(tier);
                    const canClaim = status === "available";

                    return (
                        <motion.div
                            key={tier.stepMilestone}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative rounded-2xl p-4 border-2 transition-all duration-300 ${status === "claimed"
                                ? "bg-green-900/20 border-green-500/50"
                                : status === "available"
                                    ? "bg-orange-900/20 border-orange-500/50"
                                    : "bg-gray-900/20 border-gray-700/50"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${status === "claimed"
                                                ? "bg-green-500"
                                                : status === "available"
                                                    ? "bg-orange-500"
                                                    : "bg-gray-600"
                                                }`}
                                        >
                                            {status === "claimed" ? (
                                                <span className="text-white">✓</span>
                                            ) : (
                                                <span className="text-white">
                                                    {tier.stepMilestone >= 1000
                                                        ? `${tier.stepMilestone / 1000}k`
                                                        : tier.stepMilestone}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">
                                                {tier.description || `${tier.stepMilestone} Steps`}
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                {tier.stepMilestone.toLocaleString()} steps
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    {/* XP Reward */}
                                    <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-lg">
                                        <span className="text-yellow-400 font-bold text-lg">
                                            +{tier.xpReward}
                                        </span>
                                        <span className="text-yellow-400 text-xs">XP</span>
                                    </div>

                                    {/* Claim Button */}
                                    {canClaim && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onClaimReward(tier.stepMilestone)}
                                            disabled={isClaiming}
                                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {isClaiming ? "Claiming..." : "Claim"}
                                        </motion.button>
                                    )}

                                    {status === "claimed" && (
                                        <span className="text-green-400 text-xs font-medium">
                                            Claimed ✓
                                        </span>
                                    )}

                                    {status === "locked" && (
                                        <span className="text-gray-500 text-xs">Locked</span>
                                    )}
                                </div>
                            </div>

                            {/* Shine effect for available rewards */}
                            {status === "available" && (
                                <motion.div
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                    animate={{
                                        x: ["-200%", "200%"],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 1,
                                        ease: "linear",
                                    }}
                                    style={{
                                        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
                                    }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

