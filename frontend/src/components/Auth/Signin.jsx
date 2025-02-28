import {useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import PassStrengthMeter from "../PasswordStrength/PassStrengthMeter";
import {PiUserLight} from "react-icons/pi";
import {GoMail} from "react-icons/go";
import {FaEye, FaEyeSlash} from 'react-icons/fa';
import {useAuthStore} from "../../store/authStore";
import{GoogleLogin} from "@react-oauth/google"
import { LucideLoader2 } from 'lucide-react';
import { MdErrorOutline } from 'react-icons/md';


const Signin = () => {
    const {
        signup,
        googleSignIn,
        login,
        isLoading,
        error,
        clearError
    } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const navigate = useNavigate();
    const [isPasswordVisible, setPasswordVisible] = useState(false);

// Handle successful Google login
const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
        const token = credentialResponse.credential;
    
            await googleSignIn(token); 
            navigate('/dashboard');
            window.scrollTo(0, 0);
  
    } catch (error) {
        console.error("Error during Google Sign-In:", error);
    }
};


const handleGoogleLoginError = () => {
    console.error("Google Sign-In failed");
};

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setPasswordVisible(!isPasswordVisible);
    };

    // Function to clear inputs
    const clearInputs = () => {
        setName('');
        setEmail('');
        setPassword('');
        setTermsAccepted(false);
        setRememberMe(false);
    };

    // Toggle between login and register
    const toggleMode = () => {
        clearError(); // Clear the error when switching modes
        clearInputs(); // Clear inputs when toggling mode
        setIsRegister(!isRegister);
    };

    // Toggle between forgotpassword and register
    const toggleForgotPasswordMode = () => {
        clearError(); // Clear the error when switching modes
        window.scrollTo(0, 0);
    };

    // Toggle Remember Me checkbox
    const handleRememberMe = () => {
        setRememberMe(!rememberMe);
    };

    const handleTermsAcceptance = (e) => {
        setTermsAccepted(e.target.checked);
    };

    // Register handler
    const handleRegister = async () => {
        try {
            await signup(email, password, name);
            navigate("/dashboard");
            window.scrollTo(0, 0);
        } catch (error) {
            console.log(error);
        }
    };

    // Login handler
    const handleLogin = async () => {
    try {
        // Call the login function with email and password
        const user = await login(email, password);

        // Check if the user exists in the response
        if (!user) {
            throw new Error("User not found"); 
        }

        if (user) {
            navigate("/dashboard"); // Navigate to the dashboard
        } 

        // Scroll to the top of the page after navigation
        window.scrollTo(0, 0);
    } catch (error) {
        console.error("Login error:", error.message); // Log the error
    }
};

    
    

    return (
        <div className={`flex justify-center items-center h-screen ${isRegister ? 'my-[8vw]' : ''}`}>
            <div
            className='w-[90vw] md:w-[30vw] flex flex-col mx-auto my-[8vw] bg-White shadow-xl px-[2.5vw] py-[7vw] md:p-[2vw] rounded-[0.5vw]'>
            <h2
                className='text-center font-satoshi text-[7vw] md:text-[2.5vw] font-semibold text-Gray900 mb-[1vw]'>
                {
                    isRegister
                        ? 'Create Account'
                        : 'Welcome Back!'
                }
            </h2>

            {/* Name input only visible in register mode */}
            {
                isRegister && (
                    <div className="relative mt-[3vw] md:mt-[1vw]">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            className='w-full outline-none border bg-transparent px-[2.5vw] py-[3vw] md:px-[1vw] md:py-[0.8vw] rounded-[1.5vw] md:rounded-[0.5vw] font-satoshi pr-[9vw] md:pr-[3vw] hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700'
                            onChange={(e) => setName(e.target.value)}/>
                        <div
                            className="absolute inset-y-0 right-[3vw] md:right-[1vw] flex items-center">
                            <PiUserLight className="fa fa-user text-Gray600 md:text-[1.3vw]"/>
                        </div>
                    </div>
                )
            }

            {/* Email input */}
            <div className="relative mt-[3vw] md:mt-[1vw]">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    autoComplete="on"
                    value={email}
                    className='w-full outline-none border bg-transparent px-[2.5vw] py-[3vw] md:px-[1vw] md:py-[0.8vw] rounded-[1.5vw] md:rounded-[0.5vw] font-satoshi pr-[9vw] md:pr-[3vw] hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700'
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmail(email.toLowerCase())}/>
                <div
                    className="absolute inset-y-0 right-[3vw] md:right-[1vw] flex items-center">
                    <GoMail className="text-Gray600 md:text-[1.3vw]"/>
                </div>
            </div>

            {/* Password input */}
            <div className="relative mt-[3vw] md:mt-[1vw]">
                <input
                    type={isPasswordVisible
                        ? 'text'
                        : 'password'}
                    placeholder="Password"
                    value={password}
                    className='w-full outline-none border bg-transparent px-[2.5vw] py-[3vw] md:px-[1vw] md:py-[0.8vw] rounded-[1.5vw] md:rounded-[0.5vw] font-satoshi pr-[9vw] md:pr-[3vw] hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700'
                    onChange={(e) => setPassword(e.target.value)}/>
                <div
                    className="absolute inset-y-0 right-[3vw] md:right-[1vw] flex items-center cursor-pointer"
                    onClick={togglePasswordVisibility}>
                    {
                        isPasswordVisible
                            ? <FaEyeSlash className="text-Gray600 md:text-[1.3vw]"/>
                            : <FaEye className="text-Gray600 md:text-[1.3vw]"/>
                    }
                </div>
            </div>

            {/* Show error only for the specific mode */}
            {
                error && <p
                        className='text-red-500 flex items-center gap-1 font-medium text-[4vw] md:text-[1vw] mt-2 font-satoshi'><MdErrorOutline className='text-[5vw] md:text-[1.2vw]'/> {error}</p>
            }

            {/* Password Strength Meter only in register mode */}
            {isRegister && <PassStrengthMeter password={password}/>}

            {/* Checkbox for "Remember Me" or "Terms Acceptance" */}
            <div className="flex justify-between items-center mt-[3vw] md:mt-[1vw]">
                {
                    isRegister
                        ? (
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={handleTermsAcceptance}
                                    className="h-[4.5vw] w-[4.5vw] md:h-[1vw] md:w-[1vw] rounded-[0.2vw] accent-Gray800 cursor-pointer"/>
                                <span className="text-[4vw] md:text-[1vw] text-Gray700 font-satoshi">I accept the Terms and Conditions</span>
                            </label>
                        )
                        : (
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={handleRememberMe}
                                    className="h-[4.5vw] w-[4.5vw] md:h-[1vw] md:w-[1vw] rounded-[0.2vw] accent-Gray800 cursor-pointer"/>
                                <span className="text-[4vw] md:text-[0.9vw] text-Gray700 font-satoshi">Remember Me</span>
                            </label>
                        )
                }

                {
                    !isRegister && (
                        <Link
                            to="/forgot-password"
                            onClick={toggleForgotPasswordMode}
                            className="text-[4vw] md:text-[0.9vw] text-Gray700 font-satoshi hover:underline">
                            Forgot Password?
                        </Link>
                    )
                }
            </div>

            {/* Submit button */}
            <button
                className={`mt-[4vw] md:mt-[1vw] ${isLoading || (isRegister && !termsAccepted)
                    ? 'bg-gray-400 cursor-not-allowed '
                    : 'bg-cyan-800'} text-white font-satoshi h-[15vw] border border-neutral-400 md:h-[2.5vw] rounded-xl box`}
                onClick={() => {
                    if (isRegister) {
                        handleRegister();
                    } else {
                        handleLogin();
                    }
                }}
                disabled={isLoading || (isRegister && !termsAccepted)}>
                {/* Disable if loading or terms are not accepted */}
                {
                    isLoading
                        ? (
                            <div className='flex justify-center items-center space-x-2'>
                                <LucideLoader2 className="animate-spin w-6 h-6"/> {/* Spinner icon */}
                                <span>{
                                        isRegister
                                            ? 'Creating Account...'
                                            : 'Authenticating...'
                                    }</span>
                            </div>
                        )
                        : (
                            isRegister
                                ? 'Create Account'
                                : 'Login'
                        )
                }
            </button>

            <div className="flex flex-col mt-[4vw] md:mt-[1vw]">
                <div className="flex items-center mb-[4vw] md:mb-[1vw]">
                    <div className="flex-1 border-t border-neutral-400 mr-2"></div>
                    <span className='text-Gray800 text-[3.5vw] md:text-[1vw] font-satoshi'>OR</span>
                    <div className="flex-1 border-t border-neutral-400 ml-2"></div>
                </div>
                    {/* Sign in with Google button */}
                    <GoogleLogin
  onSuccess={handleGoogleLoginSuccess}
  onError={handleGoogleLoginError}
  useOneTap={false} // Disable One-Tap auto sign-in
  cookiePolicy={'single_host_origin'}
  theme="outline"
  text="signin_with"
  shape="rectangular"
  prompt="select_account" // Force account selection
  auto_select={false} // Disable auto-selection
/>
            </div>

            {/* Switch mode button */}
            <button
                onClick={() => {
                    toggleMode();
                    window.scrollTo(0, 0);
                }}
                className='mt-[4vw] md:mt-[1vw] text-[4vw] md:text-[1vw] font-satoshi font-medium'>
                {
                    isRegister
                        ? 'Already have an account? Login'
                        : "Don't have an account? Register"
                }
            </button>
        </div>
        </div>
        
    );
};

export default Signin;
