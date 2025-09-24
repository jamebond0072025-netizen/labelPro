import React from 'react';

interface BarcodeSvgProps {
  value: string;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({ value }) => {
  const bars = value
    .split('')
    .map((char, index) => {
      const charCode = char.charCodeAt(0);
      const width = 1 + (charCode % 4); // Random width between 1 and 4
      const x = index * 6;
      return <rect key={index} x={x} y="0" width={width} height="50" fill="black" />;
    });

  return (
    <svg width="100%" height="100%" viewBox="0 0 240 50" preserveAspectRatio="none">
      {bars}
    </svg>
  );
};
