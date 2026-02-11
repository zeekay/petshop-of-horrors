/**
 * Hero Component
 * Main landing section with headline, description, and call-to-action
 * Features responsive layout with text content and hero image
 */

import Button from './Button'
import { HeroImage } from '../assets/images/images'

const Hero = () => {
    return (
        <section className='w-screen bg-lightPurple px-8 py-20 lg:p-24 text-center flex flex-col lg:flex-row items-center justify-center lg:justify-between'>
            {/* Content Section - Left side on desktop, top on mobile */}
            <div className='flex flex-col items-center justify-center lg:items-start lg:justify-normal lg:w-1/2'>
                <h1 className='text-5xl lg:text-7xl text-textColor font-semibold'>{`Pet Store\n& Beyond`}</h1>
                
                <p className='text-lg text-textColor opacity-50 py-10'>
                    This is a sample landing page, created with Figma and Anima.
                    No coding involved.
                </p>
                
                <Button
                    title='Get Started'
                    mainClassName='bg-yellowColor'
                />
            </div>
            
            {/* Hero Image Section - Right side on desktop, bottom on mobile */}
            <div className='shrink-0 w-full mt-10 lg:mt-0 lg:w-1/2 lg:h-[460px]'>
                <img
                    className='w-full h-full'
                    src={HeroImage}
                    alt='Hero'
                />
            </div>
        </section>
    )
}

export default Hero