"use client";
import React, { useEffect } from "react";
import MyEarningCard from "./Components/MyEarningCard";
import { HighestEarningGame } from "./Components/HighestEarningGame";
import TransactionHistory from "./Components/TransactionHistory";
import { VipMember } from "./Components/VipMember";
import { WithdrawalOption } from "./Components/WithdrawalOption";
import { Conversion } from "./Components/Conversion";
import { HomeIndicator } from "../../components/HomeIndicator";
import WalletHeader from "./Components/WalletHeader";
import SpinWin from "../myprofile/components/SpinWin";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useVipStatus } from "@/hooks/useVipStatus";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProfileStats } from "@/lib/redux/slice/profileSlice";
import { fetchWalletScreen } from "@/lib/redux/slice/walletTransactionsSlice";


export default function WalletPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = useAuth();

  const {
    detailsStatus,
    statsStatus,
    error,
  } = useSelector((state) => state.profile);

  // VIP status using custom hook
  const { vipStatus, isLoading: vipLoadingStatus } = useVipStatus();


  // Get wallet screen data from Redux store
  const { walletScreen, walletScreenStatus } = useSelector((state) => state.walletTransactions);
  const coinBalance = walletScreen?.wallet?.balance || 0;
  const balance = coinBalance || 0;

  // Refresh wallet and balance data when page is visited (to get admin updates)
  // Do this in background without blocking UI - show cached data immediately
  useEffect(() => {
    if (!token) return;

    // Use setTimeout to refresh in background after showing cached data
    // This ensures smooth UX - cached data shows immediately, fresh data loads in background
    const refreshTimer = setTimeout(() => {
      dispatch(fetchWalletScreen({ token, force: true }));
      dispatch(fetchProfileStats({ token, force: true }));
    }, 100); // Small delay to let cached data render first

    return () => clearTimeout(refreshTimer);
  }, [token, dispatch]);

  // Refresh when app comes to foreground
  useEffect(() => {
    if (!token) return;

    const handleFocus = () => {
      dispatch(fetchWalletScreen({ token, force: true }));
      dispatch(fetchProfileStats({ token, force: true }));
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [token, dispatch]);

  const handleVipUpgrade = () => {
    router.prefetch("/BuySubscription");
    router.push("/BuySubscription");
  };

  // Only show loading if we have NO cached data at all
  // This allows showing cached data immediately while refreshing in background
  const hasCachedData = walletScreen || statsStatus === 'succeeded' || detailsStatus === 'succeeded' || vipStatus;
  const isLoading = !hasCachedData && (detailsStatus === 'loading' || statsStatus === 'loading' || walletScreenStatus === 'loading' || vipLoadingStatus === 'loading');
  const hasFailed = detailsStatus === 'failed' || statsStatus === 'failed' || walletScreenStatus === 'failed' || vipLoadingStatus === 'failed';

  // Only show loading screen if we have absolutely no data
  // Otherwise, show cached data immediately and refresh in background
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center text-white text-xl">
        Loading Wallet...
      </div>
    );
  }

  // Only show error if we have no cached data to fall back to
  if (hasFailed && !hasCachedData) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center text-red-500 text-xl">
        Error: {error || "Failed to load data. Please try again later."}
      </div>
    );
  }



  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black flex justify-center">
      <div className="w-full max-w-md min-h-screen flex flex-col items-center bg-black pb-6">
        <WalletHeader balance={balance} appVersion="V0.1.1" token={token} />
        <MyEarningCard token={token} />
        <TransactionHistory />
        <HighestEarningGame />
        <SpinWin />
        <Conversion />
        <WithdrawalOption />
        <section className="mb-5  ">
          <div className="w-full max-w-[335px] sm:max-w-[375px] mx-auto">
            <div className="w-full p-4 sm:p-6 rounded-lg bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.1)_50%,rgba(0,0,0,0.9)_100%)] shadow-lg border border-white/20">
              <div className="flex flex-col justify-start gap-2">
                <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-[#f4f3fc] text-[14px] sm:text-[14px] ">
                  Disclaimer
                </h2>
                <p className="[font-family:'Poppins',Helvetica] font-light text-[#FFFFFF] text-[13px] sm:text-base text-start leading-5 sm:leading-6">
                  Points ar for loyalty use only and do not reflect real-world currency
                </p>
              </div>
            </div>
          </div>
        </section>
        <VipMember vipStatus={vipStatus} handleVipUpgrade={handleVipUpgrade} />
        <HomeIndicator activeTab="wallet" />
      </div>
    </div>
  );
}