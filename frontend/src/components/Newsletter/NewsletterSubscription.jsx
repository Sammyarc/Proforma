import {useState} from 'react';
import {GoMail} from 'react-icons/go';
import { HiArrowRight } from 'react-icons/hi';

const NewsletterSubscription = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically handle the actual subscription
        console.log('Subscribing email:', email);
        setIsSubmitted(true);
        setEmail('');

        // Reset submission status after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false);
        }, 3000);
    };

    return (
        <section className="bg-neutral-700 mx-[3vw] rounded-2xl py-6 px-8 md:rounded-[1vw] md:py-12 md:px-4">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                {/* Left column - Form */}
                <div className="md:p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-2 md:mb-4">
                            <label
                                htmlFor="email"
                                className="hidden text-[vw] font-medium text-white font-satoshi mb-1 md:text-[1vw] md:block">
                                Email Address
                            </label>
                            <div className='flex flex-col gap-2 md:flex-row md:items-center'>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        placeholder="your@email.com"
                                        autoComplete="on"
                                        value={email}
                                        className='w-full outline-none border bg-transparent text-white px-[2.5vw] py-[3vw] rounded-[1.5vw] font-satoshi pr-[9vw] hover:outline hover:outline-2 hover:outline-neutral-200 focus:outline focus:outline-2 focus:outline-neutral-200 md:w-[20vw] md:px-[1vw] md:py-[0.8vw] md:rounded-[0.5vw] md:pr-[3vw]'
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => setEmail(email.toLowerCase())}/>
                                    <div
                                        className="absolute inset-y-0 right-[3vw] md:right-[1vw] flex items-center">
                                        <GoMail className="text-white text-[6vw] md:text-[1.3vw]"/>
                                    </div>
                                </div>

                                <button
                                    type='submit'
                                    className="px-[4vw] py-[2vw] mt-[3vw] w-[30vw] flex justify-center gap-x-[0.5vw] bg-white items-center font-satoshi font-bold border border-neutral-500 rounded-3xl box md:px-[1.5vw] md:py-[0.8vw] md:mt-0 md:w-[10vw]">
                                    Subscribe
                                    <HiArrowRight size={20} className='hidden md:flex'/>
                                </button>
                            </div>
                        </div>
                        {
                            isSubmitted && (
                                <p className="mt-2 text-sm font-satoshi text-green-600">
                                    Thanks for subscribing!
                                </p>
                            )
                        }
                    </form>
                </div>

                {/* Right column - Text content */}
                <div className="flex flex-col justify-center">
                    <h2 className="text-[6vw] font-bold text-white font-satoshi mb-2 md:text-[2vw]">
                        Stay Updated with Our Newsletter
                    </h2>
                    <p className="text-gray-300 font-satoshi mb-4">
                        Join our subscriber list to get the latest updates, exclusive offers, and
                        insights delivered directly to your inbox. We promise we won&apos;t spam you!
                    </p>
                    <ul className="text-gray-300 font-satoshi">
                        <li className="flex items-center mb-2">
                            <svg
                                className="h-5 w-5 text-white mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"/>
                            </svg>
                            Weekly industry updates
                        </li>
                        <li className="flex items-center mb-2">
                            <svg
                                className="h-5 w-5 text-white mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"/>
                            </svg>
                            Exclusive subscriber discounts
                        </li>
                        <li className="flex items-center">
                            <svg
                                className="h-5 w-5 text-white mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"/>
                            </svg>
                            Tips and best practices
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSubscription;