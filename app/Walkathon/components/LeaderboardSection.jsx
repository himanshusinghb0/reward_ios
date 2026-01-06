"use client";
import React from "react";
import { motion } from "framer-motion";

/**
 * Leaderboard Section
 * Displays weekly rankings for the walkathon
 */
export const LeaderboardSection = ({
    leaderboard = [],
    userRank = null,
    totalParticipants = 0,
    onViewFullLeaderboard,
}) => {
    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return "🥇";
            case 2:
                return "🥈";
            case 3:
                return "🥉";
            default:
                return `#${rank}`;
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 1:
                return "from-yellow-500 to-yellow-600";
            case 2:
                return "from-gray-300 to-gray-400";
            case 3:
                return "from-orange-600 to-orange-700";
            default:
                return "from-gray-600 to-gray-700";
        }
    };

    // Show top 10 + user's rank if not in top 10
    const displayLeaderboard = [...leaderboard];
    if (
        userRank &&
        userRank.rank > 10 &&
        !displayLeaderboard.find((entry) => entry.userId === userRank.userId)
    ) {
        displayLeaderboard.push(userRank);
    }

    return (
        <div className="w-full px-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-white text-lg font-semibold"
                >
                    Weekly Leaderboard
                </motion.h3>
                {onViewFullLeaderboard && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onViewFullLeaderboard}
                        className="text-orange-400 text-sm font-medium hover:text-orange-300 transition-colors"
                    >
                        View All
                    </motion.button>
                )}
            </div>

            {totalParticipants === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-900/20 border border-gray-700/50 rounded-lg p-6 text-center"
                >
                    <p className="text-gray-400 text-sm">
                        No participants yet. Be the first to join!
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                    {displayLeaderboard.map((entry, index) => {
                        const isCurrentUser =
                            userRank && entry.userId === userRank.userId;
                        const rank = entry.rank || index + 1;

                        return (
                            <motion.div
                                key={entry.userId || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`rounded-xl p-3 border transition-all ${isCurrentUser
                                    ? "bg-orange-900/30 border-orange-500/50 shadow-lg shadow-orange-500/20"
                                    : rank <= 3
                                        ? "bg-gray-900/30 border-gray-700/50"
                                        : "bg-gray-900/20 border-gray-800/50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Rank Badge */}
                                    <div
                                        className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm bg-gradient-to-br ${getRankColor(
                                            rank
                                        )} text-white`}
                                    >
                                        {rank <= 3 ? (
                                            <span className="text-lg">{getRankIcon(rank)}</span>
                                        ) : (
                                            <span>{rank}</span>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden">
                                        {entry.avatar ? (
                                            <img
                                                src={entry.avatar}
                                                alt={entry.displayName || "User"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white text-lg">
                                                {entry.displayName?.charAt(0)?.toUpperCase() || "U"}
                                            </span>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`font-semibold text-sm truncate ${isCurrentUser ? "text-orange-400" : "text-white"
                                                }`}
                                        >
                                            {isCurrentUser ? "You" : entry.displayName || "Anonymous"}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            {entry.totalSteps?.toLocaleString() || 0} steps
                                        </p>
                                    </div>

                                    {/* XP Level Badge */}
                                    {entry.xpLevel && (
                                        <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg">
                                            <span className="text-yellow-400 text-xs font-semibold">
                                                Lvl {entry.xpLevel}
                                            </span>
                                        </div>
                                    )}

                                    {/* VIP Badge */}
                                    {entry.vipLevel && (
                                        <div
                                            className={`px-2 py-1 rounded-lg text-xs font-semibold ${entry.vipLevel === "gold"
                                                ? "bg-yellow-900/50 text-yellow-400"
                                                : entry.vipLevel === "silver"
                                                    ? "bg-gray-700/50 text-gray-300"
                                                    : "bg-purple-900/50 text-purple-400"
                                                }`}
                                        >
                                            VIP
                                        </div>
                                    )}
                                </div>

                                {/* Badges */}
                                {entry.badges && entry.badges.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        {entry.badges.map((badge, badgeIndex) => (
                                            <span
                                                key={badgeIndex}
                                                className="text-xs px-2 py-0.5 bg-orange-900/30 text-orange-400 rounded-full"
                                            >
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* User Rank Summary */}
            {userRank && userRank.rank > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-semibold">Your Rank</p>
                            <p className="text-gray-400 text-sm">
                                #{userRank.rank} of {totalParticipants} participants
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-orange-400 font-bold text-xl">
                                #{userRank.rank}
                            </p>
                            {userRank.percentile && (
                                <p className="text-gray-400 text-xs">
                                    Top {100 - userRank.percentile}%
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};


