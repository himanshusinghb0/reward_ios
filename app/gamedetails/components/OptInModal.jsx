import React, { useState, useEffect } from "react";


export const OptInModal = ({
    isVisible = false,
    onClose,
    sessionData = { sessionCoins: 0, sessionXP: 0 },
    game = null,
    isClaimed = false
}) => {
    // Calculate progress percentages
    const maxCoins = game?.amount || 0;
    const coinProgressPercentage = maxCoins > 0 ? (sessionData.sessionCoins / maxCoins) * 100 : 0;
    const maxXP = maxCoins > 0 ? Math.floor(maxCoins * 0.1) : 0;

    // Early return after all hooks
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-hidden">
            <div
                className="relative w-[335px] max-w-[calc(100vw-2rem)] bg-black rounded-[20px] border border-solid border-[#595959] overflow-y-auto max-h-[90vh] pb-8 scrollbar-hide"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitScrollbar: { display: 'none' },
                    overflow: '-moz-scrollbars-none',
                    overflowX: 'hidden'
                }}
            >
                {/* Header */}
                <header className="absolute top-0 left-0 w-[335px] h-[130px] flex rounded-[20px_20px_30px_30px] overflow-hidden shadow-[0px_4px_4px_#00000040] bg-[linear-gradient(180deg,rgba(51,0,72,1)_0%,rgba(144,74,188,1)_100%)]">
                    <h1 className="mt-[51px] w-[240px] h-[54px] ml-[42px] [text-shadow:0px_4px_4px_#00000040] [font-family:'Poppins',Helvetica] font-bold text-white text-lg text-start tracking-[0] leading-[normal]">
                        What is Opt-In/Opt-Out?
                        <br />
                        And how to claim my 🎁?
                    </h1>
                </header>


                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-[31px] h-[31px] hover:opacity-80 transition-opacity z-10"
                    aria-label="Close"
                    type="button"
                >
                    <img alt="Close" src="https://c.animaapp.com/hVj7UvM7/img/close.svg" />
                </button>

                {/* Introduction Content */}


                {/* Game Selection Instructions */}
                <section className="w-[303px] mt-36  px-4">
                    <p className="w-[303px] mb-3 [font-family:'Poppins',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal]">
                        We've introduced a new rewards system where users can earn extra
                        loyalty points by choosing opt-in to long-term campaigns.
                    </p>
                    <div className="flex items-start gap-3">
                        <img
                            className="w-11 h-11 aspect-[1] object-cover"
                            alt="Game controller icon"
                            src="https://c.animaapp.com/hVj7UvM7/img/image-4075@2x.png"
                        />
                        <div className="flex-1">
                            <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
                                Choose a Game & Opt-In to Earn More
                            </h2>
                            <ul className="mt-2 [font-family:'Poppins',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal] list-none">
                                <li>🎮 Select a game you enjoy and want to play consistently.</li>
                                <li>
                                    🎮 Opt-in campaigns offer boosted rewards compared to standard
                                    ones.
                                </li>
                                <li>
                                    🎮 Simply check the box and tap "Opt-In" to join the
                                    campaign.
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>


                {/* Campaign Steps - Using LevelsSection Card Style */}
                <section className="w-[303px] mt-8 px-4">
                    <div className="relative flex flex-col gap-4">
                        {/* Step 5: Complete Level 75 */}
                        <div className="flex items-center gap-3 w-full relative z-10">
                            {/* Level Number Circle */}
                            <div className="flex w-[43px] h-[43px] items-center justify-center rounded-full flex-shrink-0 relative bg-[#2f344a]">
                                <div className="font-semibold text-[#f4f3fc] text-[14.7px]">
                                    5
                                </div>
                            </div>

                            {/* Level Card */}
                            <div className="w-[256px] min-h-[75px] relative rounded-[10px] bg-[linear-gradient(180deg,rgba(255,0,238,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex flex-col justify-between p-2 pb-2">
                                {/* Top Row: Title and Reward */}
                                <div className="flex justify-between items-start gap-2 mb-1.5">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-normal text-[#f4f3fc] text-[13px] leading-tight line-clamp-2 pr-1">
                                            Complete Level 75
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <div className="font-semibold text-[15px] text-white">
                                            282
                                        </div>
                                        <img
                                            className="w-[19px] h-[20px]"
                                            alt="Reward Icon"
                                            src="https://c.animaapp.com/hVj7UvM7/img/image-3938@2x.png"
                                        />
                                    </div>
                                </div>

                                {/* Time Limit Row */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <img
                                            className="w-[14px] h-[14px] flex-shrink-0"
                                            alt="Clock"
                                            src="https://c.animaapp.com/hVj7UvM7/img/clock.svg"
                                        />
                                        <span className="font-normal text-[11px] text-[#f4f3fc]">
                                            72 hrs
                                        </span>
                                    </div>

                                    {/* XP Bonus */}
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-gray-400">XP:</span>
                                        <div className=" text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                            +50
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 6: Purchase 3 items in game */}
                        <div className="flex items-center gap-3 w-full relative z-10">
                            {/* Level Number Circle */}
                            <div className="flex w-[43px] h-[43px] items-center justify-center rounded-full flex-shrink-0 relative bg-[#2f344a]">
                                <div className="font-semibold text-[#f4f3fc] text-[14.7px]">
                                    6
                                </div>
                            </div>

                            {/* Level Card */}
                            <div className="w-[256px] min-h-[75px] relative rounded-[10px] bg-[linear-gradient(180deg,rgba(19,200,116,1)_0%,rgba(87,34,150,1)_100%)] flex flex-col justify-between p-2 pb-2">
                                {/* Top Row: Title and Reward */}
                                <div className="flex justify-between items-start gap-2 mb-1.5">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-normal text-[#f4f3fc] text-[13px] leading-tight line-clamp-2 pr-1">
                                            Purchase 3 items in game
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <div className="font-semibold text-[15px] text-white">
                                            410
                                        </div>
                                        <img
                                            className="w-[19px] h-[20px]"
                                            alt="Reward Icon"
                                            src="https://c.animaapp.com/hVj7UvM7/img/image-3938@2x.png"
                                        />
                                    </div>
                                </div>

                                {/* Time Limit Row */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <img
                                            className="w-[14px] h-[14px] flex-shrink-0"
                                            alt="Clock"
                                            src="https://c.animaapp.com/hVj7UvM7/img/clock.svg"
                                        />
                                        <span className="font-normal text-[11px] text-[#f4f3fc]">
                                            No limit
                                        </span>
                                    </div>

                                    {/* XP Bonus */}
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-gray-400">XP:</span>
                                        <div className=" text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                            +100
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center  ml-12">
                        <div className={`w-[210px] h-[30px] flex gap-[2px] ml-2 rounded-[0px_0px_10px_10px] overflow-hidden shadow-[0px_4px_4px_#00000040] bg-[linear-gradient(141deg,rgba(244,187,64,1)_0%,rgba(247,206,70,1)_64%,rgba(251,234,141,1)_80%,rgba(247,206,70,1)_98%)] ${isClaimed ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                            <p className="mt-1.5 w-[214px] h-[18px] ml-[16px] [text-shadow:0px_4px_4px_#00000040] [font-family:'Poppins',Helvetica] font-semibold text-black text-xs text-center tracking-[0] leading-[normal]">
                                Reach Here To Claim Your Rewards
                            </p>
                            <button
                                className={`mt-[5px] w-[24px] mr-2 h-[19px] flex items-center justify-center bg-[#716ae7] rounded-[100px] overflow-hidden hover:bg-[#5a52d4] transition-colors cursor-pointer ${isClaimed ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                            >
                                <div className="flex items-center justify-center w-full h-full [text-shadow:0px_4px_4px_#00000040] [font-family:'Poppins',Helvetica] font-bold text-white text-base text-center tracking-[0] leading-4 whitespace-nowrap">
                                    ﹖
                                </div>
                            </button>
                        </div>
                    </div>

                </section>

                {/* Important Notes */}
                <section className="flex flex-col w-[303px] items-center gap-2.5 mt-8 px-4">
                    <h2 className="relative self-stretch mt-[-1.00px] [font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
                        Important Notes
                    </h2>
                    <div className="relative w-[305px] h-[141px] ">
                        <img
                            className="absolute top-0 left-2 w-[303px] h-[141px]"
                            alt="Card background"
                            src="https://c.animaapp.com/hVj7UvM7/img/card@2x.png"
                        />
                        <ul className="absolute top-[18px] left-[15px] w-[273px] [font-family:'Poppins',Helvetica] font-normal text-neutral-400 text-sm tracking-[0] leading-[normal] list-none">
                            <li>
                                Coins remain in the campaign until you end your game play
                                <br />
                                You should finish paying the game  opting out, to get your full rewards.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Final CTA Button */}
                <button
                    onClick={onClose}
                    className="w-[303px] h-10 flex rounded-lg overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] mx-auto mt-6 mb-12"
                    type="button"
                >
                    <span className="mt-[8.0px] w-[261px] h-6 ml-[17.0px] [font-family:'Poppins',Helvetica] font-semibold text-white text-base text-center tracking-[0] leading-[normal]">
                        Tap Here to Claim Your Rewards
                    </span>
                </button>
            </div>
        </div>
    );
};