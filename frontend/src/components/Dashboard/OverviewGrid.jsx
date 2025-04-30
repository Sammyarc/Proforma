import { motion } from "framer-motion";
import { GiCheckMark, GiPayMoney } from "react-icons/gi";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { TfiReload } from "react-icons/tfi";

const cardVariants = {
    hidden: { opacity: 0, y: 10 }, // Start below with opacity 0
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const OverviewGrid = () => {
    return (
        <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 mb-[5vw] md:mb-[2vw]"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }} // Stagger effect
        >

            {/* Invoices Sent */}
            <motion.div className="flex flex-col box p-4 border border-neutral-700 rounded-3xl" variants={cardVariants}>
                <h2 className="text-[4vw] md:text-[1.2vw] text-Gray800 font-semibold font-satoshi">Invoices Sent</h2>
                <div className="flex items-center space-x-[2vw] md:space-x-2 mt-[1.5vw] md:mt-[0.5vw]">
                    <LiaFileInvoiceSolid className="text-teal-600 text-[6vw] md:text-[2.5vw]"/>
                    <p className="text-[4vw] md:text-[1vw] font-satoshi font-bold text-Gray700">0</p>
                </div>
            </motion.div>

            {/* Pending Payments */}
            <motion.div className="flex flex-col box p-4 border border-neutral-700 rounded-3xl" variants={cardVariants}>
                <h2 className="text-[4vw] md:text-[1.2vw] text-Gray800 font-semibold font-satoshi">Pending Payments</h2>
                <div className="flex items-center space-x-[2vw] md:space-x-2 mt-[1.5vw] md:mt-[0.5vw]">
                    <GiPayMoney className="text-indigo-600 text-[6vw] md:text-[2.5vw]"/>
                    <p className="text-[4vw] md:text-[1vw] font-satoshi font-bold text-Gray700">0</p>
                </div>
            </motion.div>

            {/* Completed Invoices */}
            <motion.div className="flex flex-col box p-4 border border-neutral-700 rounded-3xl" variants={cardVariants}>
                <h2 className="text-[4vw] md:text-[1.2vw] text-Gray800 font-semibold font-satoshi">Completed Payments</h2>
                <div className="flex items-center space-x-[2vw] md:space-x-2 mt-[1.5vw] md:mt-[0.5vw]">
                    <GiCheckMark className="text-green-500 text-[6vw] md:text-[2.5vw]"/>
                    <p className="text-[4vw] md:text-[1vw] font-satoshi font-bold text-Gray700">0</p>
                </div>
            </motion.div>

            {/* Recurring Payments */}
            <motion.div className="flex flex-col box p-4 border border-neutral-700 rounded-3xl" variants={cardVariants}>
                <h2 className="text-[4vw] md:text-[1.2vw] text-Gray800 font-semibold font-satoshi">Recurring Payments</h2>
                <div className="flex items-center space-x-[2vw] md:space-x-2 mt-[1.5vw] md:mt-[0.5vw]">
                    <TfiReload className="text-red-500 text-[6vw] md:text-[2.5vw]"/>
                    <p className="text-[4vw] md:text-[1vw] font-satoshi font-bold text-Gray700">0</p>
                </div>
            </motion.div>

        </motion.div>
    );
};

export default OverviewGrid;
