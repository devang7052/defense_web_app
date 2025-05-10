import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { StateStatus } from '../lib/conflictData';

interface IndiaMapProps {
  stateStatuses: StateStatus[];
}

const D3IndiaDistrictMap: React.FC<IndiaMapProps> = ({ stateStatuses }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [selectedState, setSelectedState] = useState<StateStatus | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This function normalizes state names since the GeoJSON format might use different conventions
  const normalizeStateName = (name: string): string => {
    // Add mappings for state names that might be different in your GeoJSON vs your data
    const stateNameMap: Record<string, string> = {
      'Jammu & Kashmir': 'Jammu and Kashmir',
      'Orissa': 'Odisha',
      'Uttaranchal': 'Uttarakhand',
      'Pondicherry': 'Puducherry',
      // Add more mappings as needed
    };
    
    return stateNameMap[name] || name;
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 700;
    
    // Clear previous content
    svg.selectAll("*").remove();
    
    // Create a group for the map
    const g = svg.append("g");
    
    // Create a projection for India
    const projection = d3.geoMercator()
      .center([83, 23]) // Centered on India
      .scale(1200)
      .translate([width / 2, height / 2]);
    
    // Create a path generator
    const path = d3.geoPath().projection(projection);
    
    // Create a tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Function to determine color based on danger level
    const getDangerColor = (stateName: string) => {
      let normalizedName = normalizeStateName(stateName);
      // Treat Ladakh as Jammu & Kashmir for coloring
      if (normalizedName === "Ladakh") {
        normalizedName = "Jammu and Kashmir";
      }
      const state = stateStatuses.find(s => 
        s.name.toLowerCase() === normalizedName.toLowerCase()
      );
      
      if (!state) return "#d1d5db"; // gray-300
      
      switch (state.dangerLevel) {
        case 'danger': return "#ef4444"; // red-500
        case 'moderate': return "#fb923c"; // orange-400
        case 'neutral': return "#22c55e"; // green-500
        default: return "#d1d5db"; // gray-300
      }
    };

    // Function to handle state click
    const handleStateClick = (event: any, d: any) => {
      let stateName = normalizeStateName(d.properties.st_nm);
      // Treat Ladakh as Jammu & Kashmir for selection
      if (stateName === "Ladakh") {
        stateName = "Jammu and Kashmir";
      }
      const state = stateStatuses.find(s => 
        s.name.toLowerCase() === stateName.toLowerCase()
      );
      
      if (state) {
        setSelectedState(state);
      }
    };

    // Load GeoJSON data
    const loadGeoJSON = async () => {
      try {
        // Attempt to fetch the GeoJSON data
        const response = await fetch('/india.geojson');
        
        if (!response.ok) {
          throw new Error('Failed to load India GeoJSON data');
        }
        
        const indiaData = await response.json();
        
        console.log("GeoJSON loaded:", indiaData.features.length, "features found");
        
        // Group districts by state to avoid internal state boundaries
        // Create a Map to store state features
        const stateFeatures = new Map();
        
        // Process each district feature
        indiaData.features.forEach((feature: any) => {
          let stateName = feature.properties.st_nm;
          // Skip Daman & Diu, Lakshadweep, and Andaman & Nicobar
          if (stateName === "Daman & Diu" || stateName === "Lakshadweep" || stateName === "Andaman & Nicobar Islands") {
            return;
          }
          // Merge Ladakh into Jammu & Kashmir
          if (stateName === "Ladakh") {
            stateName = "Jammu and Kashmir";
          }
          
          if (!stateFeatures.has(stateName)) {
            // Create a new entry for this state
            stateFeatures.set(stateName, {
              type: "Feature",
              properties: {
                st_nm: stateName,
                st_code: feature.properties.st_code
              },
              geometry: {
                type: "MultiPolygon",
                coordinates: []
              }
            });
          }
          
          // Add this district's coordinates to the state's MultiPolygon
          const stateFeature = stateFeatures.get(stateName);
          if (feature.geometry.type === "Polygon") {
            stateFeature.geometry.coordinates.push(feature.geometry.coordinates);
          } else if (feature.geometry.type === "MultiPolygon") {
            stateFeature.geometry.coordinates.push(...feature.geometry.coordinates);
          }
        });
        
        // Convert the Map values to an array
        const mergedStateFeatures = Array.from(stateFeatures.values());
        
        // Draw the states
        g.selectAll("path")
          .data(mergedStateFeatures)
          .enter()
          .append("path")
          .attr("d", path as any)
          .attr("fill", (d: any) => getDangerColor(d.properties.st_nm))
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.5)
          .attr("class", "state")
          .style("cursor", "pointer")
          .on("mouseover", function(event, d: any) {
            d3.select(this)
              .attr("stroke-width", 1.5)
              .attr("stroke", "#ffffff");
              
            // Find and highlight the corresponding state label
            g.selectAll(".state-label")
              .filter((labelData: any) => labelData.properties.st_nm === d.properties.st_nm)
              .attr("font-size", "14px")
              .attr("font-weight", "bold");
              
            tooltip
              .style("opacity", 1)
              .html(`
                <div class="font-medium">${normalizeStateName(d.properties.st_nm)}</div>
              `)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 25) + "px");
          })
          .on("mouseout", function() {
            d3.select(this)
              .attr("stroke-width", 0.5);
              
            // Reset all state labels
            g.selectAll(".state-label")
              .attr("font-size", "10px")
              .attr("font-weight", "normal");
              
            tooltip.style("opacity", 0);
          })
          .on("click", handleStateClick);

        // Add black dots for each state
        g.selectAll(".state-dot")
          .data(mergedStateFeatures)
          .enter()
          .append("circle")
          .attr("class", "state-dot")
          .attr("cx", (d: any) => {
            const centroid = path.centroid(d);
            return centroid[0];
          })
          .attr("cy", (d: any) => {
            const centroid = path.centroid(d);
            return centroid[1];
          })
          .attr("r", 3)
          .attr("fill", "#000000");
          
        g.selectAll(".state-label")
          .data(mergedStateFeatures)
          .enter()
          .append("text")
          .attr("class", "state-label")
          .attr("x", (d: any) => {
            const centroid = path.centroid(d);
            return centroid[0];
          })
          .attr("y", (d: any) => {
            const centroid = path.centroid(d);
            return centroid[1] + 15; // Move label below the dot
          })
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("fill", "#222")
          .attr("pointer-events", "none")
          .text((d: any) => normalizeStateName(d.properties.st_nm));
          
        setMapLoaded(true);
        setError(null);
        
      } catch (err) {
        console.error("Error loading map data:", err);
        setError(`Failed to load map data: ${err instanceof Error ? err.message : String(err)}`);
        setMapLoaded(false);
      }
    };
    
    loadGeoJSON();
    
    // Cleanup function
    return () => {
      svg.selectAll("*").remove();
    };
  }, [stateStatuses]); // Re-render if stateStatuses changes

  return (
    <div className="relative">
      <div className="w-full max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-sm">
        {!mapLoaded && !error && (
          <div className="flex justify-center items-center h-64">
            <div className="text-blue-600 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p>Loading map...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}
        
        <div 
          className={`transition-opacity duration-500 ${
            mapLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 800 700"
            className="w-full h-auto"
          />
          
          <div 
            ref={tooltipRef}
            className="absolute bg-white px-2 py-1 rounded shadow-md text-sm z-10 pointer-events-none opacity-0 transition-opacity"
          />
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center">
            <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>
            <span>High Danger</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-orange-400 rounded-full mr-2"></span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
            <span>Neutral</span>
          </div>
        </div>
      </div>

      {/* State info box */}
      {selectedState && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold mb-2 text-black">{selectedState.name}</h3>
          <div className="flex items-center mb-2">
            <span className="mr-2 text-black">Status:</span>
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
};

export default D3IndiaDistrictMap;