import React from 'react'
import Link from "next/link";
import NextImage from "next/image";
export const Header = () => {
    return (
        <div className='w-[334px] h-full  flex-col justify-center items-center'>
            <div className=" font-normal  w-[334px]  text-[#A4A4A4]  mr-1 text-[10px] leading-3">
                App Version: V0.0.1
            </div>

            <header className="flex flex-col w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl items-center justify-center gap-2 pt-7 pb-2 mx-auto">
                <div className="flex items-center w-full max-w-full px-0 sm:px-2 md:px-4 lg:px-6" /* moved left by reducing px padding */>
                    <Link
                        className="relative w-6 h-6 flex-shrink-0"
                        aria-label="Go back"
                        href="/cash-coach"
                    >
                        <svg
                            className="w-6 h-6 mt-[3px]"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M15 18L9 12L15 6"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Link>
                    <h1 className="font-semibold text-[#FFFFFF] text-[20px] leading-5 flex-1 ml-2 text-left truncate">
                        Achieve Your Goal
                    </h1>
                </div>
            </header>

        </div>
    )
}
