import { useState, useEffect, useRef } from 'react';

const Features = () => {
  const [peopleCount, setPeopleCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [rateCount, setRateCount] = useState(0);
  const [animationStarted, setAnimationStarted] = useState(false);
  const countersRef = useRef(null);
  
  const startCounterAnimation = () => {
    if (animationStarted) return;
    setAnimationStarted(true);
    
    // Animation duration
    const duration = 2000; // 2 seconds
    const interval = 50; // Update every 50ms
    
    // Calculate steps
    const peopleStep = 10000 / (duration / interval);
    const usersStep = 500000 / (duration / interval);
    const rateStep = 85 / (duration / interval);
    
    const timer = setInterval(() => {
      setPeopleCount(prev => {
        const next = prev + peopleStep;
        return next >= 10000 ? 10000 : next;
      });
      
      setUsersCount(prev => {
        const next = prev + usersStep;
        return next >= 500000 ? 500000 : next;
      });
      
      setRateCount(prev => {
        const next = prev + rateStep;
        return next >= 85 ? 85 : next;
      });
      
      // Check if all animations have completed
      if (peopleCount >= 10000 && usersCount >= 500000 && rateCount >= 85) {
        clearInterval(timer);
      }
    }, interval);
    
    return timer;
  };
  
  // Format for display
  const formatPeople = () => {
    const value = Math.floor(peopleCount / 1000);
    const decimal = Math.floor((peopleCount % 1000) / 100);
    
    if (peopleCount === 10000) return "10K";
    if (decimal > 0) return `${value}.${decimal}K`;
    return `${value}K`;
  };
  
  const formatUsers = () => {
    const value = Math.floor(usersCount / 1000);
    
    if (usersCount === 500000) return "500K";
    return `${value}K`;
  };

  useEffect(() => {
    const currentRef = countersRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          const timer = startCounterAnimation();
          
          return () => {
            if (timer) clearInterval(timer);
          };
        }
      },
      { threshold: 0.1 } // Start animation when at least 10% of the element is visible
    );
    
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);
  
  return (
    <section className="p-8 mt-[4vw] relative" id="features">
      <div 
        ref={countersRef} 
        className="grid grid-cols-3 gap-[2vw] w-[80vw] mx-auto text-center"
      >
        <div className="border-r border-gray-400">
          <h2 className="text-[2.5vw] font-clash">{formatPeople()}+</h2>
          <p className="text-[1vw] font-satoshi">Invoices Generated and Sent</p>
        </div>

        <div className="border-r border-gray-400">
          <h2 className="text-[2.5vw] font-clash">{formatUsers()}+</h2>
          <p className="text-[1vw] font-satoshi">Active Users</p>
        </div>
        
        <div>
          <h2 className="text-[2.5vw] font-clash">{Math.floor(rateCount)}%</h2>
          <p className="text-[1vw] font-satoshi">Fast Payments rating</p>
        </div>
      </div>
    </section>
  );
};

export default Features;