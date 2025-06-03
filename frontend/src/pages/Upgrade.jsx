
import { useState, useEffect, useRef } from 'react';
import { CreditCard, Star } from 'lucide-react';
import { GoChevronDown, GoShieldLock } from 'react-icons/go';
import Visa from '../assets/Images/SVG Icons/visa-logo-svgrepo-com.svg';
import Gpay from '../assets/Images/SVG Icons/gpay-logo.svg';
import Mastercard from '../assets/Images/SVG Icons/mastercard-logo.svg';
import Discover from '../assets/Images/SVG Icons/discover-logo.svg';

export default function Upgrade() {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    country: '',
    postalCode: ''
  });

   const [isProcessing, setIsProcessing] = useState(false);
   const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef();
    
    useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
    
    // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        // Using REST Countries API as an example
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
        const data = await response.json();
        
        // Sort countries alphabetically
        const sortedCountries = data
          .map(country => ({
            code: country.cca2,
            name: country.name.common
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setCountries(sortedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        // Fallback countries if API fails
        setCountries([
          { code: 'US', name: 'United States' },
          { code: 'UK', name: 'United Kingdom' },
          { code: 'CA', name: 'Canada' },
          { code: 'AU', name: 'Australia' },
          { code: 'DE', name: 'Germany' },
          { code: 'FR', name: 'France' }
        ]);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);
    
    const handleSelect = (countryCode) => {
    setCardData((prev) => ({ ...prev, country: countryCode }));
    setIsOpen(false);
    };
    
    const selectedCountry = countries.find((c) => c.code === cardData.country);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 3) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setCardData(prev => ({ ...prev, expiryDate: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      alert('Upgrade successful! Welcome to Pro!');
    }, 2000);
  };

  const proFeatures = [
    { text: "Create unlimited invoices" },
    { text: "Advanced customization" },
    { text: "PDF generation" },
    { text: "Priority email support" },
    { text: "PDF Downloads" },
    { text: "Client management" },
    { text: "Payment integrations" },
    { text: "One month free" },
    { text: "Advanced reporting" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-satoshi mb-4">
            Upgrade to Pro
          </h1>
          <p className="text-lg max-w-2xl mx-auto font-satoshi">
            Unlock the full potential of our platform with advanced features and priority support
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 bg-white shadow-xl rounded-lg gap-8 lg:gap-4">
            
            {/* Payment Form - Left Side */}
            <div className="order-2 lg:order-1">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold font-satoshi">Payment Details</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Card Number */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-satoshi">
                      Card Number
                    </label>
                     <div className="flex items-center gap-2">
                        {/* Visa */}
                        <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                          <img src={Visa} className='w-full h-full object-cover' />
                        </div>
                        
                        {/* Mastercard */}
                        <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                          <img src={Mastercard} className='w-full h-full object-cover' />
                        </div>
                        
                        {/* AGoogle Pay */}
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                          <img src={Gpay} className='w-full h-full object-contain' />
                        </div>
                        
                        {/* Discover */}
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                          <img src={Discover} className='w-full h-full object-contain' />
                        </div>
                      </div>                     
                    </div>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-4 py-3 font-satoshi border border-gray-400 bg-transparent rounded-lg placeholder-gray-400 outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 transition-all"
                      required
                    />
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-satoshi mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-3 font-satoshi border border-gray-400 bg-transparent rounded-lg placeholder-gray-400 outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-satoshi mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-3 font-satoshi border border-gray-400 bg-transparent rounded-lg placeholder-gray-400 outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Name on Card */}
                  <div>
                    <label className="block text-sm font-satoshi mb-2">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      name="nameOnCard"
                      value={cardData.nameOnCard}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 font-satoshi border border-gray-400 bg-transparent rounded-lg placeholder-gray-400 outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 transition-all"
                      required
                    />
                  </div>

                  {/* Country and Postal Code */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-satoshi mb-2">
                        Country
                      </label>
                      <div className="relative w-full" ref={dropdownRef}>
                        <button type="button" onClick={()=> setIsOpen((prev) => !prev)}
                            disabled={loadingCountries}
                            className="w-full px-4 py-3 font-satoshi border border-gray-400 bg-transparent rounded-lg flex justify-between
                            items-center text-left cursor-pointer outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline
                            focus:outline-2 focus:outline-neutral-700 transition-all"
                            >
                            <span>
                                {loadingCountries
                                ? "Loading countries..."
                                : selectedCountry
                                ? selectedCountry.name
                                : "Select Country"}
                            </span>
                            <GoChevronDown className={`w-5 h-5 transition-transform duration-300 ${ isOpen ? "rotate-180" : "" }`} />
                        </button>

                        {isOpen && (
                            <ul
                            className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md max-h-60 overflow-y-auto shadow-lg text-sm">
                            {countries.map((country) => (
                            <li key={country.code} onClick={()=> handleSelect(country.code)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                {country.name}
                            </li>
                            ))}
                            </ul>
                        )}
                    </div>
                    </div>
                    <div>
                      <label className="block text-sm font-satoshi mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={cardData.postalCode}
                        onChange={handleInputChange}
                        placeholder="12345"
                        className="w-full px-4 py-3 font-satoshi border border-gray-400 bg-transparent rounded-lg placeholder-gray-400 outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full box font-satoshi disabled:bg-gray-400 disabled:cursor-not-allowed text-white bg-cyan-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      'Upgrade to Pro'
                    )}
                  </button>
                </form>

                {/* Security Notice */}
                <div className="text-neutral-400 text-[4vw] flex justify-center items-start space-x-[0.5vw] font-semibold font-satoshi mt-6 md:items-center md:text-base lg:text-[0.9vw]">
                    <GoShieldLock size={25} />
                    <span>Secure connection via encrypted protocols</span>
                </div>
              </div>
            </div>

            {/* Plan Details - Right Side */}
            <div className="order-1 lg:order-2">
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-lime-800 text-white px-4 py-2 rounded-full text-sm font-medium font-satoshi mb-4">
                    <Star className="w-4 h-4" />
                    Recommended
                  </div>
                  <div className="flex items-baseline justify-center mt-3">
                    <span className="text-6xl font-bold font-satoshi">$108</span>
                    <span className="font-satoshi text-2xl">/year</span>
                  </div>
                  <p className="font-satoshi mt-2">Save 10% with annual billing, cancel anytime</p>
                </div>

                {/* Features List */}
                
        
                <ul className="space-y-4">
                {proFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg
                      className="h-6 w-6 text-neutral-700 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-[4vw] font-satoshi md:text-xl lg:text-[1vw]">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 font-satoshi text-[16px]">
          <p>Questions? Contact our support team at support@example.com</p>
        </div>
      </div>
    </div>
  );
}




// import React, { useState } from 'react';
// import { CreditCard, Check, Star, Shield, Zap, Users } from 'lucide-react';

// export default function Upgrade() {
//   const [cardData, setCardData] = useState({
//     cardNumber: '',
//     expiryDate: '',
//     cvv: '',
//     nameOnCard: '',
//     country: '',
//     postalCode: ''
//   });

//   const [isProcessing, setIsProcessing] = useState(false);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setCardData(prev => ({ ...prev, [name]: value }));
//   };

//   const formatCardNumber = (value) => {
//     const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
//     const matches = v.match(/\d{4,16}/g);
//     const match = matches && matches[0] || '';
//     const parts = [];
//     for (let i = 0, len = match.length; i < len; i += 4) {
//       parts.push(match.substring(i, i + 4));
//     }
//     if (parts.length) {
//       return parts.join(' ');
//     } else {
//       return v;
//     }
//   };

//   const formatExpiryDate = (value) => {
//     const v = value.replace(/\D/g, '');
//     if (v.length >= 3) {
//       return v.substring(0, 2) + '/' + v.substring(2, 4);
//     }
//     return v;
//   };

//   const handleCardNumberChange = (e) => {
//     const formatted = formatCardNumber(e.target.value);
//     setCardData(prev => ({ ...prev, cardNumber: formatted }));
//   };

//   const handleExpiryChange = (e) => {
//     const formatted = formatExpiryDate(e.target.value);
//     setCardData(prev => ({ ...prev, expiryDate: formatted }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsProcessing(true);
//     // Simulate processing
//     setTimeout(() => {
//       setIsProcessing(false);
//       alert('Upgrade successful! Welcome to Pro!');
//     }, 2000);
//   };

//   const proFeatures = [
//     { icon: <Zap className="w-5 h-5" />, text: "Unlimited API requests" },
//     { icon: <Users className="w-5 h-5" />, text: "Priority customer support" },
//     { icon: <Shield className="w-5 h-5" />, text: "Advanced security features" },
//     { icon: <Star className="w-5 h-5" />, text: "Early access to new features" }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
//             Upgrade to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Pro</span>
//           </h1>
//           <p className="text-gray-300 text-lg max-w-2xl mx-auto">
//             Unlock the full potential of our platform with advanced features and priority support
//           </p>
//         </div>

//         {/* Main Content */}
//         <div className="max-w-6xl mx-auto">
//           <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            
//             {/* Payment Form - Left Side */}
//             <div className="order-2 lg:order-1">
//               <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
//                     <CreditCard className="w-5 h-5 text-white" />
//                   </div>
//                   <h2 className="text-2xl font-bold text-white">Payment Details</h2>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   {/* Card Number */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-200 mb-2">
//                       Card Number
//                     </label>
//                     <input
//                       type="text"
//                       name="cardNumber"
//                       value={cardData.cardNumber}
//                       onChange={handleCardNumberChange}
//                       placeholder="1234 5678 9012 3456"
//                       maxLength="19"
//                       className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                       required
//                     />
//                   </div>

//                   {/* Expiry and CVV */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-200 mb-2">
//                         Expiry Date
//                       </label>
//                       <input
//                         type="text"
//                         name="expiryDate"
//                         value={cardData.expiryDate}
//                         onChange={handleExpiryChange}
//                         placeholder="MM/YY"
//                         maxLength="5"
//                         className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-200 mb-2">
//                         CVV
//                       </label>
//                       <input
//                         type="text"
//                         name="cvv"
//                         value={cardData.cvv}
//                         onChange={handleInputChange}
//                         placeholder="123"
//                         maxLength="4"
//                         className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                         required
//                       />
//                     </div>
//                   </div>

//                   {/* Name on Card */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-200 mb-2">
//                       Name on Card
//                     </label>
//                     <input
//                       type="text"
//                       name="nameOnCard"
//                       value={cardData.nameOnCard}
//                       onChange={handleInputChange}
//                       placeholder="John Doe"
//                       className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                       required
//                     />
//                   </div>

//                   {/* Country and Postal Code */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-200 mb-2">
//                         Country
//                       </label>
//                       <select
//                         name="country"
//                         value={cardData.country}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                         required
//                       >
//                         <option value="">Select Country</option>
//                         <option value="US">United States</option>
//                         <option value="UK">United Kingdom</option>
//                         <option value="CA">Canada</option>
//                         <option value="AU">Australia</option>
//                         <option value="DE">Germany</option>
//                         <option value="FR">France</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-200 mb-2">
//                         Postal Code
//                       </label>
//                       <input
//                         type="text"
//                         name="postalCode"
//                         value={cardData.postalCode}
//                         onChange={handleInputChange}
//                         placeholder="12345"
//                         className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//                         required
//                       />
//                     </div>
//                   </div>

//                   {/* Submit Button */}
//                   <button
//                     type="submit"
//                     disabled={isProcessing}
//                     className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
//                   >
//                     {isProcessing ? (
//                       <div className="flex items-center justify-center gap-2">
//                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                         Processing...
//                       </div>
//                     ) : (
//                       'Upgrade to Pro'
//                     )}
//                   </button>
//                 </form>

//                 {/* Security Notice */}
//                 <div className="mt-6 flex items-center gap-2 text-gray-300 text-sm">
//                   <Shield className="w-4 h-4" />
//                   <span>Your payment information is secure and encrypted</span>
//                 </div>
//               </div>
//             </div>

//             {/* Plan Details - Right Side */}
//             <div className="order-1 lg:order-2">
//               <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
//                 <div className="text-center mb-8">
//                   <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
//                     <Star className="w-4 h-4" />
//                     Most Popular
//                   </div>
//                   <h3 className="text-3xl font-bold text-white mb-2">Pro Plan</h3>
//                   <div className="flex items-baseline justify-center gap-2">
//                     <span className="text-5xl font-bold text-white">$29</span>
//                     <span className="text-gray-300">/month</span>
//                   </div>
//                   <p className="text-gray-300 mt-2">Billed monthly, cancel anytime</p>
//                 </div>

//                 {/* Features List */}
//                 <div className="space-y-4 mb-8">
//                   {proFeatures.map((feature, index) => (
//                     <div key={index} className="flex items-center gap-3">
//                       <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
//                         {feature.icon}
//                       </div>
//                       <span className="text-white font-medium">{feature.text}</span>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Additional Benefits */}
//                 <div className="bg-white/5 rounded-lg p-6 mb-6">
//                   <h4 className="text-white font-semibold mb-3">What's included:</h4>
//                   <ul className="space-y-2 text-gray-300 text-sm">
//                     <li className="flex items-center gap-2">
//                       <Check className="w-4 h-4 text-green-400" />
//                       Advanced analytics dashboard
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check className="w-4 h-4 text-green-400" />
//                       Custom integrations
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check className="w-4 h-4 text-green-400" />
//                       Team collaboration tools
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check className="w-4 h-4 text-green-400" />
//                       24/7 priority support
//                     </li>
//                   </ul>
//                 </div>

//                 {/* Money Back Guarantee */}
//                 <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
//                   <p className="text-green-400 text-sm font-medium">
//                     💚 30-day money-back guarantee
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-12 text-gray-400 text-sm">
//           <p>Questions? Contact our support team at support@example.com</p>
//         </div>
//       </div>
//     </div>
//   );
// }