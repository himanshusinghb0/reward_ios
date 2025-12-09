import React from "react";
import Image from "next/image";

export const HighestTransctionCard = ({
    id,
    gameName,
    status,
    coins,
    xpBonus,
    xp,
    finalXp,
    gameLogoSrc,
    metadata,
}) => {
    // Priority: metadata.xp > finalXp > xpBonus
    // Use metadata.xp if available (for Daily Rewards), otherwise use finalXp, then xpBonus
    const displayXp = (xp !== null && xp !== undefined) ? xp : 
                      (finalXp !== null && finalXp !== undefined ? finalXp : xpBonus);
    return (
        <article
            className="relative w-[335px] h-[92px] bg-black  rounded-[10px] shadow-[0_0_10px_6px_rgba(255,255,255,0.15)]"
            role="button"
            tabIndex={0}
            aria-label={`${gameName} game tile with ${coins} coins and +${xpBonus} XP bonus`}
        >
            <div className="absolute w-14 h-14 top-3.5 left-4 rounded-full overflow-hidden">
                {/* 
                  Ensure that the /download.png image exists in your public folder.
                  Also, verify that next/image is configured correctly.
                  Use optional chaining to fall back to a default image if gameLogoSrc is not provided.
                */}
                <Image
                    className="w-full h-full object-cover"
                    alt={gameLogoSrc ? `${gameName} game logo` : "Default game logo"}
                    src={gameLogoSrc || "/download.png"}
                    width={64}
                    height={64}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/download.png";
                    }}
                    priority
                />
            </div>

            <header className="absolute w-[139px] top-[21px] left-[92px]">
                <h2 className="[font-family:'Poppins',Helvetica] font-bold text-[#d9d9d9] text-[16px] tracking-[0.02px] leading-[normal] opacity-[100%] truncate max-w-[139px]">
                    {gameName}
                </h2>
            </header>

            <p className="absolute top-[45px] left-[92px] [font-family:'Poppins',Helvetica] font-light text-[#d9d9d9] text-[13px] tracking-[0.02px] leading-[18px] whitespace-nowrap">
                {status}
            </p>

            <div
                className="absolute flex items-center justify-end w-[60px] h-[30px] top-[22px] left-[236px] gap-1"
                aria-label={`${coins} coins`}
            >
                <span className="[font-family:'Poppins',Helvetica] font-semibold text-[#FFFFFF] text-[20px] tracking-[0.02px] leading-[normal]">
                    {coins}
                </span>

                <Image
                    className="w-[20px] mb-1 h-[21px] aspect-[0.97]"
                    alt="Coin icon"
                    src="/dollor.png"
                    width={20}
                    height={21}
                />
            </div>

            <div
                className="absolute w-[89px] h-[22px] top-[70px] left-[123px]"
                aria-label={`Plus ${displayXp} XP bonus${finalXp ? ' (Final XP with multiplier)' : ''}`}
            >
                <div className="relative w-[110px] h-7 -top-0.5 -left-1.5">
                    <div className="absolute w-[57px] h-6 top-0 left-[27px] bg-[#201f59] rounded-[4px_4px_0px_0px] shadow-[0px_0px_4px_#fef47e33]" />

                    <Image
                        className="absolute w-[27px] h-7 top-0 left-[3px]"
                        alt="Left decoration"
                        src="https://c.animaapp.com/UNpBPFIY/img/vector-4235.svg"
                        width={27}
                        height={28}
                    />

                    <Image
                        className="absolute w-[26px] h-[27px] top-px left-[81px]"
                        alt="Right decoration"
                        src="https://c.animaapp.com/UNpBPFIY/img/vector-4234.svg"
                        width={26}
                        height={27}
                    />

                    <span className="absolute h-5 top-1 left-[30px] [font-family:'Poppins',Helvetica] font-medium text-white text-[13px] tracking-[0] leading-[normal]">
                        +{displayXp}
                    </span>

                    <Image
                        className="absolute w-4 h-[15px] top-[5px] left-[63px]"
                        alt="XP icon"
                        src="/xp.svg"
                        width={16}
                        height={15}
                    />
                </div>
            </div>
        </article>
    );
};