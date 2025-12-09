"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchGamesBySection } from "@/lib/redux/slice/gameSlice";
// Removed getAgeGroupFromProfile and getGenderFromProfile - now passing user object directly

const RecommendationCard = React.memo(({ card, onCardClick }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    // Pre-compute image source for better performance
    const imageSrc = card.backgroundImage || card.image || '/game.png';

    return (
        <article
            className="flex flex-col w-[158px] rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-all duration-200"
            onClick={() => onCardClick(card)}
        >
            <div className="relative w-[158px] h-[158px]">
                {!imageError ? (
                    <Image
                        className="object-cover rounded-t-xl"
                        alt={card.title || "Game promotion"}
                        src={imageSrc}
                        fill
                        sizes="158px"
                        priority
                        onError={handleImageError}
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center rounded-t-xl">
                        <div className="text-center text-white">
                            <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium">{card.title || 'Game'}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-col h-[60px] w-[158px] px-2 pt-2 pb-3 bg-[linear-gradient(180deg,rgba(81,98,182,0.9)_0%,rgba(63,56,184,0.9)_100%)]">

                <div className="flex flex-col mt-auto gap-0.5">
                    <div className="flex items-center gap-1 min-w-0">
                        <p className="[font-family:'Poppins',Helvetica] font-medium text-white text-[14px] whitespace-nowrap">Earn upto {card.earnings || "100"}</p>
                        <Image
                            className="w-[18px] h-[19px] flex-shrink-0"
                            alt="Coin"
                            src="/dollor.png"
                            width={18}
                            height={19}
                            priority
                            unoptimized
                        />
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                        <p className="[font-family:'Poppins',Helvetica] font-medium text-white text-[14px] whitespace-nowrap">and {card.xpPoints || "50"}</p>
                        <Image
                            className="w-[21px] h-[16px] flex-shrink-0"
                            alt="Reward icon"
                            src="/xp.svg"
                            width={21}
                            height={16}
                            priority
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </article>
    );
});

export const ListGame = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [currentScaleClass, setCurrentScaleClass] = useState("scale-100");
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    // Use both API games and downloaded games
    const { gamesBySection, gamesBySectionStatus, inProgressGames } = useSelector((state) => state.games);
    const { details: userProfile } = useSelector((state) => state.profile);

    // Extract games from the "Swipe" section (since that's what we're fetching)
    const swipeGames = gamesBySection?.["Swipe"] || [];
    const swipeStatus = gamesBySectionStatus?.["Swipe"] || "idle";

    // Optimized: Pre-compute games data with both API games and downloaded games
    const recommendationCards = useMemo(() => {
        const allGames = [];

        // Add API games (not downloaded) - using besitosRawData
        if (swipeGames && swipeGames.length > 0) {
            const apiGames = swipeGames.map((game, index) => {
                // Use besitosRawData if available, otherwise fallback to existing structure
                const rawData = game.besitosRawData || {};

                return {
                    id: game.id || game._id || game.gameId || `api-game-${index}`,
                    originalId: game.id || game._id || game.gameId,
                    title: rawData.title || game.name || game.title || game.details?.name || 'Game',
                    category: rawData.categories?.[0]?.name || game.categories?.[0] || 'Action',
                    // Use besitosRawData images first
                    image: rawData.square_image || rawData.image || game.image || game.square_image || game.background_image || game.icon || game.thumbnail || game.logo || game.banner,
                    backgroundImage: rawData.large_image || rawData.image || game.image || game.square_image || game.background_image || game.icon || game.thumbnail || game.logo || game.banner,
                    earnings: rawData.amount ? `$${rawData.amount}` : (game.amount ? `$${game.amount}` : (game.currency || '$5')),
                    xpPoints: game.rewards?.xp || game.xpRewardConfig?.baseXP || "50",
                    isDownloaded: false,
                    source: 'api',
                    fullData: game // Store full game including besitosRawData
                };
            });
            allGames.push(...apiGames);
        }

        // Add downloaded games
        if (inProgressGames && inProgressGames.length > 0) {
            const downloadedGames = inProgressGames.map((game, index) => ({
                id: game.id || game._id || `downloaded-game-${index}`,
                originalId: game.id || game._id,
                title: game.title || game.name || 'Downloaded Game',
                category: game.categories?.[0]?.name || 'Action',
                image: game.square_image || game.large_image || game.image,
                backgroundImage: game.large_image || game.image,
                earnings: game.amount ? `$${game.amount}` : '$5',
                xpPoints: "50",
                isDownloaded: true,
                source: 'downloaded',
                fullData: game // Store full game data for navigation
            }));
            allGames.push(...downloadedGames);
        }

        console.log('🎮 ListGame: Combined games:', {
            apiGames: swipeGames?.length || 0,
            downloadedGames: inProgressGames?.length || 0,
            totalGames: allGames.length
        });

        return allGames;
    }, [swipeGames, inProgressGames]);

    // Optimized: Memoized game click handler
    const handleGameClick = useCallback((game) => {
        console.log('🎮 ListGame: Game clicked:', {
            game,
            gameId: game.originalId,
            title: game.title || game.name || game.details?.name,
            isDownloaded: game.isDownloaded,
            source: game.source
        });

        // Clear Redux state BEFORE navigation to prevent showing old data
        dispatch({ type: 'games/clearCurrentGameDetails' });

        // Clear Redux state BEFORE navigation
        dispatch({ type: 'games/clearCurrentGameDetails' });

        if (game.isDownloaded && game.fullData) {
            // For downloaded games, use localStorage method
            console.log('🎮 ListGame: Navigating to downloaded game via localStorage');
            try {
                localStorage.setItem('selectedGameData', JSON.stringify(game.fullData));
            } catch (error) {
                console.error('❌ Failed to store game data:', error);
            }
            router.push(`/gamedetails?gameId=${game.originalId}&source=race`);
        } else {
            // For API games, store full data including besitosRawData
            if (game.fullData) {
                try {
                    localStorage.setItem('selectedGameData', JSON.stringify(game.fullData));
                    console.log('💾 [ListGame] Stored full game data with besitosRawData:', {
                        hasBesitosRawData: !!game.fullData.besitosRawData,
                        gameId: game.originalId
                    });
                } catch (error) {
                    console.error('❌ Failed to store game data:', error);
                }
            }

            const gameId = game.originalId || game.id;
            if (!gameId) {
                console.error('❌ ListGame: No game ID found:', game);
                return;
            }
            console.log('🎮 ListGame: Navigating to API game via gameId:', {
                gameId,
                hasBesitosRawData: !!game.fullData?.besitosRawData
            });
            router.push(`/gamedetails?gameId=${gameId}&source=race`);
        }
    }, [router, dispatch]);



    // Reuse existing game data from homepage - no need to fetch again
    // The games are already loaded in the homepage GameCard component
    // This prevents duplicate API calls and improves performance

    // Fallback: Only fetch if homepage hasn't loaded games yet and we're not already loading
    useEffect(() => {
        // Only fetch as fallback if no games are available and not currently loading
        if (swipeStatus === 'idle' && (!swipeGames || swipeGames.length === 0)) {
            console.log('[ListGame] Fallback: Fetching games data (homepage may not have loaded yet)...', {
                age: userProfile?.age,
                ageRange: userProfile?.ageRange,
                gender: userProfile?.gender
            });

            dispatch(fetchGamesBySection({
                uiSection: "Swipe",
                user: userProfile,
                page: 1,
                limit: 50  // Increased limit to get more games
            }));
        }
    }, [dispatch, swipeStatus, swipeGames, userProfile]);

    // Refresh games in background after showing cached data (to get admin updates)
    // Do this in background without blocking UI - show cached data immediately
    useEffect(() => {
        if (!userProfile) return;

        // Use setTimeout to refresh in background after showing cached data
        // This ensures smooth UX - cached data shows immediately, fresh data loads in background
        const refreshTimer = setTimeout(() => {
            console.log("🔄 [ListGame] Refreshing games in background to get admin updates...");
            dispatch(fetchGamesBySection({
                uiSection: "Swipe",
                user: userProfile,
                page: 1,
                limit: 50,
                force: true,
                background: true
            }));
        }, 100); // Small delay to let cached data render first

        return () => clearTimeout(refreshTimer);
    }, [dispatch, userProfile]);

    // Refresh games in background when app comes to foreground (admin might have updated)
    useEffect(() => {
        if (!userProfile) return;

        const handleFocus = () => {
            console.log("🔄 [ListGame] App focused - refreshing games to get admin updates");
            dispatch(fetchGamesBySection({
                uiSection: "Swipe",
                user: userProfile,
                page: 1,
                limit: 50,
                force: true,
                background: true
            }));
        };

        window.addEventListener("focus", handleFocus);

        const handleVisibilityChange = () => {
            if (!document.hidden && userProfile) {
                console.log("🔄 [ListGame] App visible - refreshing games to get admin updates");
                dispatch(fetchGamesBySection({
                    uiSection: "Swipe",
                    user: userProfile,
                    page: 1,
                    limit: 50,
                    force: true,
                    background: true
                }));
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [dispatch, userProfile]);

    // Loading timeout handling
    useEffect(() => {
        if (swipeStatus === 'loading') {
            const timeout = setTimeout(() => {
                setLoadingTimeout(true);
            }, 10000); // 10 second timeout

            return () => clearTimeout(timeout);
        } else {
            setLoadingTimeout(false);
        }
    }, [swipeStatus]);

    // REMOVED: Enhanced loading state for better Android UX - show content immediately
    // Games will load in background without blocking UI

    // REMOVED: Error state handling for better Android UX - show content immediately
    // Users can still interact with the app even if games fail to load

    return (
        <section className="relative w-full min-h-screen bg-black max-w-sm mx-auto flex flex-col items-center">
            {/* App Version */}
            <div className="absolute top-[8px] left-8 [font-family:'Poppins',Helvetica] font-light text-[#A4A4A4] text-[10px] tracking-[0] leading-3 whitespace-nowrap">
                App Version: V0.0.1
            </div>

            {/* Header */}
            <div className="flex flex-col w-full items-start gap-2 pl-7 pr-4 py-4 mt-[34px]">
                <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto] rounded-[32px]">
                    <button
                        aria-label="Go back"
                        className="flex items-center justify-center w-6 h-6 flex-shrink-0"
                        onClick={() => {
                            router.back();
                        }}
                    >
                        <svg
                            className="w-6 h-6 text-white cursor-pointer transition-transform duration-150 active:scale-95"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path
                                d="M15 18L9 12L15 6"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    <h1 className="flex-1 [font-family:'Poppins',Helvetica] font-semibold text-white text-xl tracking-[0] leading-5">
                        Select Game
                    </h1>
                </div>
            </div>

            {/* Game Grid - Centered with proper spacing */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-[335px] mx-auto px-4 mt-4 mb-12 pb-4">
                {recommendationCards.length > 0 ? (
                    recommendationCards.map((card) => (
                        <RecommendationCard
                            key={card.id}
                            card={card}
                            onCardClick={handleGameClick}
                        />
                    ))
                ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center py-6 px-4">
                        <h3 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-lg mb-2 text-center">
                            Gaming - Swipe
                        </h3>
                        <p className="[font-family:'Poppins',Helvetica] font-normal text-gray-400 text-sm text-center">
                            No games available
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};