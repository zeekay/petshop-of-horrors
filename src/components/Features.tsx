/**
 * Features Component
 * Showcases the main features/services of the PetShop
 * Displays 4 key features in a responsive grid layout with icons and descriptions
 */

import React from 'react'
import { Feature1, Feature2, Feature3, Feature4 } from '../assets/images/images';

// TypeScript interface for feature props
interface Feature {
    icon: any;           
    title: string;       
    description: string; 
    className?: string;  
}

const Features = () => {

    const RenderFeature = (props: Feature) => {
        return (
            <div className={`${props.className} flex flex-col items-center justify-center`}>
                {/* Feature Icon Container */}
                <div className='shrink-0 w-24 h-24'>
                    <img
                        className='w-full h-full'
                        src={props.icon}
                        alt='Feature Icon'
                    />
                </div>
                
                {/* Feature Title */}
                <h3 className='text-lg font-bold text-textColor text-center mt-10'>{props.title}</h3>
                
                {/* Feature Description */}
                <p className='text-lg text-textColor text-center opacity-50 mt-4'>{props.description}</p>
            </div>
        );
    }

    return (
        <section className='w-screen bg-whiteColor px-8 py-20 lg:p-24 flex flex-col lg:flex-row items-center justify-center lg:justify-between'>
            {/* Feature 1: Pet Food */}
            <RenderFeature
                className='lg:w-56'
                icon={Feature1}
                title={`Best quality pet food`}
                description={`Super delicious food. Available in a range of delicious flavors.`}
            />
            
            {/* Feature 2: Toys & Accessories */}
            <RenderFeature
                className='my-10 lg:my-0 lg:w-56'
                icon={Feature2}
                title={`Toys & Accessories`}
                description={`Soft toys, chew toys, and rope toys. Strong, interactive, and fun.`}
            />
            
            {/* Feature 3: Medical Care */}
            <RenderFeature
                className='lg:w-56'
                icon={Feature3}
                title={`Pets medical care`}
                description={`You can get a wide range of great treatments for your dog.`}
            />
            
            {/* Feature 4: Grooming Services */}
            <RenderFeature
                className='mt-10 lg:mt-0 lg:w-56'
                icon={Feature4}
                title={`Full service grooming`}
                description={`It's the right time to groom your dog with a variety of treatments.`}
            />
        </section>
    )
}

export default Features