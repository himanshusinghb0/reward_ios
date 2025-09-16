"use client";
import React from "react";
import Link from 'next/link';
import { usePathname } from "next/navigation";

export const HomeIndicator = ({ activeTab }) => {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (activeTab) return activeTab;
    if (pathname === "/homepage") return "home";
    if (pathname === "/games") return "games";
    if (pathname === "/Wallet") return "wallet";
    if (pathname === "/cash-coach") return "cash";
    return "home";
  };

  const currentActiveTab = getActiveTab();

  const getActiveIconStyle = (tabId) => {
    if (currentActiveTab === tabId) {
      return { filter: 'brightness(1.8)' };
    }
    return { filter: 'brightness(0.7) opacity(0.7)' };
  };


  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full z-[9999]"
      data-model-id="730:32095"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-center items-end w-full">
        <div className="w-full max-w-[375px] h-[100px] relative">
          <div className="absolute bottom-0 left-0 right-0 bg-black w-full h-[78px]"></div>
          <div className="absolute bottom-[5px] left-1/2 transform -translate-x-1/2 w-[135px] h-[5px] bg-white rounded-[100px]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[78px] flex items-center justify-center px-6">
            <div className="flex items-center justify-between w-full max-w-[320px] relative">

              <Link
                href="/homepage"
                className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative"
                aria-label="Navigate to Home"
                aria-current={currentActiveTab === "home" ? "page" : undefined}
              >
                {currentActiveTab === "home" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <img
                  className="w-6 h-6 z-10"
                  alt=""
                  src="https://c.animaapp.com/Tbz6Qwwg/img/home.svg"
                  role="presentation"
                  style={getActiveIconStyle("home")}
                />
                <span className={`text-[10px] font-normal z-10 ${currentActiveTab === "home" ? "text-white" : "text-[#ffffffb2]"}`}>
                  Home
                </span>
                {currentActiveTab === "home" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </Link>

              <Link
                href="/games"
                className="group flex flex-col mr-6 items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative"
                aria-label="Navigate to My Games"
                aria-current={currentActiveTab === "games" ? "page" : undefined}
              >
                {currentActiveTab === "games" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <img
                  className="w-[35px] h-[16px] z-10"
                  alt=""
                  src="/game.png"
                  role="presentation"
                  style={getActiveIconStyle("games")}
                />
                <span className={`text-[10px] font-normal text-center z-10 ${currentActiveTab === "games" ? "text-white" : "text-[#ffffffb2]"}`}>
                  My Games
                </span>
                {currentActiveTab === "games" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </Link>

              <button
                className="flex flex-col items-center cursor-pointer focus:outline-none rounded-full absolute -top-[42px] left-1/2 transform -translate-x-1/2"
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

              <Link
                href="/Wallet"
                className="group flex flex-col ml-4 items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative"
                aria-label="Navigate to My Wallet"
                aria-current={currentActiveTab === "wallet" ? "page" : undefined}
              >
                {currentActiveTab === "wallet" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <div className="w-6 h-6 relative z-10">
                  <img
                    className="absolute w-5 h-[18px] top-[3px] left-0.5"
                    alt=""
                    src="https://c.animaapp.com/Tbz6Qwwg/img/wallet@2x.png"
                    role="presentation"
                    style={getActiveIconStyle("wallet")}
                  />
                </div>
                <span className={`text-[10px] font-normal text-center z-10 ${currentActiveTab === "wallet" ? "text-white" : "text-[#ffffffb2]"}`}>
                  My Wallet
                </span>
                {currentActiveTab === "wallet" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </Link>

              <Link
                href="/cash-coach"
                className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative"
                aria-label="Navigate to Cash Coach"
                aria-current={currentActiveTab === "cash" ? "page" : undefined}
              >
                {currentActiveTab === "cash" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <img
                  className="w-6 h-6 z-10"
                  alt=""
                  src="https://c.animaapp.com/Tbz6Qwwg/img/money.svg"
                  role="presentation"
                  style={getActiveIconStyle("cash")}
                />
                <span className={`text-[10px] font-normal text-center whitespace-nowrap z-10 ${currentActiveTab === "cash" ? "text-white" : "text-[#ffffffb2]"}`}>
                  Cash Coach
                </span>
                {currentActiveTab === "cash" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </Link>

            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};