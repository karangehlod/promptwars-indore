import React from 'react';

export const MapPreview: React.FC<{ destinationName: string }> = ({ destinationName }) => {
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(destinationName)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-border-color overflow-hidden relative shadow-sm">
      <iframe
        title={`Map of ${destinationName}`}
        width="100%"
        height="100%"
        style={{ border: 0, filter: 'contrast(1.05) saturate(0.95)' }}
        src={embedUrl}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};
