import { useState, useEffect } from 'react';
import { StateStatus } from '../lib/conflictData';

interface IndiaMapProps {
  stateStatuses: StateStatus[];
}

interface StatePathProps {
  id: string;
  name: string;
  path: string;
  dangerLevel: 'danger' | 'moderate' | 'neutral';
  onClick: (name: string) => void;
}

// Component for individual state
const StatePath = ({ id, name, path, dangerLevel, onClick }: StatePathProps) => {
  // Get fill color based on danger level
  const getFillColor = () => {
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

  return (
    <path
      id={id}
      d={path}
      className={`cursor-pointer ${getFillColor()} transition-colors duration-150 ease-in-out`}
      onClick={() => onClick(name)}
    />
  );
};

export default function IndiaMap({ stateStatuses }: IndiaMapProps) {
  const [selectedState, setSelectedState] = useState<StateStatus | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    // Set map as loaded after component mounts
    setMapLoaded(true);
  }, []);

  // Get state status by name (with name normalization)
  const getStateStatus = (name: string): StateStatus | undefined => {
    // Map state names to match your data
    const nameMapping: Record<string, string> = {
      'Jammu & Kashmir': 'Jammu and Kashmir',
      'Uttarakhand': 'Uttarakhand',
      'Himachal Pradesh': 'Himachal Pradesh',
      'Punjab': 'Punjab',
      'Haryana': 'Haryana',
      'Delhi': 'Delhi',
      'Uttar Pradesh': 'Uttar Pradesh',
      'Rajasthan': 'Rajasthan',
      'Gujarat': 'Gujarat',
      'Madhya Pradesh': 'Madhya Pradesh',
      'Bihar': 'Bihar',
      'Jharkhand': 'Jharkhand',
      'West Bengal': 'West Bengal',
      'Sikkim': 'Sikkim',
      'Assam': 'Assam',
      'Arunachal Pradesh': 'Arunachal Pradesh',
      'Nagaland': 'Nagaland',
      'Manipur': 'Manipur',
      'Mizoram': 'Mizoram',
      'Tripura': 'Tripura',
      'Meghalaya': 'Meghalaya',
      'Odisha': 'Odisha',
      'Chhattisgarh': 'Chhattisgarh',
      'Maharashtra': 'Maharashtra',
      'Telangana': 'Telangana',
      'Andhra Pradesh': 'Andhra Pradesh',
      'Karnataka': 'Karnataka',
      'Goa': 'Goa',
      'Kerala': 'Kerala',
      'Tamil Nadu': 'Tamil Nadu',
      // Union territories
      'Ladakh': 'Ladakh',
      'Chandigarh': 'Chandigarh',
      'Puducherry': 'Puducherry',
      'Lakshadweep': 'Lakshadweep',
      'Andaman & Nicobar': 'Andaman and Nicobar Islands',
      'Dadra & Nagar Haveli': 'Dadra and Nagar Haveli',
      'Daman & Diu': 'Daman and Diu'
    };

    const normalizedName = nameMapping[name] || name;
    return stateStatuses.find(state => state.name.toLowerCase() === normalizedName.toLowerCase());
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
      {!mapLoaded && (
        <div className="flex justify-center items-center w-full h-64">
          <div className="text-blue-600 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}

      <div className={`w-full max-w-2xl mx-auto ${!mapLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}>
        <svg
          viewBox="0 0 950 920"
          className="w-full h-auto stroke-gray-800 stroke-1"
        >
          {/* Jammu and Kashmir */}
          <StatePath
            id="JK"
            name="Jammu & Kashmir"
            path="M318,82 L352,65 L406,78 L432,120 L476,142 L492,172 L476,198 L441,188 L380,194 L342,157 L318,82"
            dangerLevel={getStateStatus('Jammu & Kashmir')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Ladakh (post 2019 J&K bifurcation) */}
          <StatePath
            id="LD"
            name="Ladakh"
            path="M492,172 L518,142 L556,124 L587,158 L595,184 L571,210 L540,228 L518,200 L492,198 L492,172"
            dangerLevel={getStateStatus('Ladakh')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Himachal Pradesh */}
          <StatePath
            id="HP"
            name="Himachal Pradesh"
            path="M380,194 L441,188 L476,198 L465,230 L435,232 L410,252 L380,220 L380,194"
            dangerLevel={getStateStatus('Himachal Pradesh')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Punjab */}
          <StatePath
            id="PB"
            name="Punjab"
            path="M342,157 L380,194 L380,220 L365,242 L335,242 L320,225 L322,192 L342,157"
            dangerLevel={getStateStatus('Punjab')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Uttarakhand */}
          <StatePath
            id="UK"
            name="Uttarakhand"
            path="M410,252 L435,232 L465,230 L489,250 L474,270 L445,275 L435,265 L410,252"
            dangerLevel={getStateStatus('Uttarakhand')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Haryana */}
          <StatePath
            id="HR"
            name="Haryana"
            path="M320,225 L335,242 L365,242 L380,252 L390,275 L380,290 L355,290 L342,275 L330,260 L322,242 L320,225"
            dangerLevel={getStateStatus('Haryana')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Delhi */}
          <StatePath
            id="DL"
            name="Delhi"
            path="M366,264 L380,258 L390,275 L380,288 L366,282 L366,264"
            dangerLevel={getStateStatus('Delhi')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Rajasthan */}
          <StatePath
            id="RJ"
            name="Rajasthan"
            path="M232,320 L320,225 L322,242 L330,260 L342,275 L355,290 L350,330 L330,375 L290,392 L240,380 L210,350 L232,320"
            dangerLevel={getStateStatus('Rajasthan')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Uttar Pradesh */}
          <StatePath
            id="UP"
            name="Uttar Pradesh"
            path="M380,290 L410,252 L435,265 L445,275 L474,270 L494,285 L520,290 L535,310 L520,340 L460,350 L410,330 L380,290"
            dangerLevel={getStateStatus('Uttar Pradesh')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Gujarat */}
          <StatePath
            id="GJ"
            name="Gujarat"
            path="M170,390 L210,350 L240,380 L290,392 L270,440 L230,470 L210,500 L180,485 L150,460 L130,420 L170,390"
            dangerLevel={getStateStatus('Gujarat')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Madhya Pradesh */}
          <StatePath
            id="MP"
            name="Madhya Pradesh"
            path="M290,392 L330,375 L350,330 L380,290 L410,330 L460,350 L470,395 L440,420 L390,440 L350,420 L290,392"
            dangerLevel={getStateStatus('Madhya Pradesh')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Bihar */}
          <StatePath
            id="BR"
            name="Bihar"
            path="M520,340 L535,310 L570,300 L590,320 L570,350 L550,360 L520,340"
            dangerLevel={getStateStatus('Bihar')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Jharkhand */}
          <StatePath
            id="JH"
            name="Jharkhand"
            path="M520,340 L550,360 L570,350 L580,380 L550,400 L520,380 L510,360 L520,340"
            dangerLevel={getStateStatus('Jharkhand')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* West Bengal */}
          <StatePath
            id="WB"
            name="West Bengal"
            path="M570,350 L590,320 L610,330 L630,350 L610,380 L610,410 L580,410 L580,380 L570,350"
            dangerLevel={getStateStatus('West Bengal')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Sikkim */}
          <StatePath
            id="SK"
            name="Sikkim"
            path="M590,320 L600,300 L620,310 L610,330 L590,320"
            dangerLevel={getStateStatus('Sikkim')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Assam */}
          <StatePath
            id="AS"
            name="Assam"
            path="M620,310 L650,290 L695,300 L710,320 L670,350 L650,330 L620,310"
            dangerLevel={getStateStatus('Assam')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Arunachal Pradesh */}
          <StatePath
            id="AR"
            name="Arunachal Pradesh"
            path="M650,290 L675,270 L705,280 L710,300 L695,300 L650,290"
            dangerLevel={getStateStatus('Arunachal Pradesh')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Northeast states (simplified) */}
          <StatePath
            id="NE"
            name="Nagaland"
            path="M695,300 L710,320 L695,330 L680,320 L695,300"
            dangerLevel={getStateStatus('Nagaland')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          <StatePath
            id="MN"
            name="Manipur"
            path="M695,330 L710,320 L720,340 L700,350 L695,330"
            dangerLevel={getStateStatus('Manipur')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          <StatePath
            id="MZ"
            name="Mizoram"
            path="M700,350 L720,340 L725,360 L710,370 L700,350"
            dangerLevel={getStateStatus('Mizoram')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          <StatePath
            id="TR"
            name="Tripura"
            path="M680,350 L695,330 L700,350 L680,360 L680,350"
            dangerLevel={getStateStatus('Tripura')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          <StatePath
            id="MG"
            name="Meghalaya"
            path="M650,330 L670,350 L650,350 L630,340 L650,330"
            dangerLevel={getStateStatus('Meghalaya')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Odisha */}
          <StatePath
            id="OD"
            name="Odisha"
            path="M490,430 L520,380 L550,400 L580,410 L570,450 L530,470 L500,460 L490,430"
            dangerLevel={getStateStatus('Odisha')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Chhattisgarh */}
          <StatePath
            id="CT"
            name="Chhattisgarh"
            path="M470,395 L490,430 L500,460 L480,470 L450,450 L440,420 L470,395"
            dangerLevel={getStateStatus('Chhattisgarh')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Maharashtra */}
          <StatePath
            id="MH"
            name="Maharashtra"
            path="M270,440 L290,392 L350,420 L390,440 L440,420 L450,450 L430,480 L380,500 L330,510 L290,490 L270,440"
            dangerLevel={getStateStatus('Maharashtra')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Telangana */}
          <StatePath
            id="TG"
            name="Telangana"
            path="M390,440 L440,420 L480,470 L470,500 L430,490 L390,440"
            dangerLevel={getStateStatus('Telangana')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Andhra Pradesh */}
          <StatePath
            id="AP"
            name="Andhra Pradesh"
            path="M380,500 L430,490 L470,500 L530,470 L520,530 L450,560 L400,550 L380,500"
            dangerLevel={getStateStatus('Andhra Pradesh')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Karnataka */}
          <StatePath
            id="KA"
            name="Karnataka"
            path="M290,490 L330,510 L380,500 L400,550 L370,590 L320,580 L280,550 L290,490"
            dangerLevel={getStateStatus('Karnataka')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Goa */}
          <StatePath
            id="GA"
            name="Goa"
            path="M290,490 L280,510 L280,520 L290,530 L300,520 L290,490"
            dangerLevel={getStateStatus('Goa')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Kerala */}
          <StatePath
            id="KL"
            name="Kerala"
            path="M320,580 L370,590 L350,640 L320,680 L290,620 L320,580"
            dangerLevel={getStateStatus('Kerala')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Tamil Nadu */}
          <StatePath
            id="TN"
            name="Tamil Nadu"
            path="M370,590 L400,550 L450,560 L460,600 L440,650 L390,690 L350,640 L370,590"
            dangerLevel={getStateStatus('Tamil Nadu')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* Union Territories (some simplified) */}
          <StatePath
            id="CH"
            name="Chandigarh"
            path="M350,230 L355,227 L358,230 L355,233 L350,230"
            dangerLevel={getStateStatus('Chandigarh')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          <StatePath
            id="PY"
            name="Puducherry"
            path="M420,615 L425,610 L430,615 L425,620 L420,615"
            dangerLevel={getStateStatus('Puducherry')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          <StatePath
            id="LK"
            name="Lakshadweep"
            path="M200,580 L205,575 L210,580 L205,585 L200,580"
            dangerLevel={getStateStatus('Lakshadweep')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          <StatePath
            id="AN"
            name="Andaman & Nicobar"
            path="M700,550 L710,540 L720,550 L710,570 L700,550"
            dangerLevel={getStateStatus('Andaman & Nicobar')?.dangerLevel || 'neutral'}
            onClick={handleStateClick}
          />
          
          {/* City markers */}
          <g className="text-xs fill-black">
            <circle cx="376" cy="267" r="3" className="fill-gray-700" />
            <text x="376" y="255" textAnchor="middle">Delhi</text>
            
            <circle cx="380" cy="194" r="3" className="fill-gray-700" />
            <text x="360" y="182" textAnchor="middle">Chandigarh</text>
            
            <circle cx="252" cy="455" r="3" className="fill-gray-700" />
            <text x="252" y="443" textAnchor="middle">Mumbai</text>
            
            <circle cx="435" cy="660" r="3" className="fill-gray-700" />
            <text x="435" y="648" textAnchor="middle">Chennai</text>
            
            <circle cx="360" cy="530" r="3" className="fill-gray-700" />
            <text x="360" y="518" textAnchor="middle">Bangalore</text>
            
            <circle cx="440" cy="470" r="3" className="fill-gray-700" />
            <text x="440" y="458" textAnchor="middle">Hyderabad</text>
            
            <circle cx="370" cy="130" r="3" className="fill-gray-700" />
            <text x="370" y="118" textAnchor="middle">Srinagar</text>
          </g>
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

// AIzaSyAilLS18c1y2T1S-BECk_bFkXVHzK1cVWc