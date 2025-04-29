import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface ComparisonItem {
  feature: string;
  codelearn: boolean;
  inHouse: boolean;
  agencies: boolean;
  freelancers: boolean;
  selfService: boolean;
  highlight?: boolean;
}

const comparisonData: ComparisonItem[] = [
  { 
    feature: "Speed", 
    codelearn: true, 
    inHouse: false, 
    agencies: false, 
    freelancers: true, 
    selfService: true 
  },
  { 
    feature: "Flexibility", 
    codelearn: true, 
    inHouse: false, 
    agencies: false, 
    freelancers: true, 
    selfService: false 
  },
  { 
    feature: "Quality", 
    codelearn: true, 
    inHouse: true, 
    agencies: true, 
    freelancers: false, 
    selfService: false 
  },
  { 
    feature: "Scalability", 
    codelearn: true, 
    inHouse: false, 
    agencies: true, 
    freelancers: false, 
    selfService: true 
  },
  { 
    feature: "Cost-effectiveness", 
    codelearn: true, 
    inHouse: false, 
    agencies: false, 
    freelancers: true, 
    selfService: true 
  },
  { 
    feature: "Work with top 1% of global creative talent", 
    codelearn: true, 
    inHouse: false, 
    agencies: false, 
    freelancers: false, 
    selfService: false,
    highlight: true
  },
];

export const ComparisonGrid = () => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  
  const columnVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5,
        delay: i * 0.1
      }
    })
  };
  
  const rowVariants = {
    initial: { opacity: 0, x: -10 },
    animate: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { 
        duration: 0.3,
        delay: i * 0.05
      }
    }),
    hover: {
      backgroundColor: "rgba(255, 204, 0, 0.05)"
    }
  };
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-6 gap-4 mb-6 pb-4 border-b border-border">
          <motion.div 
            className="col-span-1"
            variants={columnVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={0}
          >
            <span className="font-bold text-lg">Features</span>
          </motion.div>
          
          {[
            { name: "CodeLearn", highlight: true },
            { name: "In-house Team", highlight: false },
            { name: "Creative Agencies", highlight: false },
            { name: "Freelancers", highlight: false },
            { name: "Self-service", highlight: false }
          ].map((column, i) => (
            <motion.div 
              key={i}
              className={`col-span-1 ${column.highlight ? 'text-yellow-400' : ''}`}
              variants={columnVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              custom={i + 1}
            >
              <span className="font-medium">{column.name}</span>
            </motion.div>
          ))}
        </div>
        
        {/* Rows */}
        {comparisonData.map((item, rowIndex) => (
          <motion.div 
            key={rowIndex}
            className={`grid grid-cols-6 gap-4 py-4 border-b border-border/30 ${
              item.highlight ? 'bg-yellow-400/5 rounded' : ''
            }`}
            variants={rowVariants}
            initial="initial"
            whileInView="animate"
            whileHover="hover"
            viewport={{ once: true }}
            custom={rowIndex}
            onMouseEnter={() => setHoveredRow(rowIndex)}
            onMouseLeave={() => setHoveredRow(null)}
          >
            <div className={`col-span-1 ${item.highlight ? 'font-bold' : ''}`}>
              {item.feature}
              
              {item.highlight && (
                <motion.div 
                  className="h-0.5 bg-yellow-400 mt-1" 
                  initial={{ width: 0 }}
                  animate={{ width: hoveredRow === rowIndex ? '100%' : '40%' }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
            
            {/* CodeLearn */}
            <div className="col-span-1">
              {item.codelearn ? (
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="flex items-center justify-center"
                >
                  <Check className="h-6 w-6 text-green-500" />
                </motion.div>
              ) : (
                <X className="h-5 w-5 text-red-500 opacity-70" />
              )}
            </div>
            
            {/* In-house */}
            <div className="col-span-1">
              {item.inHouse ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500 opacity-70" />
              )}
            </div>
            
            {/* Agencies */}
            <div className="col-span-1">
              {item.agencies ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500 opacity-70" />
              )}
            </div>
            
            {/* Freelancers */}
            <div className="col-span-1">
              {item.freelancers ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500 opacity-70" />
              )}
            </div>
            
            {/* Self-service */}
            <div className="col-span-1">
              {item.selfService ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500 opacity-70" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};