"use client";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@/contexts/AuthContext";
import { fetchFinancialGoals } from "@/lib/redux/slice/cashCoachSlice";
import { EarningsOverviewSection } from "./components/EarningsOverviewSection";
import { GoalsAndTargetsSection } from "./components/GoalsAndTargetsSection";
import { HomeIndicator } from "@/components/HomeIndicator";
import { PageHeader } from "@/components/PageHeader";

export default function CashCoachPage() {
    const dispatch = useDispatch();
    const { token } = useAuth();
    const { status, error } = useSelector((state) => state.cashCoach);

    // Get wallet screen data from Redux store for coin balance
    const { walletScreen } = useSelector((state) => state.walletTransactions);
    const coinBalance = walletScreen?.wallet?.balance || 0;

    useEffect(() => {
        if (token && status === 'idle') {
            dispatch(fetchFinancialGoals(token));
        }
    }, [dispatch, token, status]);

    if (status === 'loading' || status === 'idle') {
        return (
            <div className="w-full h-screen bg-black flex flex-col justify-center items-center">
                <div className="text-white text-center text-lg font-medium">
                    Loading Your Coach...
                </div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="w-full h-screen bg-black flex flex-col justify-center items-center">
                <div className="text-white text-center text-lg font-medium">
                    Error: {error}
                </div>
            </div>
        );
    }

    // Coin balance component for header
    const CoinBalance = () => (
        <div className="min-w-[87px] max-w-[120px] h-9 rounded-3xl bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-between px-2.5 flex-shrink-0">
            <div className="text-white text-lg [font-family:'Poppins',Helvetica] font-semibold leading-[normal] truncate">
                {coinBalance || 0}
            </div>
            <img
                className="w-[23px] h-6 ml-1 flex-shrink-0"
                alt="Coin"
                src="/dollor.png"
            />
        </div>
    );

    return (
        <div className="flex flex-col overflow-x-hidden w-full h-full items-center justify-center px-4 pb-3 pt-1 bg-black max-w-[390px] mx-auto relative">
            <PageHeader
                title="Cash Coach"
                rightElement={<CoinBalance />}
            />
            <EarningsOverviewSection />
            <GoalsAndTargetsSection />
            <HomeIndicator />
        </div>
    );
}