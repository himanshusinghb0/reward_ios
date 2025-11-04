import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function SpinWheel() {
    const [isSpinning, setIsSpinning] = useState(false);
    const [spins, setSpins] = useState(10)
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState("");
    const [coins, setCoins] = useState(1250);
    const [pendingReward, setPendingReward] = useState(0);
    const [isAdWatched, setIsAdWatched] = useState(false);
    const [appVersion] = useState("V0.0.1");
    const [dailySpinsUsed, setDailySpinsUsed] = useState(0);
    const [maxDailySpins] = useState(10);

    // Audio ref for sound effects
    const audioRef = useRef(null);

    // Load daily spins from localStorage on mount
    useEffect(() => {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('spinWheelDate');
        const savedSpins = parseInt(localStorage.getItem('dailySpinsUsed') || '0');

        if (savedDate === today) {
            setDailySpinsUsed(savedSpins);
        } else {
            // New day, reset spins
            localStorage.setItem('spinWheelDate', today);
            localStorage.setItem('dailySpinsUsed', '0');
            setDailySpinsUsed(0);
        }
    }, []);

    // Save daily spins to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('dailySpinsUsed', dailySpinsUsed.toString());
    }, [dailySpinsUsed]);

    // Function to play sound effect
    const playSpinSound = () => {
        try {
            if (audioRef.current) {
                audioRef.current.currentTime = 0; // Reset to beginning
                audioRef.current.play().catch(error => {
                    console.log("Audio play failed:", error);
                });
            }
        } catch (error) {
            console.log("Sound effect error:", error);
        }
    };

    const handleSpin = () => {
        console.log("Spin button clicked!", { isSpinning, spins, dailySpinsUsed, maxDailySpins });

        // Check daily spin limit FIRST
        if (dailySpinsUsed >= maxDailySpins) {
            setResult(`🚫 Daily Spin Limit Reached!\n\nYou've used all ${maxDailySpins} spins today.\n\nCome back tomorrow for more spins!`);
            setShowResult(true);
            setTimeout(() => setShowResult(false), 5000);
            return;
        }

        // Check if already spinning
        if (isSpinning) {
            console.log("Already spinning...");
            return;
        }

        if (!isSpinning) {
            console.log("Starting spin animation...");

            // Play sound effect when user clicks spin
            playSpinSound();

            setIsSpinning(true);
            setShowResult(false);
            setPendingReward(0);
            setIsAdWatched(false);

            // Spin animation duration
            setTimeout(() => {
                console.log("Spin animation finished!");
                setIsSpinning(false);

                // 0.1% chance of winning a reward, 99.9% chance of losing
                const isWin = Math.random() < 0.001; // 0.1% probability of winning
                console.log("Win probability check:", isWin);

                if (isWin) {
                    // Calculate random reward (1-100 coins)
                    const rewardAmount = Math.floor(Math.random() * 100) + 1;
                    console.log("Reward amount:", rewardAmount);

                    // Store pending reward (not yet credited)
                    setPendingReward(rewardAmount);
                    setResult(`🎉 Congratulations! You won ${rewardAmount} coins!\n\nWatch ad to redeem your reward.`);
                    setShowResult(true);
                } else {
                    // 1% chance - no reward
                    setPendingReward(0);
                    setResult(`😔 Better Luck Next Time!\n\nNo reward this time.\nTry spinning again!`);
                    setShowResult(true);
                }

                // Update daily spins used
                setDailySpinsUsed(prev => prev + 1);

                // Only decrement spins if we have more than 0
                if (spins > 0) {
                    setSpins(prev => prev - 1);
                }

                // Hide result after 5 seconds
                setTimeout(() => {
                    setShowResult(false);
                }, 5000);
            }, 3000);
        } else {
            console.log("Cannot spin:", { isSpinning, spins });
        }
    };

    const handleWatchToRedeem = () => {
        if (pendingReward > 0) {
            console.log("Watch to Redeem clicked - Starting rewarded video ad...");

            // Simulate rewarded video ad
            simulateRewardedVideoAd();
        } else {
            console.log("No pending reward to redeem");
            setResult("❌ No pending reward to redeem!");
            setShowResult(true);
            setTimeout(() => setShowResult(false), 3000);
        }
    };

    const simulateRewardedVideoAd = () => {
        console.log("Simulating rewarded video ad...");

        // Simulate ad loading and watching
        setTimeout(() => {
            console.log("Ad watched successfully!");

            // Credit the reward to wallet
            setCoins(prev => prev + pendingReward);
            setIsAdWatched(true);
            setResult(`✅ ${pendingReward}💰 added to your wallet!`);
            setShowResult(true);

            // Clear pending reward
            setPendingReward(0);

            // Hide result after 3 seconds
            setTimeout(() => {
                setShowResult(false);
            }, 3000);
        }, 2000); // Simulate 2-second ad
    };

    const handleBackToWallet = () => {
        console.log("Back to Wallet clicked");
        // In a real app, this would navigate to the wallet screen
        // For now, we'll just log it
    };

    const handleBackNavigation = () => {
        console.log("Back navigation clicked");
    };

    return (
        <div
            className="relative w-full h-[620px] bg-black overflow-hidden"
            data-model-id="3721:8597"
        >
            {/* Spin Count Display at Top */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30">
                <motion.div
                    className="flex flex-col items-center gap-1 px-4 py-2 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#B8860B] rounded-full shadow-[0_4px_15px_rgba(255,215,0,0.5)] border-2 border-[#FFD700]"
                    animate={isSpinning ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                            "0 4px 15px rgba(255,215,0,0.5)",
                            "0 8px 25px rgba(255,215,0,0.8)",
                            "0 4px 15px rgba(255,215,0,0.5)"
                        ]
                    } : {
                        scale: [1, 1.05, 1]
                    }}
                    transition={isSpinning ? {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    } : {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <motion.span
                        className="text-[#2C1810] text-2xl font-black tracking-tight"
                        style={{
                            fontFamily: 'Arial Black, sans-serif',
                            fontWeight: 900,
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                        animate={isSpinning ? {
                            scale: [1, 1.2, 1],
                            color: ["#2C1810", "#FFD700", "#2C1810"]
                        } : {}}
                        transition={isSpinning ? {
                            duration: 0.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        } : {}}
                    >
                        {spins}
                    </motion.span>
                    <span
                        className="text-[#2C1810] text-xs font-bold tracking-wide"
                        style={{
                            fontFamily: 'Arial Black, sans-serif',
                            fontWeight: 700,
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                    >
                        SPINS
                    </span>
                </motion.div>
            </div>

            {/* 3D Animated Border for Slot Machine */}
            <div className="absolute top-[20px] left-0 w-full h-[563px] z-20 pointer-events-none">
                {/* Outer 3D border with animated glowing corners and sides */}
                <div className="relative w-full h-full">
                    {/* 3D border layers */}
                    <div className="absolute inset-0 rounded-[20px] border-[4px] border-gradient-to-br from-yellow-400 via-orange-500 to-red-700 shadow-[0_0_40px_10px_rgba(255,140,0,0.25),0_8px_32px_0_rgba(0,0,0,0.5)]"
                        style={{
                            boxShadow: `
                                0 0 32px 8px rgba(255, 200, 80, 0.25),
                                0 0 0 6px rgba(255, 180, 60, 0.10) inset,
                                0 8px 32px 0 rgba(0,0,0,0.5)
                            `,
                            borderImage: "linear-gradient(120deg, #FFD700 10%, #FF9800 40%, #B45309 90%) 1"
                        }}
                    ></div>
                    {/* Animated glowing corners */}
                    {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, idx) => (
                        <span
                            key={pos}
                            className={`absolute ${pos} w-8 h-8 pointer-events-none`}
                        >
                            <span
                                className="block w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 opacity-70 blur-[6px] animate-pulse"
                                style={{
                                    animationDelay: `${idx * 0.3}s`,
                                    filter: "drop-shadow(0 0 16px #FFD700) drop-shadow(0 0 32px #FF9800)"
                                }}
                            ></span>
                        </span>
                    ))}
                    {/* Animated glowing side lines */}
                    {[
                        { className: "top-0 left-8 right-8 h-2", deg: 0 },
                        { className: "bottom-0 left-8 right-8 h-2", deg: 180 },
                        { className: "left-0 top-8 bottom-8 w-2", deg: 270 },
                        { className: "right-0 top-8 bottom-8 w-2", deg: 90 }
                    ].map((side, idx) => (
                        <span
                            key={side.className}
                            className={`absolute ${side.className} pointer-events-none`}
                        >
                            <span
                                className="block w-full h-full rounded-full bg-gradient-to-r from-yellow-200 via-orange-400 to-red-500 opacity-60 blur-[2px] animate-border-glow"
                                style={{
                                    animationDelay: `${idx * 0.2}s`,
                                    background: side.deg % 180 === 0
                                        ? "linear-gradient(90deg, #FFD700 0%, #FF9800 60%, #B45309 100%)"
                                        : "linear-gradient(180deg, #FFD700 0%, #FF9800 60%, #B45309 100%)"
                                }}
                            ></span>
                        </span>
                    ))}
                </div>
                {/* Keyframes for border glow */}
                <style jsx>{`
                    @keyframes border-glow {
                        0%, 100% { opacity: 0.7; filter: blur(2px) brightness(1.1);}
                        50% { opacity: 1; filter: blur(6px) brightness(1.4);}
                    }
                    .animate-border-glow {
                        animation: border-glow 2.2s ease-in-out infinite;
                    }
                `}</style>
            </div>


            <div className="absolute top-[20px] left-0 w-full h-[563px] aspect-[0.68] z-10">
                <img
                    className="w-full h-full object-cover transition-transform duration-300"
                    alt="Spin wheel slot machine"
                    src="/spinwheel.png"
                />

                {/* Slot Machine Display Overlay - "2 SPINS" with Coins */}
                <div className="absolute top-[52%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    {/* Side lights and main frame container */}
                    <div className="relative flex items-center">

                        {/* Left side lights with animation */}
                        <div className="flex flex-col gap-0.5 mr-1">
                            {[...Array(4)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-gradient-to-br from-[#FFA500] to-[#FF8C00] rounded-full shadow-[0_0_4px_rgba(255,165,0,0.8)]"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.7, 1, 0.7],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Main slot machine frame with 3D effects */}
                        <motion.div
                            className="relative bg-gradient-to-b from-[#8B4513] via-[#6B3410] to-[#4A2511] rounded-xl p-[3px] shadow-[0_8px_25px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.6)]"
                            whileHover={{
                                scale: 1.02,
                                rotateY: 5,
                                rotateX: 2,
                            }}
                            whileTap={{
                                scale: 0.98,
                                rotateY: -2,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {/* Inner brown display area with 3D depth */}
                            <div className="relative bg-gradient-to-b from-[#D2B48C] via-[#BC9A6A] to-[#A0522D] rounded-lg p-[4px] shadow-[inset_0_3px_8px_rgba(0,0,0,0.3),inset_0_-1px_2px_rgba(255,255,255,0.1)]">
                                {/* Three panel slots container */}
                                <div className="flex items-stretch gap-0 rounded-md overflow-hidden">

                                    {/* Left Coin Panel with 3D animation */}
                                    <motion.div
                                        className="flex items-center justify-center w-[60px] h-[95px] bg-gradient-to-b from-[#DEB887] via-[#D2B48C] to-[#BC9A6A] border-r-[1px] border-[#8B4513]"
                                        whileHover={{ scale: 1.05 }}
                                        animate={isSpinning ? {
                                            rotateY: [0, 10, -10, 10, 0],
                                            scale: [1, 1.05, 1]
                                        } : {}}
                                        transition={isSpinning ? { duration: 3, ease: "easeOut" } : { type: "spring", stiffness: 400 }}
                                    >
                                        {/* Golden coin with 3D metallic effect */}
                                        <motion.div
                                            className="relative w-[35px] h-[35px]"
                                            animate={isSpinning ? {
                                                rotateY: [0, 360, 720, 1080, 1440, 1800, 0],
                                                rotateZ: [0, 180, 360, 540, 720, 0],
                                                scale: [1, 1.2, 1, 1.2, 1, 1]
                                            } : {
                                                rotateY: [0, 360],
                                                scale: [1, 1.05, 1],
                                                y: [0, -1, 0]
                                            }}
                                            transition={isSpinning ? {
                                                duration: 3,
                                                ease: "easeOut"
                                            } : {
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            {/* Outer shadow */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#B8860B] to-[#8B4513] rounded-full"></div>
                                            {/* Main coin body with 3D effect */}
                                            <div className="absolute inset-[1px] bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#CD853F] rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)]"></div>
                                            {/* Inner highlight */}
                                            <div className="absolute inset-[2px] bg-gradient-to-br from-[#FFE44D] to-[#FFD700] rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]"></div>
                                            {/* Dollar symbol */}
                                            <div className="absolute inset-[4px] flex items-center justify-center">
                                                <motion.span
                                                    className="text-[#2C1810] text-2xl font-black drop-shadow-[0_3px_4px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,215,0,0.8)]"
                                                    animate={isSpinning ? {
                                                        scale: [1, 1.3, 1],
                                                        rotate: [0, 180, 360, 540, 720, 0]
                                                    } : {
                                                        scale: [1, 1.1, 1],
                                                        rotate: [0, 5, -5, 0],
                                                    }}
                                                    transition={isSpinning ? {
                                                        duration: 3,
                                                        ease: "easeOut"
                                                    } : {
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    style={{
                                                        textShadow: isSpinning ? '0 0 10px rgba(255,215,0,0.8), 0 2px 4px rgba(0,0,0,0.8)' : '0 0 8px rgba(255,215,0,0.6), 0 2px 4px rgba(0,0,0,0.8)',
                                                        filter: isSpinning ? 'drop-shadow(0 0 6px rgba(255,215,0,0.6))' : 'drop-shadow(0 0 4px rgba(255,215,0,0.4))'
                                                    }}
                                                >
                                                    $
                                                </motion.span>
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Center Panel - Coin Image Only */}
                                    <motion.div
                                        className="flex items-center justify-center w-[75px] h-[95px] bg-gradient-to-b from-[#DEB887] via-[#D2B48C] to-[#BC9A6A] border-r-[1px] border-[#8B4513] relative overflow-hidden"
                                        animate={isSpinning ? {
                                            boxShadow: [
                                                "inset 0 0 0 rgba(255,215,0,0)",
                                                "inset 0 0 30px rgba(255,215,0,0.8)",
                                                "inset 0 0 0 rgba(255,215,0,0)"
                                            ],
                                            scale: [1, 1.1, 1],
                                            rotateZ: [0, 5, -5, 0]
                                        } : {
                                            boxShadow: [
                                                "inset 0 0 0 rgba(255,215,0,0)",
                                                "inset 0 0 20px rgba(255,215,0,0.3)",
                                                "inset 0 0 0 rgba(255,215,0,0)"
                                            ]
                                        }}
                                        transition={isSpinning ? {
                                            duration: 3,
                                            ease: "easeOut"
                                        } : {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        {/* Coin Image in Center */}
                                        <motion.div
                                            className="relative w-[45px] h-[45px]"
                                            animate={isSpinning ? {
                                                rotateY: [0, 360, 720, 1080, 1440, 1800, 0],
                                                rotateX: [0, 180, 360, 540, 720, 0],
                                                scale: [1, 1.2, 1, 1.2, 1, 1]
                                            } : {
                                                rotateY: [0, 360],
                                                scale: [1, 1.1, 1],
                                                y: [0, -2, 0]
                                            }}
                                            transition={isSpinning ? {
                                                duration: 3,
                                                ease: "easeOut"
                                            } : {
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <img
                                                src="/dollor.png"
                                                alt="Coin"
                                                className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(255,215,0,0.6)]"
                                                style={{
                                                    filter: isSpinning ? 'drop-shadow(0 0 12px rgba(255,215,0,0.9)) brightness(1.3)' : 'drop-shadow(0 0 6px rgba(255,215,0,0.6))'
                                                }}
                                            />
                                        </motion.div>
                                    </motion.div>

                                    {/* Right Coin Panel with 3D animation */}
                                    <motion.div
                                        className="flex items-center justify-center w-[60px] h-[95px] bg-gradient-to-b from-[#DEB887] via-[#D2B48C] to-[#BC9A6A]"
                                        whileHover={{ scale: 1.05 }}
                                        animate={isSpinning ? {
                                            rotateY: [0, -10, 10, -10, 0],
                                            scale: [1, 1.05, 1]
                                        } : {}}
                                        transition={isSpinning ? { duration: 3, ease: "easeOut" } : { type: "spring", stiffness: 400 }}
                                    >
                                        {/* Golden coin with 3D metallic effect */}
                                        <motion.div
                                            className="relative w-[35px] h-[35px]"
                                            animate={isSpinning ? {
                                                rotateY: [0, -360, -720, -1080, -1440, -1800, 0],
                                                rotateZ: [0, -180, -360, -540, -720, 0],
                                                scale: [1, 1.2, 1, 1.2, 1, 1]
                                            } : {
                                                rotateY: [0, -360],
                                                scale: [1, 1.05, 1],
                                                y: [0, 1, 0]
                                            }}
                                            transition={isSpinning ? {
                                                duration: 3,
                                                ease: "easeOut"
                                            } : {
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            {/* Outer shadow */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#B8860B] to-[#8B4513] rounded-full"></div>
                                            {/* Main coin body with 3D effect */}
                                            <div className="absolute inset-[1px] bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#CD853F] rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)]"></div>
                                            {/* Inner highlight */}
                                            <div className="absolute inset-[2px] bg-gradient-to-br from-[#FFE44D] to-[#FFD700] rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]"></div>
                                            {/* Dollar symbol */}
                                            <div className="absolute inset-[4px] flex items-center justify-center">
                                                <motion.span
                                                    className="text-[#2C1810] text-2xl font-black drop-shadow-[0_3px_4px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,215,0,0.8)]"
                                                    animate={isSpinning ? {
                                                        scale: [1, 1.3, 1],
                                                        rotate: [0, -180, -360, -540, -720, 0]
                                                    } : {
                                                        scale: [1, 1.1, 1],
                                                        rotate: [0, -5, 5, 0],
                                                    }}
                                                    transition={isSpinning ? {
                                                        duration: 3,
                                                        ease: "easeOut"
                                                    } : {
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    style={{
                                                        textShadow: isSpinning ? '0 0 10px rgba(255,215,0,0.8), 0 2px 4px rgba(0,0,0,0.8)' : '0 0 8px rgba(255,215,0,0.6), 0 2px 4px rgba(0,0,0,0.8)',
                                                        filter: isSpinning ? 'drop-shadow(0 0 6px rgba(255,215,0,0.6))' : 'drop-shadow(0 0 4px rgba(255,215,0,0.4))'
                                                    }}
                                                >
                                                    $
                                                </motion.span>
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                </div>

                                {/* Sparkle effects during spinning */}
                                {isSpinning && (
                                    <>
                                        {/* Left sparkles */}
                                        <motion.div
                                            className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full"
                                            animate={{
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                                y: [0, -20, -40],
                                                x: [0, -10, -20]
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0,
                                                repeat: 3,
                                                ease: "easeOut"
                                            }}
                                        />
                                        <motion.div
                                            className="absolute top-4 left-4 w-1 h-1 bg-orange-400 rounded-full"
                                            animate={{
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                                y: [0, -15, -30],
                                                x: [0, 5, 10]
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.3,
                                                repeat: 3,
                                                ease: "easeOut"
                                            }}
                                        />

                                        {/* Right sparkles */}
                                        <motion.div
                                            className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full"
                                            animate={{
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                                y: [0, -20, -40],
                                                x: [0, 10, 20]
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.2,
                                                repeat: 3,
                                                ease: "easeOut"
                                            }}
                                        />
                                        <motion.div
                                            className="absolute top-4 right-4 w-1 h-1 bg-orange-400 rounded-full"
                                            animate={{
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                                y: [0, -15, -30],
                                                x: [0, -5, -10]
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.5,
                                                repeat: 3,
                                                ease: "easeOut"
                                            }}
                                        />

                                        {/* Center sparkles */}
                                        <motion.div
                                            className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-300 rounded-full"
                                            animate={{
                                                scale: [0, 1.5, 0],
                                                opacity: [0, 1, 0],
                                                y: [0, -10, -20],
                                                x: [0, 0, 0]
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.1,
                                                repeat: 3,
                                                ease: "easeOut"
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {/* Right side lights with animation */}
                        <div className="flex flex-col gap-0.5 ml-1">
                            {[...Array(4)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-gradient-to-br from-[#FFA500] to-[#FF8C00] rounded-full shadow-[0_0_4px_rgba(255,165,0,0.8)]"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.7, 1, 0.7],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                />
                            ))}
                        </div>

                    </div>
                </div>

                {/* PUSH TO SPIN Button Overlay */}
                <div className="absolute top-[67%] left-1/2  mr-2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <motion.button
                        onClick={handleSpin}
                        className="w-[200px] h-12 bg-gradient-to-b from-red-600 to-red-800 text-white text-lg font-bold px-8 rounded-lg shadow-[0_8px_0px_#8f1a1a,inset_0_2px_4px_rgba(255,255,255,0.4)] border-2 border-red-900"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98, y: 4, boxShadow: '0 4px 0px #8f1a1a, inset 0 2px 4px rgba(255,255,255,0.4)' }}
                    >
                        PUSH TO SPIN
                    </motion.button>
                </div>
            </div>

            <button
                onClick={handleWatchToRedeem}
                className={`top-[500px]     left-[calc(50.00%_-_122px)] w-60 h-[55px] gap-[9.7px] rounded-[12.97px] overflow-hidden flex absolute cursor-pointer transition-all ${pendingReward > 0
                    ? 'bg-[linear-gradient(180deg,rgba(223,131,40,1)_0%,rgba(221,135,42,1)_100%)] hover:scale-105'
                    : 'bg-gray-500 cursor-not-allowed opacity-50'
                    }`}
                aria-label="Watch video to redeem"
                disabled={pendingReward === 0}
            >
                <img
                    className="mt-[7px] w-[42px] h-[42px] ml-[18px] aspect-[1] object-cover"
                    alt=""
                    src="https://c.animaapp.com/3wi5zxvU/img/image-3941@2x.png"
                />

                <span className="mt-[15.1px] w-[146px] h-6 [font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
                    {pendingReward > 0 ? `Watch to Redeem ${pendingReward}💰` : 'No Reward to Redeem'}
                </span>
            </button>

            {/* Header with App Version and Back Button */}


            {/* Pending Reward Indicator */}
            {/* {pendingReward > 0 && (
                <div className="absolute  left-1/2 transform -translate-x-1/2 z-40">
                    <div className="bg-yellow-500 text-black px-4 py-2 rounded-full shadow-lg animate-pulse">
                        <div className="text-sm font-bold">🎉 {pendingReward}💰 Pending!</div>
                        <div className="text-xs">Watch ad to redeem</div>
                    </div>
            </div>
            )} */}

            {/* Result Modal */}
            {showResult && (
                <motion.div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-3xl p-8 mx-4 text-center shadow-2xl border-2 border-[#8f4d1e] max-w-sm relative overflow-hidden"
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            duration: 0.5
                        }}
                    >
                        {/* Animated background particles */}
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                    animate={{
                                        x: [0, Math.random() * 200 - 100],
                                        y: [0, Math.random() * 200 - 100],
                                        scale: [0, 1, 0],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        delay: i * 0.2,
                                        repeat: Infinity,
                                        repeatDelay: 3
                                    }}
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`
                                    }}
                                />
                            ))}
                        </div>

                        {/* Main content */}
                        <div className="relative z-10">
                            {/* Animated emoji with coin icons for congratulations */}
                            <motion.div
                                className="text-6xl mb-6"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: result.includes("🎉") ? 3 : 0,
                                    ease: "easeInOut"
                                }}
                            >
                                {result.includes("🎉") ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-5xl">🎉</span>
                                        <motion.div
                                            animate={{
                                                rotate: [0, 360],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <img
                                                src="/dollor.png"
                                                alt="Coin"
                                                className="w-8 h-8"
                                            />
                                        </motion.div>
                                    </div>
                                ) : result.includes("🚫") ? (
                                    <span className="text-5xl">🚫</span>
                                ) : (
                                    <span className="text-5xl">😔</span>
                                )}
                            </motion.div>

                            {/* Title with improved styling */}
                            <motion.h2
                                className="text-2xl font-bold mb-6 text-white leading-relaxed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                            >
                                {result.includes("🎉") ? "Congratulations!" :
                                    result.includes("🚫") ? "Daily Limit Reached" :
                                        "Better Luck Next Time"}
                            </motion.h2>

                            {/* Description with coin icons for rewards */}
                            <motion.div
                                className="text-lg text-gray-300 mb-6 leading-relaxed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                            >
                                {result.includes("🎉") ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>You won</span>
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                rotate: [0, 10, -10, 0]
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: 2,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <img
                                                src="/dollor.png"
                                                alt="Coin"
                                                className="w-6 h-6"
                                            />
                                        </motion.div>
                                        <span className="font-bold text-yellow-400">{pendingReward}</span>
                                        <span>coins!</span>
                                    </div>
                                ) : result.includes("🚫") ? (
                                    <div>
                                        <p>You've used all {maxDailySpins} spins today.</p>
                                        <p className="text-sm text-gray-400 mt-2">Come back tomorrow for more spins!</p>
                                    </div>
                                ) : (
                                    <p>No reward this time. Try spinning again!</p>
                                )}
                            </motion.div>

                            {/* Status information */}
                            {!result.includes("🚫") && (
                                <motion.div
                                    className="bg-[#2a2a2a] rounded-xl p-4 mb-4"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ scale: [1, 1.02, 1] }}
                                    transition={{ delay: 0.4, duration: 0.3 }}
                                >
                                    <p className="text-gray-400 text-sm">
                                        Daily Spins: <span className="text-yellow-400 font-semibold">{dailySpinsUsed}/{maxDailySpins}</span>
                                    </p>
                                </motion.div>
                            )}

                            {/* Limit reached info */}
                            {result.includes("🚫") && (
                                <motion.div
                                    className="bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-xl p-4 mb-4 border border-red-700/50"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4, duration: 0.3 }}
                                >
                                    <p className="text-red-300 text-sm font-medium">
                                        Daily Spins Used: {dailySpinsUsed}/{maxDailySpins}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        Resets at midnight
                                    </p>
                                </motion.div>
                            )}

                            {/* Pending reward indicator */}
                            {pendingReward > 0 && (
                                <motion.div
                                    className="bg-gradient-to-r from-yellow-900/30 to-orange-800/20 rounded-xl p-4 border border-yellow-600/50"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        scale: [1, 1.02, 1]
                                    }}
                                    transition={{
                                        delay: 0.5,
                                        duration: 0.4,
                                        scale: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <img
                                            src="/dollor.png"
                                            alt="Coin"
                                            className="w-5 h-5"
                                        />
                                        <span className="text-yellow-400 font-bold text-sm">
                                            {pendingReward} coins pending
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1">
                                        Watch ad to redeem
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Audio element for sound effects */}
            <audio
                ref={audioRef}
                preload="auto"
                src="/spinning-coin-on-table-352448.mp3"
            />

        </div>
    );
}
