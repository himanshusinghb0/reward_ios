"use client";
import React, { useState } from "react";

const SurveysSection = () => {
    const [activesIndex, setActivesIndex] = useState(1);
    const HORIZONTALS_SPREAD = 120;

    const surveyProviders = [
        {
            id: 1,
            name: "Ayet Studios",
            image: "https://c.animaapp.com/xCaMzUYh/img/image-3979@2x.png",
            bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74-2@2x.png",
        },
        {
            id: 2,
            name: "BitLabs",
            image: "https://c.animaapp.com/xCaMzUYh/img/image-3974@2x.png",
            bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-73-3@2x.png",
        },
        {
            id: 3,
            name: "CPX Research",
            image: "https://c.animaapp.com/xCaMzUYh/img/image-3977@2x.png",
            bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74-2@2x.png",
        },
    ];

    const totalsCards = surveyProviders.length;

    const handleSurveyClick = (provider) => {
        console.log('Survey provider clicked:', provider.name);
        // You can add navigation to survey provider or open WebView here
    };

    return (
        <div className="flex w-full flex-col my-1 items-start gap-3 relative">
            <div className="flex w-full items-center justify-between">
                <p className="[font-family:'Poppins',Helvetica] text-[16px] font-semibold leading-[normal] tracking-[0] text-[#FFFFFF]">
                    Get Paid to do Surveys
                </p>
            </div>

            {/* The Carousel itself */}
            <div className="relative flex h-[190px] rounded-[10px] w-full items-center justify-center overflow-hidden">
                {surveyProviders.map((provider, index) => {
                    const offset = index - activesIndex;

                    const cardStyle = {
                        transform: `translateX(calc(-50% + ${offset * HORIZONTALS_SPREAD
                            }px)) scale(${offset === 0 ? 1 : 0.85})`,
                        zIndex: totalsCards - Math.abs(offset),
                        opacity: offset === 0 ? 1 : 0.6,
                        transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                    };

                    return (
                        <div
                            key={provider.id}
                            onClick={() => {
                                setActivesIndex(index);
                                handleSurveyClick(provider);
                            }}
                            className="absolute top-0 left-1/2 cursor-pointer"
                            style={cardStyle}
                        >
                            <div className="relative h-[190px] w-[165px]">
                                <img
                                    className="absolute inset-0 h-full w-full rounded-2xl object-cover"
                                    alt={`${provider.name} background`}
                                    src={provider.bgImage}
                                />
                                <div className="absolute top-[123px] left-1/2 w-full -translate-x-1/2 text-center font-['Poppins',Helvetica] font-semibold leading-tight text-[16px] tracking-[0] text-[#FFFFFF]">
                                    {/* Break name into multiple lines if it contains spaces */}
                                    {provider.name.split(" ").map((word, i) => (
                                        <span key={i}>
                                            {word}
                                            {provider.name.includes(" ") && i === 0 && <br />}
                                        </span>
                                    ))}
                                </div>
                                <img
                                    className="absolute top-[39px] left-1/2 h-auto w-20 max-h-[78px] -translate-x-1/2 object-contain"
                                    alt={`${provider.name} logo`}
                                    src={provider.image}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SurveysSection;
