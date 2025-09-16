'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useOnboardingStore from '@/stores/useOnboardingStore'
import { useSelector } from 'react-redux';


export default function AgeSelection() {
  const router = useRouter()
  const { ageRange, setAgeRange, setCurrentStep } = useOnboardingStore()
  const { ageOptions, status: onboardingStatus, error } = useSelector((state) => state.onboarding);
  const [selectedIndex, setSelectedIndex] = useState(0)
  const wheelRef = useRef(null)
  const itemHeight = 50


  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])



  const handleSelectAge = async (ageOptionId) => {
    await setAgeRange(ageOptionId)
    setTimeout(() => {
      router.push('/select-gender')
    }, 200)
  }

  const handleScroll = (e) => {
    if (!ageOptions.length) return

    const scrollTop = e.target.scrollTop
    const index = Math.round(scrollTop / itemHeight)
    const clampedIndex = Math.max(0, Math.min(index, ageOptions.length - 1))

    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex)
    }
  }

  const handleWheelClick = (index) => {
    setSelectedIndex(index)
    if (wheelRef.current) {
      wheelRef.current.scrollTop = index * itemHeight
    }
    if (ageOptions[index]) {
      handleSelectAge(ageOptions[index].id)
    }
  }


  return (
    <div className='relative w-full h-screen bg-[#272052] overflow-hidden'>
      <div className='absolute w-[542px] h-[542px] top-0 left-0 bg-[#af7de6] rounded-[271px] blur-[250px]' />

      <div className='absolute top-[100px] left-0 px-4'>
        <h1 className='text-white font-poppins font-normal text-4xl tracking-wide leading-tight'>
          Select your age <br /> range
        </h1>
        <p className='mt-4 text-white font-poppins font-light text-base'>
          Helps with content filtering, COPPA <br /> compliance, and reward
          expectations
        </p>
      </div>

      <div className='absolute inset-0 w-full flex items-center mt-50 justify-center'>
        <div className='relative w-full mx-4'>
          {onboardingStatus === 'loading' && (
            <div className='text-white text-lg text-center p-4'>Loading...</div>
          )}
          {onboardingStatus === 'failed' && (
            <div className='text-red-400 text-lg text-center p-4'>{error}</div>
          )}
          {onboardingStatus === 'succeeded' && (
            <div className='relative h-[250px] rounded-xl bg-[rgba(255,255,255,0.1)] backdrop-blur-sm'>
              {/* Wheel picker container */}
              <div
                ref={wheelRef}
                className='h-full overflow-y-scroll scrollbar-hide'
                onScroll={handleScroll}
                style={{
                  scrollSnapType: 'y mandatory',
                  scrollBehavior: 'smooth'
                }}
              >
                <div style={{ height: `${itemHeight * 2}px` }} />

                {ageOptions.map((option, index) => (
                  <div
                    key={option.id}
                    onClick={() => handleWheelClick(index)}
                    className={`flex items-center justify-center cursor-pointer transition-all duration-200 ${selectedIndex === index
                      ? 'bg-white rounded-lg mx-1  shadow-lg transform scale-105'
                      : 'bg-transparent hover:bg-white/10'
                      }`}
                    style={{
                      height: `${itemHeight}px`,
                      scrollSnapAlign: 'center'
                    }}
                  >
                    <div
                      className={`[font-family:'Poppins',Helvetica] text-lg text-center tracking-[0] leading-6 transition-all duration-200 ${selectedIndex === index
                        ? 'text-[#6433aa] font-semibold'
                        : 'text-white font-normal opacity-60'
                        }`}
                    >
                      {option.label}
                    </div>
                  </div>
                ))}

                <div style={{ height: `${itemHeight * 2}px` }} />
              </div>

              <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                <div className='w-full h-[50px] border-t-2 border-b-2 border-white/30 bg-white/5' />
              </div>

              <div className='pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-[rgba(39,32,82,0.8)] via-transparent to-[rgba(39,32,82,0.8)]' />
            </div>
          )}
        </div>
      </div>

    </div>
  )
}