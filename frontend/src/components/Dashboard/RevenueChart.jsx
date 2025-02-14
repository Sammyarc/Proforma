import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { FaArrowUpLong } from "react-icons/fa6";
import { useEffect, useState } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const RevenueChart = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const labelFontSize = isMobile ? 9 : 13;
    const barThicknessSize = isMobile ? 25 : 30;

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Profit Realized',
                data: [100, 250, 550, 600, 130, 40, 200, 500, 700, 150, 340, 140],
                backgroundColor: '#2E2E2E',
                hoverBackgroundColor: '#525252',
                barThickness: barThicknessSize,
                borderRadius: { topLeft: 5, topRight: 5, bottomLeft: 5, bottomRight: 5 }, // Rounded on all sides
                borderSkipped: false, // Ensures full rounding effect
                order: 1, 
            },
            {
                label: '', // Invisible padding dataset
                data: Array(12).fill(15), // Adds vertical spacing (adjust as needed)
                backgroundColor: 'rgba(0,0,0,0)', // Fully transparent
                barThickness: barThicknessSize,
                order: 2,
            },
            {
                label: 'Loss',
                data: [10, 25, 50, 60, 0, 40, 100, 200, 70, 10, 40, 40],
                backgroundColor: '#d4d4d4',
                hoverBackgroundColor: '#e5e7eb',
                barThickness: barThicknessSize,
                borderRadius: 5, 
                borderSkipped: false, // Keeps the bars visually clean
                order: 3, 
            },
            {
                label: '', // Invisible padding dataset
                data: Array(12).fill(20), // Adds vertical spacing (adjust as needed)
                backgroundColor: 'rgba(0,0,0,0)', // Fully transparent
                barThickness: barThicknessSize,
                order: 0, 
            },
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Keeps chart flexible
        plugins: {
            legend: {
                display: true,
                position: "bottom", // Moves legend to bottom
                align: "start", // Aligns legend items to the left
                labels: {
                    font: {
                        family: 'satoshi',
                        size: labelFontSize
                    },
                    boxWidth: 15,
                    padding: 10,
                    color: '#3C3D37'
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => `$${context.raw.toLocaleString()}`
                },
                titleFont: { family: 'satoshi', size: labelFontSize },
                bodyFont: { family: 'satoshi', size: labelFontSize },
                backgroundColor: '#fff',
                titleColor: '#3C3D37',
                bodyColor: '#3C3D37',
                padding: 15,
                borderColor: '#525252',
                borderWidth: 1,
                caretSize: 5,
                caretPadding: 30, // Adjust this value to increase tooltip distance from bar
                displayColors: false, // Removes color box in tooltip
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: {
                    font: { family: 'satoshi', size: 14 },
                    color: '#3C3D37'
                }
            },
            y: {
                beginAtZero: true,
                display:false,
                stacked: true,
                grid: { display: false },
                ticks: {
                    callback: (value) => `$${value}`,
                    font: { family: 'satoshi', size: 12 },
                    color: '#3C3D37',
                }
            }
        }
    };

    return (
        <div className="p-[4vw] border border-neutral-700 box rounded-3xl w-[80vw] md:w-full md:px-[1vw] md:pt-[2vw] md:pb-0">
            <h3 className="text-[4.5vw] md:text-[1.5vw] font-semibold text-Gray900 font-satoshi md:mb-2">
                Monthly Invoice Revenue
            </h3>
            <div className='flex space-x-[1vw] items-center'>
                <div className="text-[4.5vw] md:text-[1.2vw] font-semibold text-Gray800 font-satoshi">
                    $500.00
                </div>
                <div className="text-green-600 font-satoshi text-[3vw] md:text-[0.8vw] flex items-center space-x-[0.1vw]">
                    <FaArrowUpLong />
                    <span>2% than last month</span>
                </div>
            </div>
            <div className='w-full md:w-full h-[40vh]'>
                <Bar data={data} options={options} className='mt-[4vw] md:mt-[2vw]' />
            </div>
        </div>
    );
};

export default RevenueChart;
