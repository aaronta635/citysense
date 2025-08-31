"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { GOOGLE_MAPS_API_KEY } from "./config";
import { Users, Heart, MessageSquare, TrendingUp, LogOut } from "lucide-react";

const SYDNEY_CENTER = { lat: -33.8688, lng: 151.2093 };
const SYDNEY_BOUNDS = {
  north: -33.7,
  south: -34.0,
  east: 151.3,
  west: 150.9,
};

// Hardcoded coordinates for 20 largest Sydney suburbs
const SYDNEY_SUBURBS: { [key: string]: { lat: number; lng: number } } = {
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Parramatta': { lat: -33.8168, lng: 151.0016 },
  'Liverpool': { lat: -33.9249, lng: 150.9239 },
  'Penrith': { lat: -33.7500, lng: 150.7000 },
  'Blacktown': { lat: -33.7667, lng: 150.9167 },
  'Campbelltown': { lat: -34.0667, lng: 150.8167 },
  'Hurstville': { lat: -33.9667, lng: 151.1000 },
  'Bankstown': { lat: -33.9167, lng: 151.0333 },
  'Auburn': { lat: -33.8500, lng: 151.0333 },
  'Fairfield': { lat: -33.8667, lng: 150.9500 },
  'Cabramatta': { lat: -33.9000, lng: 150.9333 },
  'Canterbury': { lat: -33.9167, lng: 151.0167 },
  'Rockdale': { lat: -33.9500, lng: 151.1333 },
  'Kogarah': { lat: -33.9667, lng: 151.1333 },
  'Maroubra': { lat: -33.9500, lng: 151.2333 },
  'Randwick': { lat: -33.9167, lng: 151.2500 },
  'Bondi': { lat: -33.8914, lng: 151.2767 },
  'Manly': { lat: -33.7969, lng: 151.2856 },
  'Chatswood': { lat: -33.8000, lng: 151.1833 },
  'Hornsby': { lat: -33.7000, lng: 151.1000 }
};




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
  const [filteredSuburbs, setFilteredSuburbs] = useState<SuburbData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showMoodStats, setShowMoodStats] = useState(false);
  const [suburbData, setSuburbData] = useState<SuburbData[]>([]);
  const [allAvailableSuburbs, setAllAvailableSuburbs] = useState<string[]>([]);
  const [user, setUser] = useState<{id: number; username: string; email: string; fullName: string} | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Mock AI analysis data (replace with actual API call later)
  const mockAIAnalysis = {
    "Bondi": {
      "complaints": {
        "Weather": 1
      },
      "positives": {},
      "newsfeed": [
        "Bondi Beach Weather Disappoints Despite Good Air Quality"
      ]
    },
    "Sydney": {
      "complaints": {},
      "positives": {
        "Weather": 1
      },
      "newsfeed": [
        "Sunny Sydney Enjoys Beautiful Weather and Great Air Quality Today!"
      ]
    },
    "Parramatta": {
      "complaints": {
        "Traffic": 2,
        "Noise": 1
      },
      "positives": {
        "Community": 1
      },
      "newsfeed": [
        "Parramatta Traffic Woes Continue, But Community Spirit Shines Through"
      ]
    },
    "Manly": {
      "complaints": {},
      "positives": {
        "Weather": 1,
        "Beach": 1
      },
      "newsfeed": [
        "Manly Beach Perfect for Surfing Today - Great Weather and Clean Air!"
      ]
    }
  };

  const mapRef = useRef<HTMLDivElement>(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Function to get coordinates for each suburb using hardcoded data
  const getCoordinatesForSuburb = (suburbName: string): { lat: number; lng: number } => {
    // Check if we have hardcoded coordinates for this suburb
    if (SYDNEY_SUBURBS[suburbName]) {
      console.log(`📍 Found coordinates for ${suburbName}:`, SYDNEY_SUBURBS[suburbName]);
      return SYDNEY_SUBURBS[suburbName];
    }
    
    // If not found, try to find a close match
    const normalizedSuburbName = suburbName.toLowerCase().trim();
    for (const [name, coords] of Object.entries(SYDNEY_SUBURBS)) {
      if (name.toLowerCase().includes(normalizedSuburbName) || 
          normalizedSuburbName.includes(name.toLowerCase())) {
        console.log(`📍 Found approximate match for ${suburbName}: ${name}`, coords);
        return coords;
      }
    }
    
    // Default to Sydney CBD if no match found
    console.warn(`⚠️ No coordinates found for ${suburbName}, using Sydney CBD coordinates`);
    return { lat: -33.8688, lng: 151.2093 };
  };

  // Function to get all available suburbs for search
  const getAllAvailableSuburbs = (): string[] => {
    return Object.keys(SYDNEY_SUBURBS);
  };

  const toggleDropdown = () => {
    console.log("Dropdown clicked, current state:", isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
    console.log("New state will be:", !isDropdownOpen);
  };

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (!target.closest(".activity-dropdown")) {
        setIsDropdownOpen(false);
      }

      if (!target.closest(`[class*="searchInputContainer"]`)) {
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

  // Fetch suburb data from API
  useEffect(() => {
    // Initialize available suburbs for search
    const availableSuburbs = getAllAvailableSuburbs();
    setAllAvailableSuburbs(availableSuburbs);
    console.log('🏘️ Available suburbs for search:', availableSuburbs);

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
          const suburbsWithMood = result.data.suburbs.filter((suburbItem: { suburb: string; mood?: { breakdown: any; sentiment?: number } }) => suburbItem.mood?.breakdown);
          console.log('🏘️ Suburbs with mood data:', suburbsWithMood.length);
          console.log('🏘️ Suburb names:', suburbsWithMood.map((s: any) => s.suburb));
          
          // Get coordinates for all suburbs using hardcoded data
          const transformedData = suburbsWithMood.map((suburbItem: { suburb: string; mood?: { breakdown: { happy: number; neutral: number; angry: number; sad: number; stressed: number; totalSubmissions: number }; sentiment?: number } }) => {
            try {
              // Get coordinates for each suburb
              console.log('🔍 Looking up coordinates for suburb:', suburbItem.suburb);
              const coordinates = getCoordinatesForSuburb(suburbItem.suburb);
              console.log('📍 Got coordinates:', coordinates);
              
              const mood = suburbItem.mood!.breakdown;
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
            } catch (error) {
              console.error(`❌ Error processing suburb ${suburbItem.suburb}:`, error);
              return null; // Return null for failed suburbs
            }
          });
          
          // Filter out any failed suburbs
          const validTransformedData = transformedData.filter((item: SuburbData | null) => item !== null) as SuburbData[];
          console.log('✅ Successfully processed suburbs:', validTransformedData.length);
          console.log('❌ Failed suburbs:', transformedData.length - validTransformedData.length);
          
          console.log('Transformed data:', transformedData);
          console.log('Number of suburbs with mood data:', validTransformedData.length);
          
          if (validTransformedData.length > 0) {
            setSuburbData(validTransformedData);
            
            // Check if we have active filters
            const sentimentFilter = document.getElementById("sentimentFilter") as HTMLSelectElement;
            const hasActiveFilter = sentimentFilter && sentimentFilter.value !== "all";
            const hasSearchFilter = suburbSearchTerm.trim() !== "";
            
            if (hasActiveFilter || hasSearchFilter) {
              // Keep current filtered state
              console.log('🔍 Keeping current filter state, not updating map yet');
            } else {
              // No active filters, show all suburbs
              setFilteredSuburbs(validTransformedData);
              console.log('✅ Data set successfully! Should see all suburbs on map.');
              
              // If map is already loaded, update the circles
              if (map) {
                console.log('🗺️ Map exists, updating circles...');
                // Clear existing circles and create new ones
                suburbCircles.forEach(circle => circle.setMap(null));
                setSuburbCircles([]);
                
                // Create new circles with fetched data
                const newCircles: google.maps.Circle[] = createSuburbSentimentCircles(map, validTransformedData);
                setSuburbCircles(newCircles);
                console.log('✅ Map updated with new circles:', newCircles.length);
              }
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
  }, [map]);


  const getSentimentColor = (
    sentimentScore: number,
    moodBreakdown?: MoodBreakdown
  ): string => {
    if (moodBreakdown) {
      const { happy, neutral, angry, sad, stressed } = moodBreakdown;
      const maxMood = Math.max(happy, neutral, angry, sad, stressed);

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

      if (maxMood === happy) return "#4caf50";
      if (maxMood === neutral) return "#ffeb3b";
      if (maxMood === angry) return "#f44336";
      if (maxMood === sad) return "#9c27b0";
      return "#9e9e9e";
    }

    if (sentimentScore >= 0.66) return "#4caf50";
    if (sentimentScore >= 0.33) return "#ffeb3b";
    return "#f44336";
  };

  const initializeSydneyMap = () => {
    try {
      console.log("Setting up Sydney map...");
      console.log("mapRef.current:", mapRef.current);

      if (!mapRef.current) {
        console.error("Map container not found");
        return;
      }

      const newMap = new google.maps.Map(mapRef.current, {
        zoom: 14,
        center: SYDNEY_CENTER,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        minZoom: 11,
        maxZoom: 18,
        restriction: {
          latLngBounds: SYDNEY_BOUNDS,
          strictBounds: true,
        },
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      setMap(newMap);
      console.log("Sydney map created successfully");

      addSydneyBoundaryIndicator(newMap);

      // Only create circles if we have data
      if (suburbData.length > 0) {
        // Use filtered suburbs if available, otherwise use all suburb data
        const dataToShow = filteredSuburbs.length > 0 ? filteredSuburbs : suburbData;
        console.log(`🗺️ Initializing map with ${dataToShow.length} suburbs:`, dataToShow.map(s => s.name));
        
        const circles = createSuburbSentimentCircles(newMap, dataToShow);
        setSuburbCircles(circles);
        
        setTimeout(() => {
          if (circles.length > 0) {
            console.log(
              `✅ Successfully created ${circles.length} interactive suburb circles`
            );
          }
        }, 100);
      } else {
        console.log('⏳ No suburb data yet, circles will be created when data arrives');
      }

      const totalSuburbs = suburbData.length;
      const totalSentiment = suburbData.reduce(
        (sum, suburb) => sum + suburb.sentiment,
        0
      );
      const averageSentiment = totalSentiment / totalSuburbs;

      updateFilterStats(totalSuburbs, totalSentiment, totalSuburbs);

      addMapControls(newMap);

      setIsMapLoading(false);
    } catch (error) {
      console.error("Error setting up Sydney map:", error);
      setMapError("Error loading map: " + (error as Error).message);
      setIsMapLoading(false);
    }
  };

  const addSydneyBoundaryIndicator = (mapInstance: google.maps.Map) => {
    new google.maps.Rectangle({
      bounds: SYDNEY_BOUNDS,
      fillColor: "#4caf50",
      fillOpacity: 0.05,
      strokeColor: "#2d5a2d",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      map: mapInstance,
    });
  };

  const createSuburbSentimentCircles = (
    mapInstance: google.maps.Map,
    dataToUse: SuburbData[] = suburbData
  ): google.maps.Circle[] => {
    const circles: google.maps.Circle[] = [];

    console.log(`🎯 Creating ${dataToUse.length} circles for suburbs:`, dataToUse.map(s => s.name));

    dataToUse.forEach((suburb) => {
      console.log('📍 Creating circle for:', suburb.name, 'at coordinates:', suburb.center);
      const circleColor = getSentimentColor(
        suburb.sentiment,
        suburb.moodBreakdown
      );

      const baseOpacity = 0.2;
      const sentimentIntensity =
        Math.max(
          suburb.moodBreakdown.happy,
          suburb.moodBreakdown.neutral,
          suburb.moodBreakdown.angry,
          suburb.moodBreakdown.sad,
          suburb.moodBreakdown.stressed
        ) / 100;

      const submissionFactor = Math.min(
        suburb.moodBreakdown.totalSubmissions / 200,
        1
      );
      const dynamicOpacity =
        baseOpacity + sentimentIntensity * 0.4 + submissionFactor * 0.2;

      const finalOpacity = Math.max(0.2, Math.min(0.8, dynamicOpacity));

      const suburbCircle = new google.maps.Circle({
        center: suburb.center,
        radius: suburb.radius,
        fillColor: circleColor,
        fillOpacity: finalOpacity,
        strokeColor: circleColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: mapInstance,
      });
      
      console.log('🎯 Circle created:', {
        name: suburb.name,
        center: suburb.center,
        radius: suburb.radius,
        color: circleColor,
        opacity: finalOpacity
      });

      (suburbCircle as any).originalOpacity = finalOpacity;
      (suburbCircle as any).originalStrokeColor = circleColor;
      (suburbCircle as any).suburbName = suburb.name; // Add suburb name for debugging

      makeSuburbCircleInteractive(suburbCircle, mapInstance, suburb);

      circles.push(suburbCircle);
    });

    console.log(`✅ Created ${circles.length} sentiment circles for suburbs`);
    return circles;
  };

  const makeSuburbCircleInteractive = (
    circle: google.maps.Circle,
    mapInstance: google.maps.Map,
    suburb: SuburbData
  ) => {};

  const addMapControls = (mapInstance: google.maps.Map) => {
    mapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(
      createResetButton(mapInstance)
    );
  };

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

  const calculateInitialStats = () => {
    const totalSuburbs = suburbData.length;
    const totalSentiment = suburbData.reduce(
      (sum, suburb) => sum + suburb.sentiment,
      0
    );
    const averageSentiment = totalSentiment / totalSuburbs;

    return { totalSuburbs, totalSentiment, averageSentiment };
  };

  const filterBySentiment = () => {
    const selectedFilter = (
      document.getElementById("sentimentFilter") as HTMLSelectElement
    ).value;
    
    console.log("🎭 Filtering by sentiment:", selectedFilter);
    
    if (selectedFilter === "all") {
      // Show all suburbs
      console.log("🔄 Showing all suburbs");
      setFilteredSuburbs(suburbData);
      if (map) {
        // Clear existing circles completely
        console.log(`🗑️ Clearing ${suburbCircles.length} existing circles`);
        suburbCircles.forEach(circle => {
          circle.setMap(null);
        });
        setSuburbCircles([]);
        
        // Create new circles with all data
        console.log("🆕 Creating circles for all suburbs");
        const newCircles: google.maps.Circle[] = createSuburbSentimentCircles(map, suburbData);
        setSuburbCircles(newCircles);
        
        // Update stats
        const totalSentiment = suburbData.reduce((sum, suburb) => sum + suburb.sentiment, 0);
        updateFilterStats(suburbData.length, totalSentiment, suburbData.length);
      }
      return;
    }
    
    // Filter the data first
    const filteredResults = suburbData.filter(suburb => {
      if (suburb.moodBreakdown) {
        const { happy, neutral, angry, sad, stressed } = suburb.moodBreakdown;

        switch (selectedFilter) {
          case "happy":
            return happy > 0 && happy >= neutral && happy >= angry && happy >= sad && happy >= stressed;
          case "neutral":
            return neutral > 0 && neutral >= happy && neutral >= angry && neutral >= sad && neutral >= stressed;
          case "angry":
            return angry > 0 && angry >= happy && angry >= neutral && angry >= sad && angry >= stressed;
          case "sad":
            return sad > 0 && sad >= happy && sad >= neutral && sad >= angry && sad >= stressed;
          case "stressed":
            return stressed > 0 && stressed >= happy && stressed >= neutral && stressed >= angry && stressed >= sad;
          default:
            return true;
        }
      } else {
        // Fallback to sentiment-based filtering if no mood breakdown
        switch (selectedFilter) {
          case "happy":
            return suburb.sentiment >= 0.66;
          case "neutral":
            return suburb.sentiment >= 0.33 && suburb.sentiment < 0.66;
          case "angry":
            return suburb.sentiment < 0.33;
          default:
            return true;
        }
      }
    });

    console.log(`✅ Filtered ${filteredResults.length} suburbs for ${selectedFilter} mood:`, filteredResults.map(s => s.name));
    
    // Update filtered suburbs state
    setFilteredSuburbs(filteredResults);
    
    // Recreate circles with filtered data
    if (map) {
      // Clear existing circles completely
      console.log(`🗑️ Clearing ${suburbCircles.length} existing circles`);
      suburbCircles.forEach(circle => {
        circle.setMap(null);
      });
      setSuburbCircles([]);
      
      // Create new circles with filtered data only
      console.log(`🆕 Creating ${filteredResults.length} circles for filtered suburbs`);
      const newCircles: google.maps.Circle[] = createSuburbSentimentCircles(map, filteredResults);
      setSuburbCircles(newCircles);
      
      // Update stats
      const totalSentiment = filteredResults.reduce((sum, suburb) => sum + suburb.sentiment, 0);
      updateFilterStats(filteredResults.length, totalSentiment, filteredResults.length);
    }
  };

  const filterBySuburb = (selectedSuburb: string) => {
    console.log("=== FILTER BY SUBURB DEBUG ===");
    console.log("Filtering by suburb:", selectedSuburb);
    console.log("Map state:", map ? "Available" : "Not available");
    console.log("suburbData length:", suburbData.length);

    if (!map) {
      console.error("Map not available for filtering");
      return;
    }

    let filteredResults: SuburbData[];
    let selectedSuburbData: SuburbData | null = null;

    if (selectedSuburb === "all") {
      filteredResults = suburbData;
      console.log("Showing all suburbs:", filteredResults.length);
    } else {
      // Check if the selected suburb exists in our data
              const foundSuburb = suburbData.find(suburb => suburb.name === selectedSuburb);
      
      if (foundSuburb) {
        filteredResults = [foundSuburb];
        selectedSuburbData = foundSuburb;
        console.log(`Found suburb with mood data: ${selectedSuburb}`);
      } else {
        // Create a placeholder suburb entry if no mood data exists
        const coordinates = getCoordinatesForSuburb(selectedSuburb);
        const placeholderSuburb = {
          name: selectedSuburb,
          center: coordinates,
          radius: 500,
          sentiment: 0.5,
          description: `Suburb: ${selectedSuburb} (no mood data yet)`,
          moodBreakdown: {
            happy: 0,
            neutral: 0,
            angry: 0,
            sad: 0,
            stressed: 0,
            totalSubmissions: 0
          }
        };
        filteredResults = [placeholderSuburb];
        selectedSuburbData = placeholderSuburb;
        console.log(`Created placeholder for suburb: ${selectedSuburb}`);
      }
      
      console.log(`Filtered to ${filteredResults.length} suburbs for "${selectedSuburb}"`);
    }

    // Update filtered suburbs state
    setFilteredSuburbs(filteredResults);
    
    // Clear existing circles completely
    console.log(`🗑️ Clearing ${suburbCircles.length} existing circles`);
    suburbCircles.forEach(circle => {
      circle.setMap(null);
    });
    setSuburbCircles([]);
    
    // Create new circles with filtered data only
    console.log(`🆕 Creating ${filteredResults.length} circles for filtered suburbs`);
    const newCircles: google.maps.Circle[] = createSuburbSentimentCircles(map, filteredResults);
    setSuburbCircles(newCircles);
    console.log(`✅ Created ${newCircles.length} circles for filtered suburbs`);

    if (selectedSuburb !== "all" && selectedSuburbData && map) {
      const suburb = selectedSuburbData as SuburbData;
      console.log("Selected suburb data:", suburb);
      console.log("Calling showMoodBreakdown for:", suburb.name);

      map.setCenter(suburb.center);
      map.setZoom(16);
      showMoodBreakdown(suburb);
      
      // Show AI analysis for the selected suburb
      showAIAnalysis(selectedSuburb);
    } else if (selectedSuburb === "all" && map) {
      console.log("Returning to all suburbs view");
      map.setCenter(SYDNEY_CENTER);
      map.setZoom(14);
      hideMoodBreakdown();
      hideAIAnalysis();
    }

    // Update stats
    const totalSentiment = filteredResults.reduce((sum, suburb) => sum + suburb.sentiment, 0);
    updateFilterStats(filteredResults.length, totalSentiment, filteredResults.length);
  };

  const handleSuburbSearch = (searchTerm: string) => {
    setSuburbSearchTerm(searchTerm);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(() => {
      if (searchTerm.trim() === "") {
        // Reset to show all suburbs
        setFilteredSuburbs(suburbData);
        setShowSuggestions(false);
        filterBySuburb("all");
              } else {
          // Filter suburbs by search term from all available suburbs
          const filtered = allAvailableSuburbs.filter((suburb) =>
            suburb.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredSuburbs(filtered.map(name => ({
            name,
            center: getCoordinatesForSuburb(name),
            radius: 500,
            sentiment: 0.5,
            description: `Suburb: ${name}`,
            moodBreakdown: {
              happy: 0,
              neutral: 0,
              angry: 0,
              sad: 0,
              stressed: 0,
              totalSubmissions: 0
            }
          })));
          setShowSuggestions(true);
          
          // Update the map to show only filtered suburbs
          if (map && filtered.length > 0) {
            // Clear existing circles completely
            console.log(`🗑️ Clearing ${suburbCircles.length} existing circles for search`);
            suburbCircles.forEach(circle => {
              circle.setMap(null);
            });
            setSuburbCircles([]);
            
            // Create new circles with filtered data only
            console.log(`🆕 Creating ${filtered.length} circles for search results`);
            const newCircles: google.maps.Circle[] = createSuburbSentimentCircles(map, filtered.map(name => ({
              name,
              center: getCoordinatesForSuburb(name),
              radius: 500,
              sentiment: 0.5,
              description: `Suburb: ${name}`,
              moodBreakdown: {
                happy: 0,
                neutral: 0,
                angry: 0,
                sad: 0,
                stressed: 0,
                totalSubmissions: 0
              }
            })));
            setSuburbCircles(newCircles);
            
            // Update stats for filtered results
            updateFilterStats(filtered.length, 0, filtered.length);
          }
        }
    }, 300);

    setSearchTimeout(newTimeout);
  };

  const selectSuburb = (suburbName: string) => {
    console.log("=== SELECT SUBURB DEBUG ===");
    console.log("Selecting suburb:", suburbName);
    console.log(
      "Current suburbData length:",
      suburbData.length
    );
    console.log("Current map state:", map ? "Available" : "Not available");
    console.log("Current suburbCircles length:", suburbCircles.length);

    // Reset sentiment filter to "all" when selecting a specific suburb
    const sentimentFilter = document.getElementById("sentimentFilter") as HTMLSelectElement;
    if (sentimentFilter) {
      sentimentFilter.value = "all";
    }

    console.log("Calling filterBySuburb with:", suburbName);
    filterBySuburb(suburbName);

    setSuburbSearchTerm(suburbName);
    setShowSuggestions(false);

    const searchInput = document.querySelector(
      `[class*="${styles.suburbSearchInput}"]`
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }

    console.log("=== END SELECT SUBURB DEBUG ===");
  };

  const showMoodBreakdown = (suburbData: SuburbData) => {
    const moodBreakdownElement = document.getElementById("moodBreakdown");
    if (!moodBreakdownElement) {
      return;
    }

    // Check if suburb has mood data
    if (suburbData.moodBreakdown.totalSubmissions === 0) {
      // Show message for suburbs without mood data
      const happyBar = document.getElementById("happyBar");
      const neutralBar = document.getElementById("neutralBar");
      const angryBar = document.getElementById("angryBar");
      const sadBar = document.getElementById("sadBar");
      const stressedBar = document.getElementById("stressedBar");

      if (happyBar) happyBar.style.width = "0%";
      if (neutralBar) neutralBar.style.width = "0%";
      if (angryBar) angryBar.style.width = "0%";
      if (sadBar) sadBar.style.width = "0%";
      if (stressedBar) stressedBar.style.width = "0%";

      const happyPercentage = document.getElementById("happyPercentage");
      const neutralPercentage = document.getElementById("neutralPercentage");
      const angryPercentage = document.getElementById("angryPercentage");
      const sadPercentage = document.getElementById("sadPercentage");
      const stressedPercentage = document.getElementById("stressedPercentage");

      if (happyPercentage) happyPercentage.textContent = "0%";
      if (neutralPercentage) neutralPercentage.textContent = "0%";
      if (angryPercentage) angryPercentage.textContent = "0%";
      if (sadPercentage) sadPercentage.textContent = "0%";
      if (stressedPercentage) stressedPercentage.textContent = "0%";

      const totalSubmissions = document.getElementById("totalSubmissions");
      if (totalSubmissions) totalSubmissions.textContent = "0";

      moodBreakdownElement.style.display = "block";
      setTimeout(() => {
        moodBreakdownElement.style.opacity = "1";
      }, 10);
      return;
    }

    const breakdown = suburbData.moodBreakdown;

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

    const totalSubmissions = document.getElementById("totalSubmissions");
    if (totalSubmissions)
      totalSubmissions.textContent = breakdown.totalSubmissions.toString();

    moodBreakdownElement.style.display = "block";
    setTimeout(() => {
      moodBreakdownElement.style.opacity = "1";
    }, 10);
  };

  const hideMoodBreakdown = () => {
    console.log("hideMoodBreakdown called");

    const moodBreakdown = document.getElementById("moodBreakdown");
    if (moodBreakdown) {
      moodBreakdown.style.opacity = "0";
      setTimeout(() => {
        moodBreakdown.style.display = "none";
      }, 300);
    } else {
      console.error("Mood breakdown element not found for hiding");
    }
  };

  const toggleSuburbOverlays = () => {
    const toggleText = document.getElementById("toggle-text");
    if (!toggleText) return;

    const isVisible = suburbCircles[0] && suburbCircles[0].getMap() !== null;

    if (isVisible) {
      suburbCircles.forEach((circle) => {
        circle.setMap(null);
      });
      toggleText.textContent = "Show Suburb Overlays";
    } else {
      suburbCircles.forEach((circle) => {
        circle.setMap(map);
      });
      toggleText.textContent = "Hide Suburb Overlays";
    }
  };

  const handleScriptLoad = () => {
    console.log("Google Maps script loaded successfully");

    const checkGoogleMaps = () => {
      if (typeof google !== "undefined" && google.maps && google.maps.Map) {
        console.log("Google Maps is fully loaded and ready");
        initializeMapWhenReady();
      } else {
        console.log("Google Maps not fully ready yet, retrying...");
        setTimeout(checkGoogleMaps, 100);
      }
    };

    checkGoogleMaps();
  };

  const initializeMapWhenReady = () => {
    console.log("Attempting to initialize map...");
    console.log("Map ref available:", !!mapRef.current);
    console.log(
      "Google Maps available:",
      typeof google !== "undefined" && !!google?.maps
    );

    if (typeof google !== "undefined" && google.maps && mapRef.current) {
      console.log("All requirements met, initializing Sydney map...");
      try {
        initializeSydneyMap();
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Failed to initialize map");
        setIsMapLoading(false);
      }
    } else {
      console.log("Requirements not met yet, retrying in 200ms...");
      setTimeout(initializeMapWhenReady, 200);
    }
  };

  const handleScriptError = () => {
    console.error("Failed to load Google Maps script");
    setMapError("Failed to load Google Maps");
    setIsMapLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isMapLoading && !map && !mapError) {
        console.error("Google Maps script load timeout");
        setMapError("Google Maps load timeout - please refresh the page");
        setIsMapLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isMapLoading, map, mapError]);

  useEffect(() => {
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

  useEffect(() => {
    if (
      mapRef.current &&
      typeof google !== "undefined" &&
      google.maps &&
      !map &&
      !mapError &&
      !isMapLoading
    ) {
      console.log("All requirements met, initializing map...");
      initializeSydneyMap();
    }
  }, [mapRef.current, map, mapError, isMapLoading]);

  useEffect(() => {
    const checkAndInitialize = () => {
      if (
        typeof google !== "undefined" &&
        google.maps &&
        mapRef.current &&
        !map &&
        !mapError &&
        !isMapLoading
      ) {
        console.log("Component mounted, initializing map...");
        initializeSydneyMap();
        return true;
      }
      return false;
    };

    if (checkAndInitialize()) return;

    const timeout = setTimeout(() => {
      checkAndInitialize();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isMapLoading, map, mapError]);

  const getTop3SuburbsByMood = (): SuburbData[] => {
    const sortedSuburbs = [...suburbData].sort((a, b) => {
      return b.moodBreakdown.happy - a.moodBreakdown.happy;
    });

    console.log(
      "Top 3 suburbs by happy mood:",
      sortedSuburbs.slice(0, 3).map((suburb) => ({
        name: suburb.name,
        happy: suburb.moodBreakdown.happy,
        total: suburb.moodBreakdown.totalSubmissions,
      }))
    );

    return sortedSuburbs.slice(0, 3);
  };

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
    return percentage * 3.6;
  };

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
          totalMoodValue +=
            (suburb.moodBreakdown.happy / 100) *
            suburb.moodBreakdown.totalSubmissions;
          break;
        case "neutral":
          totalMoodValue +=
            (suburb.moodBreakdown.neutral / 100) *
            suburb.moodBreakdown.totalSubmissions;
          break;
        case "angry":
          totalMoodValue +=
            (suburb.moodBreakdown.angry / 100) *
            suburb.moodBreakdown.totalSubmissions;
          break;
        case "sad":
          totalMoodValue +=
            (suburb.moodBreakdown.sad / 100) *
            suburb.moodBreakdown.totalSubmissions;
          break;
        case "stressed":
          totalMoodValue +=
            (suburb.moodBreakdown.stressed / 100) *
            suburb.moodBreakdown.totalSubmissions;
          break;
      }
    });

    return totalSubmissions > 0
      ? Math.round((totalMoodValue / totalSubmissions) * 100)
      : 0;
  };

  const getPieChartGradient = () => {
    const totalSubmissions = suburbData.reduce(
      (sum, suburb) => sum + suburb.moodBreakdown.totalSubmissions,
      0
    );

    if (totalSubmissions === 0) return "";

    let totalHappy = 0;
    let totalNeutral = 0;
    let totalAngry = 0;
    let totalSad = 0;
    let totalStressed = 0;

    suburbData.forEach((suburb) => {
      totalHappy +=
        (suburb.moodBreakdown.happy / 100) *
        suburb.moodBreakdown.totalSubmissions;
      totalNeutral +=
        (suburb.moodBreakdown.neutral / 100) *
        suburb.moodBreakdown.totalSubmissions;
      totalAngry +=
        (suburb.moodBreakdown.angry / 100) *
        suburb.moodBreakdown.totalSubmissions;
      totalSad +=
        (suburb.moodBreakdown.sad / 100) *
        suburb.moodBreakdown.totalSubmissions;
      totalStressed +=
        (suburb.moodBreakdown.stressed / 100) *
        suburb.moodBreakdown.totalSubmissions;
    });

    const happyPercent = (totalHappy / totalSubmissions) * 100;
    const neutralPercent = (totalNeutral / totalSubmissions) * 100;
    const angryPercent = (totalAngry / totalSubmissions) * 100;
    const sadPercent = (totalSad / totalSubmissions) * 100;
    const stressedPercent = (totalStressed / totalSubmissions) * 100;

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

  useEffect(() => {
    validateMoodPercentages();
  }, []);

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Escape") {
      setShowSuggestions(false);
      setSuburbSearchTerm("");
      setFilteredSuburbs(suburbData);
      // Reset to show all suburbs
      filterBySuburb("all");
    }
  };

  const resetAllFilters = () => {
    console.log("🔄 Resetting all filters");
    
    // Reset sentiment filter dropdown
    const sentimentFilter = document.getElementById("sentimentFilter") as HTMLSelectElement;
    if (sentimentFilter) {
      sentimentFilter.value = "all";
    }
    
    // Reset search
    setSuburbSearchTerm("");
    setFilteredSuburbs(suburbData);
    setShowSuggestions(false);
    
    // Reset map to show all suburbs
    if (map) {
      // Clear existing circles completely
      console.log(`🗑️ Clearing ${suburbCircles.length} existing circles for reset`);
      suburbCircles.forEach(circle => {
        circle.setMap(null);
      });
      setSuburbCircles([]);
      
      // Create new circles with all data
      console.log("🆕 Creating circles for all suburbs after reset");
      const newCircles: google.maps.Circle[] = createSuburbSentimentCircles(map, suburbData);
      setSuburbCircles(newCircles);
      
      // Reset map view
      map.setCenter(SYDNEY_CENTER);
      map.setZoom(14);
      
      // Hide mood breakdown
      hideMoodBreakdown();
      
      // Hide AI analysis
      hideAIAnalysis();
      
      // Update stats
      const totalSentiment = suburbData.reduce((sum, suburb) => sum + suburb.sentiment, 0);
      updateFilterStats(suburbData.length, totalSentiment, suburbData.length);
    }
  };

  // Show AI analysis for specific suburb
  const showAIAnalysis = (suburbName: string) => {
    const aiAnalysisElement = document.getElementById("aiAnalysis");
    const aiAnalysisContent = document.getElementById("aiAnalysisContent");
    
    if (!aiAnalysisElement || !aiAnalysisContent) return;
    
    const analysis = mockAIAnalysis[suburbName as keyof typeof mockAIAnalysis];
    if (!analysis) return;
    
    // Populate the content
    aiAnalysisContent.innerHTML = `
      <div class="${styles.suburbAnalysis}">
        <h4 class="${styles.suburbAnalysisTitle}">${suburbName}</h4>
        
        <div class="${styles.analysisItem}">
          <span class="${styles.analysisLabel}">Positives:</span>
          <span class="${styles.analysisValue}">
            ${Object.keys(analysis.positives).length > 0 
              ? Object.entries(analysis.positives).map(([key, value]) => `${key}: ${value}`).join(', ')
              : 'None'
            }
          </span>
        </div>

        <div class="${styles.analysisItem}">
          <span class="${styles.analysisLabel}">Complaints:</span>
          <span class="${styles.analysisValue}">
            ${Object.keys(analysis.complaints).length > 0 
              ? Object.entries(analysis.complaints).map(([key, value]) => `${key}: ${value}`).join(', ')
              : 'None'
            }
          </span>
        </div>
      </div>
    `;
    
    // Show the element
    aiAnalysisElement.style.display = "block";
    setTimeout(() => {
      aiAnalysisElement.style.opacity = "1";
    }, 10);
  };

  // Hide AI analysis
  const hideAIAnalysis = () => {
    const aiAnalysisElement = document.getElementById("aiAnalysis");
    if (aiAnalysisElement) {
      aiAnalysisElement.style.opacity = "0";
      setTimeout(() => {
        aiAnalysisElement.style.display = "none";
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className={styles.dashboard}>
      {/* Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization`}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="afterInteractive"
      />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>CitySense</div>
        {isAuthenticated && user && (
          <div className={styles.userWelcome}>
            Welcome, {user.username}!
          </div>
        )}

        <div className={styles.headerIcons}>
          {/* Recent Activity Dropdown */}
          <div className={styles.activityDropdown}>
            <button className={styles.dropdownTrigger}>
              <svg
                className={styles.icon}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
              Recent Activity
              <svg
                className={styles.dropdownArrow}
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

            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>
                <h4>Recent Activity</h4>
                <span className={styles.activityCount}>
                  {Object.values(mockAIAnalysis).reduce((total, analysis) => total + analysis.newsfeed.length, 0)} new
                </span>
              </div>

              <div className={styles.dropdownActivities}>
                {Object.entries(mockAIAnalysis).map(([suburbName, analysis]) => 
                  analysis.newsfeed.map((news, index) => (
                    <div key={`${suburbName}-${index}`} className={styles.dropdownActivityItem}>
                      <div
                        className={`${styles.activityDot} ${styles.blue}`}
                      ></div>
                      <div className={styles.dropdownActivityContent}>
                        <div className={styles.dropdownActivityText}>
                          {news}
                        </div>
                        <div className={styles.dropdownActivityTime}>
                          {suburbName} • Just now
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.dropdownFooter}>
                <button className={styles.viewAllBtn}>View All Activity</button>
              </div>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className={styles.profileDropdown}>
            <button
              className={styles.profileTrigger}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <svg
                className={styles.icon}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>

            {/* Profile Menu */}
            {isProfileOpen && (
              <div className={styles.profileMenu}>
                <div className={styles.profileHeader}>
                  <div className={styles.profileAvatar}>
                    <svg
                      className={styles.profileIcon}
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
                  <div className={styles.profileInfo}>
                    <div className={styles.profileName}>{user?.fullName || "Guest"}</div>
                    <div className={styles.profileEmail}>
                      {user?.email || "Not logged in"}
                    </div>
                  </div>
                </div>

                <div className={styles.profileOptions}>
                  {isAuthenticated && (
                    <div className={`${styles.profileOption} ${styles.logout}`} onClick={handleLogout}>
                      <svg
                        className={styles.optionIcon}
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
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.filterSection}>
          <h3>Mood Filter</h3>
          <div className={styles.dropdownContainer}>
            <select
              id="sentimentFilter"
              className={styles.sentimentDropdown}
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

          <div className={styles.filterInfo}>
            <p>Filter suburbs by community mood</p>
          </div>

          <h3 style={{ marginTop: "15px" }}>Suburb Filter</h3>

          <div className={styles.combinedFilterContainer}>
            <div className={styles.searchInputContainer}>
              <input
                type="text"
                placeholder="Search suburbs..."
                value={suburbSearchTerm}
                onChange={(e) => handleSuburbSearch(e.target.value)}
                onFocus={() => {
                  if (filteredSuburbs.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onClick={() => {
                  if (filteredSuburbs.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleSearchKeyDown}
                className={styles.suburbSearchInput}
              />
              {suburbSearchTerm && (
                <button
                  onClick={() => {
                    setSuburbSearchTerm("");
                    setFilteredSuburbs(suburbData);
                    setShowSuggestions(false);
                    filterBySuburb("all");
                    const searchInput = document.querySelector(
                      `[class*="${styles.suburbSearchInput}"]`
                    ) as HTMLInputElement;
                    if (searchInput) {
                      searchInput.focus();
                    }
                  }}
                  className={styles.clearSearchBtn}
                  title="Clear search"
                >
                  ×
                </button>
              )}

              {showSuggestions && filteredSuburbs.length > 0 && (
                <div className={styles.searchSuggestions}>
                  {filteredSuburbs.length > 0 ? (
                    <>
                      <div className={styles.suggestionHeader}>
                        <span>
                          Found {filteredSuburbs.length} suburb
                          {filteredSuburbs.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {filteredSuburbs.slice(0, 8).map((suburb) => (
                        <div
                          key={suburb.name}
                          className={styles.suggestionItem}
                          onClick={() => {
                            selectSuburb(suburb.name);
                            setTimeout(() => {
                              setShowSuggestions(false);
                            }, 100);
                          }}
                        >
                          <span className={styles.suggestionName}>
                            {suburb.name}
                          </span>
                          <span className={styles.suggestionSentiment}>
                            {Math.round(suburb.sentiment * 100)}%
                          </span>
                        </div>
                      ))}
                      {filteredSuburbs.length > 8 && (
                        <div className={styles.suggestionFooter}>
                          <span>... and {filteredSuburbs.length - 8} more</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.noSuggestions}>
                      <span>No suburbs found for "{suburbSearchTerm}"</span>
                      <br />
                      <small>Try a different search term</small>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                console.log("Show All clicked");
                filterBySuburb("all");
                setSuburbSearchTerm("");
                setFilteredSuburbs(suburbData);
                setShowSuggestions(false);
              }}
              className={styles.showAllBtn}
            >
              Show All
            </button>
            <button
              onClick={resetAllFilters}
              className={styles.resetFiltersBtn}
              style={{
                marginTop: "8px",
                padding: "6px 12px",
                background: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                width: "100%"
              }}
            >
              Reset All Filters
            </button>
          </div>

          <div className={styles.filterInfo}>
            <p>Search to filter or scroll through the dropdown list</p>
          </div>
        </div>

        <div className={styles.statsSection}>
          <h3>Current View</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Suburbs Shown:</span>
            <span id="suburbsShown" className={styles.statValue}>
              {stats.suburbsShown}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Average Mood:</span>
            <span id="avgSentiment" className={styles.statValue}>
              {stats.avgSentiment}
            </span>
          </div>
        </div>

        <div
          className={styles.moodBreakdownSection}
          id="moodBreakdown"
          style={{ display: "none", opacity: "0" }}
        >
          <h3>Mood Breakdown</h3>
          <div className={styles.moodBar}>
            <div className={styles.moodLabel}>Happy 😊</div>
            <div className={styles.moodBarContainer}>
              <div
                className={`${styles.moodBarFill} ${styles.happy}`}
                id="happyBar"
              ></div>
            </div>
            <div className={styles.moodPercentage} id="happyPercentage">
              0%
            </div>
          </div>
          <div className={styles.moodBar}>
            <div className={styles.moodLabel}>Neutral 😐</div>
            <div className={styles.moodBarContainer}>
              <div
                className={`${styles.moodBarFill} ${styles.neutral}`}
                id="neutralBar"
              ></div>
            </div>
            <div className={styles.moodPercentage} id="neutralPercentage">
              0%
            </div>
          </div>
          <div className={styles.moodBar}>
            <div className={styles.moodLabel}>Angry 😠</div>
            <div className={styles.moodBarContainer}>
              <div
                className={`${styles.moodBarFill} ${styles.angry}`}
                id="angryBar"
              ></div>
            </div>
            <div className={styles.moodPercentage} id="angryPercentage">
              0%
            </div>
          </div>
          <div className={styles.moodBar}>
            <div className={styles.moodLabel}>Sad 😢</div>
            <div className={styles.moodBarContainer}>
              <div
                className={`${styles.moodBarFill} ${styles.sad}`}
                id="sadBar"
              ></div>
            </div>
            <div className={styles.moodPercentage} id="sadPercentage">
              0%
            </div>
          </div>
          <div className={styles.moodBar}>
            <div className={styles.moodLabel}>Stressed 😰</div>
            <div className={styles.moodBarContainer}>
              <div
                className={`${styles.moodBarFill} ${styles.stressed}`}
                id="stressedBar"
              ></div>
            </div>
            <div className={styles.moodPercentage} id="stressedPercentage">
              0%
            </div>
          </div>
          <div className={styles.totalSubmissions}>
            <span>Total Submissions: </span>
            <span id="totalSubmissions">0</span>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div
          className={styles.aiAnalysisSection}
          id="aiAnalysis"
          style={{ display: "none", opacity: "0" }}
        >
          <h3>AI Community Analysis</h3>
          <div id="aiAnalysisContent">
            {/* Content will be populated dynamically */}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <div className={styles.contentTitle}>
            <svg
              className={styles.icon}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
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
                const sentimentFilter = document.getElementById(
                  "sentimentFilter"
                ) as HTMLSelectElement;
                if (sentimentFilter) {
                  sentimentFilter.value = "all";
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
          <button className={styles.hideButton} onClick={toggleSuburbOverlays}>
            <svg
              className={styles.icon}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span id="toggle-text">Hide Suburb Overlays</span>
          </button>
        </div>

        <div className={styles.mapContainer}>
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
            className={styles.map}
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
      <aside className={styles.rightPanel}>
        <div className={styles.panelSection}>
          <h3>Key Metrics</h3>
          <div className={styles.metricItem}>
            <Heart className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <h4>Overall Sentiment</h4>
              <div className={`${styles.metricValue} ${styles.positive}`}>
                72% <span className={styles.positive}>Positive</span>
              </div>
            </div>
          </div>
          <div className={styles.metricItem}>
            <Users className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <h4>Active Residents</h4>
              <div className={styles.metricValue}>1,247</div>
            </div>
          </div>
          <div className={styles.metricItem}>
            <MessageSquare className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <h4>Total Comments</h4>
              <div className={styles.metricValue}>3,891</div>
            </div>
          </div>
          <div className={styles.metricItem}>
            <TrendingUp className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <h4>Weekly Growth</h4>
              <div className={styles.metricValue}>
                <span className={styles.growth}>+12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Suburbs Ranking Chart */}
        <div className={styles.panelSection}>
          <h3>Top 3 Suburbs by Happy Mood</h3>
          <div className={styles.rankingChart}>
            {getTop3SuburbsByMood().map((suburb, index) => (
              <div
                key={suburb.name}
                className={`${styles.rankingItem} ${
                  styles[`rank${index + 1}`]
                }`}
              >
                <div className={styles.rankNumber}>{index + 1}</div>
                <div className={styles.rankContent}>
                  <div className={styles.rankSuburbName}>{suburb.name}</div>
                  <div className={styles.rankMoodInfo}>
                    <span className={styles.rankSentiment}>
                      {Math.round(suburb.sentiment * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Call to Action Button */}
      <a href="/form" className={styles.ctaButton} title="Submit Feedback">
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
      </a>

      {/* Mood Statistics Hover Button */}
      <div className={styles.moodStatsButtonContainer}>
        <button
          className={styles.moodStatsButton}
          onMouseEnter={() => setShowMoodStats(true)}
          onMouseLeave={() => setShowMoodStats(false)}
        >
          <svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>

        {/* Mood Statistics Popup */}
        {showMoodStats && (
          <div className={styles.moodStatsPopup}>
            <div className={styles.popupHeader}>
              <h3>Overall Mood Distribution</h3>
              <span className={styles.popupSubtitle}>All Sydney Suburbs</span>
            </div>

            <div className={styles.pieChartContainer}>
              <div
                className={styles.pieChart}
                style={{
                  background: `conic-gradient(${getPieChartGradient()})`,
                }}
              >
                {/* Pie chart created with dynamic conic-gradient */}
              </div>
            </div>

            <div className={styles.moodLegend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.happy}`}></div>
                <span>Happy: {getOverallMoodPercentage("happy")}%</span>
              </div>
              <div className={styles.legendItem}>
                <div
                  className={`${styles.legendColor} ${styles.neutral}`}
                ></div>
                <span>Neutral: {getOverallMoodPercentage("neutral")}%</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.angry}`}></div>
                <span>Angry: {getOverallMoodPercentage("angry")}%</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.sad}`}></div>
                <span>Sad: {getOverallMoodPercentage("sad")}%</span>
              </div>
              <div className={styles.legendItem}>
                <div
                  className={`${styles.legendColor} ${styles.stressed}`}
                ></div>
                <span>Stressed: {getOverallMoodPercentage("stressed")}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
