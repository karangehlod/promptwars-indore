import React from 'react';
import { Wallet } from 'lucide-react';

interface BudgetBreakdownProps {
  totalBudget: number;
  breakdown: { category: string; amount: number }[];
  profileAmount: number;
}

export const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({ totalBudget, breakdown, profileAmount }) => {
  const isOverBudget = totalBudget > profileAmount;

  return (
    <div className="bg-surface-color dark:bg-gray-800 p-6 rounded-2xl border border-border-color shadow-sm w-full lg:max-w-xs flex-shrink-0">
      <div className="flex items-center space-x-2 mb-6">
        <Wallet className="text-primary-500" />
        <h3 className="font-bold text-lg">Budget Breakdown</h3>
      </div>
      
      <div className="mb-6">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimated Total</div>
        <div className={`text-3xl font-bold ${isOverBudget ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
          ${totalBudget.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Target: ${profileAmount.toLocaleString()}
        </div>
        {isOverBudget && (
          <div className="mt-2 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-100 dark:border-red-900/50">
            Warning: This itinerary exceeds your planned budget.
          </div>
        )}
      </div>

      <div className="space-y-4">
        {breakdown.map((item, idx) => {
          const percentage = Math.min(100, Math.round((item.amount / totalBudget) * 100)) || 0;
          return (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">${item.amount}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
