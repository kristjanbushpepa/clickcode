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

  const totalChance = rewards.reduce((sum, reward) => sum + reward.chance, 0);
  
  // Calculate segments
  const segments = rewards.map((reward, index) => {
    const percentage = (reward.chance / totalChance) * 100;
    const startAngle = index === 0 ? 0 : rewards.slice(0, index).reduce((sum, r) => sum + (r.chance / totalChance) * 360, 0);
    const endAngle = startAngle + (percentage / 100) * 360;
    
    return {
      ...reward,
      percentage,
      startAngle,
      endAngle,
      rotation: startAngle + (endAngle - startAngle) / 2
    };
  });

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Generate random number based on chances
    const random = Math.random() * totalChance;
    let currentChance = 0;
    let selectedReward = rewards[0];
    
    for (const reward of rewards) {
      currentChance += reward.chance;
      if (random <= currentChance) {
        selectedReward = reward;
        break;
      }
    }
    
    // Calculate rotation to land on selected reward
    const segment = segments.find(s => s.text === selectedReward.text);
    const targetAngle = segment ? segment.rotation : 0;
    const spins = 5; // Number of full rotations
    const finalRotation = rotation + spins * 360 + (360 - targetAngle);
    
    setRotation(finalRotation);
    setResult(selectedReward.text);
    
    setTimeout(() => {
      setIsSpinning(false);
      onComplete(selectedReward.text);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-foreground"></div>
        </div>
        
        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="w-64 h-64 rounded-full border-4 border-border relative overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {segments.map((segment, index) => {
              const startAngleRad = (segment.startAngle * Math.PI) / 180;
              const endAngleRad = (segment.endAngle * Math.PI) / 180;
              
              const x1 = 100 + 90 * Math.cos(startAngleRad);
              const y1 = 100 + 90 * Math.sin(startAngleRad);
              const x2 = 100 + 90 * Math.cos(endAngleRad);
              const y2 = 100 + 90 * Math.sin(endAngleRad);
              
              const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              const textAngle = (segment.startAngle + segment.endAngle) / 2;
              const textX = 100 + 60 * Math.cos((textAngle * Math.PI) / 180);
              const textY = 100 + 60 * Math.sin((textAngle * Math.PI) / 180);
              
              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                  >
                    {segment.text}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      
      <Button 
        onClick={spin} 
        disabled={isSpinning}
        size="lg"
        className="px-8"
      >
        {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
      </Button>
      
      {result && !isSpinning && (
        <div className="text-center">
          <p className="text-lg font-bold text-primary">You won:</p>
          <p className="text-xl font-bold">{result}</p>
        </div>
      )}
    </div>
  );
};