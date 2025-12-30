import React, { useState } from "react";

export const LegalDisclaimerSection = () => {
    const [selectedPlan, setSelectedPlan] = useState("monthly");

    const plans = [
        {
            id: "weekly",
            name: "Weekly",
            price: "$8",
            isHighlighted: false,
            badge: null,
        },
        {
            id: "monthly",
            name: "Monthly",
            price: "$15",
            isHighlighted: true,
            badge: "Trending",
        },
        {
            id: "yearly",
            name: "Yearly",
            price: "$50",
            isHighlighted: false,
            badge: null,
        },
    ];

    return (
        <section className="flex flex-col w-full items-center gap-5 px-4">
            {/* <div className="inline-flex flex-col h-[234px] items-start gap-[11.14px] relative">
                {plans.map((plan) => (
                    <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`flex w-[335px] h-[70.53px] items-center justify-between px-[25.98px] py-[22.27px] relative rounded-[18.56px] ${plan.isHighlighted
                            ? "bg-black border-[2.78px] border-solid border-[#1c1c1e] shadow-[0px_0px_0px_0.93px_#ffd200] overflow-hidden"
                            : "border border-solid border-[#ffffff80]"
                            }`}
                        aria-pressed={selectedPlan === plan.id}
                        aria-label={`Select ${plan.name} plan for ${plan.price}`}
                    >
                        <div className="inline-flex items-start gap-[7.42px] relative flex-[0_0_auto]">
                            <span
                                className={`relative w-fit ${plan.isHighlighted ? "mt-[-0.93px]" : ""
                                    } font-['SF_Pro-Medium',Helvetica] font-medium text-white text-[18.6px] text-center tracking-[0] leading-[normal] whitespace-nowrap`}
                            >
                                {plan.name}
                            </span>
                            {plan.badge && (
                                <span className="inline-flex items-center justify-center gap-[9.28px] px-[7.42px] py-[3.71px] relative flex-[0_0_auto] bg-[#ef890f] rounded-[13.92px] overflow-hidden">
                                    <span className="relative flex items-center justify-center w-fit mt-[-0.93px] font-['SF_Pro-Heavy',Helvetica] font-normal text-white text-[12.1px] text-center tracking-[0] leading-[normal] whitespace-nowrap">
                                        {plan.badge}
                                    </span>
                                </span>
                            )}
                        </div>
                        <span
                            className={`relative w-fit ${plan.isHighlighted ? "mt-[-0.79px]" : ""
                                } font-['SF_Pro-Bold',Helvetica] font-bold text-white text-[18.6px] text-center tracking-[0] leading-[normal] whitespace-nowrap`}
                        >
                            {plan.price}
                        </span>
                    </button>
                ))}
            </div> */}
            <div className="flex flex-col items-center gap-2.5">
                <p className="[font-family:'Poppins',Helvetica] font-normal text-[#a6a6a6] text-sm text-center tracking-[0] leading-5">
                    *$XX.XX billed annually. Cancel anytime.
                </p>
                <p className="[font-family:'Poppins',Helvetica] font-normal text-[#a6a6a6] text-[13px] text-center tracking-[0] leading-[18px]">
                    All subscriptions renew automatically unless canceled at least 24
                    hours before renewal.
                </p>
            </div>
        </section>
    );
};

