import React from "react";

export const RaceModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const decorativeStars = [
        { id: 1, top: "44px", left: "248px" },
        { id: 2, top: "125px", left: "12px" },
        { id: 3, top: "220px", left: "213px" },
        { id: 4, top: "54px", left: "16px" },
        { id: 5, top: "104px", left: "312px" },
        { id: 6, top: "33px", left: "79px" },
        { id: 7, top: "0px", left: "271px" },
        { id: 8, top: "29px", left: "13px" },
    ];

    const progressData = {
        currentPoints: 2592,
        maxPoints: 10000,
        currentLevel: "Junior",
        nextLevel: "Mid-level",
        achievementText: "You discovered Mid-level feature",
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4 py-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative w-[335px] max-w-full max-h-[80vh] rounded-[20px] overflow-y-auto border border-solid border-[#ffffff80] bg-[linear-gradient(0deg,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_100%)]"
                data-model-id="2035:13685"
                role="dialog"
                aria-labelledby="banner-title"
                aria-describedby="banner-description"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Content Container with proper spacing */}
                <div className="relative min-h-full p-6 pb-8">
                    {/* Decorative Stars */}
                    {decorativeStars.map((star, index) => (
                        <img
                            key={star.id}
                            className="absolute w-[19px] h-[19px] pointer-events-none"
                            style={{ top: star.top, left: star.left }}
                            alt=""
                            src={
                                index < 4
                                    ? "https://c.animaapp.com/b76V1iGo/img/vector-2.svg"
                                    : index < 6
                                        ? "https://c.animaapp.com/b76V1iGo/img/vector-8.svg"
                                        : index === 6
                                            ? "https://c.animaapp.com/b76V1iGo/img/vector-4.svg"
                                            : index === 7
                                                ? "https://c.animaapp.com/b76V1iGo/img/vector-5.svg"
                                                : "https://c.animaapp.com/b76V1iGo/img/vector-7.svg"
                            }
                        />
                    ))}

                    {/* Close Button */}
                    <button
                        className="absolute w-[31px] h-[31px] top-6 right-6 cursor-pointer hover:opacity-80 transition-opacity z-10"
                        aria-label="Close banner"
                        type="button"
                        onClick={onClose}
                    >
                        <img
                            alt=""
                            src="https://c.animaapp.com/b76V1iGo/img/close.svg"
                            className="w-full h-full"
                        />
                    </button>

                    {/* Main XP Icon */}
                    <div className="flex justify-center mb-4 mt-2">
                        <img
                            className="w-[125px] h-[108px]"
                            alt="XP Points icon"
                            src="https://c.animaapp.com/b76V1iGo/img/pic.svg"
                        />
                    </div>

                    {/* Title Section */}
                    <header className="flex flex-col items-center mb-6">
                        <div className="flex items-center gap-2">
                            <h1
                                id="banner-title"
                                className="[text-shadow:0px_4px_8px_#1a002f40] [-webkit-text-stroke:0.5px_transparent] [-webkit-background-clip:text] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(245,245,245,1)_100%)] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Poppins',Helvetica] font-bold text-transparent text-[32px] tracking-[0] leading-8 whitespace-nowrap"
                            >
                                XP Points
                            </h1>
                            <img
                                className="w-[19px] h-[19px]"
                                alt=""
                                src="https://c.animaapp.com/b76V1iGo/img/vector-8.svg"
                            />
                        </div>
                    </header>

                    {/* Description Section */}
                    <section className="mb-8">
                        <p
                            id="banner-description"
                            className="w-full [font-family:'Poppins',Helvetica] font-light text-white text-sm text-center tracking-[0] leading-5 px-4"
                        >
                            Compete against players by completing tasks. Finish first to win extra XP & reward coins. Higher XP tiers unlock tougher races with bigger rewards.
                        </p>
                    </section>

                    {/* Progress Section */}
                    <section className="flex flex-col w-full items-center justify-center gap-4 mb-4">
                        <img
                            className="w-[50px] h-[54px] aspect-[0.94]"
                            alt="Achievement unlock icon"
                            src="https://c.animaapp.com/b76V1iGo/img/image-3966@2x.png"
                        />

                        <div className="flex items-center justify-center gap-2 pt-0 pb-3 px-0 w-full border-b [border-bottom-style:solid] border-[#383838]">
                            <div className="[font-family:'Poppins',Helvetica] font-semibold text-[#ffb568] text-sm tracking-[0] leading-5 text-center">
                                {progressData.achievementText}
                            </div>
                        </div>

                        <div className="flex justify-between items-center w-full px-2 mb-2">
                            <div className="[font-family:'Poppins',Helvetica] font-normal text-white text-sm tracking-[0] leading-[14px] whitespace-nowrap">
                                {progressData.currentLevel}
                            </div>
                            <div className="[font-family:'Poppins',Helvetica] font-normal text-white text-sm tracking-[0] leading-[14px] whitespace-nowrap">
                                {progressData.nextLevel}
                            </div>
                        </div>

                        <div
                            className="w-full max-w-[304px] h-6 mb-4"
                            role="progressbar"
                            aria-valuenow={progressData.currentPoints}
                            aria-valuemin={0}
                            aria-valuemax={progressData.maxPoints}
                            aria-label={`Progress: ${progressData.currentPoints} out of ${progressData.maxPoints} XP points`}
                        >
                            <img
                                alt=""
                                src="https://c.animaapp.com/b76V1iGo/img/progress-bar.svg"
                                className="w-full h-full"
                            />
                        </div>

                        <div className="flex items-center justify-center gap-1 w-full">
                            <div className="[font-family:'Poppins',Helvetica] font-medium text-[#d2d2d2] text-sm tracking-[0] leading-[normal]">
                                {progressData.currentPoints.toLocaleString()}
                            </div>

                            <img
                                className="w-5 h-[18px]"
                                alt=""
                                src="https://c.animaapp.com/b76V1iGo/img/pic-1.svg"
                            />

                            <div className="[font-family:'Poppins',Helvetica] font-medium text-[#dddddd] text-sm tracking-[0] leading-[normal]">
                                out of {progressData.maxPoints.toLocaleString()}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
