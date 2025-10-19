"use client";
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchFullWalletTransactions } from '@/lib/redux/slice/walletTransactionsSlice';
import { useAuth } from '@/contexts/AuthContext';
import { HighestTransctionCard } from './HighestTransctionCard';

const FullTransactionHistroy = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { token } = useAuth();

    // Get full transactions from Redux store
    const { fullTransactions, fullTransactionsStatus, pagination } = useSelector((state) => state.walletTransactions);


    const handleBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <section className="flex flex-col items-center p-4 w-full max-w-[335px] mx-auto">
                <div className="flex flex-col gap-4 items-center w-full">
                    <div className="w-full flex items-center justify-center relative mt-[24px] mb-3">
                        <button
                            onClick={handleBack}
                            className="absolute left-0 [font-family:'Poppins',Helvetica] font-medium text-white text-[16px] tracking-[-0.17px] leading-[18px] bg-transparent border-none cursor-pointer hover:underline"
                        >
                            ←
                        </button>
                        <div className="[font-family:'Poppins',Helvetica] font-semibold text-[#F4F3FC] text-[16px] tracking-[-0.17px] leading-[18px] opacity-[100%] text-center">
                            Full Transaction History
                        </div>
                    </div>
                    <div className="w-full flex flex-col items-center gap-4">
                        {fullTransactions.length > 0 ? (
                            fullTransactions.map((data) => (
                                <HighestTransctionCard
                                    key={data.id}
                                    {...data}
                                />
                            ))
                        ) : (
                            <div className="text-center text-gray-400 mt-8">
                                <p>No transactions found</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FullTransactionHistroy
