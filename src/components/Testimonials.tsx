import { User } from '../assets/images/images'
import { QuoteIcon } from '../assets/icons/icons'

const Testimonials = () => {
    return (
        <section className='w-screen bg-lightPurple px-8 py-20 lg:p-24 flex flex-col lg:flex-row items-center justify-center'>
            <div className='shrink-0 w-64 lg:w-80'>
                <img
                    className='w-full h-full'
                    src={User}
                    alt='User'
                />
            </div>
            <div className='w-full px-5 mt-16 lg:mt-0 lg:w-1/3 lg:ml-14'>
                <div className='shrink-0 w-14'>
                    <img
                        className='w-full h-full'
                        src={QuoteIcon}
                        alt='Quote'
                    />
                </div>
                <p className='text-lg font-bold text-textColor mt-5 mb-10'>
                    We love using PETSHOP products.  Environmentally friendly and sustainable.
                    We have the sustainable dog bowls and regularly use the mint scented poo bags which were all such great value for money.
                </p>
                <p className='text-lg text-textColor opacity-50'>Dylan Shaw</p>
            </div>
        </section>
    )
}

export default Testimonials