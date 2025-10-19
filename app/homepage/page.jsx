"use client";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useVipStatusWithRefresh } from "@/hooks/useVipStatus";
import { useHomepageData } from "@/hooks/useHomepageData";
import { HomeIndicator } from "../../components/HomeIndicator";
import HeaderSection from "./components/HeaderSection";
import RewardProgress from "./components/RewardProgress";
import XPTierTracker from "./components/XPTierTracker";
import MostPlayedGames from "./components/MostPlayedGames";
import WelcomeOfferSection from "./components/WelcomeOfferSection";
import GameCard from "./components/GameCard";
import NonGamingOffers from "./components/NonGamingOffers";
import VipBanner from "./components/VipBanner";
import RaceSection from "./components/RaceSection";
import SurveysSection from "./components/SurveysSection";
import StreakSection from "./components/StreakSection";

const Homepage = () => {
  const { token, user } = useAuth();
  const { vipLoading } = useVipStatusWithRefresh();


  // Use optimized hook for data management
  const {
    stats,
    userData,
    walletScreen,
    details,
    isLoading,
    hasStats,
    hasUserData,
    hasWalletData,
  } = useHomepageData(token, user);

  // REMOVED: Skeleton loader for better Android UX - show content immediately
  // Components will handle their own loading states internally

  return (
    <div
      className="relative w-full min-h-screen bg-black pb-[150px] animate-fade-in"
      data-model-id="972:9945"
    >
      <div className="absolute w-full h-[49px] top-0 left-0 z-10 px-5">
        <div className="absolute top-[10px] left-5 [font-family:'Poppins',Helvetica] font-normal text-white text-[10px] tracking-[0] leading-3 whitespace-nowrap">
          App Version: V0.0.1
        </div>
      </div>

      <HeaderSection />

      <div className="flex flex-col w-full max-w-[375px] mx-auto items-center gap-6 pt-36 px-4 relative">
        {hasStats && <RewardProgress stats={stats} />}
        {hasStats && <XPTierTracker stats={stats} token={token} />}
        <MostPlayedGames />
        <WelcomeOfferSection />

        <GameCard />
      </div>
      {/* <NonGamingOffers /> */}
      <div className="flex flex-col w-full max-w-[375px] mx-auto items-center gap-6 px-4">
        <VipBanner />
        <RaceSection />
        {/* <SurveysSection /> */}
        <StreakSection />
      </div>
      <HomeIndicator activeTab="home" />
    </div>
  );
};

export default Homepage;