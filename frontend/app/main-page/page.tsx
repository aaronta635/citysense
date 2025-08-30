"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import "../globals.css";
import { GOOGLE_MAPS_API_KEY } from "./config";
import { Users, Heart, MessageSquare, TrendingUp } from "lucide-react";

// Sydney map configuration
const SYDNEY_CENTER = { lat: -33.8688, lng: 151.2093 };
const SYDNEY_BOUNDS = {
  north: -33.7, // Northern boundary (Hornsby area)
  south: -34.0, // Southern boundary (Sutherland area)
  east: 151.3, // Eastern boundary (Bondi area)
  west: 150.9, // Western boundary (Parramatta area)
};

// Temporary hardcoded data - will be replaced with API data
const suburbSentimentData: SuburbData[] = [];

// Type definitions
interface MoodBreakdown {
  happy: number;
  neutral: number;
  angry: number;
  sad: number;
  stressed: number;
  totalSubmissions: number;
}

interface SuburbData {
  name: string;
  center: { lat: number; lng: number };
  radius: number;
  sentiment: number;
  description: string;
  moodBreakdown: MoodBreakdown;
}

export default function SydneySensePage() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [suburbCircles, setSuburbCircles] = useState<google.maps.Circle[]>([]);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [stats, setStats] = useState({ suburbsShown: 0, avgSentiment: "0%" });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suburbSearchTerm, setSuburbSearchTerm] = useState("");
  const [suburbData, setSuburbData] = useState<SuburbData[]>([]);
  const [filteredSuburbs, setFilteredSuburbs] = useState<SuburbData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showMoodStats, setShowMoodStats] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);

  // Helper function to get approximate coordinates for Sydney suburbs
  const getCoordinatesForSuburb = (suburbName: string) => {
    // Basic mapping of suburbs to coordinates (you can expand this list)
    const suburbCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'Bondi': { lat: -33.8915, lng: 151.2767 },
      'Bondi Beach': { lat: -33.8915, lng: 151.2767 },
      'Bondi Junction': { lat: -33.8947, lng: 151.2477 },
      'Coogee': { lat: -33.9205, lng: 151.2584 },
      'Randwick': { lat: -33.9067, lng: 151.2417 },
      'Dover Heights': { lat: -33.8742, lng: 151.2789 },
      'Sydney': { lat: -33.8688, lng: 151.2093 },
      'Kirrawee': { lat: -34.0307, lng: 151.1158 },
      'Sutherland': { lat: -34.0307, lng: 151.0580 }
    };
    
    return suburbCoordinates[suburbName] || { lat: -33.8688, lng: 151.2093 }; // Default to Sydney CBD
  };

  // Fetch suburb data from API
  useEffect(() => {
    const fetchSuburbData = async () => {
      try {
        const response = await fetch('http://localhost:3000/v1/citysense/data/combined');
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Backend responded successfully!');
          console.log('Raw backend data:', result.data.suburbs);
          console.log('Number of suburbs from backend:', result.data.suburbs.length);
          
          // Transform backend data to match frontend expectations
          // Only include suburbs that have mood data
          const transformedData = result.data.suburbs
            .filter((suburbItem: any) => suburbItem.mood?.breakdown) // Only suburbs with mood data
            .map((suburbItem: any) => {
              const coordinates = getCoordinatesForSuburb(suburbItem.suburb);
              const mood = suburbItem.mood.breakdown;
              const total = mood.totalSubmissions || 1;
              
              // Convert counts to percentages
              const moodBreakdown = {
                happy: Math.round((mood.happy || 0) / total * 100),
                neutral: Math.round((mood.neutral || 0) / total * 100),
                angry: Math.round((mood.angry || 0) / total * 100),
                sad: Math.round((mood.sad || 0) / total * 100),
                stressed: Math.round((mood.stressed || 0) / total * 100),
                totalSubmissions: total
              };
              
              return {
                name: suburbItem.suburb,
                center: coordinates,
                radius: 500, // Default radius in meters
                sentiment: suburbItem.mood?.sentiment || 0.5,
                description: `Community mood data for ${suburbItem.suburb} (${total} submissions)`,
                moodBreakdown: moodBreakdown
              };
            });
          
          console.log('Transformed data:', transformedData);
          console.log('Number of suburbs with mood data:', transformedData.length);
          
          if (transformedData.length > 0) {
            setSuburbData(transformedData);
            setFilteredSuburbs(transformedData);
            console.log('✅ Data set successfully! Should see suburbs on map.');
            
            // If map is already loaded, update the circles
            if (map) {
              console.log('🗺️ Map exists, updating circles...');
              updateMapWithNewData(transformedData);
            }
          } else {
            console.log('❌ No suburbs with mood data found!');
          }
        }
      } catch (error) {
        console.error('Error fetching suburb data:', error);
      }
    };

    fetchSuburbData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchSuburbData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update map when suburbData changes
  useEffect(() => {
    if (map && suburbData.length > 0) {
      console.log('📊 Data changed, updating map with', suburbData.length, 'suburbs');
      updateMapWithNewData(suburbData);
    }
  }, [map, suburbData]);

  // Function to update map with new data
  const updateMapWithNewData = (data: SuburbData[]) => {
    if (!map) return;
    
    console.log('🔄 Updating map with', data.length, 'suburbs');
    
    // Clear existing circles
    suburbCircles.forEach(circle => circle.setMap(null));
    
    // Create new circles with the fresh data
    const newCircles = createSuburbSentimentCircles(map, data);
    setSuburbCircles(newCircles);
    
    // Update stats
    const totalSentiment = data.reduce((sum, suburb) => sum + suburb.sentiment, 0);
    const avgSentiment = data.length > 0 ? Math.round((totalSentiment / data.length) * 100) : 0;
    
    setStats({
      suburbsShown: data.length,
      avgSentiment: avgSentiment + "%"
    });
    
    console.log('✅ Map updated with new circles!');
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    console.log("Dropdown clicked, current state:", isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
    console.log("New state will be:", !isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".activity-dropdown")) {
        setIsDropdownOpen(false);
      }
      if (!target.closest(".search-input-container")) {
        setShowSuggestions(false);
      }
      if (!target.closest(".profile-dropdown")) {
        setIsProfileOpen(false);
      }
    };

    if (isDropdownOpen || showSuggestions || isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, showSuggestions, isProfileOpen]);

  // Convert sentiment score to mood-based color
  const getSentimentColor = (
    sentimentScore: number,
    moodBreakdown?: MoodBreakdown
  ): string => {
    // If moodBreakdown is provided, use the largest mood percentage
    if (moodBreakdown) {
      const { happy, neutral, angry, sad, stressed } = moodBreakdown;
      const maxMood = Math.max(happy, neutral, angry, sad, stressed);

      // Debug logging to check mood percentages
      console.log(`Mood breakdown for suburb:`, {
        happy,
        neutral,
        angry,
        sad,
        stressed,
        maxMood,
        dominantMood:
          maxMood === happy
            ? "happy"
            : maxMood === neutral
            ? "neutral"
            : maxMood === angry
            ? "angry"
            : maxMood === sad
            ? "sad"
            : "stressed",
      });

      if (maxMood === happy) return "#4caf50"; // Green for happy
      if (maxMood === neutral) return "#ffeb3b"; // Yellow for neutral
      if (maxMood === angry) return "#f44336"; // Red for angry
      if (maxMood === sad) return "#9c27b0"; // Purple for sad
      return "#9e9e9e"; // Gray for stressed
    }

    // Fallback to original sentiment score logic
    if (sentimentScore >= 0.66) return "#4caf50"; // Green for happy (66%+)
    if (sentimentScore >= 0.33) return "#ffeb3b"; // Yellow for neutral (33-65%)
    return "#f44336"; // Red for angry (0-32%)
  };

  // Initialize the Sydney map
  const initializeSydneyMap = () => {
    try {
      console.log("Setting up Sydney map...");
      console.log("mapRef.current:", mapRef.current);

      if (!mapRef.current) {
        console.error("Map container not found");
        return;
      }

      // Create the main map centered on Sydney
      const newMap = new google.maps.Map(mapRef.current, {
        zoom: 14,
        center: SYDNEY_CENTER,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        minZoom: 11, // Don't zoom out too far
        maxZoom: 18, // Don't zoom in too close
        restriction: {
          latLngBounds: SYDNEY_BOUNDS,
          strictBounds: true, // Keep users within Sydney area
        },
        styles: [
          {
            featureType: "poi", // Points of interest
            elementType: "labels",
            stylers: [{ visibility: "off" }], // Hide POI labels for cleaner look
          },
        ],
      });

      setMap(newMap);
      console.log("Sydney map created successfully");

      // Add a subtle boundary indicator around Sydney region
      addSydneyBoundaryIndicator(newMap);

      // Create sentiment circles for each suburb
      const circles = createSuburbSentimentCircles(newMap);
      setSuburbCircles(circles);

      // Initialize with all suburbs visible and update stats
      updateFilterStats(11, 5.8, 11);

      // Add map controls for user interaction
      addMapControls(newMap);

      console.log("Sydney map setup completed successfully");
      setIsMapLoading(false);
    } catch (error) {
      console.error("Error setting up Sydney map:", error);
      setMapError("Error loading map: " + (error as Error).message);
      setIsMapLoading(false);
    }
  };

  // Add a visual boundary around the Sydney region
  const addSydneyBoundaryIndicator = (mapInstance: google.maps.Map) => {
    new google.maps.Rectangle({
      bounds: SYDNEY_BOUNDS,
      fillColor: "#4caf50",
      fillOpacity: 0.05, // Very subtle fill
      strokeColor: "#2d5a2d",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      map: mapInstance,
    });
  };

  // Create sentiment circles for each suburb
  const createSuburbSentimentCircles = (
    mapInstance: google.maps.Map,
    dataToUse?: SuburbData[]
  ): google.maps.Circle[] => {
    const circles: google.maps.Circle[] = [];
    const dataSource = dataToUse || suburbData;
    
    console.log('🎯 Creating circles for', dataSource.length, 'suburbs');

    dataSource.forEach((suburb) => {
      // Get the color based on mood breakdown
      const circleColor = getSentimentColor(
        suburb.sentiment,
        suburb.moodBreakdown
      );

      // Debug logging for angry suburbs
      if (
        suburb.moodBreakdown.angry > suburb.moodBreakdown.happy &&
        suburb.moodBreakdown.angry > suburb.moodBreakdown.neutral &&
        suburb.moodBreakdown.angry > suburb.moodBreakdown.sad &&
        suburb.moodBreakdown.angry > suburb.moodBreakdown.stressed
      ) {
        console.log(`Angry suburb detected: ${suburb.name}`, {
          angry: suburb.moodBreakdown.angry,
          happy: suburb.moodBreakdown.happy,
          neutral: suburb.moodBreakdown.neutral,
          sad: suburb.moodBreakdown.sad,
          stressed: suburb.moodBreakdown.stressed,
          assignedColor: circleColor,
        });
      }

      // Create a circle representing the suburb area
      const suburbCircle = new google.maps.Circle({
        center: suburb.center,
        radius: suburb.radius,
        fillColor: circleColor,
        fillOpacity: 0.3, // Semi-transparent fill
        strokeColor: circleColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: mapInstance,
      });

      // Create info popup for when users click on a suburb
      const suburbInfoPopup = createSuburbInfoPopup(suburb);

      // Make the suburb circle interactive
      makeSuburbCircleInteractive(suburbCircle, suburbInfoPopup, mapInstance);

      // Store the circle for later use (showing/hiding)
      circles.push(suburbCircle);
    });

    console.log("Created sentiment circles for all Sydney suburbs");
    return circles;
  };

  // Create an info popup for a suburb
  const createSuburbInfoPopup = (suburb: SuburbData) => {
    return new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #2d5a2d;">${suburb.name}</h3>
          <p style="margin: 0 0 8px 0; color: #666;">${suburb.description}</p>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: bold; color: #333;">Sentiment Score:</span>
            <span style="color: ${getSentimentColor(
              suburb.sentiment,
              suburb.moodBreakdown
            )}; font-weight: bold;">
              ${Math.round(suburb.sentiment * 100)}%
            </span>
          </div>
        </div>
      `,
    });
  };

  // Make a suburb circle interactive with click and hover effects
  const makeSuburbCircleInteractive = (
    circle: google.maps.Circle,
    infoPopup: google.maps.InfoWindow,
    mapInstance: google.maps.Map
  ) => {
    // Show info when clicked
    circle.addListener("click", () => {
      infoPopup.open(mapInstance, circle);
    });

    // Highlight on hover
    circle.addListener("mouseover", () => {
      circle.setOptions({
        fillOpacity: 0.6, // More visible on hover
        strokeWeight: 3, // Thicker border on hover
      });
    });

    // Return to normal on mouse out
    circle.addListener("mouseout", () => {
      circle.setOptions({
        fillOpacity: 0.3, // Back to semi-transparent
        strokeWeight: 2, // Normal border thickness
      });
    });
  };

  // Add map control buttons
  const addMapControls = (mapInstance: google.maps.Map) => {
    // Add reset button to return to default view
    mapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(
      createResetButton(mapInstance)
    );
  };

  // Create the reset button to return to default view
  const createResetButton = (mapInstance: google.maps.Map) => {
    const resetButton = document.createElement("div");
    resetButton.style.backgroundColor = "#fff";
    resetButton.style.border = "2px solid #fff";
    resetButton.style.borderRadius = "3px";
    resetButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    resetButton.style.cursor = "pointer";
    resetButton.style.marginBottom = "22px";
    resetButton.style.textAlign = "center";

    const buttonText = document.createElement("div");
    buttonText.style.color = "rgb(25,25,25)";
    buttonText.style.fontFamily = "Roboto,Arial,sans-serif";
    buttonText.style.fontSize = "16px";
    buttonText.style.lineHeight = "38px";
    buttonText.style.paddingLeft = "5px";
    buttonText.style.paddingRight = "5px";
    buttonText.innerHTML = "Reset View";
    resetButton.appendChild(buttonText);

    buttonText.addEventListener("click", () => {
      mapInstance.setCenter(SYDNEY_CENTER);
      mapInstance.setZoom(14);
    });
    return resetButton;
  };

  // Update the statistics display
  const updateFilterStats = (
    visibleCount: number,
    totalSentiment: number,
    visibleSuburbs: number
  ) => {
    if (visibleSuburbs > 0) {
      const averageSentiment = Math.round(
        (totalSentiment / visibleSuburbs) * 100
      );
      setStats({
        suburbsShown: visibleCount,
        avgSentiment: averageSentiment + "%",
      });
    } else {
      setStats({ suburbsShown: 0, avgSentiment: "0%" });
    }
  };

  // Filter suburbs based on selected mood
  const filterBySentiment = () => {
    const selectedFilter = (
      document.getElementById("sentimentFilter") as HTMLSelectElement
    ).value;
    let visibleCount = 0;
    let totalSentiment = 0;
    let visibleSuburbs = 0;

    suburbCircles.forEach((circle, index) => {
      const suburb = suburbData[index];
      let shouldShow = false;

      // Use moodBreakdown data instead of sentiment score for more accurate filtering
      if (suburb.moodBreakdown) {
        const { happy, neutral, angry, sad, stressed } = suburb.moodBreakdown;

        switch (selectedFilter) {
          case "happy":
            shouldShow =
              happy >= neutral &&
              happy >= angry &&
              happy >= sad &&
              happy >= stressed; // Happy is the highest percentage
            break;
          case "neutral":
            shouldShow =
              neutral >= happy &&
              neutral >= angry &&
              neutral >= sad &&
              neutral >= stressed; // Neutral is the highest percentage
            break;
          case "angry":
            shouldShow =
              angry >= happy &&
              angry >= neutral &&
              angry >= sad &&
              angry >= stressed; // Angry is the highest percentage
            break;
          case "sad":
            shouldShow =
              sad >= happy && sad >= neutral && sad >= angry && sad >= stressed; // Sad is the highest percentage
            break;
          case "stressed":
            shouldShow =
              stressed >= happy &&
              stressed >= neutral &&
              stressed >= angry &&
              stressed >= sad; // Stressed is the highest percentage
            break;
          default: // "all"
            shouldShow = true;
            break;
        }
      } else {
        // Fallback to sentiment score if no moodBreakdown available
        switch (selectedFilter) {
          case "happy":
            shouldShow = suburb.sentiment >= 0.66; // Happy mood (66%+)
            break;
          case "neutral":
            shouldShow = suburb.sentiment >= 0.33 && suburb.sentiment < 0.66; // Neutral mood (33-65%)
            break;
          case "angry":
            shouldShow = suburb.sentiment < 0.33; // Angry mood (0-32%)
            break;
          default: // "all"
            shouldShow = true;
            break;
        }
      }

      if (shouldShow) {
        circle.setMap(map);
        visibleCount++;
        totalSentiment += suburb.sentiment;
        visibleSuburbs++;
      } else {
        circle.setMap(null);
      }
    });

    // Update the stats display
    updateFilterStats(visibleCount, totalSentiment, visibleSuburbs);
  };

  // Filter suburbs by specific suburb name
  const filterBySuburb = (selectedSuburb: string) => {
    let visibleCount = 0;
    let totalSentiment = 0;
    let visibleSuburbs = 0;
    let selectedSuburbData: SuburbData | null = null;

    suburbCircles.forEach((circle, index) => {
      const suburb = suburbData[index];
      let shouldShow = false;

      if (selectedSuburb === "all") {
        shouldShow = true;
      } else {
        shouldShow = suburb.name === selectedSuburb;
        if (shouldShow) {
          selectedSuburbData = suburb;
        }
      }

      if (shouldShow) {
        circle.setMap(map);
        visibleCount++;
        totalSentiment += suburb.sentiment;
        visibleSuburbs++;
      } else {
        circle.setMap(null);
      }
    });

    // If a specific suburb is selected, center the map on it and show mood breakdown
    if (selectedSuburb !== "all" && selectedSuburbData && map) {
      const suburb = selectedSuburbData as SuburbData;
      map.setCenter(suburb.center);
      map.setZoom(16); // Zoom in closer to see the suburb better
      showMoodBreakdown(suburb);
    } else if (selectedSuburb === "all" && map) {
      // Return to default Sydney view
      map.setCenter(SYDNEY_CENTER);
      map.setZoom(14);
      hideMoodBreakdown();
    }

    // Update the stats display
    updateFilterStats(visibleCount, totalSentiment, visibleSuburbs);
  };

  // Handle suburb search
  const handleSuburbSearch = (searchTerm: string) => {
    setSuburbSearchTerm(searchTerm);
    if (searchTerm.trim() === "") {
      setFilteredSuburbs(suburbData);
      setShowSuggestions(false);
      // Show all suburbs when search is cleared
      filterBySuburb("all");
    } else {
      const filtered = suburbData.filter((suburb) =>
        suburb.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuburbs(filtered);
      setShowSuggestions(true);
    }
  };

  // Select suburb from search results
  const selectSuburb = (suburbName: string) => {
    filterBySuburb(suburbName);
    setSuburbSearchTerm(suburbName);
    setFilteredSuburbs(suburbData);
  };

  // Show mood breakdown for a specific suburb
  const showMoodBreakdown = (suburbData: SuburbData) => {
    const moodBreakdownElement = document.getElementById("moodBreakdown");
    if (!moodBreakdownElement) return;

    const breakdown = suburbData.moodBreakdown;

    // Update the mood bars
    const happyBar = document.getElementById("happyBar");
    const neutralBar = document.getElementById("neutralBar");
    const angryBar = document.getElementById("angryBar");
    const sadBar = document.getElementById("sadBar");
    const stressedBar = document.getElementById("stressedBar");

    if (happyBar) happyBar.style.width = breakdown.happy + "%";
    if (neutralBar) neutralBar.style.width = breakdown.neutral + "%";
    if (angryBar) angryBar.style.width = breakdown.angry + "%";
    if (sadBar) sadBar.style.width = breakdown.sad + "%";
    if (stressedBar) stressedBar.style.width = breakdown.stressed + "%";

    // Update the percentages
    const happyPercentage = document.getElementById("happyPercentage");
    const neutralPercentage = document.getElementById("neutralPercentage");
    const angryPercentage = document.getElementById("angryPercentage");
    const sadPercentage = document.getElementById("sadPercentage");
    const stressedPercentage = document.getElementById("stressedPercentage");

    if (happyPercentage) happyPercentage.textContent = breakdown.happy + "%";
    if (neutralPercentage)
      neutralPercentage.textContent = breakdown.neutral + "%";
    if (angryPercentage) angryPercentage.textContent = breakdown.angry + "%";
    if (sadPercentage) sadPercentage.textContent = breakdown.sad + "%";
    if (stressedPercentage)
      stressedPercentage.textContent = breakdown.stressed + "%";

    // Update total submissions
    const totalSubmissions = document.getElementById("totalSubmissions");
    if (totalSubmissions)
      totalSubmissions.textContent = breakdown.totalSubmissions.toString();

    // Show the mood breakdown section
    moodBreakdownElement.style.display = "block";
  };

  // Hide mood breakdown when showing all suburbs
  const hideMoodBreakdown = () => {
    const moodBreakdown = document.getElementById("moodBreakdown");
    if (moodBreakdown) {
      moodBreakdown.style.display = "none";
    }
  };

  // Toggle visibility of all suburb circles
  const toggleSuburbOverlays = () => {
    const toggleText = document.getElementById("toggle-text");
    if (!toggleText) return;

    const isVisible = suburbCircles[0] && suburbCircles[0].getMap() !== null;

    if (isVisible) {
      // Hide all suburb circles
      suburbCircles.forEach((circle) => {
        circle.setMap(null);
      });
      toggleText.textContent = "Show Suburb Overlays";
    } else {
      // Show all suburb circles
      suburbCircles.forEach((circle) => {
        circle.setMap(map);
      });
      toggleText.textContent = "Hide Suburb Overlays";
    }
  };

  // Handle Google Maps script load
  const handleScriptLoad = () => {
    console.log("Google Maps script loaded successfully");
    // Initialize map after a short delay to ensure everything is ready
    setTimeout(() => {
      console.log("Checking Google Maps availability...");
      console.log("typeof google:", typeof google);
      console.log("google.maps:", google?.maps);

      if (typeof google !== "undefined" && google.maps) {
        console.log("Google Maps is available, initializing...");
        initializeSydneyMap();
      } else {
        console.error("Google Maps not available after script load");
        setMapError("Google Maps failed to initialize");
        setIsMapLoading(false);
      }
    }, 1000); // Increased delay to ensure script is fully loaded
  };

  // Handle Google Maps script error
  const handleScriptError = () => {
    console.error("Failed to load Google Maps script");
    setMapError("Failed to load Google Maps");
    setIsMapLoading(false);
  };

  // Add a timeout fallback in case the script never loads
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isMapLoading && !map && !mapError) {
        console.error("Google Maps script load timeout");
        setMapError("Google Maps load timeout - please refresh the page");
        setIsMapLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isMapLoading, map, mapError]);

  // Manual script loading fallback
  useEffect(() => {
    // If Next.js Script doesn't work, try manual loading after 5 seconds
    const fallbackTimeout = setTimeout(() => {
      if (isMapLoading && !map && !mapError && typeof google === "undefined") {
        console.log("Trying manual Google Maps script loading...");
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization`;
        script.async = true;
        script.onload = () => {
          console.log("Manual script load successful");
          handleScriptLoad();
        };
        script.onerror = () => {
          console.error("Manual script load failed");
          handleScriptError();
        };
        document.head.appendChild(script);
      }
    }, 5000);

    return () => clearTimeout(fallbackTimeout);
  }, [isMapLoading, map, mapError]);

  // // Helper functions for ranking chart
  // const getTop3SuburbsByMood = (): SuburbData[] => {
  //   // Sort suburbs by their happy mood percentage
  //   const sortedSuburbs = [...suburbData].sort((a, b) => {
  //     return b.moodBreakdown.happy - a.moodBreakdown.happy; // Descending order by happy percentage
  //   });

  //   // Debug: Log the top 3 suburbs and their happy percentages
  //   console.log(
  //     "Top 3 suburbs by happy mood:",
  //     sortedSuburbs.slice(0, 3).map((suburb) => ({
  //       name: suburb.name,
  //       happy: suburb.moodBreakdown.happy,
  //       total: suburb.moodBreakdown.totalSubmissions,
  //     }))
  //   );

  //   return sortedSuburbs.slice(0, 3);
  // };

  const getMoodType = (moodBreakdown: MoodBreakdown): string => {
    const { happy, neutral, angry, sad, stressed } = moodBreakdown;
    const maxMood = Math.max(happy, neutral, angry, sad, stressed);
    if (maxMood === happy) return "Happy";
    if (maxMood === neutral) return "Neutral";
    if (maxMood === angry) return "Angry";
    if (maxMood === sad) return "Sad";
    return "Stressed";
  };

  const getMoodPercentage = (moodBreakdown: MoodBreakdown): number => {
    const { happy, neutral, angry, sad, stressed } = moodBreakdown;
    return Math.max(happy, neutral, angry, sad, stressed);
  };

  const getMoodIcon = (moodBreakdown: MoodBreakdown): string => {
    const { happy, neutral, angry, sad, stressed } = moodBreakdown;
    const maxMood = Math.max(happy, neutral, angry, sad, stressed);
    if (maxMood === happy) return "😊";
    if (maxMood === neutral) return "😐";
    if (maxMood === angry) return "😠";
    if (maxMood === sad) return "😢";
    return "😰";
  };

  // Helper function for pie chart rotation
  const getPieChartRotation = (moodType: string) => {
    const totalSubmissions = suburbData.reduce(
      (sum, suburb) => sum + suburb.moodBreakdown.totalSubmissions,
      0
    );
    if (totalSubmissions === 0) return 0;

    let totalMoodValue = 0;
    suburbData.forEach((suburb) => {
      switch (moodType) {
        case "happy":
          totalMoodValue += suburb.moodBreakdown.happy;
          break;
        case "neutral":
          totalMoodValue += suburb.moodBreakdown.neutral;
          break;
        case "angry":
          totalMoodValue += suburb.moodBreakdown.angry;
          break;
        case "sad":
          totalMoodValue += suburb.moodBreakdown.sad;
          break;
        case "stressed":
          totalMoodValue += suburb.moodBreakdown.stressed;
          break;
      }
    });

    const percentage = (totalMoodValue / totalSubmissions) * 100;
    return percentage * 3.6; // 360 degrees for 100%
  };

  // Helper function for overall mood percentage
  const getOverallMoodPercentage = (moodType: string) => {
    const totalSubmissions = suburbData.reduce(
      (sum, suburb) => sum + suburb.moodBreakdown.totalSubmissions,
      0
    );
    if (totalSubmissions === 0) return 0;

    let totalMoodValue = 0;
    suburbData.forEach((suburb) => {
      switch (moodType) {
        case "happy":
          totalMoodValue += suburb.moodBreakdown.happy;
          break;
        case "neutral":
          totalMoodValue += suburb.moodBreakdown.neutral;
          break;
        case "angry":
          totalMoodValue += suburb.moodBreakdown.angry;
          break;
        case "sad":
          totalMoodValue += suburb.moodBreakdown.sad;
          break;
        case "stressed":
          totalMoodValue += suburb.moodBreakdown.stressed;
          break;
      }
    });

    return totalSubmissions > 0
      ? Math.round((totalMoodValue / totalSubmissions) * 100)
      : 0;
  };

  // Helper function to create pie chart conic gradient
  const getPieChartGradient = () => {
    const happyPercent = getOverallMoodPercentage("happy");
    const neutralPercent = getOverallMoodPercentage("neutral");
    const angryPercent = getOverallMoodPercentage("angry");
    const sadPercent = getOverallMoodPercentage("sad");
    const stressedPercent = getOverallMoodPercentage("stressed");

    let currentAngle = 0;
    const segments = [];

    if (happyPercent > 0) {
      segments.push(
        `#4caf50 ${currentAngle}deg ${currentAngle + happyPercent * 3.6}deg`
      );
      currentAngle += happyPercent * 3.6;
    }

    if (neutralPercent > 0) {
      segments.push(
        `#ffeb3b ${currentAngle}deg ${currentAngle + neutralPercent * 3.6}deg`
      );
      currentAngle += neutralPercent * 3.6;
    }

    if (angryPercent > 0) {
      segments.push(
        `#f44336 ${currentAngle}deg ${currentAngle + angryPercent * 3.6}deg`
      );
      currentAngle += angryPercent * 3.6;
    }

    if (sadPercent > 0) {
      segments.push(
        `#9c27b0 ${currentAngle}deg ${currentAngle + sadPercent * 3.6}deg`
      );
      currentAngle += sadPercent * 3.6;
    }

    if (stressedPercent > 0) {
      segments.push(
        `#9e9e9e ${currentAngle}deg ${currentAngle + stressedPercent * 3.6}deg`
      );
    }

    return segments.join(", ");
  };

  // Validate mood percentages add up to 100%
  const validateMoodPercentages = () => {
    suburbData.forEach((suburb, index) => {
      const { happy, neutral, angry, sad, stressed } = suburb.moodBreakdown;
      const total = happy + neutral + angry + sad + stressed;

      if (total !== 100) {
        console.warn(
          `Suburb ${suburb.name} (index ${index}) mood percentages don't add up to 100%:`,
          {
            happy,
            neutral,
            angry,
            sad,
            stressed,
            total,
          }
        );
      }
    });
  };

  // Run validation on component mount
  useEffect(() => {
    validateMoodPercentages();
  }, []);

  return (
    <div className="dashboard">
      {/* Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization`}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="lazyOnload"
      />

      {/* Header */}
      <header className="header">
        <div className="logo">CitySense</div>

        <div className="header-icons">
          {/* Recent Activity Dropdown */}
          <div className="activity-dropdown">
            <button className="dropdown-trigger">
              <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
              Recent Activity
              <svg
                className="dropdown-arrow"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>

            <div className="dropdown-menu">
              <div className="dropdown-header">
                <h4>Recent Activity</h4>
                <span className="activity-count">3 new</span>
              </div>

              <div className="dropdown-activities">
                <div className="dropdown-activity-item">
                  <div className="activity-dot green"></div>
                  <div className="dropdown-activity-content">
                    <div className="dropdown-activity-text">
                      New positive feedback in Downtown area
                    </div>
                    <div className="dropdown-activity-time">2 minutes ago</div>
                  </div>
                </div>

                <div className="dropdown-activity-item">
                  <div className="activity-dot yellow"></div>
                  <div className="dropdown-activity-content">
                    <div className="dropdown-activity-text">
                      Neutral sentiment spike in Park District
                    </div>
                    <div className="dropdown-activity-time">15 minutes ago</div>
                  </div>
                </div>

                <div className="dropdown-activity-item">
                  <div className="activity-dot red"></div>
                  <div className="dropdown-activity-content">
                    <div className="dropdown-activity-text">
                      Concerns raised about traffic in Main St
                    </div>
                    <div className="dropdown-activity-time">1 hour ago</div>
                  </div>
                </div>
              </div>

              <div className="dropdown-footer">
                <button className="view-all-btn">View All Activity</button>
              </div>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="profile-dropdown">
            <button
              className="profile-trigger"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>

            {/* Profile Menu */}
            {isProfileOpen && (
              <div className="profile-menu">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <svg
                      className="profile-icon"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div className="profile-info">
                    <div className="profile-name">John Doe</div>
                    <div className="profile-email">john.doe@example.com</div>
                  </div>
                </div>

                <div className="profile-options">
                  <div className="profile-option logout">
                    <svg
                      className="option-icon"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm0 2h12v8H3V5z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span>Sign Out</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="filter-section">
          <h3>Mood Filter</h3>
          <div className="dropdown-container">
            <select
              id="sentimentFilter"
              className="sentiment-dropdown"
              onChange={filterBySentiment}
            >
              <option value="all">All Moods</option>
              <option value="happy">Happy 😊</option>
              <option value="neutral">Neutral 😐</option>
              <option value="angry">Angry 😠</option>
              <option value="sad">Sad 😢</option>
              <option value="stressed">Stressed 😰</option>
            </select>
          </div>

          <div className="filter-info">
            <p>Filter suburbs by community mood</p>
          </div>

          <div className="color-legend"></div>
        </div>

        <div className="filter-section">
          <h3>Suburb Filter</h3>

          {/* Combined Search and Dropdown */}
          <div className="combined-filter-container">
            {/* Search Input with Suggestions */}
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search suburbs..."
                value={suburbSearchTerm}
                onChange={(e) => handleSuburbSearch(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="suburb-search-input"
              />

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suburbSearchTerm && (
                <div className="search-suggestions">
                  {filteredSuburbs.length > 0 ? (
                    filteredSuburbs.map((suburb) => (
                      <div
                        key={suburb.name}
                        className="suggestion-item"
                        onClick={() => {
                          selectSuburb(suburb.name);
                          setShowSuggestions(false);
                        }}
                      >
                        <span className="suggestion-name">{suburb.name}</span>
                        <span className="suggestion-sentiment">
                          {Math.round(suburb.sentiment * 100)}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="no-suggestions">No suburbs found</div>
                  )}
                </div>
              )}
            </div>

            {/* Show All Button */}
            <button
              onClick={() => {
                filterBySuburb("all");
                setSuburbSearchTerm("");
              }}
              className="show-all-btn"
            >
              Show All
            </button>
          </div>

          <div className="filter-info">
            <p>Search to filter or scroll through the dropdown list</p>
          </div>
        </div>

        <div className="stats-section">
          <h3>Current View</h3>
          <div className="stat-item">
            <span className="stat-label">Suburbs Shown:</span>
            <span id="suburbsShown" className="stat-value">
              {stats.suburbsShown}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Mood:</span>
            <span id="avgSentiment" className="stat-value">
              {stats.avgSentiment}
            </span>
          </div>
        </div>

        <div
          className="mood-breakdown-section"
          id="moodBreakdown"
          style={{ display: "none" }}
        >
          <h3>Mood Breakdown</h3>
          <div className="mood-bar">
            <div className="mood-label">Happy 😊</div>
            <div className="mood-bar-container">
              <div className="mood-bar-fill happy" id="happyBar"></div>
            </div>
            <div className="mood-percentage" id="happyPercentage">
              0%
            </div>
          </div>
          <div className="mood-bar">
            <div className="mood-label">Neutral 😐</div>
            <div className="mood-bar-container">
              <div className="mood-bar-fill neutral" id="neutralBar"></div>
            </div>
            <div className="mood-percentage" id="neutralPercentage">
              0%
            </div>
          </div>
          <div className="mood-bar">
            <div className="mood-label">Angry 😠</div>
            <div className="mood-bar-container">
              <div className="mood-bar-fill angry" id="angryBar"></div>
            </div>
            <div className="mood-percentage" id="angryPercentage">
              0%
            </div>
          </div>
          <div className="mood-bar">
            <div className="mood-label">Sad 😢</div>
            <div className="mood-bar-container">
              <div className="mood-bar-fill sad" id="sadBar"></div>
            </div>
            <div className="mood-percentage" id="sadPercentage">
              0%
            </div>
          </div>
          <div className="mood-bar">
            <div className="mood-label">Stressed 😰</div>
            <div className="mood-bar-container">
              <div className="mood-bar-fill stressed" id="stressedBar"></div>
            </div>
            <div className="mood-percentage" id="stressedPercentage">
              0%
            </div>
          </div>
          <div className="total-submissions">
            <span>Total Submissions: </span>
            <span id="totalSubmissions">0</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <div className="content-title">
            <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              ></path>
            </svg>
            Sydney Suburb Sentiment Map
          </div>
          <button
            onClick={() => {
              console.log("Manual map init triggered");
              if (typeof google !== "undefined" && google.maps) {
                initializeSydneyMap();
                // Reset mood filter dropdown to "All Moods"
                const sentimentFilter = document.getElementById(
                  "sentimentFilter"
                ) as HTMLSelectElement;
                if (sentimentFilter) {
                  sentimentFilter.value = "all";
                  // Trigger the filter to show all suburbs
                  filterBySentiment();
                }
              } else {
                console.log("Google Maps not available");
              }
            }}
            style={{
              padding: "8px 16px",
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              marginLeft: "10px",
            }}
          >
            Reload map
          </button>
          <button className="hide-button" onClick={toggleSuburbOverlays}>
            <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span id="toggle-text">Hide Suburb Overlays</span>
          </button>
        </div>

        <div className="map-container">
          {isMapLoading && (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
              }}
            >
              <div style={{ textAlign: "center", color: "#666" }}>
                <h3>Loading Map...</h3>
                <p>Initializing Google Maps</p>
              </div>
            </div>
          )}

          {mapError && (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
              }}
            >
              <div style={{ textAlign: "center", color: "#f44336" }}>
                <h3>Map Error</h3>
                <p>{mapError}</p>
              </div>
            </div>
          )}

          <div
            ref={mapRef}
            id="map"
            className="map"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "12px",
              display: isMapLoading || mapError ? "none" : "block",
            }}
          />
        </div>
      </main>

      {/* Right Panel */}
      <aside className="right-panel">
        <div className="panel-section">
          <h3>Key Metrics</h3>
          <div className="metric-item">
            <Heart className="metric-icon" />
            <div className="metric-content">
              <h4>Overall Sentiment</h4>
              <div className="metric-value">
                72% <span className="positive">Positive</span>
              </div>
            </div>
          </div>
          <div className="metric-item">
            <Users className="metric-icon" />
            <div className="metric-content">
              <h4>Active Residents</h4>
              <div className="metric-value">1,247</div>
            </div>
          </div>
          <div className="metric-item">
            <MessageSquare className="metric-icon" />
            <div className="metric-content">
              <h4>Total Comments</h4>
              <div className="metric-value">3,891</div>
            </div>
          </div>
          <div className="metric-item">
            <TrendingUp className="metric-icon" />
            <div className="metric-content">
              <h4>Weekly Growth</h4>
              <div className="metric-value">
                <span className="growth">+12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Suburbs Ranking Chart
        <div className="panel-section">
          <h3>Top 3 Suburbs by Happy Mood</h3>
          <div className="ranking-chart">
            {getTop3SuburbsByMood().map((suburb, index) => (
              <div
                key={suburb.name}
                className={`ranking-item rank-${index + 1}`}
              >
                <div className="rank-number">{index + 1}</div>
                <div className="rank-content">
                  <div className="rank-suburb-name">{suburb.name}</div>
                  <div className="rank-mood-info">
                    <span className="rank-sentiment">
                      {Math.round(suburb.sentiment * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </aside>

      {/* Call to Action Button */}
      <button className="cta-button" title="Submit Feedback">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M13 8H7" />
          <path d="M17 12H7" />
        </svg>
      </button>

      {/* Mood Statistics Hover Button */}
      <div className="mood-stats-button-container">
        <button
          className="mood-stats-button"
          onMouseEnter={() => setShowMoodStats(true)}
          onMouseLeave={() => setShowMoodStats(false)}
        >
          <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>

        {/* Mood Statistics Popup */}
        {showMoodStats && (
          <div className="mood-stats-popup">
            <div className="popup-header">
              <h3>Overall Mood Distribution</h3>
              <span className="popup-subtitle">All Sydney Suburbs</span>
            </div>

            <div className="pie-chart-container">
              <div
                className="pie-chart"
                style={{
                  background: `conic-gradient(${getPieChartGradient()})`,
                }}
              >
                {/* Pie chart created with dynamic conic-gradient */}
              </div>
            </div>

            <div className="mood-legend">
              <div className="legend-item">
                <div className="legend-color happy"></div>
                <span>Happy: {getOverallMoodPercentage("happy")}%</span>
              </div>
              <div className="legend-item">
                <div className="legend-color neutral"></div>
                <span>Neutral: {getOverallMoodPercentage("neutral")}%</span>
              </div>
              <div className="legend-item">
                <div className="legend-color angry"></div>
                <span>Angry: {getOverallMoodPercentage("angry")}%</span>
              </div>
              <div className="legend-item">
                <div className="legend-color sad"></div>
                <span>Sad: {getOverallMoodPercentage("sad")}%</span>
              </div>
              <div className="legend-item">
                <div className="legend-color stressed"></div>
                <span>Stressed: {getOverallMoodPercentage("stressed")}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}