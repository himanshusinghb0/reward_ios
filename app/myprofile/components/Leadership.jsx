import React, { useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { handleGameDownload } from '@/lib/gameDownloadUtils'
import { fetchGamesBySection } from '@/lib/redux/slice/gameSlice'
// Removed getAgeGroupFromProfile and getGenderFromProfile - now passing user object directly

const Leadership = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    // Use new game discovery API for Leadership section
    const gamesBySection = useSelector((state) => state.games.gamesBySection)
    const gamesBySectionStatus = useSelector((state) => state.games.gamesBySectionStatus)
    const { details: userProfile } = useSelector((state) => state.profile)

    // STALE-WHILE-REVALIDATE: Always fetch - will use cache if available and fresh
    useEffect(() => {
        console.log('🎮 Leadership: Using user profile:', {
            age: userProfile?.age,
            ageRange: userProfile?.ageRange,
            gender: userProfile?.gender
        });

        // Always dispatch - stale-while-revalidate will handle cache logic automatically
        // Pass user object directly - API will extract age and gender dynamically
        // This ensures:
        // 1. Shows cached data immediately if available (< 5 min old)
        // 2. Refreshes in background if cache is stale or 80% expired
        // 3. Fetches fresh if no cache exists
        dispatch(fetchGamesBySection({
            uiSection: "Leadership",
            user: userProfile,
            page: 1,
            limit: 10
        }));
    }, [dispatch, userProfile]);

    // Refresh games in background after showing cached data (to get admin updates)
    // Do this in background without blocking UI - show cached data immediately
    useEffect(() => {
        if (!userProfile) return;

        // Use setTimeout to refresh in background after showing cached data
        // This ensures smooth UX - cached data shows immediately, fresh data loads in background
        const refreshTimer = setTimeout(() => {
            console.log("🔄 [Leadership] Refreshing games in background to get admin updates...");
            dispatch(fetchGamesBySection({
                uiSection: "Leadership",
                user: userProfile,
                page: 1,
                limit: 10,
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
            console.log("🔄 [Leadership] App focused - refreshing games to get admin updates");
            dispatch(fetchGamesBySection({
                uiSection: "Leadership",
                user: userProfile,
                page: 1,
                limit: 10,
                force: true,
                background: true
            }));
        };

        window.addEventListener("focus", handleFocus);

        const handleVisibilityChange = () => {
            if (!document.hidden && userProfile) {
                console.log("🔄 [Leadership] App visible - refreshing games to get admin updates");
                dispatch(fetchGamesBySection({
                    uiSection: "Leadership",
                    user: userProfile,
                    page: 1,
                    limit: 10,
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

    // Memoize the leadership games from the new API
    const leadershipGames = useMemo(() => {
        const allGames = gamesBySection?.["Leadership"] || [];
        return allGames.slice(0, 2);
    }, [gamesBySection]);

    // Handle game click - navigate to game details
    const handleGameClick = (game) => {
        const rawData = game.besitosRawData || {};
        console.log('🎮 Leadership Games: Navigating to game details for:', rawData.title || game.details?.name || game.title || game.name);

        // Clear Redux state BEFORE navigation to prevent showing old data
        dispatch({ type: 'games/clearCurrentGameDetails' });

        // Store full game data including besitosRawData in localStorage
        try {
            localStorage.setItem('selectedGameData', JSON.stringify(game));
            console.log('💾 [Leadership] Stored full game data with besitosRawData:', {
                hasBesitosRawData: !!game.besitosRawData,
                gameId: game.id || game._id
            });
        } catch (error) {
            console.error('❌ Failed to store game data:', error);
        }

        // Use 'id' field first (as expected by API), fallback to '_id'
        const gameId = game.id || game._id || game.gameId;
        router.push(`/gamedetails?gameId=${gameId}&source=leadership`);
    };

    // Show loading state if games are still loading
    if (gamesBySectionStatus?.["Leadership"] === 'loading') {
        return (
            <section className="flex flex-col w-full max-w-[335px] items-start gap-2.5 mx-auto">
                <h3 className="font-semibold text-white text-base">Featured Games</h3>
                <div className="flex items-center gap-[15px] w-full">
                    {[1, 2].map((i) => (
                        <div key={i} className="relative w-40 h-[281px] animate-pulse">
                            <div className="w-40 h-[180px] bg-gray-700 rounded-[20px]"></div>
                            <div className="mt-4 space-y-2">
                                <div className="w-24 h-4 bg-gray-700 rounded"></div>
                                <div className="w-20 h-8 bg-gray-700 rounded-[10px]"></div>
                                <div className="w-16 h-3 bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Show message if no games available
    if (leadershipGames.length === 0) {
        return (
            <section className="flex flex-col w-full max-w-[335px] items-start gap-2.5 mx-auto">
                <h3 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-lg mb-2">
                    Gaming - Leadership
                </h3>
                <div className="flex items-center justify-center w-full h-32">
                    <p className="[font-family:'Poppins',Helvetica] font-normal text-gray-400 text-sm text-center">
                        No games available
                    </p>
                </div>
            </section>
        );
    }
    return (
        <section className="flex flex-col w-full max-w-[335px] items-start gap-2.5 mx-auto">
            {/* JACK_58: Ensure heading is present and styled */}
            <h3 className="font-semibold text-white text-base">Leadership</h3>

            <div className="flex items-center gap-[15px] w-full">
                {leadershipGames.map((game, index) => {
                    // Use besitosRawData if available
                    const rawData = game.besitosRawData || {};
                    const displayImage = rawData.square_image || rawData.image || game.images?.icon || game.icon || game.square_image || game.image || '/placeholder-game.png';
                    const displayTitle = rawData.title || game.details?.name || game.title || game.name || 'Game';

                    return (
                        <article
                            key={game._id || game.id || game.gameId || `game-${index}`}
                            className="relative w-40 h-[281px] cursor-pointer hover:scale-105 transition-all duration-200"
                            onClick={() => handleGameClick(game)}
                        >
                            <div
                                className="absolute w-40 h-[185px] top-0 left-0 bg-cover bg-center rounded-[16px]"
                                style={{
                                    backgroundImage: ` url(${displayImage})`,
                                }}
                            >
                                {/* <div className="relative w-[68px] h-[25px] top-3 left-[82px]">
                                <div className="relative w-[66px] h-[25px] bg-[#ffffff4f] rounded-[5.32px] backdrop-blur-[2.66px]">
                                    <Image
                                        width={13}
                                        height={10}
                                        className="absolute top-2 left-[7px]"
                                        alt="Views icon"
                                        src="https://c.animaapp.com/V1uc3arn/img/vector-2.svg"
                                    />
                                    <div className="absolute top-[3px] left-[25px] font-bold text-white text-[13px]">
                                        {game.amount && typeof game.amount === 'number' ? `$${game.amount}` : 'Free'}
                                    </div>
                                </div>
                            </div> */}
                            </div>

                            <div className="flex flex-col w-[154px] gap-2 absolute top-[196px] left-0">
                                <div className="flex flex-col gap-1">
                                    <h4 className="font-semibold text-white text-base">
                                        {(() => {
                                            const title = displayTitle;
                                            // Remove "Android" text from the title
                                            return title
                                                .replace(/\s*Android\s*/gi, '') // Removes "Android"
                                                .replace(/-/g, ' ')             // Replaces all hyphens with a space
                                                .trim();
                                        })()}
                                    </h4>

                                    <div className="w-[120px] h-[37px] rounded-[10px]  mb-6 overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)] flex items-center pl-2">
                                        <div className="font-medium text-white text-base">
                                            {rawData.categories?.[0]?.name || game.details?.category || (game.categories && game.categories.length > 0
                                                ? (typeof game.categories[0] === 'object' ? game.categories[0].name || 'Game' : game.categories[0])
                                                : 'Game')}
                                        </div>
                                    </div>

                                    {/* <div className="text-white text-[13px]">
                                    {game.categories && game.categories.length > 0
                                        ? (typeof game.categories[0] === 'object' ? game.categories[0].name || 'Entertainment' : game.categories[0])
                                        : 'Entertainment'}
                                </div> */}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    )
}

export default Leadership
