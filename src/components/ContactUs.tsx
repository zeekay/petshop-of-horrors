import Button from './Button'
import { ContactUsImage } from '../assets/images/images'

const ContactUs = () => {
    return (
        <section className='w-screen bg-offWhiteColor px-8 py-20 lg:p-24 flex flex-col lg:flex-row items-center justify-center lg:justify-between'>
            <div className='flex flex-col items-center justify-center lg:items-start lg:justify-normal lg:w-1/2'>
                <h1 className='text-5xl text-textColor font-semibold'>{`Let’s talk, woof!`}</h1>
                <p className='text-lg text-textColor opacity-50 my-8'>{`You can ask us questions about your pet, and we will be happy to answer you!`}</p>
                <Button
                    title='Contact Us'
                    mainClassName='bg-yellowColor'
                />
            </div>
            <div className='shrink-0 w-full mt-16 lg:mt-0 lg:w-1/2 lg:h-[460px]'>
                <img
                    className='w-full h-full'
                    src={ContactUsImage}
                    alt='Contact Us'
                />
            </div>
        </section>
    )
}

export default ContactUs