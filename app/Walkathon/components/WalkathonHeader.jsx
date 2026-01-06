"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Walkathon Header Component
 * Displays page header with back button and title
 */
export const WalkathonHeader = ({ title = "Walkathon Challenge" }) => {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between w-full px-4 py-3 mb-4"
        >
            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBack}
                    className="relative w-6 h-6 flex-shrink-0"
                    aria-label="Go back"
                >
                    <Image
                        width={24}
                        height={24}
                        className="w-6 h-6"
                        alt="Back"
                        src="https://c.animaapp.com/V1uc3arn/img/arrow-back-ios-new@2x.png"
                    />
                </motion.button>

                <h1 className="font-semibold text-white text-xl leading-5">{title}</h1>
            </div>
        </motion.header>
    );
};


