"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

export const HomeIndicator = ({ activeTab }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Auto-detect active tab based on current pathname if not explicitly provided
  const getActiveTab = () => {
    if (activeTab) return activeTab;

    if (pathname === "/homepage") return "home";
    if (pathname === "/games") return "games";
    if (pathname === "/wallet") return "wallet";
    if (pathname === "/cash-coach") return "cash";

    return "home"; // default fallback
  };

  const currentActiveTab = getActiveTab();


  const navigationItems = [
    { id: "home", icon: "https://c.animaapp.com/Tbz6Qwwg/img/home.svg", label: "Home", route: "/homepage" },
    { id: "games", icon: "/Games.svg", label: "My Games", route: "/games" },
    { id: "more", icon: "https://c.animaapp.com/Tbz6Qwwg/img/more.svg", label: "", isCenter: true, route: null },
    { id: "wallet", icon: "https://c.animaapp.com/Tbz6Qwwg/img/wallet@2x.png", label: "My Wallet", route: "/wallet" },
    { id: "cash", icon: "https://c.animaapp.com/Tbz6Qwwg/img/money.svg", label: "Cash Coach", route: "/cash-coach" },
  ];

  const handleTabClick = (tabId, route) => {
    // Only navigate if a route is provided
    if (route) {
      router.push(route);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full z-[9999]"
      data-model-id="730:32095"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Main Container - Center aligned for all devices */}
      <div className="flex justify-center items-end w-full">
        <div className="w-full max-w-[375px] h-[100px] relative">

          {/* Background */}
          <div className="absolute bottom-0 left-0 right-0 bg-black w-full h-[78px]"></div>

          {/* Home indicator line - At bottom of navbar */}
          <div className="absolute bottom-[5px] left-1/2 transform -translate-x-1/2 w-[135px] h-[5px] bg-white rounded-[100px]"></div>

          {/* Navigation items container */}
          <div className="absolute bottom-0 left-0 right-0 h-[78px] flex items-center justify-center px-6">
            <div className="flex items-center justify-between w-full max-w-[320px] relative">

              {/* Home Button */}
              <button
                className={`
                  flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative
                `}
                onClick={() => handleTabClick("home", "/homepage")}
                aria-label="Navigate to Home"
                aria-current={currentActiveTab === "home" ? "page" : undefined}
                tabIndex={0}
              >
                <img
                  className="w-6 h-6"
                  alt=""
                  src="https://c.animaapp.com/Tbz6Qwwg/img/home.svg"
                  role="presentation"
                />
                <span className={`text-[10px] font-normal ${currentActiveTab === "home" ? "text-white" : "text-[#ffffffb2]"}`}>
                  Home
                </span>
                {currentActiveTab === "home" && (
                  <div className="absolute w-1 h-1 bottom-0  left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full" />
                )}
              </button>

              {/* Games Button */}
              <button
                className={`
                  flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative
                `}
                onClick={() => handleTabClick("games", "/games")}
                aria-label="Navigate to My Games"
                aria-current={currentActiveTab === "games" ? "page" : undefined}
                tabIndex={0}
              >
                <img
                  className="w-[35px] h-[16px]"
                  alt=""
                  src="/game.png"
                  role="presentation"
                />
                <span className={`text-[10px] font-normal text-center ${currentActiveTab === "games" ? "text-white" : "text-[#ffffffb2]"}`}>
                  My Games
                </span>
                {currentActiveTab === "games" && (
                  <div className="absolute w-1 h-1 bottom-0 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full" />
                )}
              </button>

              {/* Center More Button - Half outside navbar */}
              <button
                className="flex flex-col items-center cursor-pointer focus:outline-none rounded-full absolute -top-[42px] left-1/2 transform -translate-x-1/2"
                onClick={() => handleTabClick("more", null)}
                aria-label="More options"
                tabIndex={0}
              >
                <img
                  className="w-[62px] h-[62px]"
                  alt=""
                  src="https://c.animaapp.com/Tbz6Qwwg/img/more.svg"
                  role="presentation"
                />
              </button>

              {/* Wallet Button */}
              <button
                className={`
                  flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative
                `}
                // onClick={() => handleTabClick("wallet", "/wallet")}
                aria-label="Navigate to My Wallet"
                aria-current={currentActiveTab === "wallet" ? "page" : undefined}
                tabIndex={0}
              >
                <div className="w-6 h-6 relative">
                  <img
                    className="absolute w-5 h-[18px] top-[3px] left-0.5"
                    alt=""
                    src="https://c.animaapp.com/Tbz6Qwwg/img/wallet@2x.png"
                    role="presentation"
                  />
                </div>
                <span className={`text-[10px] font-normal text-center ${currentActiveTab === "wallet" ? "text-white" : "text-[#ffffffb2]"}`}>
                  My Wallet
                </span>
                {currentActiveTab === "wallet" && (
                  <div className="absolute w-1 h-1 bottom-0 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full" />
                )}
              </button>

              {/* Cash Coach Button */}
              <button
                className={`
                  flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative
                `}
                // onClick={() => handleTabClick("cash", "/cash-coach")}
                aria-label="Navigate to Cash Coach"
                tabIndex={0}
              >
                <img
                  className="w-6 h-6"
                  alt=""
                  src="https://c.animaapp.com/Tbz6Qwwg/img/money.svg"
                  role="presentation"
                />
                <span className={`text-[10px] font-normal text-center whitespace-nowrap ${currentActiveTab === "cash" ? "text-white" : "text-[#ffffffb2]"}`}>
                  Cash Coach
                </span>
                {currentActiveTab === "cash" && (
                  <div className="absolute w-1 h-1 bottom-0 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full" />
                )}
              </button>

            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};