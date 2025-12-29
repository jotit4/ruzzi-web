import React from 'react';

const Logo = ({ className = "h-8" }: { className?: string }) => {
  return (
    <img 
      src="/logo_ruzzi_real.png" 
      alt="Ruzzi Logo" 
      className={className}
      onError={(e) => {
        console.log("Logo fallback - showing text");
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.className = 'text-2xl font-bold text-navy';
        fallback.textContent = 'RUZZI';
        target.parentNode?.appendChild(fallback);
      }}
    />
  );
};

export default Logo;