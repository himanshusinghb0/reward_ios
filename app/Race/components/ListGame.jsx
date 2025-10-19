"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchGamesBySection } from "@/lib/redux/slice/gameSlice";

const RecommendationCard = React.memo(({ card, onCardClick }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    // Pre-compute image source for better performance
    const imageSrc = card.backgroundImage || card.image || '/game.png';

    return (
        <article
            className="flex flex-col w-full rounded-md overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-all duration-200"
            onClick={() => onCardClick(card)}
        >
            <div className="relative w-full aspect-square">
                <img
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={card.title || "Game promotion"}
                    src={imageSrc}
                    onError={handleImageError}
                />
                {imageError && (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
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
            <div className="flex flex-col h-[60px] p-2  bg-[linear-gradient(180deg,rgba(81,98,182,0.9)_0%,rgba(63,56,184,0.9)_100%)]">

                <div className="flex flex-col mt-auto">
                    <div className="flex items-center gap-1">
                        <p className="[font-family:'Poppins',Helvetica] font-medium text-white text-[14px]">Earn upto {card.earnings || "100"}</p>
                        <img className="w-[18px] h-[19px]" alt="Coin" src="/dollor.png" />
                    </div>
                    <div className="flex items-center gap-1">
                        <p className="[font-family:'Poppins',Helvetica] font-medium text-white text-[14px]">and {card.xpPoints || "50"}</p>
                        <img className="w-[21px] h-[16px]" alt="Reward icon" src="/xp.svg" />
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

    // Extract games from the "Swipe" section (since that's what we're fetching)
    const swipeGames = gamesBySection?.["Swipe"] || [];
    const swipeStatus = gamesBySectionStatus?.["Swipe"] || "idle";

    // Debug logging
    console.log('🎮 ListGame Debug:', {
        gamesBySection,
        gamesBySectionStatus,
        swipeGames: swipeGames?.length || 0,
        swipeStatus,
        inProgressGames: inProgressGames?.length || 0
    });

    // Optimized: Pre-compute games data with both API games and downloaded games
    const recommendationCards = useMemo(() => {
        const allGames = [];

        // Add API games (not downloaded)
        if (swipeGames && swipeGames.length > 0) {
            const apiGames = swipeGames.map((game, index) => ({
                id: game.id || game._id || `api-game-${index}`,
                originalId: game.id || game._id,
                title: game.name || game.title || 'Game',
                category: game.categories?.[0] || 'Action',
                image: game.image || game.square_image || game.background_image || game.icon || game.thumbnail || game.logo || game.banner,
                backgroundImage: game.image || game.square_image || game.background_image || game.icon || game.thumbnail || game.logo || game.banner,
                earnings: game.amount ? `$${game.amount}` : (game.currency || '$5'),
                xpPoints: "50",
                isDownloaded: false,
                source: 'api'
            }));
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

        if (game.isDownloaded && game.fullData) {
            // For downloaded games, use localStorage method
            console.log('🎮 ListGame: Navigating to downloaded game via localStorage');
            localStorage.setItem('selectedGameData', JSON.stringify(game.fullData));
            router.push(`/gamedetails?id=${game.originalId}`);
        } else {
            // For API games, use normal navigation
            const gameId = game.originalId;
            if (!gameId) {
                console.error('❌ ListGame: No game ID found:', game);
                return;
            }
            console.log('🎮 ListGame: Navigating to API game via gameId');
            router.push(`/gamedetails?gameId=${gameId}`);
        }
    }, [router, dispatch]);

    // Optimized: Simplified scale handling for mobile
    useEffect(() => {
        const updateScale = () => {
            const width = window.innerWidth;
            if (width >= 768) setCurrentScaleClass("scale-150");
            else if (width >= 640) setCurrentScaleClass("scale-120");
            else if (width >= 480) setCurrentScaleClass("scale-125");
            else if (width >= 375) setCurrentScaleClass("scale-100");
            else setCurrentScaleClass("scale-90");
        };
        updateScale();
    }, []);

    // Reuse existing game data from homepage - no need to fetch again
    // The games are already loaded in the homepage GameCard component
    // This prevents duplicate API calls and improves performance

    // Fallback: Only fetch if homepage hasn't loaded games yet and we're not already loading
    useEffect(() => {
        // Only fetch as fallback if no games are available and not currently loading
        if (swipeStatus === 'idle' && (!swipeGames || swipeGames.length === 0)) {
            console.log('[ListGame] Fallback: Fetching games data (homepage may not have loaded yet)...');
            dispatch(fetchGamesBySection({
                uiSection: "Swipe",
                ageGroup: "18-24",
                gender: "male",
                page: 1,
                limit: 50  // Increased limit to get more games
            }));
        }
    }, [dispatch, swipeStatus, swipeGames]);

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
        <section className="flex flex-col justify-center items-center gap-2 w-full">
            <div className="absolute w-full h-[49px] top-0 left-0 z-10 px-5">
                <div className="absolute top-[10px] left-5 [font-family:'Poppins',Helvetica] font-normal text-white text-[10px] tracking-[0] leading-3 whitespace-nowrap">
                    App Version: V0.0.1
                </div>
            </div>
            <header className="flex flex-col w-[375px] items-start gap-2 px-5 py-6 absolute top-[14px] left-0">
                <nav className="items-center gap-4 self-stretch w-full rounded-[32px] flex relative flex-[0_0_auto]">
                    <button
                        aria-label="Go back"
                        onClick={() => {
                            router.back();
                        }}
                    >
                        <svg
                            className="relative w-6 h-6 text-white cursor-pointer transition-transform duration-150 active:scale-95"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path
                                d="M15 18l-6-6 6-6"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </svg>
                    </button>

                    <h1 className="relative w-[255px] [font-family:'Poppins',Helvetica] font-semibold text-white text-xl tracking-[0] leading-5">
                        Select Game
                    </h1>
                </nav>
            </header>
            <div className="grid grid-cols-2 gap-4 w-full max-w-[400px] mx-auto px-4 mt-20 mb-8">
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
                        <h4 className="[font-family:'Poppins',Helvetica] font-semibold text-[#F4F3FC] text-[14px] text-center mb-2">
                            No Games Available
                        </h4>
                        <p className="[font-family:'Poppins',Helvetica] text-[#F4F3FC]/70 text-[12px] text-center">
                            {swipeStatus === 'loading'
                                ? 'Loading games...'
                                : 'No games found. Try downloading some games first or check back later for new games.'}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};