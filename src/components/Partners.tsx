import { PartnersDesktop, PartnersMobile } from '../assets/images/images'

const Partners = () => {
    return (
        <section className='w-screen bg-whiteColor px-8 py-20 lg:p-24 flex items-center justify-center'>
            <div className='shrink-0 w-full lg:hidden'>
                <img
                    className='w-full h-full'
                    src={PartnersMobile}
                    alt='Partners'
                />
            </div>
            <div className='shrink-0 hidden lg:flex'>
                <img
                    className='w-full h-full'
                    src={PartnersDesktop}
                    alt='Partners'
                />
            </div>
        </section>
    )
}

export default Partners