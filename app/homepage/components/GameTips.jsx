"use client";
import React, { useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { fetchGamesBySection } from '@/lib/redux/slice/gameSlice'

export const Frame = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    // Use new game discovery API for Game Tips section
    const gamesBySection = useSelector((state) => state.games.gamesBySection)
    const gamesBySectionStatus = useSelector((state) => state.games.gamesBySectionStatus)

    // Fetch game tips on component mount
    // Using "Swipe" section as it's a reliable section that should have games
    // If backend has "Game Tips" section configured, it can be changed back
    useEffect(() => {
        dispatch(fetchGamesBySection({
            uiSection: "Swipe",
            ageGroup: "18-24",
            gender: "male",
            page: 1,
            limit: 10
        }));
    }, [dispatch]);

    // Memoize the game tips from the new API
    const gameTips = useMemo(() => {
        const swipeGames = gamesBySection?.["Swipe"] || [];
        // Try "Game Tips" first if it exists, otherwise use "Swipe"
        const gameTipsGames = gamesBySection?.["Game Tips"] || [];
        const allGames = gameTipsGames.length > 0 ? gameTipsGames : swipeGames;

        return allGames.slice(0, 2).map((game, index) => {
            // Clean and format title
            const rawTitle = game?.title || game?.details?.name || 'Game';
            const cleanTitle = rawTitle
                .replace(/\s*Android\s*/gi, '') // Remove "Android" text
                .replace(/-/g, ' ')             // Replace hyphens with spaces
                .split(' - ')[0]                // Remove platform suffix after "-"
                .trim();

            // Format description - more readable
            const rawDesc = game.details?.description || game.description || "Discover an amazing gaming experience";
            let cleanDesc = rawDesc.trim();
            // Capitalize first letter
            cleanDesc = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
            // Truncate at word boundary (max ~60 chars)
            if (cleanDesc.length > 60) {
                const truncated = cleanDesc.substring(0, 57);
                const lastSpace = truncated.lastIndexOf(' ');
                cleanDesc = lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
            }

            return {
                id: game._id || game.id || `game-tip-${index}`,
                title: cleanTitle,
                description: cleanDesc,
                image: game.images?.icon || game.icon || game.square_image || game.image || '/placeholder-game.png',
                imageType: index === 0 ? "bg" : "img",
                game: game // Store the full game object for navigation
            };
        });
    }, [gamesBySection]);

    // Handle game click - navigate to game tips details page
    const handleGameClick = (game) => {
        console.log('🎮 Game Tips: Navigating to game tips details for:', game.details?.name || game.title || game.name);

        // Get game title for the tips page
        const gameTitle = (() => {
            const title = game?.title || game?.details?.name || game?.name || 'Game';
            return title
                .replace(/\s*Android\s*/gi, '')
                .replace(/-/g, ' ')
                .split(' - ')[0]
                .trim();
        })();

        // Get game image
        const gameImage = game.images?.icon || game.icon || game.square_image || game.image || '';

        // Get game category
        const gameCategory = game.details?.category || (game.categories && game.categories.length > 0
            ? (typeof game.categories[0] === 'object' ? game.categories[0].name || 'Casual' : game.categories[0])
            : 'Casual');

        router.push(`/game-tips-details?title=${encodeURIComponent(gameTitle)}&image=${encodeURIComponent(gameImage)}&category=${encodeURIComponent(gameCategory)}`);
    };

    // Show loading state if games are still loading
    const swipeStatus = gamesBySectionStatus?.["Swipe"];
    const isLoading = swipeStatus === 'loading';

    if (isLoading) {
        return (
            <section
                className="inline-flex flex-col items-start gap-2.5 relative"
                data-model-id="2035:19059"
                aria-labelledby="game-tips-heading"
            >
                <header className="flex items-center justify-around gap-[49px] relative self-stretch w-full flex-[0_0_auto]">
                    <h1
                        id="game-tips-heading"
                        className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-semibold text-white-f4f3fc text-xl tracking-[0] leading-[normal]"
                    >
                        🧩 Game Tips ⛳
                    </h1>
                </header>
                <div className="flex items-start gap-5 pt-0 pb-2.5 px-5 relative self-stretch w-full">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex flex-col w-[158px] rounded-md overflow-hidden shadow-lg animate-pulse">
                            <div className="w-[158px] h-[120px] bg-gray-700"></div>
                            <div className="h-[111px] bg-gray-700"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Show message if no games available after section has loaded
    const swipeLoaded = swipeStatus === 'succeeded' || swipeStatus === 'failed';
    const hasNoData = gameTips.length === 0 && swipeLoaded;

    if (hasNoData) {
        return (
            <section
                className="inline-flex flex-col items-start gap-2.5 relative"
                data-model-id="2035:19059"
                aria-labelledby="game-tips-heading"
            >
                <header className="flex items-center justify-around gap-[49px] relative self-stretch w-full flex-[0_0_auto]">
                    <h1
                        id="game-tips-heading"
                        className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-semibold text-white-f4f3fc text-xl tracking-[0] leading-[normal]"
                    >
                        🧩 Game Tips ⛳
                    </h1>
                </header>
                <div className="flex h-[229px] items-start gap-5 pt-0 pb-2.5 px-5 relative self-stretch w-full">
                    <p className="text-gray-400 text-sm">No game tips available</p>
                </div>
            </section>
        );
    }

    return (
        <section
            className="inline-flex flex-col items-start gap-2.5 relative"
            data-model-id="2035:19059"
            aria-labelledby="game-tips-heading"
        >
            <header className="flex items-center justify-around gap-[49px] relative self-stretch w-full flex-[0_0_auto]">
                <h1
                    id="game-tips-heading"
                    className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-semibold text-white text-xl tracking-[0] leading-[normal]"
                >
                    🧩 Game Tips ⛳
                </h1>
            </header>
            <div className="flex items-start gap-5 pt-0 pb-2.5 px-5 relative self-stretch w-full">
                {gameTips.map((tip) => (
                    <article
                        key={tip.id}
                        className="flex flex-col w-[158px] rounded-md overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-all duration-200"
                        onClick={() => handleGameClick(tip.game)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleGameClick(tip.game);
                            }
                        }}
                        aria-label={`View tips for ${tip.title}`}
                    >
                        {/* Image Section - 120px height as per Figma */}
                        <div className="relative w-[158px] h-[120px] flex-shrink-0">
                            {tip.imageType === "bg" ? (
                                <div
                                    className="w-full h-full bg-cover bg-center rounded-t-[12px]"
                                    style={{ backgroundImage: `url(${tip.image})` }}
                                    role="img"
                                    aria-label={tip.title}
                                />
                            ) : (
                                <img
                                    className="absolute inset-0 w-full h-full object-cover rounded-t-[12px]"
                                    alt={tip.title}
                                    src={tip.image}
                                    loading="lazy"
                                />
                            )}
                        </div>

                        {/* Content Section - 111px height as per Figma */}
                        <div className="flex flex-col h-[111px] p-2.5 bg-[linear-gradient(180deg,rgba(81,98,182,0.9)_0%,rgba(63,56,184,0.9)_100%)] flex-shrink-0 rounded-b-[12px]">
                            <div className="flex flex-col gap-1 flex-1">
                                <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-sm leading-tight line-clamp-1 mb-0.5">
                                    {tip.title}
                                </h2>
                                <p className="[font-family:'Poppins',Helvetica] font-light text-white text-[12px] leading-[1.4] line-clamp-3 flex-1">
                                    {tip.description}
                                </p>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleGameClick(tip.game);
                                    }}
                                    className="[font-family:'Poppins',Helvetica] font-semibold text-[#9eadf7] text-xs leading-4 hover:text-[#b8c5ff] transition-colors mt-auto"
                                    aria-label={`Read more about ${tip.title}`}
                                >
                                    More...
                                </a>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

