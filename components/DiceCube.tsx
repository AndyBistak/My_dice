
import React from 'react';
import { Theme } from '../App';

interface FaceProps {
  value: number;
  className: string;
  theme: Theme;
}

const Face: React.FC<FaceProps> = ({ value, className, theme }) => {
  const dotPositions: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const activeDots = dotPositions[value] || [];

  return (
    <div 
      className={`cube__face ${className}`} 
      style={{ backgroundColor: theme.bg, borderColor: theme.border }}
    >
      <div className="dots-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {activeDots.includes(i) && (
              <div 
                className="dot" 
                style={{ backgroundColor: theme.dot }} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface DiceCubeProps {
  value: number;
  isRolling: boolean;
  theme: Theme;
}

export const DiceCube: React.FC<DiceCubeProps> = ({ value, isRolling, theme }) => {
  const rotations: Record<number, string> = {
    1: 'rotateY(0deg) rotateX(0deg)',
    2: 'rotateY(180deg) rotateX(0deg)',
    3: 'rotateY(-90deg) rotateX(0deg)',
    4: 'rotateY(90deg) rotateX(0deg)',
    5: 'rotateY(0deg) rotateX(-90deg)',
    6: 'rotateY(0deg) rotateX(90deg)',
  };

  return (
    <div className="scene">
      <div 
        className={`cube ${isRolling ? 'is-rolling' : ''}`}
        style={!isRolling ? { transform: rotations[value] } : {}}
      >
        <Face value={1} className="face-1" theme={theme} />
        <Face value={2} className="face-2" theme={theme} />
        <Face value={3} className="face-3" theme={theme} />
        <Face value={4} className="face-4" theme={theme} />
        <Face value={5} className="face-5" theme={theme} />
        <Face value={6} className="face-6" theme={theme} />
      </div>
    </div>
  );
};
