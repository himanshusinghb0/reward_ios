"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const LegalCompliance = () => {
    const router = useRouter();

    const handleTermsOfUse = () => {
        router.push('/terms-of-use');
    };

    const handleLoyaltyProgramTerms = () => {
        router.push('/loyalty-program-terms');
    };

    const handlePrivacyPolicy = () => {
        router.push('/privacy-policy');
    };

    const handleAgeRestriction = () => {
        router.push('/age-restriction');
    };

    const legalOptions = [
        {
            id: 1,
            title: "Terms Of Use",
            icon: "https://c.animaapp.com/V1uc3arn/img/line-user-contacts-line.svg", // person+document icon
            onClick: handleTermsOfUse,
        },
        {
            id: 2,
            title: "Loyalty Program Terms",
            icon: "https://c.animaapp.com/V1uc3arn/img/line-communication-chat-quote-line.svg", // speech bubble icon
            onClick: handleLoyaltyProgramTerms,
        },
        {
            id: 3,
            title: "Privacy policy",
            icon: "https://c.animaapp.com/V1uc3arn/img/line-system-lock-2-line.svg", // padlock icon
            onClick: handlePrivacyPolicy,
        },
        {
            id: 4,
            title: "Age Restriction ",
            icon: "https://c.animaapp.com/V1uc3arn/img/line-user-contacts-line.svg", // person+document icon
            onClick: handleAgeRestriction,
        },
    ];

    return (
        <section className="flex flex-col w-full max-w-[335px] items-start gap-2.5 mx-auto mb-10 mt-[-2.20rem]">
            <h3 className="font-semibold text-white text-base">Legal & Compliance:</h3>

            <div className="w-full bg-[#141414] rounded-lg border border-[#494949] shadow p-4">
                {legalOptions.map((option, index) => (
                    <button
                        key={option.id}
                        className={`flex items-center justify-between w-full cursor-pointer hover:opacity-80 transition-opacity duration-200 ${index !== legalOptions.length - 1 ? 'mb-6' : ''}`}
                        onClick={option.onClick}
                        aria-label={`Go to ${option.title}`}
                        type="button"
                    >
                        <div className="flex items-center gap-4">
                            <Image
                                width={24}
                                height={24}
                                alt={option.title}
                                src={option.icon}
                                className="w-6 h-6"
                            />
                            <span className="text-white text-base">{option.title}</span>
                        </div>
                        <div className="w-6 h-6 flex-shrink-0">
                            <Image
                                width={24}
                                height={24}
                                alt="Arrow"
                                src="https://c.animaapp.com/V1uc3arn/img/arrow-back-ios-new-3@2x.png"
                                className="w-6 h-6"
                            />
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default LegalCompliance;

