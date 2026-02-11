import React from 'react'

const Video = () => {
    return (
        <section className='w-screen bg-lightGreen px-8 py-20 lg:p-24 flex flex-col items-center justify-center'>
            <video
                className='rounded-lg w-full h-full object-cover lg:w-1/2'
                src={`https://cdn.animaapp.com/projects/60d876f00b85a9c710f9b3a3/files/pexels-yaroslav-shuraev-9632184.mp4`}
                anima-src={`https://cdn.animaapp.com/projects/60d876f00b85a9c710f9b3a3/files/pexels-yaroslav-shuraev-9632184.mp4`}
                loop
                controls
                playsInline
                muted
                autoPlay
            />
        </section>
    )
}

export default Video