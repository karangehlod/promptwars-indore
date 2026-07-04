import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../ui/Card';
import { StaggeredGrid } from '../ui/StaggeredGrid';
import { Landmark } from 'lucide-react';

export const HeritageInsights: React.FC = () => {
  const { heritage } = useAppStore();

  if (!heritage.length) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <Landmark className="text-accent" />
        <h3 className="text-2xl font-bold">Heritage & History</h3>
      </div>
      
      <StaggeredGrid dataFetchId={heritage.length}>
        {heritage.map((item, idx) => (
          <Card key={idx} className="cursor-default hover:-translate-y-0 hover:shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                {item.period}
              </span>
            </div>
            <h4 className="text-xl font-bold mb-2 text-text-primary">{item.title}</h4>
            <p className="text-text-secondary text-sm mb-4">
              {item.summary}
            </p>
            <div className="mt-auto border-t border-border pt-4 text-xs text-text-secondary italic">
              {item.significance}
            </div>
          </Card>
        ))}
      </StaggeredGrid>
    </section>
  );
};
