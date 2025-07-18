
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface Reward {
  text: string;
  chance: number;
  color: string;
}

interface SpinWheelProps {
  rewards: Reward[];
  onComplete: (result: string) => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ rewards, onComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string>('');
  const wheelRef = useRef<HTMLDivElement>(null);

  // Normalize rewards to ensure they add up to 100%
  const normalizeRewards = (rewards: Reward[]) => {
    const totalChance = rewards.reduce((sum, reward) => sum + reward.chance, 0);
    if (totalChance === 0) return rewards;
    
    return rewards.map(reward => ({
      ...reward,
      chance: (reward.chance / totalChance) * 100
    }));
  };

  const normalizedRewards = normalizeRewards(rewards);
  
  // Calculate segments
  const segments = normalizedRewards.map((reward, index) => {
    const startAngle = index === 0 ? 0 : normalizedRewards.slice(0, index).reduce((sum, r) => sum + (r.chance / 100) * 360, 0);
    const segmentAngle = (reward.chance / 100) * 360;
    const endAngle = startAngle + segmentAngle;
    
    return {
      ...reward,
      startAngle,
      endAngle,
      midAngle: startAngle + segmentAngle / 2
    };
  });

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Generate random number to select winner
    const random = Math.random() * 100;
    let currentChance = 0;
    let selectedReward = normalizedRewards[0];
    
    for (const reward of normalizedRewards) {
      currentChance += reward.chance;
      if (random <= currentChance) {
        selectedReward = reward;
        break;
      }
    }
    
    // Calculate rotation to land on selected reward
    const segment = segments.find(s => s.text === selectedReward.text);
    if (!segment) return;
    
    // Calculate target angle (we want the pointer to point to the middle of the segment)
    const targetAngle = 360 - segment.midAngle; // Reverse because wheel spins clockwise but we measure counterclockwise
    const spins = 5; // Number of full rotations
    const finalRotation = rotation + spins * 360 + targetAngle + Math.random() * 20 - 10; // Add small random offset
    
    setRotation(finalRotation);
    setResult(selectedReward.text);
    
    setTimeout(() => {
      setIsSpinning(false);
      onComplete(selectedReward.text);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-transparent border-b-gray-800 drop-shadow-sm"></div>
        </div>
        
        {/* Golden outer ring */}
        <div className="w-[280px] h-[280px] rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-2 shadow-xl">
          {/* Wheel */}
          <div 
            ref={wheelRef}
            className="w-full h-full rounded-full relative overflow-hidden shadow-inner"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
            }}
          >
            <svg className="w-full h-full" viewBox="0 0 200 200">
              {segments.map((segment, index) => {
                const startAngleRad = (segment.startAngle * Math.PI) / 180;
                const endAngleRad = (segment.endAngle * Math.PI) / 180;
                
                const x1 = 100 + 95 * Math.cos(startAngleRad);
                const y1 = 100 + 95 * Math.sin(startAngleRad);
                const x2 = 100 + 95 * Math.cos(endAngleRad);
                const y2 = 100 + 95 * Math.sin(endAngleRad);
                
                const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                
                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A 95 95 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                const textAngle = segment.midAngle;
                const textRadius = 65;
                const textX = 100 + textRadius * Math.cos((textAngle * Math.PI) / 180);
                const textY = 100 + textRadius * Math.sin((textAngle * Math.PI) / 180);
                
                // Calculate text rotation to always be readable
                let textRotation = textAngle;
                if (textAngle > 90 && textAngle < 270) {
                  textRotation = textAngle + 180;
                }
                
                return (
                  <g key={index}>
                    <path
                      d={pathData}
                      fill={segment.color}
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      className="drop-shadow-sm"
                    />
                    {/* Text */}
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                      style={{
                        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                        filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))'
                      }}
                    >
                      {segment.text}
                    </text>
                  </g>
                );
              })}
              
              {/* Center circle */}
              <circle
                cx="100"
                cy="100"
                r="8"
                fill="url(#centerGradient)"
                stroke="#fbbf24"
                strokeWidth="2"
              />
              
              {/* Gradient definitions */}
              <defs>
                <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={spin} 
        disabled={isSpinning}
        size="lg"
        className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:transform-none"
      >
        {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
      </Button>
      
      {result && !isSpinning && (
        <div className="text-center animate-fade-in">
          <p className="text-lg font-bold text-primary">You won:</p>
          <p className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{result}</p>
        </div>
      )}
    </div>
  );
};
