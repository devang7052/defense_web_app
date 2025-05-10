import { useState } from 'react';
import { StateStatus } from '../lib/conflictData';

interface IndiaMapProps {
  stateStatuses: StateStatus[];
}

// This is a simplified map component that uses SVG paths for each state
// In a production app, you might use a more detailed SVG map or a library like react-simple-maps
export default function IndiaMap({ stateStatuses }: IndiaMapProps) {
  const [selectedState, setSelectedState] = useState<StateStatus | null>(null);

  // Helper function to get color based on danger level
  const getDangerColor = (dangerLevel: string) => {
    switch (dangerLevel) {
      case 'danger':
        return 'fill-red-500 hover:fill-red-600';
      case 'moderate':
        return 'fill-orange-400 hover:fill-orange-500';
      case 'neutral':
        return 'fill-green-500 hover:fill-green-600';
      default:
        return 'fill-gray-300 hover:fill-gray-400';
    }
  };

  // Find a state by name
  const getStateStatus = (name: string): StateStatus | undefined => {
    return stateStatuses.find(state => state.name.toLowerCase() === name.toLowerCase());
  };

  // Handle click on a state
  const handleStateClick = (stateName: string) => {
    const stateData = getStateStatus(stateName);
    if (stateData) {
      setSelectedState(stateData);
    }
  };

  return (
    <div className="relative">
      {/* Map container */}
      <div className="aspect-[4/5] w-full max-w-2xl mx-auto">
        <svg
          viewBox="0 0 800 1000"
          className="w-full h-full stroke-gray-800 stroke-1"
        >
          {/* Jammu and Kashmir */}
          <path
            d="M300 100 L350 80 L400 100 L420 150 L380 170 L330 160 L300 100"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Jammu and Kashmir')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Jammu and Kashmir')}
          />
          
          {/* Punjab */}
          <path
            d="M330 160 L380 170 L390 200 L350 220 L330 160"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Punjab')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Punjab')}
          />
          
          {/* Rajasthan */}
          <path
            d="M250 300 L350 290 L370 350 L320 420 L250 380 L250 300"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Rajasthan')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Rajasthan')}
          />
          
          {/* Gujarat */}
          <path
            d="M180 400 L250 380 L280 450 L220 500 L150 480 L180 400"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Gujarat')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Gujarat')}
          />
          
          {/* Himachal Pradesh */}
          <path
            d="M380 170 L420 150 L450 180 L420 200 L390 200 L380 170"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Himachal Pradesh')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Himachal Pradesh')}
          />
          
          {/* Uttarakhand */}
          <path
            d="M390 200 L420 200 L450 180 L480 200 L450 240 L410 240 L390 200"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Uttarakhand')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Uttarakhand')}
          />
          
          {/* Haryana */}
          <path
            d="M350 220 L390 200 L410 240 L380 280 L350 260 L350 220"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Haryana')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Haryana')}
          />
          
          {/* Delhi */}
          <path
            d="M365 250 L380 240 L390 250 L380 260 L365 250"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Delhi')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Delhi')}
          />
          
          {/* Uttar Pradesh */}
          <path
            d="M410 240 L450 240 L500 250 L520 300 L450 320 L380 280 L410 240"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Uttar Pradesh')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Uttar Pradesh')}
          />
          
          {/* Bihar */}
          <path
            d="M520 300 L550 290 L580 310 L550 340 L520 330 L520 300"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Bihar')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Bihar')}
          />
          
          {/* West Bengal */}
          <path
            d="M580 310 L600 300 L620 330 L600 380 L570 350 L580 310"
            className={`cursor-pointer ${getDangerColor(getStateStatus('West Bengal')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('West Bengal')}
          />
          
          {/* Madhya Pradesh */}
          <path
            d="M320 420 L370 350 L450 320 L520 330 L500 380 L400 450 L320 420"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Madhya Pradesh')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Madhya Pradesh')}
          />
          
          {/* Maharashtra */}
          <path
            d="M280 450 L320 420 L400 450 L420 520 L300 530 L280 450"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Maharashtra')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Maharashtra')}
          />
          
          {/* Karnataka */}
          <path
            d="M300 530 L420 520 L430 580 L350 650 L280 600 L300 530"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Karnataka')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Karnataka')}
          />
          
          {/* Telangana */}
          <path
            d="M400 450 L500 380 L520 450 L430 520 L400 450"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Telangana')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Telangana')}
          />
          
          {/* Andhra Pradesh */}
          <path
            d="M430 520 L520 450 L550 500 L500 600 L430 580 L430 520"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Andhra Pradesh')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Andhra Pradesh')}
          />
          
          {/* Tamil Nadu */}
          <path
            d="M350 650 L430 580 L500 600 L470 700 L380 720 L350 650"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Tamil Nadu')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Tamil Nadu')}
          />
          
          {/* Kerala */}
          <path
            d="M280 600 L350 650 L380 720 L300 700 L280 600"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Kerala')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Kerala')}
          />
          
          {/* Odisha */}
          <path
            d="M500 380 L550 340 L600 380 L570 450 L520 450 L500 380"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Odisha')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Odisha')}
          />
          
          {/* Chhattisgarh */}
          <path
            d="M500 380 L520 450 L570 450 L550 380 L500 380"
            className={`cursor-pointer ${getDangerColor(getStateStatus('Chhattisgarh')?.dangerLevel || 'neutral')}`}
            onClick={() => handleStateClick('Chhattisgarh')}
          />
          
          {/* Northeast States (simplified as one region) */}
          <path
            d="M600 300 L650 250 L700 300 L670 350 L620 330 L600 300"
            className={`cursor-pointer fill-gray-300 hover:fill-gray-400`}
            onClick={() => handleStateClick('Assam')}
          />
        </svg>
      </div>

      {/* State info box */}
      {selectedState && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h3 className="text-xl font-semibold mb-2">{selectedState.name}</h3>
          <div className="flex items-center mb-2">
            <span className="mr-2">Status:</span>
            <span className={`px-2 py-1 rounded-full text-white text-sm ${
              selectedState.dangerLevel === 'danger' ? 'bg-red-500' :
              selectedState.dangerLevel === 'moderate' ? 'bg-orange-400' : 'bg-green-500'
            }`}>
              {selectedState.dangerLevel.charAt(0).toUpperCase() + selectedState.dangerLevel.slice(1)}
            </span>
          </div>
          <p className="text-gray-700">{selectedState.description}</p>
        </div>
      )}
    </div>
  );
}