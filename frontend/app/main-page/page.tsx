"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import styles from "./page.module.css";
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

// Community sentiment data for each Sydney suburb
const suburbSentimentData = [
  {
    name: "Sydney CBD",
    center: { lat: -33.8688, lng: 151.2093 },
    radius: 300,
    sentiment: 0.8,
    description: "High positive sentiment",
    moodBreakdown: {
      happy: 60,
      neutral: 20,
      angry: 8,
      sad: 7,
      stressed: 5,
      totalSubmissions: 150,
    },
  },
  {
    name: "The Rocks",
    center: { lat: -33.8588, lng: 151.2088 },
    radius: 300,
    sentiment: 0.6,
    description: "Moderate positive sentiment",
    moodBreakdown: {
      happy: 40,
      neutral: 35,
      angry: 12,
      sad: 8,
      stressed: 5,
      totalSubmissions: 89,
    },
  },
  {
    name: "Pyrmont",
    center: { lat: -33.8715, lng: 151.2006 },
    radius: 300,
    sentiment: 0.3,
    description: "Neutral sentiment",
    moodBreakdown: {
      happy: 20,
      neutral: 45,
      angry: 20,
      sad: 10,
      stressed: 5,
      totalSubmissions: 112,
    },
  },
  {
    name: "Ultimo",
    center: { lat: -33.883, lng: 151.2093 },
    radius: 300,
    sentiment: 0.1,
    description: "High stress area",
    moodBreakdown: {
      happy: 5,
      neutral: 15,
      angry: 20,
      sad: 25,
      stressed: 35,
      totalSubmissions: 78,
    },
  },
  {
    name: "Circular Quay",
    center: { lat: -33.8568, lng: 151.2036 },
    radius: 300,
    sentiment: 0.9,
    description: "Very high positive sentiment",
    moodBreakdown: {
      happy: 75,
      neutral: 12,
      angry: 4,
      sad: 6,
      stressed: 3,
      totalSubmissions: 95,
    },
  },
  {
    name: "Woolloomooloo",
    center: { lat: -33.87, lng: 151.22 },
    radius: 300,
    sentiment: 0.4,
    description: "Moderate sentiment",
    moodBreakdown: {
      happy: 25,
      neutral: 40,
      angry: 20,
      sad: 10,
      stressed: 5,
      totalSubmissions: 67,
    },
  },
  {
    name: "Glebe",
    center: { lat: -33.89, lng: 151.2 },
    radius: 300,
    sentiment: 0.7,
    description: "Good positive sentiment",
    moodBreakdown: {
      happy: 50,
      neutral: 25,
      angry: 12,
      sad: 8,
      stressed: 5,
      totalSubmissions: 134,
    },
  },
  {
    name: "Newtown",
    center: { lat: -33.88, lng: 151.18 },
    radius: 300,
    sentiment: 0.2,
    description: "High sadness area",
    moodBreakdown: {
      happy: 8,
      neutral: 20,
      angry: 15,
      sad: 42,
      stressed: 15,
      totalSubmissions: 156,
    },
  },
  {
    name: "Parramatta",
    center: { lat: -33.8148, lng: 151.0 },
    radius: 300,
    sentiment: 0.6,
    description: "Good positive sentiment",
    moodBreakdown: {
      happy: 45,
      neutral: 30,
      angry: 12,
      sad: 8,
      stressed: 5,
      totalSubmissions: 203,
    },
  },
  {
    name: "Hornsby",
    center: { lat: -33.7, lng: 151.1 },
    radius: 300,
    sentiment: 0.8,
    description: "High positive sentiment",
    moodBreakdown: {
      happy: 65,
      neutral: 18,
      angry: 8,
      sad: 6,
      stressed: 3,
      totalSubmissions: 98,
    },
  },
  {
    name: "Bondi",
    center: { lat: -33.85, lng: 151.28 },
    radius: 300,
    sentiment: 0.7,
    description: "Good positive sentiment",
    moodBreakdown: {
      happy: 55,
      neutral: 22,
      angry: 12,
      sad: 7,
      stressed: 4,
      totalSubmissions: 145,
    },
  },
  {
    name: "Manly",
    center: { lat: -33.7969, lng: 151.2854 },
    radius: 300,
    sentiment: 0.8,
    description: "High positive sentiment",
    moodBreakdown: {
      happy: 70,
      neutral: 18,
      angry: 4,
      sad: 5,
      stressed: 3,
      totalSubmissions: 120,
    },
  },
  {
    name: "North Sydney",
    center: { lat: -33.8405, lng: 151.2073 },
    radius: 300,
    sentiment: 0.7,
    description: "Good positive sentiment",
    moodBreakdown: {
      happy: 55,
      neutral: 25,
      angry: 8,
      sad: 8,
      stressed: 4,
      totalSubmissions: 95,
    },
  },
  {
    name: "Chatswood",
    center: { lat: -33.8014, lng: 151.1805 },
    radius: 300,
    sentiment: 0.6,
    description: "Moderate positive sentiment",
    moodBreakdown: {
      happy: 45,
      neutral: 30,
      angry: 12,
      sad: 8,
      stressed: 5,
      totalSubmissions: 180,
    },
  },
  {
    name: "Burwood",
    center: { lat: -33.8889, lng: 151.1033 },
    radius: 300,
    sentiment: 0.5,
    description: "Moderate sentiment",
    moodBreakdown: {
      happy: 35,
      neutral: 35,
      angry: 18,
      sad: 8,
      stressed: 4,
      totalSubmissions: 110,
    },
  },
  {
    name: "Strathfield",
    center: { lat: -33.8647, lng: 151.0897 },
    radius: 300,
    sentiment: 0.4,
    description: "High anger area",
    moodBreakdown: {
      happy: 10,
      neutral: 15,
      angry: 50,
      sad: 15,
      stressed: 10,
      totalSubmissions: 85,
    },
  },
  {
    name: "Auburn",
    center: { lat: -33.8508, lng: 151.0325 },
    radius: 300,
    sentiment: 0.3,
    description: "High sadness area",
    moodBreakdown: {
      happy: 15,
      neutral: 25,
      angry: 20,
      sad: 35,
      stressed: 5,
      totalSubmissions: 140,
    },
  },
  {
    name: "Bankstown",
    center: { lat: -33.9244, lng: 151.0249 },
    radius: 300,
    sentiment: 0.2,
    description: "High stress area",
    moodBreakdown: {
      happy: 10,
      neutral: 20,
      angry: 25,
      sad: 15,
      stressed: 30,
      totalSubmissions: 200,
    },
  },
  {
    name: "Liverpool",
    center: { lat: -33.9244, lng: 150.9249 },
    radius: 300,
    sentiment: 0.4,
    description: "High anger area",
    moodBreakdown: {
      happy: 8,
      neutral: 20,
      angry: 52,
      sad: 12,
      stressed: 8,
      totalSubmissions: 160,
    },
  },
  {
    name: "Campbelltown",
    center: { lat: -34.0668, lng: 150.8172 },
    radius: 300,
    sentiment: 0.3,
    description: "High anger area",
    moodBreakdown: {
      happy: 10,
      neutral: 20,
      angry: 45,
      sad: 15,
      stressed: 10,
      totalSubmissions: 125,
    },
  },
  {
    name: "Penrith",
    center: { lat: -33.7507, lng: 150.6955 },
    radius: 300,
    sentiment: 0.5,
    description: "Moderate positive sentiment",
    moodBreakdown: {
      happy: 40,
      neutral: 35,
      angry: 12,
      sad: 8,
      stressed: 5,
      totalSubmissions: 180,
    },
  },
  {
    name: "Blacktown",
    center: { lat: -33.7667, lng: 150.9167 },
    radius: 300,
    sentiment: 0.4,
    description: "High anger area",
    moodBreakdown: {
      happy: 12,
      neutral: 18,
      angry: 45,
      sad: 15,
      stressed: 10,
      totalSubmissions: 220,
    },
  },
  {
    name: "Castle Hill",
    center: { lat: -33.7333, lng: 151.0167 },
    radius: 300,
    sentiment: 0.7,
    description: "Good positive sentiment",
    moodBreakdown: {
      happy: 55,
      neutral: 25,
      angry: 8,
      sad: 8,
      stressed: 4,
      totalSubmissions: 95,
    },
  },
  {
    name: "Baulkham Hills",
    center: { lat: -33.75, lng: 151.0 },
    radius: 300,
    sentiment: 0.6,
    description: "Moderate positive sentiment",
    moodBreakdown: {
      happy: 45,
      neutral: 30,
      angry: 12,
      sad: 8,
      stressed: 5,
      totalSubmissions: 110,
    },
  },
  {
    name: "Kellyville",
    center: { lat: -33.7167, lng: 150.95 },
    radius: 300,
    sentiment: 0.7,
    description: "Good positive sentiment",
    moodBreakdown: {
      happy: 60,
      neutral: 22,
      angry: 8,
      sad: 7,
      stressed: 3,
      totalSubmissions: 85,
    },
  },
  {
    name: "Rouse Hill",
    center: { lat: -33.6833, lng: 150.9167 },
    radius: 300,
    sentiment: 0.8,
    description: "High positive sentiment",
    moodBreakdown: {
      happy: 65,
      neutral: 18,
      angry: 8,
      sad: 6,
      stressed: 3,
      totalSubmissions: 75,
    },
  },
  {
    name: "The Ponds",
    center: { lat: -33.7, lng: 150.9 },
    radius: 300,
    sentiment: 0.7,
    description: "Good positive sentiment",
    moodBreakdown: {
      happy: 55,
      neutral: 25,
      angry: 8,
      sad: 8,
      stressed: 4,
      totalSubmissions: 60,
    },
  },
  {
    name: "Riverstone",
    center: { lat: -33.6833, lng: 150.8667 },
    radius: 300,
    sentiment: 0.5,
    description: "Moderate sentiment",
    moodBreakdown: {
      happy: 35,
      neutral: 40,
      angry: 12,
      sad: 8,
      stressed: 5,
      totalSubmissions: 70,
    },
  },
];

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
  const [filteredSuburbs, setFilteredSuburbs] = useState(suburbSentimentData);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showMoodStats, setShowMoodStats] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown menu
  const toggleDropdown = () => {
    console.log("Dropdown clicked, current state:", isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
    console.log("New state will be:", !isDropdownOpen);
  };

  // Enhanced suburb search with debouncing
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Enhanced click outside handler for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Check for activity dropdown
      if (!target.closest(".activity-dropdown")) {
        setIsDropdownOpen(false);
      }

      // Enhanced search suggestions handling
      if (!target.closest(`[class*="searchInputContainer"]`)) {
        setShowSuggestions(false);
      }

      // Check for profile dropdown
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

      // Ensure circles are properly initialized and interactive
      setTimeout(() => {
        if (circles.length > 0) {
          console.log(
            `Successfully created ${circles.length} interactive suburb circles`
          );
        }
      }, 100);

      // Initialize with all suburbs visible and update stats
      // Calculate actual stats from the data
      const totalSuburbs = suburbSentimentData.length;
      const totalSentiment = suburbSentimentData.reduce(
        (sum, suburb) => sum + suburb.sentiment,
        0
      );
      const averageSentiment = totalSentiment / totalSuburbs;

      // Pass the correct values: visibleCount, totalSentiment, visibleSuburbs
      updateFilterStats(totalSuburbs, totalSentiment, totalSuburbs);

      // Add map controls for user interaction
      addMapControls(newMap);

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
    mapInstance: google.maps.Map
  ): google.maps.Circle[] => {
    const circles: google.maps.Circle[] = [];

    suburbSentimentData.forEach((suburb) => {
      // Get the color based on mood breakdown
      const circleColor = getSentimentColor(
        suburb.sentiment,
        suburb.moodBreakdown
      );

      // Calculate dynamic transparency based on sentiment intensity and submission count
      const baseOpacity = 0.2; // Minimum transparency
      const sentimentIntensity =
        Math.max(
          suburb.moodBreakdown.happy,
          suburb.moodBreakdown.neutral,
          suburb.moodBreakdown.angry,
          suburb.moodBreakdown.sad,
          suburb.moodBreakdown.stressed
        ) / 100; // Normalize to 0-1

      // Higher sentiment intensity = more opaque, more submissions = more visible
      const submissionFactor = Math.min(
        suburb.moodBreakdown.totalSubmissions / 200,
        1
      ); // Normalize to 200 max submissions
      const dynamicOpacity =
        baseOpacity + sentimentIntensity * 0.4 + submissionFactor * 0.2;

      // Clamp opacity between 0.2 and 0.8
      const finalOpacity = Math.max(0.2, Math.min(0.8, dynamicOpacity));

      // Create a circle representing the suburb area
      const suburbCircle = new google.maps.Circle({
        center: suburb.center,
        radius: suburb.radius,
        fillColor: circleColor,
        fillOpacity: finalOpacity, // Dynamic transparency
        strokeColor: circleColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: mapInstance,
      });

      // Store original opacity and stroke color for hover effects
      (suburbCircle as any).originalOpacity = finalOpacity;
      (suburbCircle as any).originalStrokeColor = circleColor;

      // No info popup needed - removed dropdown functionality

      // Make the suburb circle interactive
      makeSuburbCircleInteractive(suburbCircle, mapInstance, suburb);

      // Store the circle for later use (showing/hiding)
      circles.push(suburbCircle);
    });

    console.log("Created sentiment circles for all Sydney suburbs");
    return circles;
  };

  // Make a suburb circle interactive with click and hover effects
  const makeSuburbCircleInteractive = (
    circle: google.maps.Circle,
    mapInstance: google.maps.Map,
    suburb: SuburbData
  ) => {
    // No hover effects - heat spots are static visual indicators
    // No click functionality - heat spots are visual only
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
      // totalSentiment is the sum of sentiment scores (0-1), so convert to percentage
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

  // Calculate initial stats from all suburbs data
  const calculateInitialStats = () => {
    const totalSuburbs = suburbSentimentData.length;
    const totalSentiment = suburbSentimentData.reduce(
      (sum, suburb) => sum + suburb.sentiment,
      0
    );
    const averageSentiment = totalSentiment / totalSuburbs;

    return { totalSuburbs, totalSentiment, averageSentiment };
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
      const suburb = suburbSentimentData[index];
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
    console.log("=== FILTER BY SUBURB DEBUG ===");
    console.log("Filtering by suburb:", selectedSuburb);
    console.log("Map state:", map ? "Available" : "Not available");
    console.log("Suburb circles count:", suburbCircles.length);
    console.log("suburbSentimentData length:", suburbSentimentData.length);

    let visibleCount = 0;
    let totalSentiment = 0;
    let visibleSuburbs = 0;
    let selectedSuburbData: SuburbData | null = null;

    // Check if map and circles are available
    if (!map || suburbCircles.length === 0) {
      console.error("Map or suburb circles not available for filtering");
      return;
    }

    suburbCircles.forEach((circle, index) => {
      const suburb = suburbSentimentData[index];
      let shouldShow = false;

      if (selectedSuburb === "all") {
        shouldShow = true;
      } else {
        shouldShow = suburb.name === selectedSuburb;
        if (shouldShow) {
          selectedSuburbData = suburb;
          console.log(
            "Found matching suburb:",
            suburb.name,
            "at index:",
            index
          );
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
      console.log("Selected suburb data:", suburb); // Debug log
      console.log("Calling showMoodBreakdown for:", suburb.name); // Debug log

      map.setCenter(suburb.center);
      map.setZoom(16); // Zoom in closer to see the suburb better
      showMoodBreakdown(suburb);
    } else if (selectedSuburb === "all" && map) {
      // Return to default Sydney view
      console.log("Returning to all suburbs view"); // Debug log
      map.setCenter(SYDNEY_CENTER);
      map.setZoom(14);
      hideMoodBreakdown();
    } else {
      console.log("=== NO MOOD BREAKDOWN SHOWN ===");
      console.log("selectedSuburb:", selectedSuburb);
      console.log("selectedSuburbData:", selectedSuburbData);
      console.log("map:", map);
      console.log("=== END DEBUG ===");
    }

    // Update the stats display
    updateFilterStats(visibleCount, totalSentiment, visibleSuburbs);
  };

  // Enhanced suburb search with debouncing
  const handleSuburbSearch = (searchTerm: string) => {
    setSuburbSearchTerm(searchTerm);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Debounce search for better performance
    const newTimeout = setTimeout(() => {
      if (searchTerm.trim() === "") {
        setFilteredSuburbs(suburbSentimentData);
        setShowSuggestions(false);
        // Show all suburbs when search is cleared
        filterBySuburb("all");
      } else {
        const filtered = suburbSentimentData.filter((suburb) =>
          suburb.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSuburbs(filtered);
        setShowSuggestions(true);
      }
    }, 300); // 300ms debounce

    setSearchTimeout(newTimeout);
  };

  // Enhanced suburb selection with better UX
  const selectSuburb = (suburbName: string) => {
    console.log("=== SELECT SUBURB DEBUG ===");
    console.log("Selecting suburb:", suburbName);
    console.log(
      "Current suburbSentimentData length:",
      suburbSentimentData.length
    );
    console.log("Current map state:", map ? "Available" : "Not available");
    console.log("Current suburbCircles length:", suburbCircles.length);

    // Filter the map to show only the selected suburb
    console.log("Calling filterBySuburb with:", suburbName);
    filterBySuburb(suburbName);

    // Update the search term to show what was selected
    setSuburbSearchTerm(suburbName);

    // Keep the filtered suburbs for the search suggestions
    // Don't reset to all suburbs here
    setShowSuggestions(false);

    // Focus back to search input for better UX
    const searchInput = document.querySelector(
      `[class*="${styles.suburbSearchInput}"]`
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }

    console.log("=== END SELECT SUBURB DEBUG ===");
  };

  // Show mood breakdown for a specific suburb
  const showMoodBreakdown = (suburbData: SuburbData) => {
    const moodBreakdownElement = document.getElementById("moodBreakdown");
    if (!moodBreakdownElement) {
      return;
    }

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
    // Use setTimeout to ensure display: block is applied before opacity change
    setTimeout(() => {
      moodBreakdownElement.style.opacity = "1";
    }, 10);
  };

  // Hide mood breakdown when showing all suburbs
  const hideMoodBreakdown = () => {
    console.log("hideMoodBreakdown called"); // Debug log

    const moodBreakdown = document.getElementById("moodBreakdown");
    if (moodBreakdown) {
      moodBreakdown.style.opacity = "0";
      // Hide after opacity transition
      setTimeout(() => {
        moodBreakdown.style.display = "none";
      }, 300);
    } else {
      console.error("Mood breakdown element not found for hiding");
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

    // Wait for Google Maps to be fully available
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

  // Initialize map when everything is ready
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

  // Single consolidated initialization check
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

  // Single initialization check when component mounts
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
        return true; // Successfully initialized
      }
      return false; // Not ready yet
    };

    // Check immediately
    if (checkAndInitialize()) return;

    // If not ready, check once more after a reasonable delay
    const timeout = setTimeout(() => {
      checkAndInitialize();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isMapLoading, map, mapError]);

  // Helper functions for ranking chart
  const getTop3SuburbsByMood = (): SuburbData[] => {
    // Sort suburbs by their happy mood percentage
    const sortedSuburbs = [...suburbSentimentData].sort((a, b) => {
      return b.moodBreakdown.happy - a.moodBreakdown.happy; // Descending order by happy percentage
    });

    // Debug: Log the top 3 suburbs and their happy percentages
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

  // Helper function for pie chart rotation
  const getPieChartRotation = (moodType: string) => {
    const totalSubmissions = suburbSentimentData.reduce(
      (sum, suburb) => sum + suburb.moodBreakdown.totalSubmissions,
      0
    );
    if (totalSubmissions === 0) return 0;

    let totalMoodValue = 0;
    suburbSentimentData.forEach((suburb) => {
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
    const totalSubmissions = suburbSentimentData.reduce(
      (sum, suburb) => sum + suburb.moodBreakdown.totalSubmissions,
      0
    );
    if (totalSubmissions === 0) return 0;

    let totalMoodValue = 0;
    suburbSentimentData.forEach((suburb) => {
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
    suburbSentimentData.forEach((suburb, index) => {
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

  // Keyboard navigation for search suggestions
  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Escape") {
      setShowSuggestions(false);
      setSuburbSearchTerm("");
      setFilteredSuburbs(suburbSentimentData);
    }
  };

  // Cleanup timeout on unmount
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
                <span className={styles.activityCount}>3 new</span>
              </div>

              <div className={styles.dropdownActivities}>
                <div className={styles.dropdownActivityItem}>
                  <div
                    className={`${styles.activityDot} ${styles.green}`}
                  ></div>
                  <div className={styles.dropdownActivityContent}>
                    <div className={styles.dropdownActivityText}>
                      New positive feedback in Downtown area
                    </div>
                    <div className={styles.dropdownActivityTime}>
                      2 minutes ago
                    </div>
                  </div>
                </div>

                <div className={styles.dropdownActivityItem}>
                  <div
                    className={`${styles.activityDot} ${styles.yellow}`}
                  ></div>
                  <div className={styles.dropdownActivityContent}>
                    <div className={styles.dropdownActivityText}>
                      Neutral sentiment spike in Park District
                    </div>
                    <div className={styles.dropdownActivityTime}>
                      15 minutes ago
                    </div>
                  </div>
                </div>

                <div className={styles.dropdownActivityItem}>
                  <div className={`${styles.activityDot} ${styles.red}`}></div>
                  <div className={styles.dropdownActivityContent}>
                    <div className={styles.dropdownActivityText}>
                      Concerns raised about traffic in Main St
                    </div>
                    <div className={styles.dropdownActivityTime}>
                      1 hour ago
                    </div>
                  </div>
                </div>
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
                    <div className={styles.profileName}>John Doe</div>
                    <div className={styles.profileEmail}>
                      john.doe@example.com
                    </div>
                  </div>
                </div>

                <div className={styles.profileOptions}>
                  <div className={`${styles.profileOption} ${styles.logout}`}>
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

          {/* Combined Search and Dropdown */}
          <div className={styles.combinedFilterContainer}>
            {/* Search Input with Suggestions */}
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
                    setFilteredSuburbs(suburbSentimentData);
                    setShowSuggestions(false);
                    filterBySuburb("all");
                    // Reset search input focus
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
                            // Small delay to ensure click event processes before hiding
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

            {/* Show All Button */}
            <button
              onClick={() => {
                console.log("Show All clicked"); // Debug log
                filterBySuburb("all");
                setSuburbSearchTerm("");
                setFilteredSuburbs(suburbSentimentData);
                setShowSuggestions(false);
              }}
              className={styles.showAllBtn}
            >
              Show All
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
      <button className={styles.ctaButton} title="Submit Feedback">
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
