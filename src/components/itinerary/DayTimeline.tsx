import React from 'react';
import type { DayPlan } from '../../schemas/itinerary';

export const DayTimeline: React.FC<{ days: DayPlan[] }> = ({ days }) => {
  return (
    <div className="space-y-8 flex-1 overflow-x-auto">
      <div className="flex md:flex-col gap-6 md:gap-8 pb-4 md:pb-0">
        {days.map(day => (
          <div key={day.day} className="min-w-[300px] md:min-w-0 md:w-full flex-shrink-0">
            <div className="sticky top-16 z-10 bg-surface-color/90 backdrop-blur-md py-2 border-b border-border-color mb-4">
              <h3 className="font-bold text-lg text-primary-700 dark:text-primary-400">Day {day.day}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{day.date}</p>
            </div>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
              {day.items.map((item, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  {/* Timeline Dot */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-color dark:border-gray-900 bg-primary-100 dark:bg-primary-900/50 shadow shrink-0 md:order-1 md:group-odd:-ml-5 md:group-even:-mr-5 z-10">
                    <div className="w-2.5 h-2.5 bg-primary-600 dark:bg-primary-500 rounded-full" />
                  </div>
                  
                  {/* Content Card */}
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-color hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.activity}</h4>
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300 ml-2 whitespace-nowrap">{item.time}</span>
                    </div>
                    {item.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.notes}</p>}
                    {item.cost !== undefined && item.cost > 0 && (
                      <div className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 inline-block px-2 py-1 rounded">
                        Est. Cost: ${item.cost}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
