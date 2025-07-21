
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';

interface Reward {
  text: string;
  chance: number;
  color: string;
}

interface SpinWheelProps {
  rewards: Reward[];
  onComplete: (result: string) => void;
  disabled?: boolean;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ rewards, onComplete, disabled = false }) => {
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
  
  // Calculate segments with equal sizes regardless of chance
  const segments = normalizedRewards.map((reward, index) => {
    const segmentAngle = 360 / normalizedRewards.length; // Equal segments
    const startAngle = index * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    
    return {
      ...reward,
      startAngle,
      endAngle,
      segmentAngle,
      midAngle: startAngle + segmentAngle / 2
    };
  });

  const spin = () => {
    if (isSpinning || disabled) return;
    
    setIsSpinning(true);
    setResult('');
    
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
    
    // Calculate rotation - we want the pointer at top to point to selected segment
    const segment = segments.find(s => s.text === selectedReward.text);
    if (!segment) return;
    
    // Calculate target angle so the segment aligns with the top pointer
    const targetAngle = 360 - segment.midAngle;
    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation = rotation + spins * 360 + targetAngle;
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      setResult(selectedReward.text);
      setIsSpinning(false);
      onComplete(selectedReward.text);
    }, 3000);
  };

  // Create SVG path for segment
  const createSegmentPath = (startAngle: number, endAngle: number, radius: number = 90) => {
    const centerX = 100;
    const centerY = 100;
    
    // Convert angles to radians and adjust for SVG coordinate system (0° at top)
    const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
    const endAngleRad = ((endAngle - 90) * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        {/* Fixed pointer at top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-transparent border-b-red-500 drop-shadow-lg"></div>
        </div>
        
        {/* Wheel container with blue border */}
        <div className={`relative w-[250px] h-[250px] rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-3 shadow-2xl ${disabled ? 'opacity-60' : ''}`}>
          {/* Inner wheel */}
          <div 
            ref={wheelRef}
            className="w-full h-full rounded-full relative overflow-hidden bg-white shadow-inner"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
            }}
          >
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <defs>
                <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </radialGradient>
              </defs>
              
              {/* Segment backgrounds */}
              {segments.map((segment, index) => {
                const pathData = createSegmentPath(segment.startAngle, segment.endAngle);
                
                return (
                  <path
                    key={`segment-${index}`}
                    d={pathData}
                    fill={segment.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="drop-shadow-sm"
                  />
                );
              })}
              
              {/* Text labels */}
              {segments.map((segment, index) => {
                const textRadius = 60;
                // Convert angle to radians and adjust for SVG coordinate system
                const textAngleRad = ((segment.midAngle - 90) * Math.PI) / 180;
                const textX = 100 + textRadius * Math.cos(textAngleRad);
                const textY = 100 + textRadius * Math.sin(textAngleRad);
                
                // Calculate text rotation for readability
                let textRotation = segment.midAngle;
                // Flip text if it would be upside down
                if (segment.midAngle > 90 && segment.midAngle < 270) {
                  textRotation = segment.midAngle + 180;
                }
                
                return (
                  <text
                    key={`text-${index}`}
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                    style={{
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                      filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'
                    }}
                  >
                    {segment.text}
                  </text>
                );
              })}
              
              {/* Center circle */}
              <circle
                cx="100"
                cy="100"
                r="15"
                fill="url(#centerGradient)"
                stroke="#3b82f6"
                strokeWidth="3"
                className="drop-shadow-lg"
              />
            </svg>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={spin} 
        disabled={isSpinning || disabled}
        size="lg"
        className={`px-6 py-2 text-lg font-bold text-white border-0 shadow-xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:transform-none rounded-xl ${
          disabled 
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
        }`}
      >
        {disabled ? (
          <span className="flex items-center gap-3">
            <Lock size={24} />
            LOCKED
          </span>
        ) : isSpinning ? (
          <span className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Spinning...
          </span>
        ) : (
          <span className="flex items-center gap-3">
            <Unlock size={24} />
            SPIN THE WHEEL!
          </span>
        )}
      </Button>
      
      {result && !isSpinning && (
        <div className="text-center animate-fade-in bg-white p-6 rounded-xl shadow-lg">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <p className="text-2xl font-bold text-blue-600 mb-4">Congratulations!</p>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl shadow-lg">
            <p className="text-2xl font-bold">{result}</p>
          </div>
          <p className="text-sm text-gray-600 mt-4 font-medium">Show this screen to claim your reward!</p>
        </div>
      )}
    </div>
  );
};
