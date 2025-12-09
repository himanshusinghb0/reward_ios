"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchNonGameOffers } from "@/lib/redux/slice/surveysSlice";

const NonGameOffersSection = () => {
    const { token } = useAuth();
    const dispatch = useDispatch();
    const [activesIndex, setActivesIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const MIN_SWIPE_DISTANCE = 50;

    // Get non-game offers from Redux store
    const { nonGameOffers, nonGameOffersStatus, nonGameOffersError } = useSelector((state) => state.surveys);

    // Fetch non-game offers on mount and when token changes
    // Uses stale-while-revalidate: shows cached data immediately, fetches fresh if needed
    useEffect(() => {
        if (!token) return;

        // Fetch cashback and shopping offers only (will use cache if available and fresh)
        dispatch(fetchNonGameOffers({ token, offerType: "cashback_shopping" }));
    }, [token, dispatch]);

    // Refresh offers in background after showing cached data (to get admin updates)
    // Do this in background without blocking UI - show cached data immediately
    useEffect(() => {
        if (!token) return;

        // Use setTimeout to refresh in background after showing cached data
        // This ensures smooth UX - cached data shows immediately, fresh data loads in background
        const refreshTimer = setTimeout(() => {
            console.log("🔄 [NonGameOffersSection] Refreshing non-game offers in background to get admin updates...");
            dispatch(fetchNonGameOffers({ token, force: true, background: true, offerType: "cashback_shopping" }));
        }, 100); // Small delay to let cached data render first

        return () => clearTimeout(refreshTimer);
    }, [token, dispatch]);

    // Refresh offers in background when app comes to foreground (admin might have updated)
    useEffect(() => {
        if (!token) return;

        const handleFocus = () => {
            console.log("🔄 [NonGameOffersSection] App focused - refreshing offers to get admin updates");
            dispatch(fetchNonGameOffers({ token, force: true, background: true, offerType: "cashback_shopping" }));
        };

        window.addEventListener("focus", handleFocus);

        const handleVisibilityChange = () => {
            if (!document.hidden && token) {
                console.log("🔄 [NonGameOffersSection] App visible - refreshing offers to get admin updates");
                dispatch(fetchNonGameOffers({ token, force: true, background: true, offerType: "cashback_shopping" }));
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [token, dispatch]);

    // Reset active index when offers change
    useEffect(() => {
        if (nonGameOffers && nonGameOffers.length > 0) {
            setActivesIndex(0);
        }
    }, [nonGameOffers?.length]);

    const totalsCards = nonGameOffers?.length || 0;

    const handleOfferClick = (offer) => {
        console.log('Offer clicked:', offer.title || offer.merchant_name || offer.anchor);

        // For shopping offers, use metadata.externalUrl, otherwise use clickUrl/click_url/deepLink
        let clickUrl;
        if (offer.type === "shopping" || offer.offerType === "shopping") {
            clickUrl = offer.metadata?.externalUrl || offer.clickUrl || offer.click_url || offer.deepLink;
        } else {
            clickUrl = offer.clickUrl || offer.click_url || offer.deepLink;
        }

        if (clickUrl) {
            window.open(clickUrl, '_blank', 'noopener,noreferrer');
        } else {
            console.error('❌ Offer has no clickUrl');
        }
    };

    // Touch handlers for circular swipe
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd || isAnimating) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
        const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

        if (isLeftSwipe && nonGameOffers && nonGameOffers.length > 0) {
            setIsAnimating(true);
            setActivesIndex((prev) => (prev + 1) % nonGameOffers.length);
            setTimeout(() => setIsAnimating(false), 400);
        }
        if (isRightSwipe && nonGameOffers && nonGameOffers.length > 0) {
            setIsAnimating(true);
            setActivesIndex((prev) => (prev - 1 + nonGameOffers.length) % nonGameOffers.length);
            setTimeout(() => setIsAnimating(false), 400);
        }
    };

    // Circular rotation calculation
    const getCardTransform = (index, totalCards) => {
        const currentIndex = activesIndex;
        let offset = index - currentIndex;

        // Handle circular wrapping for smooth rotation
        if (offset > totalCards / 2) {
            offset = offset - totalCards;
        } else if (offset < -totalCards / 2) {
            offset = offset + totalCards;
        }

        // Calculate circular position with 3D effect
        const angle = (offset * 50) * (Math.PI / 180);
        const radius = 70;
        const x = Math.sin(angle) * radius;
        const scale = 0.8 + (1 - Math.abs(offset) * 0.2);
        const opacity = 1 - Math.abs(offset) * 0.5;

        return {
            transform: `translateX(calc(-50% + ${x}px)) scale(${scale})`,
            opacity: Math.max(opacity, 0.4),
            zIndex: totalCards - Math.abs(offset),
        };
    };

    // Get reward display based on offer type
    const getRewardDisplay = (offer) => {
        if (offer.type === "cashback") {
            return offer.cashback ? `${offer.cashback} ${offer.currency || ""}` : `${offer.coinReward || offer.userRewardCoins || 0}`;
        } else if (offer.type === "shopping") {
            return offer.total_points || `${offer.coinReward || offer.userRewardCoins || 0}`;
        } else if (offer.type === "magic_receipt") {
            return offer.total_points || `${offer.coinReward || offer.userRewardCoins || 0}`;
        } else {
            return offer.coinReward || offer.userRewardCoins || 0;
        }
    };

    // Get time display based on offer type
    const getTimeDisplay = (offer) => {
        if (offer.type === "cashback") {
            return offer.reward_delay_days ? `${offer.reward_delay_days}d` : offer.estimatedTime || "1m";
        } else if (offer.type === "shopping") {
            return offer.estimatedTime ? `${offer.estimatedTime}m` : "1m";
        } else if (offer.type === "magic_receipt") {
            return offer.confirmation_time || offer.estimatedTime ? `${offer.estimatedTime || 2}m` : "2m";
        } else {
            return offer.estimatedTime ? `${offer.estimatedTime}m` : "1m";
        }
    };

    // Show loading state (only if no cached data)
    if (nonGameOffersStatus === "loading" && (!nonGameOffers || nonGameOffers.length === 0)) {
        return (
            <div className="flex w-full flex-col my-1 items-start gap-3 relative">
                <div className="flex w-full items-center justify-between">
                    <p className="[font-family:'Poppins',Helvetica] text-[16px] font-semibold leading-[normal] tracking-[0] text-[#FFFFFF]">
                        Earn More Rewards
                    </p>
                </div>
                <div className="relative flex h-[190px] rounded-[10px] w-full items-center justify-center">
                    <p className="text-white text-sm">Loading offers...</p>
                </div>
            </div>
        );
    }

    // Show error state (only if we have an error and no offers)
    if (nonGameOffersStatus === "failed" && (!nonGameOffers || nonGameOffers.length === 0)) {
        return (
            <div className="flex w-full flex-col my-1 items-start gap-3 relative">
                <div className="flex w-full items-center justify-between">
                    <p className="[font-family:'Poppins',Helvetica] text-[16px] font-semibold leading-[normal] tracking-[0] text-[#FFFFFF]">
                        Earn More Rewards
                    </p>
                </div>
                <div className="relative flex h-[190px] rounded-[10px] w-full items-center justify-center">
                    <p className="text-gray-400 text-sm">
                        {nonGameOffersError || "No offers available at the moment"}
                    </p>
                </div>
            </div>
        );
    }

    // Show empty state if no offers but not loading/error
    if (!nonGameOffers || nonGameOffers.length === 0) {
        return (
            <div className="flex w-full flex-col my-1 items-start gap-3 relative">
                <div className="flex w-full items-center justify-between">
                    <p className="[font-family:'Poppins',Helvetica] text-lg font-semibold leading-[normal] tracking-[0] text-[#FFFFFF]">
                        Non-gaming Offer
                    </p>
                </div>
                <div className="relative flex h-[190px] rounded-[10px] w-full items-center justify-center">
                    <p className="text-gray-400 text-sm">
                        No offers available at the moment
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-between items-center transition-transform pt-4 px-2 mb-4 duration-200 ease-in-out">
            <section className="flex flex-col w-full max-w-[335px] justify-center items-start gap-2.5 mx-auto">
                <h3 className="font-semibold text-[#F4F3FC] pb-12 mr-26 text-lg  opacity-[100%]">
                    Non-gaming Offer
                </h3>
                <div
                    className="flex items-center gap-[15px] w-full overflow-visible px-2 relative mt-4"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="flex items-center gap-[15px] w-full relative" style={{ height: '200px', perspective: '1000px' }}>
                        {nonGameOffers.length > 0 ? nonGameOffers.map((offer, index) => {
                            // Get offer image - for cashback use images.cardImage, for shopping use metadata.thumbnail, otherwise use banner/icon
                            let offerImage;
                            if (offer.type === "cashback" && offer.images) {
                                offerImage = offer.images.cardImage || offer.images.backgroundImage || offer.images.cardImageSmall || "https://static.bitlabs.ai/categories/other.svg";
                            } else if (offer.type === "shopping" || offer.offerType === "shopping") {
                                offerImage = offer.metadata?.thumbnail || offer.banner || offer.icon || offer.category?.icon_url || "https://static.bitlabs.ai/categories/other.svg";
                            } else {
                                offerImage = offer.banner || offer.icon || offer.category?.icon_url || "https://static.bitlabs.ai/categories/other.svg";
                            }

                            // Get coins and XP
                            const coins = offer.coinReward || offer.userRewardCoins || 0;
                            const xp = offer.userRewardXP || 0;
                            const rewardDisplay = getRewardDisplay(offer);
                            const timeDisplay = getTimeDisplay(offer);

                            // Get category for cashback
                            const category = offer.type === "cashback" ? (offer.primary_category || offer.category?.name || "") : "";

                            // Calculate positioning for circular animation - same size as survey cards
                            const cardWidth = 'w-28';
                            const cardHeight = 'min-h-[180px]'; // Same size as survey cards
                            const imageHeight = 'h-[110px]';
                            const bannerHeight = 'h-[50px]'; // Same banner height as survey cards

                            // Get circular transform
                            const circularTransform = getCardTransform(index, nonGameOffers.length);
                            const isActive = index === activesIndex;

                            const cardStyle = {
                                position: 'absolute',
                                left: '50%',
                                ...circularTransform,
                                transition: isAnimating ? 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'all 0.3s ease-out',
                            };

                            return (
                                <article
                                    key={offer.id || offer.externalId || index}
                                    className={`relative ${cardWidth} ${cardHeight} flex-shrink-0 cursor-pointer ${isActive ? 'hover:scale-110' : 'hover:scale-105'} transition-all duration-200`}
                                    style={cardStyle}
                                    onClick={() => {
                                        if (index !== activesIndex) {
                                            setIsAnimating(true);
                                            setActivesIndex(index);
                                            setTimeout(() => setIsAnimating(false), 400);
                                        } else {
                                            handleOfferClick(offer);
                                        }
                                    }}
                                >
                                    {/* Unified Card Container */}
                                    <div className={`relative ${cardWidth} rounded-[15px] overflow-hidden border-2 border-white/20 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg`}>
                                        {/* Offer Image Section - Same as survey */}
                                        <div className={`relative w-full ${imageHeight} bg-gradient-to-br from-gray-800 to-gray-900 ${(offer.type === "cashback" || offer.type === "shopping" || offer.offerType === "shopping") ? 'overflow-hidden' : 'flex items-center justify-center'}`}>
                                            {offer.type === "cashback" ? (
                                                <>
                                                    <img
                                                        className="w-full h-full object-cover"
                                                        src={offerImage}
                                                        alt={offer.merchant_name || "Cashback Offer"}
                                                        onError={(e) => {
                                                            e.target.src = "https://static.bitlabs.ai/categories/other.svg";
                                                        }}
                                                    />
                                                    {/* Merchant name overlay on image */}
                                                    {offer.merchant_name && (
                                                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm">
                                                            <p className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[8px] tracking-[0] leading-tight text-center truncate">
                                                                {offer.merchant_name}
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (offer.type === "shopping" || offer.offerType === "shopping") ? (
                                                <>
                                                    <img
                                                        className="w-full h-full object-cover"
                                                        src={offerImage}
                                                        alt={offer.anchor || offer.title || "Shopping Offer"}
                                                        onError={(e) => {
                                                            e.target.src = "https://static.bitlabs.ai/categories/other.svg";
                                                        }}
                                                    />
                                                    {/* Anchor/title overlay on image */}
                                                    {offer.anchor && (
                                                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm">
                                                            <p className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[8px] tracking-[0] leading-tight text-center truncate">
                                                                {offer.anchor}
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <img
                                                    className="w-[64px] h-[64px] object-contain"
                                                    src={offerImage}
                                                    alt={offer.title || "Offer"}
                                                    onError={(e) => {
                                                        e.target.src = "https://static.bitlabs.ai/categories/other.svg";
                                                    }}
                                                />
                                            )}
                                            {/* Overlay to ensure visibility */}
                                            <div className="absolute inset-0 bg-black/10" />
                                        </div>

                                        {/* Gradient Banner Section - Same structure as survey */}
                                        <div
                                            className={`relative w-full ${bannerHeight} overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)] flex flex-col justify-center px-3 py-0.5`}
                                            role="banner"
                                            aria-label="Offer rewards banner"
                                        >
                                            {/* Top Row - Cashback value and Reward delay (similar to coins and time in survey) */}
                                            {offer.type === "cashback" ? (
                                                <div className="flex items-center justify-between w-full gap-1">
                                                    <div className="flex flex-col items-start flex-1 min-w-0">
                                                        <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[8px] tracking-[0] leading-tight">
                                                            Cashback
                                                        </span>
                                                        <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[9px] tracking-[0] leading-tight truncate w-full">
                                                            {offer.cashback || offer.original_cashback || "0"}% {offer.currency || ""}
                                                        </span>
                                                    </div>
                                                    {/* Reward delay on the right (like time in survey) */}
                                                    {offer.reward_delay_days !== undefined && offer.reward_delay_days !== null && (
                                                        <div className="flex flex-col items-end flex-shrink-0">
                                                            <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[8px] tracking-[0] leading-tight">
                                                                Delay
                                                            </span>
                                                            <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[9px] tracking-[0] leading-tight">
                                                                {offer.reward_delay_days}d
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (offer.type === "shopping" || offer.offerType === "shopping") ? (
                                                <div className="flex items-center justify-between w-full gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[11px] tracking-[0] leading-[normal]">
                                                            {coins}
                                                        </span>
                                                        {coins > 0 && (
                                                            <img
                                                                className="w-[11px] h-[11px] aspect-[0.97]"
                                                                alt="Dollar coin icon"
                                                                src="/dollor.png"
                                                            />
                                                        )}
                                                    </div>
                                                    {/* Time indicator in minutes */}
                                                    {offer.estimatedTime !== undefined && offer.estimatedTime !== null && (
                                                        <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-[11px] tracking-[0] leading-[normal]">
                                                            {offer.estimatedTime} min
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-1">
                                                        <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[11px] tracking-[0] leading-[normal]">
                                                            {coins}
                                                        </span>
                                                        {coins > 0 && (
                                                            <img
                                                                className="w-[11px] h-[11px] aspect-[0.97]"
                                                                alt="Dollar coin icon"
                                                                src="/dollor.png"
                                                            />
                                                        )}
                                                    </div>
                                                    {/* Time indicator */}
                                                    {timeDisplay && (
                                                        <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-[11px] tracking-[0] leading-[normal]">
                                                            {timeDisplay}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Bottom Row - Category (similar to XP in survey) */}
                                            {offer.type === "cashback" ? (
                                                category && (
                                                    <div className="flex flex-col items-start w-full mt-0.5">
                                                        <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[8px] tracking-[0] leading-tight">
                                                            Category
                                                        </span>
                                                        <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[9px] tracking-[0] leading-tight truncate w-full">
                                                            {category}
                                                        </span>
                                                    </div>
                                                )
                                            ) : (
                                                xp > 0 && (
                                                    <div className="flex items-center justify-start w-full mt-0">
                                                        <div className="flex items-center gap-1">
                                                            <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[11px] tracking-[0] leading-[normal]">
                                                                {xp}
                                                            </span>
                                                            <img
                                                                className="w-[11px] h-[11px]"
                                                                alt="XP points icon"
                                                                src="/xp.svg"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            {/* Magic Receipt Specific Info */}
                                            {offer.type === "magic_receipt" && (
                                                <>
                                                    {offer.anchor && (
                                                        <div className="flex items-center justify-start w-full mt-0.5">
                                                            <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[10px] tracking-[0] leading-[normal] truncate">
                                                                {offer.anchor}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {offer.confirmation_time && (
                                                        <div className="flex items-center justify-start w-full mt-0.5">
                                                            <span className="[font-family:'Poppins',Helvetica] font-normal text-white/90 text-[9px] tracking-[0] leading-[normal]">
                                                                {offer.confirmation_time}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {offer.total_points && (
                                                        <div className="flex items-center justify-start w-full mt-0.5">
                                                            <span className="[font-family:'Poppins',Helvetica] font-normal text-white/90 text-[9px] tracking-[0] leading-[normal]">
                                                                {offer.total_points} points
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* Bottom Row - XP */}

                                        </div>
                                    </div>
                                </article>
                            );
                        }) : (
                            <div className="w-full flex flex-col items-center justify-center py-6 px-4">
                                <h4 className="[font-family:'Poppins',Helvetica] font-semibold text-[#F4F3FC] text-[14px] text-center mb-2">
                                    No Offers Available
                                </h4>
                                <p className="[font-family:'Poppins',Helvetica] font-normal text-white text-[12px] text-center opacity-90">
                                    Check back later for new opportunities!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NonGameOffersSection;

