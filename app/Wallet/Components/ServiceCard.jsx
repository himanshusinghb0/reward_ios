"use client";
import Image from 'next/image';
import React from 'react';

const ServiceCard = ({ card }) => {
    if (!card) return null;

    return (
        <div
            className={`
                ${card.innerBgColor} 
                flex-shrink-0 snap-center 
                w-[90px] h-[176px] 
                rounded-[12px]
                opacity-100
                flex flex-col items-center justify-center gap-2 py-4 px-2 
                relative 
                text-center 
                transition-all duration-200 hover:scale-105
            `}
            role="button"
            tabIndex={0}
            aria-label={`Service card for ${card.title}`}
        >
            <Image
                src={card.image}
                alt={card.title}
                width={45}
                height={45}
                className="object-contain"
                loading="lazy"
            />
            <div className="font-bold text-[#B7B7B7] font-[Libre Franklin] text-[12px] tracking-tight leading-snug">
                {card.title.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                        {index < card.title.split("\n").length - 1 && <br />}
                    </React.Fragment>
                ))}
            </div>
            {card.hasDescription && card.description && (
                <p className="text-[#B7B7B7] font-[Libre Franklin] text-[9px] font-normal leading-tight px-1">
                    {card.description}
                </p>
            )}
        </div>
    );
};

export default ServiceCard;