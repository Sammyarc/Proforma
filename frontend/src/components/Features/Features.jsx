import { useState, useEffect, useRef } from "react";

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
    const peopleStep = 1000 / (duration / interval);
    const usersStep = 10000 / (duration / interval);
    const rateStep = 85 / (duration / interval);

    const timer = setInterval(() => {
      setPeopleCount((prev) => {
        const next = prev + peopleStep;
        return next >= 1000 ? 1000 : next;
      });

      setUsersCount((prev) => {
        const next = prev + usersStep;
        return next >= 10000 ? 10000 : next;
      });

      setRateCount((prev) => {
        const next = prev + rateStep;
        return next >= 85 ? 85 : next;
      });

      // Check if all animations have completed
      if (peopleCount >= 1000 && usersCount >= 10000 && rateCount >= 85) {
        clearInterval(timer);
      }
    }, interval);

    return timer;
  };

  // Format for display
  const formatPeople = () => {
    const value = Math.floor(peopleCount / 1000);
    const decimal = Math.floor((peopleCount % 1000) / 100);

    if (peopleCount === 1000) return "1K";
    if (decimal > 0) return `${value}.${decimal}K`;
    return `${value}K`;
  };

  const formatUsers = () => {
    const value = Math.floor(usersCount / 1000);

    if (usersCount === 10000) return "10K";
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
    <section className="p-8 relative lg:mt-[4vw]" id="features">
      <div
        ref={countersRef}
        className="grid gap-[2vw] space-y-6 mx-auto text-center lg:grid-cols-3 lg:w-[80vw] lg:space-y-0"
      >
        <div className="lg:border-gray-400 lg:border-r">
          <h2 className="text-[8vw] font-clash md:text-4xl lg:text-[2.5vw]">
            {formatPeople()}+
          </h2>
          <p className="text-[4vw] font-satoshi md:text-xl lg:text-[1vw]">
            Invoices Generated and Sent
          </p>
        </div>

        <div className="lg:border-gray-400 lg:border-r">
          <h2 className="text-[8vw] font-clash md:text-4xl lg:text-[2.5vw]">
            {formatUsers()}+
          </h2>
          <p className="text-[4vw] font-satoshi md:text-xl lg:text-[1vw]">Active Users</p>
        </div>

        <div>
          <h2 className="text-[8vw] font-clash md:text-4xl lg:text-[2.5vw]">
            {Math.floor(rateCount)}%
          </h2>
          <p className="text-[4vw] font-satoshi md:text-xl lg:text-[1vw]">
            Fast Payments rating
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
