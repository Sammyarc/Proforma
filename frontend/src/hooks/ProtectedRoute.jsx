import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { TbLoader3 } from "react-icons/tb";

const ProtectedRoute = ({ children }) => {
  const { isCheckingAuth, checkAuth, isAuthenticated } = useAuthStore();
  const [minLoading, setMinLoading] = useState(true);


  // Animated ellipsis component
    const AnimatedEllipsis = () => {
      const [dots, setDots] = useState("");
  
      useEffect(() => {
        const interval = setInterval(() => {
          setDots((prevDots) => {
            if (prevDots === "") return ".";
            if (prevDots === ".") return "..";
            if (prevDots === "..") return "...";
            return "";
          });
        }, 600);
  
        return () => clearInterval(interval);
      }, []);
  
      return <span className="animated-ellipsis">{dots}</span>;
    };

  useEffect(() => {
    // Define an async function to run the auth check
    const initializeAuth = async () => {
      await checkAuth();
    };
    initializeAuth();
  }, [checkAuth]);

  // Ensure the spinner shows for at least 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

 // While authentication is being checked or the 3 second minimum loading time hasn't elapsed, show spinner
 if (isCheckingAuth || minLoading) {
  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-3">
      <TbLoader3 size={30} className="animate-spin text-teal-500" />
      <p className="text-[4vw] font-satoshi md:text-[1vw]">Please wait while we load the content<AnimatedEllipsis /></p>
    </div>
  );
}

  // After the auth check is complete, if the user is not authenticated, redirect them to signup
  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }

  // Otherwise, render the protected children
  return children;
};

export default ProtectedRoute;
