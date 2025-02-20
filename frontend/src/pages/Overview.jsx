
import { useEffect } from "react";
import OverviewGrid from "../components/Dashboard/OverviewGrid";
import RevenueChart from "../components/Dashboard/RevenueChart";
import Greeting from "../components/Dashboard/Greeting";


const Overview = () => {
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pr-[2vw]">
            <Greeting />
            <OverviewGrid />
            <RevenueChart />     
        </div>

    )
}

export default Overview