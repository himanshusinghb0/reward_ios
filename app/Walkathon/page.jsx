"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { HomeIndicator } from "@/components/HomeIndicator";
import {
    getWalkathonStatus,
    joinWalkathon,
    syncWalkathonSteps,
    getWalkathonProgress,
    claimWalkathonReward,
    getWalkathonLeaderboard,
    getWalkathonRank,
} from "@/lib/api";
import { WalkathonHeader } from "./components/WalkathonHeader";
import { CircularProgressTracker } from "./components/CircularProgressTracker";
import { RewardTiersSection } from "./components/RewardTiersSection";
import { HealthKitIntegration } from "./components/HealthKitIntegration";
import { LeaderboardSection } from "./components/LeaderboardSection";
import { ActionButtons } from "./components/ActionButtons";
import { MilestoneCelebration } from "./components/MilestoneCelebration";

/**
 * Walkathon Page
 * Main page for step-based challenge with XP rewards
 */
export default function WalkathonPage() {
    const { token, user } = useAuth();
    const router = useRouter();

    // State management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEligible, setIsEligible] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Walkathon data
    const [walkathon, setWalkathon] = useState(null);
    const [progress, setProgress] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [newMilestones, setNewMilestones] = useState([]);

    // Debug logging helper
    const logWalkathon = (label, data) => {
        console.log(`[🚶 WALKATHON] ${label}`, data);
    };

    // Log component mount
    useEffect(() => {
        logWalkathon("Component Mounted", { token: !!token, user: user?.id || "N/A" });
        return () => {
            logWalkathon("Component Unmounted", {});
        };
    }, []);

    // Load walkathon status
    const loadWalkathonStatus = async () => {
        if (!token) {
            logWalkathon("Status Load Skipped", { reason: "No token" });
            return;
        }

        try {
            logWalkathon("Loading Status", { timestamp: new Date().toISOString() });
            setLoading(true);
            setError(null);

            const response = await getWalkathonStatus(token);
            logWalkathon("Status API Response", { response });

            // Check if API returned an error
            if (response.success === false) {
                logWalkathon("❌ API Error Response", {
                    success: response.success,
                    error: response.error,
                    message: response.message,
                    status: response.status,
                    body: response.body,
                    fullResponse: response,
                    troubleshooting: [
                        "Check backend logs for errors",
                        "Verify API endpoint is working",
                        "Check authentication token is valid",
                        "Verify backend walkathon service is configured"
                    ]
                });

                console.error("Walkathon API error:", response);
                setIsEligible(false);
                setError(response.error || response.message || "Failed to load walkathon status. Please try again later.");
                setLoading(false);
                return;
            }

            // Backend returns { success: true, data: {...} }
            if (response.success && response.data) {
                const { data } = response;

                // Enhanced logging - show full response structure
                logWalkathon("📥 Full Status Response Structure", {
                    hasSuccess: response.success,
                    hasData: !!response.data,
                    dataKeys: Object.keys(data || {}),
                    fullData: data,
                    hasActiveWalkathon: data.hasActiveWalkathon,
                    walkathonExists: !!data.walkathon,
                    eligibilityExists: !!data.eligibility,
                    userProgressExists: !!data.userProgress
                });

                console.log("Walkathon status response:", data);

                if (data.hasActiveWalkathon) {
                    logWalkathon("✅ Active Walkathon Found", {
                        walkathonId: data.walkathon?.id,
                        walkathonTitle: data.walkathon?.title,
                        walkathonDescription: data.walkathon?.description,
                        walkathonStartDate: data.walkathon?.startDate,
                        walkathonEndDate: data.walkathon?.endDate,
                        rewardTiersCount: data.walkathon?.rewardTiers?.length || 0,
                        rewardTiers: data.walkathon?.rewardTiers,
                        isEligible: data.eligibility?.isEligible,
                        eligibilityReason: data.eligibility?.reason,
                        eligibilityDetails: data.eligibility,
                        userProgressExists: !!data.userProgress,
                        userProgress: data.userProgress
                    });

                    setIsEligible(data.eligibility?.isEligible || false);
                    setWalkathon(data.walkathon);

                    // Check if user has progress (has joined)
                    const hasProgress = data.userProgress && data.userProgress.hasProgress;
                    if (hasProgress) {
                        logWalkathon("User Has Progress", {
                            totalSteps: data.userProgress.progress?.totalSteps,
                            milestonesReached: data.userProgress.progress?.milestonesReached?.length || 0,
                            rewardsClaimed: data.userProgress.progress?.rewardsClaimed?.length || 0,
                            userRank: data.userProgress.userRank
                        });

                        setIsJoined(true);
                        setProgress(data.userProgress.progress);
                        setUserRank(data.userProgress.userRank);
                        setTimeRemaining(data.userProgress.timeRemaining);

                        // Load fresh progress data
                        await loadProgress();
                    } else {
                        logWalkathon("User Not Joined Yet", {});
                        setIsJoined(false);
                    }

                    // Always load leaderboard
                    await loadLeaderboard();
                } else {
                    logWalkathon("❌ No Active Walkathon", {
                        hasActiveWalkathon: data.hasActiveWalkathon,
                        message: data.message,
                        eligibility: data.eligibility,
                        eligibilityReason: data.eligibility?.reason,
                        eligibilityIsEligible: data.eligibility?.isEligible,
                        walkathonExists: !!data.walkathon,
                        walkathon: data.walkathon,
                        userProgressExists: !!data.userProgress,
                        userProgress: data.userProgress,
                        fullResponseData: data,
                        possibleReasons: [
                            !data.walkathon ? "No walkathon object in response" : "",
                            !data.hasActiveWalkathon ? "hasActiveWalkathon is false" : "",
                            !data.eligibility?.isEligible ? `Not eligible: ${data.eligibility?.reason || "Unknown reason"}` : "",
                            data.message ? `Backend message: ${data.message}` : ""
                        ].filter(Boolean)
                    });

                    setIsEligible(false);
                    // More specific error message
                    const errorMsg = data.message ||
                        data.eligibility?.reason ||
                        "No active walkathon found. The walkathon may not be available at this time.";
                    setError(errorMsg);

                    // Enhanced logging for debugging
                    console.warn("No active walkathon - Full details:", {
                        hasActiveWalkathon: data.hasActiveWalkathon,
                        message: data.message,
                        eligibility: data.eligibility,
                        walkathon: data.walkathon,
                        userProgress: data.userProgress,
                        fullData: data
                    });
                }
            } else {
                // Unexpected response structure
                logWalkathon("❌ Unexpected Response Structure", {
                    response,
                    hasSuccess: response?.success,
                    hasData: !!response?.data,
                    responseKeys: Object.keys(response || {}),
                    responseStructure: {
                        success: response?.success,
                        data: response?.data,
                        error: response?.error,
                        message: response?.message
                    },
                    troubleshooting: [
                        "Backend response structure doesn't match expected format",
                        "Expected: { success: true, data: {...} }",
                        "Check backend API endpoint response structure",
                        "Verify API middleware is configured correctly"
                    ]
                });

                console.error("Unexpected walkathon status response:", response);
                setIsEligible(false);
                setError("Invalid response from server. Please try again later.");
            }
        } catch (err) {
            console.error("Error loading walkathon status:", err);
            // More user-friendly error message
            const errorMsg = err.message || "Failed to load walkathon. Please check your connection and try again.";
            setError(errorMsg);
            setIsEligible(false);
        } finally {
            setLoading(false);
        }
    };

    // Load user progress
    const loadProgress = async () => {
        if (!token) {
            logWalkathon("Progress Load Skipped", { reason: "No token" });
            return;
        }

        try {
            logWalkathon("Loading Progress", { timestamp: new Date().toISOString() });
            const response = await getWalkathonProgress(token);
            logWalkathon("Progress API Response", { response });

            // Backend returns { success: true, data: {...} }
            if (response.success && response.data) {
                const { data } = response;

                if (data.hasProgress) {
                    logWalkathon("Progress Updated", {
                        totalSteps: data.progress?.totalSteps || data.progress?.totalStepsCompleted || 0,
                        milestonesReached: data.progress?.milestonesReached?.length || 0,
                        rewardsClaimed: data.progress?.rewardsClaimed?.length || 0,
                        availableRewards: data.progress?.availableRewards?.length || 0,
                        userRank: data.userRank,
                        timeRemaining: data.timeRemaining
                    });

                    setProgress(data.progress);
                    setUserRank(data.userRank);
                    setTimeRemaining(data.timeRemaining);
                    setIsJoined(true);
                } else {
                    logWalkathon("No Progress Found", { userNotJoined: true });
                    setIsJoined(false);
                }
            }
        } catch (err) {
            logWalkathon("Progress Load Error", { error: err.message, stack: err.stack });
            // If error, user might not have joined yet
            if (err.message?.includes("not joined") || err.message?.includes("not found")) {
                setIsJoined(false);
            }
        }
    };

    // Load leaderboard
    const loadLeaderboard = async () => {
        if (!token) {
            logWalkathon("Leaderboard Load Skipped", { reason: "No token" });
            return;
        }

        try {
            logWalkathon("Loading Leaderboard", { timestamp: new Date().toISOString() });
            const response = await getWalkathonLeaderboard(token);
            logWalkathon("Leaderboard API Response", { response });

            // Backend returns { success: true, data: { weekKey, leaderboard, totalParticipants } }
            if (response.success && response.data) {
                const { data } = response;

                logWalkathon("Leaderboard Updated", {
                    totalParticipants: data.totalParticipants,
                    leaderboardEntries: data.leaderboard?.length || 0,
                    weekKey: data.weekKey
                });

                setLeaderboard(data.leaderboard || []);

                // Also update walkathon total participants if available
                if (data.totalParticipants !== undefined && walkathon) {
                    setWalkathon({
                        ...walkathon,
                        totalParticipants: data.totalParticipants
                    });
                }
            }
        } catch (err) {
            logWalkathon("Leaderboard Load Error", { error: err.message, stack: err.stack });
        }
    };

    // Join walkathon
    const handleJoin = async () => {
        if (!token) {
            logWalkathon("Join Skipped", { reason: "No token" });
            return;
        }
        if (isJoining) {
            logWalkathon("Join Skipped", { reason: "Already joining" });
            return;
        }

        try {
            logWalkathon("Joining Walkathon", { timestamp: new Date().toISOString() });
            setIsJoining(true);
            setError(null);

            const response = await joinWalkathon(token);
            logWalkathon("Join API Response", { response });

            // Backend returns { success: true, data: { success: true, message, progress } }
            if (response.success && response.data) {
                const { data } = response;

                if (data.success) {
                    logWalkathon("Join Success", {
                        totalSteps: data.progress?.totalSteps || 0,
                        message: data.message
                    });

                    setIsJoined(true);
                    setProgress(data.progress);
                    await loadProgress();
                    await loadLeaderboard();
                } else {
                    logWalkathon("Join Failed", { message: data.message });
                    setError(data.message || "Failed to join walkathon");
                }
            }
        } catch (err) {
            logWalkathon("Join Error", { error: err.message, stack: err.stack });
            setError(err.message || "Failed to join walkathon");
        } finally {
            setIsJoining(false);
        }
    };

    // Sync steps from HealthKit
    const handleStepsSynced = async (stepData) => {
        if (!token) {
            logWalkathon("Sync Skipped", { reason: "No token" });
            return;
        }
        if (!isJoined) {
            logWalkathon("Sync Skipped", { reason: "User not joined" });
            return;
        }

        try {
            logWalkathon("Syncing Steps", {
                steps: stepData.steps,
                date: stepData.date,
                source: stepData.source,
                timestamp: new Date().toISOString()
            });

            setIsSyncing(true);
            setError(null);

            const response = await syncWalkathonSteps(stepData, token);
            logWalkathon("Sync API Response", { response });

            // Backend returns { success: true, data: { success: true, message, newMilestones, progress } }
            if (response.success && response.data) {
                const { data } = response;

                if (data.success) {
                    logWalkathon("Sync Success", {
                        newTotalSteps: data.progress?.totalSteps || data.progress?.totalStepsCompleted || 0,
                        newMilestonesCount: data.newMilestones?.length || 0,
                        message: data.message
                    });

                    // Update progress with latest data
                    setProgress(data.progress);

                    // Show milestone celebration if new milestones reached
                    if (data.newMilestones && data.newMilestones.length > 0) {
                        logWalkathon("🎉 New Milestones Reached", {
                            milestones: data.newMilestones,
                            count: data.newMilestones.length
                        });
                        setNewMilestones(data.newMilestones);
                        // Refresh progress to show new milestones
                        await loadProgress();
                    }

                    // Reload leaderboard to update rankings
                    await loadLeaderboard();
                } else {
                    logWalkathon("Sync Failed", { message: data.message });
                    setError(data.message || "Failed to sync steps");
                }
            }
        } catch (err) {
            logWalkathon("Sync Error", { error: err.message, stack: err.stack });
            setError(err.message || "Failed to sync steps");
        } finally {
            setIsSyncing(false);
        }
    };

    // Claim reward for a milestone
    const handleClaimReward = async (milestone) => {
        if (!token) {
            logWalkathon("Claim Skipped", { reason: "No token" });
            return;
        }
        if (isClaiming) {
            logWalkathon("Claim Skipped", { reason: "Already claiming" });
            return;
        }

        try {
            logWalkathon("Claiming Reward", {
                milestone: typeof milestone === 'number' ? milestone : milestone.stepMilestone || milestone,
                timestamp: new Date().toISOString()
            });

            setIsClaiming(true);
            setError(null);

            const response = await claimWalkathonReward(milestone, token);
            logWalkathon("Claim API Response", { response });

            // Backend returns { success: true, data: { success: true, message, reward, transaction } }
            if (response.success && response.data) {
                const { data } = response;

                if (data.success) {
                    logWalkathon("✅ Reward Claimed Successfully", {
                        reward: data.reward,
                        xpReward: data.reward?.xpReward || 0,
                        transactionId: data.transaction?.id,
                        message: data.message
                    });

                    // Reload progress to update claimed rewards
                    await loadProgress();
                    await loadLeaderboard();
                } else {
                    logWalkathon("Claim Failed", { message: data.message });
                    setError(data.message || "Failed to claim reward");
                }
            }
        } catch (err) {
            logWalkathon("Claim Error", { error: err.message, stack: err.stack });
            setError(err.message || "Failed to claim reward");
        } finally {
            setIsClaiming(false);
        }
    };

    // Claim all available rewards
    const handleClaimAll = async () => {
        if (!progress?.availableRewards || progress.availableRewards.length === 0) {
            return;
        }

        // Claim rewards one by one
        for (const reward of progress.availableRewards) {
            await handleClaimReward(reward.stepMilestone);
        }
    };

    // View full leaderboard
    const handleViewFullLeaderboard = () => {
        // Navigate to full leaderboard page if exists
        // For now, just scroll or expand
        router.push("/walkathon/leaderboard");
    };

    // Initialize
    useEffect(() => {
        if (token) {
            logWalkathon("Initializing Walkathon Page", { token: !!token });
            loadWalkathonStatus();
        } else {
            logWalkathon("Initialization Skipped", { reason: "No token" });
        }
    }, [token]);

    // Auto-refresh progress every 30 seconds
    useEffect(() => {
        if (isJoined && token) {
            logWalkathon("Auto-Refresh Started", { interval: "30 seconds" });
            const interval = setInterval(() => {
                logWalkathon("Auto-Refresh Triggered", { timestamp: new Date().toISOString() });
                loadProgress();
                loadLeaderboard();
            }, 30000); // Every 30 seconds

            return () => {
                logWalkathon("Auto-Refresh Stopped", {});
                clearInterval(interval);
            };
        }
    }, [isJoined, token]);

    // Calculate level from progress
    const getCurrentLevel = () => {
        if (!progress) return { level: 1, progress: 0, max: 3 };

        // Count claimed rewards (handle both number array and object array)
        const claimedCount = Array.isArray(progress.rewardsClaimed)
            ? progress.rewardsClaimed.length
            : 0;

        // Calculate level based on milestones claimed
        const level = Math.floor(claimedCount / 3) + 1;
        const levelProgress = claimedCount % 3;
        return { level, progress: levelProgress, max: 3 };
    };

    const levelInfo = getCurrentLevel();

    // Loading state
    if (loading) {
        return (
            <div className="relative w-full min-h-screen bg-black flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    // Error or not eligible state (AC1: Only eligible users can access)
    if (error || !isEligible || !walkathon) {
        return (
            <div className="relative w-full min-h-screen bg-black pb-[150px]">
                <WalkathonHeader title="Walkathon" />
                <div className="flex flex-col items-center justify-center px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="text-6xl mb-4">🚶</div>
                        <h2 className="text-white text-2xl font-bold mb-2">
                            {error ? " Walkathon" : "Not Available"}
                        </h2>
                        <p className="text-gray-400 text-sm mb-6">
                            {error ||
                                "Walkathon is not currently available or you're not eligible. Eligibility is based on country, XP level, and age restrictions."}
                        </p>
                        {walkathon?.eligibility?.reason && (
                            <p className="text-orange-400 text-xs mb-4">
                                {walkathon.eligibility.reason}
                            </p>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.back()}
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
                        >
                            Go Back
                        </motion.button>
                    </motion.div>
                </div>
                <HomeIndicator activeTab="home" />
            </div>
        );
    }

    // Extract progress data (backend returns arrays/objects)
    const milestonesReached = Array.isArray(progress?.milestonesReached)
        ? progress.milestonesReached
        : [];
    const rewardsClaimed = Array.isArray(progress?.rewardsClaimed)
        ? progress.rewardsClaimed.map(r => typeof r === 'object' ? r.milestone : r)
        : [];
    const availableRewards = Array.isArray(progress?.availableRewards)
        ? progress.availableRewards
        : [];
    const rewardTiers = Array.isArray(walkathon?.rewardTiers)
        ? walkathon.rewardTiers
        : [];
    const totalSteps = progress?.totalSteps || progress?.totalStepsCompleted || 0;
    const nextMilestone = progress?.nextMilestone || null;

    // Log render state changes
    useEffect(() => {
        logWalkathon("Render State", {
            loading,
            isEligible,
            isJoined,
            isJoining,
            isClaiming,
            isSyncing,
            hasWalkathon: !!walkathon,
            hasProgress: !!progress,
            totalSteps,
            leaderboardCount: leaderboard.length,
            userRank,
            error: error || null
        });
    }, [loading, isEligible, isJoined, isJoining, isClaiming, isSyncing, walkathon, progress, totalSteps, leaderboard.length, userRank, error]);

    return (
        <div className="relative w-full min-h-screen bg-black pb-[150px] animate-fade-in">
            <div className="flex flex-col w-full max-w-[375px] mx-auto items-center gap-6 pt-4 px-0">
                {/* Header */}
                <WalkathonHeader title={walkathon.title || "Walkathon Challenge"} />

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="w-full px-4"
                        >
                            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Walkathon Description */}
                {walkathon.description && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full px-4"
                    >
                        <p className="text-gray-300 text-sm text-center">
                            {walkathon.description}
                        </p>
                    </motion.div>
                )}

                {/* Time Remaining */}
                {timeRemaining && !timeRemaining.isExpired && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full px-4"
                    >
                        <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-3 text-center">
                            <p className="text-orange-400 text-sm font-semibold">
                                {timeRemaining.days}d {timeRemaining.hours}h{" "}
                                {timeRemaining.minutes}m remaining
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* HealthKit Integration */}
                <HealthKitIntegration
                    onStepsSynced={handleStepsSynced}
                    token={token}
                    onError={setError}
                    isJoined={isJoined}
                />

                {/* Circular Progress Tracker */}
                {isJoined && (
                    <CircularProgressTracker
                        totalSteps={totalSteps}
                        currentLevel={levelInfo.level}
                        levelProgress={levelInfo.progress}
                        levelMax={levelInfo.max}
                        nextMilestone={nextMilestone}
                        milestones={rewardTiers}
                        rewardsClaimed={rewardsClaimed}
                    />
                )}

                {/* Action Buttons */}
                <ActionButtons
                    isJoined={isJoined}
                    hasAvailableRewards={availableRewards.length > 0}
                    availableRewards={availableRewards}
                    onJoin={handleJoin}
                    onClaimAll={handleClaimAll}
                    isJoining={isJoining}
                    isClaiming={isClaiming}
                    nextMilestone={nextMilestone}
                    totalSteps={totalSteps}
                />

                {/* Reward Tiers Section */}
                {isJoined && (
                    <RewardTiersSection
                        rewardTiers={rewardTiers}
                        milestonesReached={milestonesReached}
                        rewardsClaimed={rewardsClaimed}
                        onClaimReward={handleClaimReward}
                        isClaiming={isClaiming}
                    />
                )}

                {/* Leaderboard Section */}
                <LeaderboardSection
                    leaderboard={leaderboard}
                    userRank={userRank}
                    totalParticipants={walkathon.totalParticipants || 0}
                    onViewFullLeaderboard={handleViewFullLeaderboard}
                />
            </div>

            {/* Milestone Celebration Modal */}
            <MilestoneCelebration
                milestones={newMilestones}
                onClose={() => setNewMilestones([])}
            />

            <HomeIndicator activeTab="home" />
        </div>
    );
}

