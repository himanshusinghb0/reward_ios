import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import { useAuth } from "@/contexts/AuthContext";
import { setGoalsLocally, updateFinancialGoals } from "@/lib/redux/slice/cashCoachSlice";

export const GoalsAndTargetsSection = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { token } = useAuth();
    const goals = useSelector((state) => state.cashCoach.goals) || {};

    const debouncedUpdate = useCallback(
        debounce((newGoals, authToken) => {
            dispatch(updateFinancialGoals({ goalsData: newGoals, token: authToken }));
        }, 500),
        [dispatch]
    );

    const handleValueChange = (key, value) => {
        const numericValue = Math.max(0, Number(value) || 0);
        const updatedGoal = { [key]: numericValue };
        dispatch(setGoalsLocally(updatedGoal));
        const newGoals = { ...goals, ...updatedGoal };
        debouncedUpdate(newGoals, token);
    };

    const handleHelpMeEarnClick = () => {
        router.push('/AchieveGoals');
    };



    const goalData = [
        { key: "salary", label: "Salary (Per Month)", max: 9999 },
        { key: "rent", label: "Rent (Per Month)", max: 9999 },
        { key: "food", label: "Food (Per Month)", max: 9999 },
        { key: "savings", label: "Savings (Per Month)", max: 9999 },
        { key: "revenueGoal", label: "Revenue Goal from Jackson", max: 9999 },
    ];
    // All goals have default value of 40, so button should always be enabled
    const areAllGoalsSet = goalData.every(goal => (goals[goal.key] || 40) >= 40);
    const isButtonDisabled = !areAllGoalsSet;
    return (
        <section className="flex  flex-col w-full justify-center mb-30 mt-7 items-start gap-2 relative">
            <header className="flex w-full items-center justify-between  ml-1 relative">
                <h2 className="relative [font-family:'Poppins',Helvetica] font-semibold text-[#F4F3FC] text-base tracking-[0] leading-[normal]">
                    Personalised Earning Targets
                </h2>
            </header>

            <p className="relative self-stretch [font-family:'Poppins',Helvetica] ml-1 font-normal text-[#F4F3FC] text-xs tracking-[0] leading-[normal]">
                Set your goals &amp; finish them the way you prefer.
            </p>

            <div className="relative w-full p-5 bg-black rounded-[10px] shadow-[2.48px_2.48px_18.58px_#a6aabc4c,-1.24px_-1.24px_16.1px_#f9faff1a]">
                <div className="flex flex-col w-full items-start gap-4">
                    {goalData.map((goal, index) => {
                        // Default value is 40 as per requirement
                        const currentValue = goals[goal.key] || 40;
                        const progress = (currentValue / goal.max) * 100;
                        const sliderStyle = {
                            background: `linear-gradient(to right, #6a6dcd ${progress}%, #307fe24c ${progress}%)`,
                        };

                        return (
                            <div
                                key={goal.key}
                                className={`flex flex-col items-start gap-4 relative self-stretch w-full pb-4 ${index < goalData.length - 1
                                    ? "border-b [border-bottom-style:solid] border-white/20"
                                    : ""
                                    }`}
                            >
                                <div className="flex items-center justify-between relative self-stretch w-full">
                                    <label
                                        htmlFor={`goal-${goal.key}`}
                                        className="relative [font-family:'Poppins',Helvetica] font-medium text-[#d9d9d9] text-sm tracking-[0.02px] leading-5"
                                    >
                                        {goal.label}
                                    </label>
                                    <div className="relative w-24 h-8 flex items-center justify-center text-center rounded-md bg-[#1C1C1E]">
                                        <input
                                            id={`goal-${goal.key}`}
                                            type="number"
                                            value={currentValue}
                                            onChange={(e) => handleValueChange(goal.key, e.target.value)}
                                            className="w-full [font-family:'Poppins',Helvetica] font-bold text-[#d9d9d9] text-sm text-center bg-transparent border-none outline-none p-1 pr-8"
                                            min="0"
                                            max={goal.max}
                                        />
                                        <img src="/dollor.png" alt="$" className="w-5 h-5 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="relative w-full pt-4">
                                    <div className="absolute -top-0 transform -translate-x-1/2" style={{ left: `${progress}%`, zIndex: 10 }}>
                                        <div className="flex items-center bg-[#2f3276] p-1 rounded-md shadow-lg">
                                            <span className="text-white text-xs font-bold">{currentValue}</span>
                                            {/* <img src="/dollor.png" alt="$" className="w-3 h-3 ml-1" /> */}
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={goal.max}
                                        step="1"
                                        value={currentValue}
                                        onChange={(e) => handleValueChange(goal.key, e.target.value)}
                                        style={sliderStyle}
                                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#6a6dcd]"
                                    />
                                </div>
                            </div>
                        );
                    })}

                    <button
                        onClick={handleHelpMeEarnClick}
                        className={`w-[200px] h-12 self-center mt-4 rounded-[12px] bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] hover:opacity-90 transition-opacity font-semibold text-white text-base  cursor-pointer
                            `}
                    >
                        Help me earn
                    </button>
                </div>
            </div>
        </section>
    );
};