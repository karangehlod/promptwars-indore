import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Recursively replaces computed styles that use unsupported CSS color functions
 * (oklab, oklch, color(), etc.) with their closest RGB equivalents so that
 * html2canvas can render them without throwing.
 */
function sanitizeColors(el: HTMLElement): void {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
  const unsupportedColorRe = /\b(oklab|oklch|lch|lab|color\()\s*\(/i;

  let node: Node | null = walker.currentNode;
  while (node) {
    const elem = node as HTMLElement;
    if (elem.style) {
      const computed = window.getComputedStyle(elem);
      // Patch color, background-color, border-color — the three main culprits
      (['color', 'backgroundColor', 'borderColor', 'borderTopColor',
        'borderRightColor', 'borderBottomColor', 'borderLeftColor'] as const).forEach((prop) => {
        const value = computed[prop as keyof CSSStyleDeclaration] as string;
        if (value && unsupportedColorRe.test(value)) {
          // Attempt to get a rendered RGB value via a temporary off-screen span
          try {
            const span = document.createElement('span');
            span.style.setProperty('color', value, 'important');
            span.style.position = 'absolute';
            span.style.opacity = '0';
            span.style.pointerEvents = 'none';
            document.body.appendChild(span);
            const resolved = window.getComputedStyle(span).color;
            document.body.removeChild(span);
            if (resolved && !unsupportedColorRe.test(resolved)) {
              elem.style.setProperty(
                prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
                resolved,
                'important',
              );
            }
          } catch {
            // If resolution fails, fall back to a safe neutral
            elem.style.setProperty(
              prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
              prop === 'color' ? '#1f2937' : prop === 'backgroundColor' ? '#ffffff' : 'transparent',
              'important',
            );
          }
        }
      });
    }
    node = walker.nextNode();
  }
}

export const exportToPDF = async (
  elementId: string,
  filename: string = 'TravelYarro-Itinerary.pdf',
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const isItineraryExport = elementId === 'itinerary-export-area';
    const originalDisplay: Record<string, string> = {};

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
    await new Promise(r => setTimeout(r, 150));

    // Deep-clone the element so we can mutate it safely
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.width = `${element.scrollWidth}px`;
    clone.style.height = `${element.scrollHeight}px`;
    document.body.appendChild(clone);

    // Strip unsupported CSS color functions from the clone
    sanitizeColors(clone);

    // Wait a tick so styles settle
    await new Promise(r => setTimeout(r, 50));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      // Override background so we don't inherit body's oklch bg
      backgroundColor: '#ffffff',
      ignoreElements: (el) =>
        el.tagName === 'SCRIPT' ||
        el.tagName === 'LINK' ||
        (el as HTMLElement).getAttribute('data-html2canvas-ignore') === 'true',
    });

    // Clean up the clone
    document.body.removeChild(clone);

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
      format: 'a4',
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
