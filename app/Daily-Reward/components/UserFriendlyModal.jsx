"use client";

import React, { useEffect } from "react";

export const UserFriendlyModal = ({ isVisible, onClose, title, children, showCloseButton = true, autoClose = false, autoCloseDelay = 3000 }) => {
    if (!isVisible) return null;

    // Auto-close functionality
    useEffect(() => {
        if (autoClose && isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoClose, autoCloseDelay, onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop - More transparent to show background content */}
            <div
                className="absolute inset-0 bg-black bg-opacity-10"
                onClick={onClose}
            />

            {/* Modal Content - Smaller size */}
            <div
                className="relative w-[280px] bg-black/90 backdrop-blur-md rounded-[12px] px-3 py-2 shadow-2xl border border-gray-600/50 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className="text-white font-medium text-sm [font-family:'Poppins',Helvetica] leading-normal mb-2">
                        <div className="text-center text-gray-200 font-bold text-sm">
                            {title}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="text-white font-medium text-xs [font-family:'Poppins',Helvetica] leading-normal">
                    <div className="text-center text-gray-200">
                        {children}
                    </div>
                </div>

                {/* Close Button */}
                {showCloseButton && (
                    <div className="mt-2 flex justify-center">
                        <button
                            onClick={onClose}
                            className="bg-gray-600/50 hover:bg-gray-500/50 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                        >
                            OK
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
