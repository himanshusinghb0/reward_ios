import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CoinInfoModal } from "./CoinInfoModal";
import { OptInModal } from "./OptInModal";
import { transferGameEarnings } from "../../../lib/api";


export const Coin = ({
    game,
    sessionCoins = 0,
    sessionXP = 0,
    isClaimed = false,
    isMilestoneReached = false,
    onClaimRewards
}) => {
    // Component state
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showClaimWarning, setShowClaimWarning] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [locallyClaimed, setLocallyClaimed] = useState(false);
    const [showOptInModal, setShowOptInModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [claimedCoins, setClaimedCoins] = useState(0);
    const [claimedXP, setClaimedXP] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [claimedGroups, setClaimedGroups] = useState(0); // Track how many groups have been claimed

    // Get authentication data from AuthContext
    const { token } = useAuth();
    const router = useRouter();

    // Progressive reward system based on task completion groups
    const calculateProgressiveRewards = (completedTasks) => {
        const tasksPerGroup = 3;
        const completedGroups = Math.floor(completedTasks / tasksPerGroup);
        const remainingTasks = completedTasks % tasksPerGroup;

        // Base reward per group (increases with each group)
        const baseRewardPerGroup = 10; // $10 for first group
        const rewardIncrease = 5; // $5 increase per group

        let totalCoins = 0;
        let totalXP = 0;

        // Calculate rewards for completed groups only (no partial rewards)
        for (let group = 0; group < completedGroups; group++) {
            const groupReward = baseRewardPerGroup + (group * rewardIncrease);
            totalCoins += groupReward;
            totalXP += 50; // Fixed XP per group
        }

        return {
            totalCoins: Math.round(totalCoins * 100) / 100, // Round to 2 decimal places
            totalXP: totalXP,
            completedGroups,
            remainingTasks,
            nextGroupProgress: remainingTasks,
            nextGroupTarget: tasksPerGroup,
            canClaim: completedGroups > 0 && remainingTasks === 0 // Can claim only when a full group is completed
        };
    };

    // Calculate rewards based on session coins (assuming sessionCoins represents completed tasks)
    const rewardData = calculateProgressiveRewards(sessionCoins);

    // Calculate available rewards (excluding already claimed groups)
    const availableGroups = Math.max(0, rewardData.completedGroups - claimedGroups);
    const availableCoins = availableGroups > 0 ?
        Array.from({ length: availableGroups }, (_, i) => {
            const groupIndex = claimedGroups + i;
            return 10 + (groupIndex * 5); // Base reward + increase per group
        }).reduce((sum, reward) => sum + reward, 0) : 0;

    const availableXP = availableGroups * 50;

    const maxCoins = rewardData.totalCoins;
    const coinProgressPercentage = maxCoins > 0 ? (sessionCoins / maxCoins) * 100 : 0;

    // Estimate max XP based on coin value (10% rule)
    const maxXP = maxCoins > 0 ? Math.floor(maxCoins * 0.1) : 0;
    const xpProgressPercentage = maxXP > 0 ? (sessionXP / maxXP) * 100 : 0;

    /**
     * Get simple user-friendly error message
     * @param {string} errorMessage - The original error message from backend
     * @returns {string} - Simple user-friendly error message
     */
    const getUserFriendlyErrorMessage = (errorMessage) => {
        return "🎯 Complete the milestone first! You need to reach the required level to claim your rewards.";
    };

    /**
     * Handle "End & Claim Rewards" button click
     * AC-12: Triggers reward transfer and session lock
     * Protection against multiple clicks
     */
    const handleClaimClick = () => {
        // Check if there are available groups to claim
        if (availableGroups === 0) {
            setErrorMessage("🎯 Complete 3 more tasks to unlock your next reward group!");
            return;
        }

        if (claiming || locallyClaimed) {
            return;
        }

        // Show warning modal before claiming (AC-10)
        setShowClaimWarning(true);
    };


    const handleConfirmClaim = async () => {
        // Check if there are available groups to claim
        if (availableGroups === 0) {
            console.warn('⚠️ No available groups to claim');
            setShowClaimWarning(false);
            return;
        }

        if (claiming || locallyClaimed) {
            console.warn('⚠️ Already claiming in progress');
            setShowClaimWarning(false);
            return;
        }

        if (!game?.id) {
            console.warn('⚠️ No game ID provided');
            alert('Game information is missing. Cannot claim rewards.');
            setShowClaimWarning(false);
            return;
        }

        // Set claiming immediately to prevent duplicate calls
        setClaiming(true);
        setLocallyClaimed(true);
        setShowClaimWarning(false);

        try {
            // Get user token from AuthContext
            if (!token) {
                throw new Error('User not authenticated');
            }

            // Prepare earning data for API call with available rewards only
            const earningData = {
                gameId: game.id,
                coins: availableCoins,
                xp: availableXP,
                reason: `Game session completion - ${game.title || 'Unknown Game'} - ${availableGroups} groups claimed`
            };


            // Prefer parent-provided claim handler which also locks session
            if (typeof onClaimRewards === 'function') {
                await onClaimRewards();
            } else {
                // Fallback to direct transfer if parent handler not provided
                const response = await transferGameEarnings(earningData, token);
                if (response.success === false) {
                    // Use the user-friendly error message function for API responses too
                    const userFriendlyError = getUserFriendlyErrorMessage(response.error || 'Failed to transfer earnings');
                    throw new Error(userFriendlyError);
                }
            }

            // Update local state with claimed values
            setClaimedCoins(availableCoins);
            setClaimedXP(availableXP);

            // Update claimed groups count
            setClaimedGroups(claimedGroups + availableGroups);

            // Show success message with better UI
            setShowSuccessMessage(true);

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
        } catch (error) {
            console.error('❌ Error claiming rewards:', error);

            const errorMessage = typeof error === 'string'
                ? error
                : error?.message || error?.error || error?.toString() || '';
            const userFriendlyError = getUserFriendlyErrorMessage(errorMessage);
            setErrorMessage(userFriendlyError);
            setLocallyClaimed(false);
        } finally {
            setClaiming(false);
        }
    };

    return (
        <section
            className={`flex flex-col w-[341px] h-[227px] items-start gap-2.5 mt-4 relative bg-[#1a1a1a] rounded-2xl overflow-hidden ${isClaimed ? 'opacity-50' : ''}`}
            data-model-id="3212:8259"
            role="region"
            aria-label="My Coins Progress Card"
        >
            <div className="relative self-stretch w-full h-[227px] rounded-2xl border border-solid border-[#616161]">
                <button
                    onClick={handleClaimClick}
                    disabled={availableGroups === 0 || claiming || locallyClaimed}
                    className={`
                        absolute top-[164px] left-4 w-[257px] h-10 flex items-center justify-center rounded-lg overflow-hidden 
                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black
                        ${availableGroups === 0 || claiming || locallyClaimed
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] hover:opacity-90 cursor-pointer'
                        }
                    `}
                    aria-label="Claim available rewards"
                    title={
                        availableGroups === 0 ? 'Complete 3 more tasks to unlock rewards' :
                            claiming ? 'Claiming rewards...' :
                                'Click to claim your available rewards'
                    }
                >
                    <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-sm text-center tracking-[0] leading-[normal]">
                        {claiming ? 'Claiming...' :
                            locallyClaimed ? '✅ Rewards Claimed' :
                                availableGroups === 0 ? '🔒 Claim Rewards Now' :
                                    `🎉 Claim ${availableGroups} Group${availableGroups > 1 ? 's' : ''}!`}
                    </span>
                </button>

                <div
                    className="flex w-[74.49%] items-center gap-1 absolute top-[calc(50.00%_+_4px)] left-[4.40%]"
                    role="status"
                    aria-label="Progress status"
                >
                    <span className={`relative w-fit [font-family:'Poppins',Helvetica] font-bold text-[15px] tracking-[0] leading-[17px] whitespace-nowrap transition-all duration-500 ${locallyClaimed ? 'text-green-400' : 'text-white'
                        }`}>
                        ${locallyClaimed ? claimedCoins.toFixed(2) : availableCoins.toFixed(2)}
                    </span>

                    <img
                        className="relative w-[22.82px] h-[23.53px] aspect-[0.97]"
                        alt="Coin icon"
                        src="https://c.animaapp.com/WucpRujl/img/image-3937@2x.png"
                    />

                    <span className={`relative w-fit [font-family:'Poppins',Helvetica] font-bold text-[15px] text-right tracking-[0] leading-[17px] whitespace-nowrap transition-all duration-500 ${locallyClaimed ? 'text-green-400' : 'text-white'
                        }`}>
                        and {locallyClaimed ? claimedXP : availableXP}
                    </span>

                    <img
                        className="relative  w-[22.82px] h-[23.53px] aspect-[0.97]"
                        alt="Level icon"
                        src="https://c.animaapp.com/WucpRujl/img/pic.svg"
                    />


                </div>

                <div
                    className="w-[52.20%] h-[5.50%] top-[42.54%] left-[5.28%] bg-gray-700 rounded-full overflow-hidden relative"
                    role="progressbar"
                    aria-valuenow={locallyClaimed ? claimedCoins : availableCoins}
                    aria-valuemin={0}
                    aria-valuemax={maxCoins}
                    aria-label={`Coin Progress: $${locallyClaimed ? claimedCoins.toFixed(2) : availableCoins.toFixed(2)} out of $${maxCoins.toFixed(2)}`}
                >
                    <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${locallyClaimed
                            ? 'bg-gradient-to-r from-green-400 to-green-500'
                            : 'bg-gradient-to-r from-[#80e76a] to-[#4ade80]'
                            }`}
                        style={{ width: `${locallyClaimed ? 100 : Math.min((availableCoins / maxCoins) * 100, 100)}%` }}
                    />

                    {/* Circular Progress Indicator */}
                    <div
                        className={`absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-xl border-3 transform -translate-y-1/2 -translate-x-1/2 z-10 ${locallyClaimed ? 'border-green-400' : 'border-[#80e76a]'
                            }`}
                        style={{
                            left: `${locallyClaimed ? 100 : Math.min((availableCoins / maxCoins) * 100, 100)}%`,
                            boxShadow: locallyClaimed
                                ? '0 6px 12px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(34, 197, 94, 0.3)'
                                : '0 6px 12px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(128, 231, 106, 0.3)'
                        }}
                    >
                        {/* Inner glow effect */}
                        <div className="absolute inset-1 bg-gradient-to-br from-white to-gray-100 rounded-full"></div>

                        {/* Top and bottom extending lines */}
                        <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-[#80e76a] transform -translate-x-1/2 -translate-y-full"></div>
                        <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-[#80e76a] transform -translate-x-1/2 translate-y-full"></div>

                        {/* Side extending lines */}
                        <div className="absolute top-1/2 left-0 w-2 h-0.5 bg-[#80e76a] transform -translate-y-1/2 -translate-x-full"></div>
                        <div className="absolute top-1/2 right-0 w-2 h-0.5 bg-[#80e76a] transform -translate-y-1/2 translate-x-full"></div>
                    </div>
                </div>

                <button
                    onClick={() => setShowOptInModal(true)}
                    className="absolute top-[165px] left-[286px] w-9 h-9 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black rounded-full"
                    aria-label="Information"
                >
                    <img
                        alt="Information icon"
                        src="https://c.animaapp.com/WucpRujl/img/frame-1000005263.svg"
                        className="w-full h-full"
                    />
                </button>

                <header className="flex flex-col w-[307px] items-start gap-[5px] absolute top-[15px] left-[18px]">
                    <div className="flex items-end justify-between relative self-stretch w-full flex-[0_0_auto]">
                        <h1 className="relative w-fit [font-family:'Poppins',Helvetica] font-semibold text-white text-xl tracking-[-0.37px] leading-[27.2px] whitespace-nowrap">
                            {'My Coins'}
                        </h1>

                        <div
                            className="flex items-center gap-2 px-0 py-1.5 relative mr-2"
                            role="status"
                            aria-label={`Session earnings: $${availableCoins.toFixed(2)}`}
                        >
                            <span className="relative w-fit [font-family:'Poppins',Helvetica] font-semibold text-white text-lg tracking-[0] leading-5 whitespace-nowrap">
                                ${availableCoins.toFixed(2)}
                            </span>

                            <img
                                className="relative w-[22.82px] h-[23.53px] aspect-[0.97]"
                                alt="Coin icon"
                                src="https://c.animaapp.com/WucpRujl/img/image-3938@2x.png"
                            />
                        </div>
                    </div>

                    {/* AC-08: Status message based on claim state */}
                    <div className="relative mb-3 self-stretch">
                        <p className={`[font-family:'Poppins',Helvetica] font-normal text-sm tracking-[0.02px] leading-[normal] transition-all duration-500 ${isClaimed ? 'text-green-400' : 'text-[#ffffff99]'
                            }`}>
                            {locallyClaimed
                                ? `✅ Successfully claimed $${claimedCoins.toFixed(2)} coins and ${claimedXP} XP!`
                                : availableGroups > 0
                                    ? `🎉 Ready to claim $${availableCoins.toFixed(2)} + ${availableXP} XP from ${availableGroups} group${availableGroups > 1 ? 's' : ''}!`
                                    : sessionCoins > 0
                                        ? `💰 Complete ${rewardData.nextGroupTarget - rewardData.nextGroupProgress} more tasks to unlock the next reward group!`
                                        : '🎯 Keep playing to earn coins and reach the next milestone!'}
                        </p>

                        {/* Progress indicator when coins are available but milestone not reached */}
                        {!locallyClaimed && sessionCoins > 0 && (
                            <div className="mt-2 space-y-2">
                                {/* Task Group Progress */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className="flex-1 bg-gray-600 rounded-full h-1.5 overflow-hidden cursor-help"
                                        title={`Task Progress: ${rewardData.nextGroupProgress}/${rewardData.nextGroupTarget} tasks in current group`}
                                    >
                                        <div
                                            className="bg-gradient-to-r from-blue-400 to-purple-400 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${(rewardData.nextGroupProgress / rewardData.nextGroupTarget) * 100}%` }}
                                        />
                                    </div>
                                    <span
                                        className="text-xs text-blue-400 font-medium cursor-help"
                                        title={`${rewardData.nextGroupTarget - rewardData.nextGroupProgress} more tasks needed for next reward group`}
                                    >
                                        {rewardData.nextGroupProgress}/{rewardData.nextGroupTarget}
                                    </span>
                                </div>

                                {/* Reward Progress */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className="flex-1 bg-gray-600 rounded-full h-1.5 overflow-hidden cursor-help"
                                        title={`Reward Progress: $${availableCoins.toFixed(2)} earned`}
                                    >
                                        <div
                                            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((availableCoins / (availableCoins + 10)) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span
                                        className="text-xs text-yellow-400 font-medium cursor-help"
                                        title={`Current rewards: $${availableCoins.toFixed(2)}`}
                                    >
                                        ${availableCoins.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </header>
            </div>

            {showClaimWarning && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 shadow-2xl max-w-sm mx-4 p-6">
                        <h3 className="text-xl font-bold text-white mb-3">⚠️ Claim Your Rewards?</h3>
                        <div className="space-y-3 mb-6">
                            <p className="text-gray-300 text-sm">
                                You're about to claim your session rewards:
                            </p>
                            <div className="bg-gradient-to-r from-yellow-500/10 to-blue-500/10 rounded-lg p-4 border border-yellow-500/20">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Coins:</span>
                                    <span className="font-bold text-yellow-400 text-lg">${availableCoins.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">XP:</span>
                                    <span className="font-bold text-blue-400 text-lg">{availableXP}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Available Groups:</span>
                                    <span className="font-bold text-green-400 text-sm">{availableGroups} group{availableGroups > 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <p className="text-orange-400 text-sm font-medium">
                                ⚠️ Once you reach this level, you'll be eligible to end this session and transfer your collected coins and XP to your wallet.
                            </p>
                            <p className="text-red-400 text-sm font-medium">
                                🔒 After claiming, you won't be able to return to this game's reward flow. Choose wisely.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClaimWarning(false)}
                                className="flex-1 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmClaim}
                                disabled={claiming}
                                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold transition-colors disabled:opacity-50"
                            >
                                {claiming ? 'Claiming...' : 'Confirm Claim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AC-15: Help Tooltip Modal */}
            <CoinInfoModal
                isVisible={showInfoModal}
                onClose={() => setShowInfoModal(false)}
            />

            {/* Opt-In/Opt-Out Information Modal */}
            <OptInModal
                isVisible={showOptInModal}
                onClose={() => setShowOptInModal(false)}
                sessionData={{ sessionCoins, sessionXP }}
                game={game}
            />

            {/* Success Message Modal */}
            {showSuccessMessage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl border border-green-600 shadow-2xl max-w-sm mx-4 p-6 animate-bounce">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">🎉 Rewards Claimed!</h3>
                            <div className="bg-green-600/20 rounded-lg p-4 mb-4 border border-green-500/30">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-green-200">Coins Earned:</span>
                                    <span className="font-bold text-yellow-300 text-lg">${claimedCoins.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-green-200">XP Earned:</span>
                                    <span className="font-bold text-blue-300 text-lg">{claimedXP}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-green-200">Groups Claimed:</span>
                                    <span className="font-bold text-green-300 text-sm">{availableGroups} group{availableGroups > 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <p className="text-green-200 text-sm mb-4">
                                Your rewards have been successfully transferred to your wallet!
                            </p>
                            <button
                                onClick={() => setShowSuccessMessage(false)}
                                className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
                            >
                                Awesome! 🚀
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message Modal */}
            {errorMessage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl border border-red-600 shadow-2xl max-w-sm mx-4 p-6 animate-pulse">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
                                </svg>
                            </div>
                            <div className="bg-red-600/20 rounded-lg p-4 mb-4 border border-red-500/30">
                                <p className="text-red-100 text-sm leading-relaxed">{errorMessage}</p>
                            </div>
                            <div className="space-y-2">

                                <button
                                    onClick={() => setErrorMessage("")}
                                    className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                                >
                                    Got it! 👍
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
