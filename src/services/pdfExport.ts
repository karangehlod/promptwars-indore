import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string = 'TravelYarro-Itinerary.pdf'): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Check if this is the itinerary export area with pagination
    const isItineraryExport = elementId === 'itinerary-export-area';
    let originalDisplay: Record<string, string> = {};
    
    if (isItineraryExport) {
      // Temporarily show all day cards for PDF export
      const dayCards = element.querySelectorAll('[data-day-card]');
      dayCards.forEach((card, index) => {
        const el = card as HTMLElement;
        originalDisplay[`day-${index}`] = el.style.display;
        el.style.display = 'block';
        el.setAttribute('data-pdf-visible', 'true');
      });
      
      // Hide pagination controls during export
      const pagination = element.querySelector('[data-pagination]');
      if (pagination) {
        const el = pagination as HTMLElement;
        originalDisplay.pagination = el.style.display;
        el.style.display = 'none';
      }
    }

    // Small delay to let DOM update
    await new Promise(r => setTimeout(r, 100));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Restore original display
    if (isItineraryExport) {
      const dayCards = element.querySelectorAll('[data-day-card]');
      dayCards.forEach((card, index) => {
        const el = card as HTMLElement;
        el.style.display = originalDisplay[`day-${index}`] || '';
        el.removeAttribute('data-pdf-visible');
      });
      
      const pagination = element.querySelector('[data-pagination]');
      if (pagination) {
        const el = pagination as HTMLElement;
        el.style.display = originalDisplay.pagination || '';
      }
    }

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
};
