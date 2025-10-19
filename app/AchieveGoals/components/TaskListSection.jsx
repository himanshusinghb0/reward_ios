"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchGamesBySection } from "@/lib/redux/slice/gameSlice";

const RecommendationCard = ({ card, onCardClick }) => {
    return (
        <article
            className="flex flex-col w-[158px] rounded-md overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-all duration-200"
            onClick={() => onCardClick(card)}
        >
            <div className="relative w-[158px] h-[158px]">
                <img
                    className="absolute inset-0 w-full h-full object-fit"
                    alt="Game promotion"
                    src={card.image}
                />

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
};

export const TaskListSection = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [currentScaleClass, setCurrentScaleClass] = useState("scale-100");

    // Use new game discovery API for Cash Coach Recommendation section
    const { gamesBySection, gamesBySectionStatus } = useSelector((state) => state.games);

    // Get the specific section data and status
    const sectionKey = "Cash Coach Recommendation";
    const sectionGames = gamesBySection?.[sectionKey] || [];
    const sectionStatus = gamesBySectionStatus?.[sectionKey] || "idle";

    // Fetch Cash Coach Recommendation games on component mount
    useEffect(() => {
        // Only fetch if we don't have data and status is idle
        if (sectionStatus === "idle" && sectionGames.length === 0) {
            dispatch(fetchGamesBySection({
                uiSection: sectionKey,
                ageGroup: "18-24",
                gender: "male",
                page: 1,
                limit: 10
            }));
        }
    }, [dispatch, sectionStatus, sectionGames, sectionKey]);

    // Map the new API data to component format
    const recommendationCards = Array.isArray(sectionGames)
        ? sectionGames.slice(0, 2).map((game) => ({
            id: game._id || game.id,
            title: game.details?.name,
            category: game.details?.category || (typeof game.categories?.[0] === 'string' ? game.categories[0] : 'Action'),
            image: game.images?.icon,
            earnings: game.rewards?.coins ? `$${game.rewards.coins}` : (game.amount ? `$${game.amount}` : '$5'),
            xpPoints: game.rewards?.xp || "0"
        }))
        : [];

    // Handle game click - navigate to game details
    const handleGameClick = (game) => {
        // Clear Redux state BEFORE navigation to prevent showing old data
        dispatch({ type: 'games/clearCurrentGameDetails' });
        // Use 'id' field first (as expected by API), fallback to '_id'
        const gameId = game.id || game._id;
        router.push(`/gamedetails?gameId=${gameId}`);
    };


    // Show loading state if games are still loading AND we have no data
    if (sectionStatus === 'loading' && sectionGames.length === 0) {
        return (
            <section className="flex flex-col justify-center items-center gap-2 w-full">
                <header>
                    <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[20px]">
                        💸💸Recommendations💸💸
                    </h2>
                </header>
                <div className="flex items-start justify-center gap-3 self-stretch">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex flex-col w-[158px] rounded-md overflow-hidden shadow-lg animate-pulse">
                            <div className="w-[158px] h-[158px] bg-gray-700"></div>
                            <div className="h-[71px] bg-gray-700"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="flex flex-col justify-center items-center gap-2 w-full">
            <header>
                <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[20px]">
                    💸💸Recommendations💸💸
                </h2>
            </header>
            <div className="flex items-start justify-center gap-3 self-stretch">
                {recommendationCards.length > 0 ? (
                    recommendationCards.map((card) => (
                        <RecommendationCard
                            key={card.id}
                            card={card}
                            onCardClick={handleGameClick}
                        />
                    ))
                ) : (
                    <div className="w-full flex flex-col items-center justify-center py-6 px-4">
                        <h4 className="[font-family:'Poppins',Helvetica] font-semibold text-[#F4F3FC] text-[14px] text-center mb-2">
                            No Recommendations Available
                        </h4>

                    </div>
                )}
            </div>
        </section>
    );
};