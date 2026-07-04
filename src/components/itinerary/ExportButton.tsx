import React from 'react';
import { exportToPDF } from '../../services/pdfExport';
import { Download } from 'lucide-react';

export const ExportButton: React.FC<{ elementId: string }> = ({ elementId }) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(elementId, 'Culturo-Itinerary.pdf');
    } catch (e) {
      console.error(e);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 border border-border-color shadow-sm"
    >
      <Download size={16} className="mr-2" />
      {isExporting ? 'Exporting...' : 'Export PDF'}
    </button>
  );
};
