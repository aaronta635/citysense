"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import styles from "./page.module.css";
import { GOOGLE_MAPS_API_KEY } from "./config";

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
    radius: 400, // meters - covers CBD area
    sentiment: 0.8,
    description: "High positive sentiment",
    moodBreakdown: {
      happy: 65,
      neutral: 25,
      angry: 10,
      totalSubmissions: 150,
    },
  },
  {
    name: "The Rocks",
    center: { lat: -33.8588, lng: 151.2088 },
    radius: 200,
    sentiment: 0.6,
    description: "Moderate positive sentiment",
    moodBreakdown: {
      happy: 45,
      neutral: 40,
      angry: 15,
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
      happy: 25,
      neutral: 50,
      angry: 25,
      totalSubmissions: 112,
    },
  },
  {
    name: "Ultimo",
    center: { lat: -33.883, lng: 151.2093 },
    radius: 250,
    sentiment: 0.1,
    description: "Low positive sentiment",
    moodBreakdown: {
      happy: 10,
      neutral: 30,
      angry: 60,
      totalSubmissions: 78,
    },
  },
  {
    name: "Circular Quay",
    center: { lat: -33.8568, lng: 151.2036 },
    radius: 200,
    sentiment: 0.9,
    description: "Very high positive sentiment",
    moodBreakdown: {
      happy: 80,
      neutral: 15,
      angry: 5,
      totalSubmissions: 95,
    },
  },
  {
    name: "Woolloomooloo",
    center: { lat: -33.87, lng: 151.22 },
    radius: 250,
    sentiment: 0.4,
    description: "Moderate sentiment",
    moodBreakdown: {
      happy: 30,
      neutral: 45,
      angry: 25,
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
      happy: 55,
      neutral: 30,
      angry: 15,
      totalSubmissions: 134,
    },
  },
  {
    name: "Newtown",
    center: { lat: -33.88, lng: 151.18 },
    radius: 350,
    sentiment: 0.2,
    description: "Low sentiment",
    moodBreakdown: {
      happy: 15,
      neutral: 35,
      angry: 50,
      totalSubmissions: 156,
    },
  },
  {
    name: "Parramatta",
    center: { lat: -33.8148, lng: 151.0 },
    radius: 400,
    sentiment: 0.6,
    description: "Good positive sentiment",
    moodBreakdown: {
      happy: 50,
      neutral: 35,
      angry: 15,
      totalSubmissions: 203,
    },
  },
  {
    name: "Hornsby",
    center: { lat: -33.7, lng: 151.1 },
    radius: 350,
    sentiment: 0.8,
    description: "High positive sentiment",
    moodBreakdown: {
      happy: 70,
      neutral: 20,
      angry: 10,
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
      happy: 60,
      neutral: 25,
      angry: 15,
      totalSubmissions: 145,
    },
  },
];

// Type definitions
interface MoodBreakdown {
  happy: number;
  neutral: number;
  angry: number;
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
  const [stats, setStats] = useState({ suburbsShown: 11, avgSentiment: "58%" });

  const mapRef = useRef<HTMLDivElement>(null);

  // Convert sentiment score to mood-based color
  const getSentimentColor = (sentimentScore: number): string => {
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
    mapInstance: google.maps.Map
  ): google.maps.Circle[] => {
    const circles: google.maps.Circle[] = [];

    suburbSentimentData.forEach((suburb) => {
      // Create a circle representing the suburb area
      const suburbCircle = new google.maps.Circle({
        center: suburb.center,
        radius: suburb.radius,
        fillColor: getSentimentColor(suburb.sentiment),
        fillOpacity: 0.3, // Semi-transparent fill
        strokeColor: getSentimentColor(suburb.sentiment),
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
              suburb.sentiment
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
      const suburb = suburbSentimentData[index];
      let shouldShow = false;

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
  const filterBySuburb = () => {
    const selectedSuburb = (
      document.getElementById("suburbFilter") as HTMLSelectElement
    ).value;
    let visibleCount = 0;
    let totalSentiment = 0;
    let visibleSuburbs = 0;
    let selectedSuburbData: SuburbData | null = null;

    suburbCircles.forEach((circle, index) => {
      const suburb = suburbSentimentData[index];
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

  // Show mood breakdown for a specific suburb
  const showMoodBreakdown = (suburbData: SuburbData) => {
    const moodBreakdownElement = document.getElementById("moodBreakdown");
    if (!moodBreakdownElement) return;

    const breakdown = suburbData.moodBreakdown;

    // Update the mood bars
    const happyBar = document.getElementById("happyBar");
    const neutralBar = document.getElementById("neutralBar");
    const angryBar = document.getElementById("angryBar");

    if (happyBar) happyBar.style.width = breakdown.happy + "%";
    if (neutralBar) neutralBar.style.width = breakdown.neutral + "%";
    if (angryBar) angryBar.style.width = breakdown.angry + "%";

    // Update the percentages
    const happyPercentage = document.getElementById("happyPercentage");
    const neutralPercentage = document.getElementById("neutralPercentage");
    const angryPercentage = document.getElementById("angryPercentage");

    if (happyPercentage) happyPercentage.textContent = breakdown.happy + "%";
    if (neutralPercentage)
      neutralPercentage.textContent = breakdown.neutral + "%";
    if (angryPercentage) angryPercentage.textContent = breakdown.angry + "%";

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

  return (
    <div className={styles.dashboard}>
      {/* Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization`}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="lazyOnload"
      />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>SydneySense</div>
        <div className={styles["header-icons"]}>
          <svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
          </svg>
          <svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles["filter-section"]}>
          <h3>Mood Filter</h3>
          <div className={styles["dropdown-container"]}>
            <select
              id="sentimentFilter"
              className={styles["sentiment-dropdown"]}
              onChange={filterBySentiment}
            >
              <option value="all">All Moods</option>
              <option value="happy">Happy 😊</option>
              <option value="neutral">Neutral 😐</option>
              <option value="angry">Angry 😠</option>
            </select>
          </div>

          <div className={styles["filter-info"]}>
            <p>Filter suburbs by community mood</p>
          </div>

          <div className={styles["color-legend"]}>
            <h4>Color Guide</h4>
            <div className={styles["legend-item"]}>
              <span className={`${styles["color-dot"]} ${styles.happy}`}></span>
              <span>Happy (66-100%)</span>
            </div>
            <div className={styles["legend-item"]}>
              <span
                className={`${styles["color-dot"]} ${styles.neutral}`}
              ></span>
              <span>Neutral (33-65%)</span>
            </div>
            <div className={styles["legend-item"]}>
              <span className={`${styles["color-dot"]} ${styles.angry}`}></span>
              <span>Angry (0-32%)</span>
            </div>
          </div>
        </div>

        <div className={styles["filter-section"]}>
          <h3>Suburb Filter</h3>
          <div className={styles["dropdown-container"]}>
            <select
              id="suburbFilter"
              className={styles["sentiment-dropdown"]}
              onChange={filterBySuburb}
            >
              <option value="all">All Suburbs</option>
              {suburbSentimentData.map((suburb) => (
                <option key={suburb.name} value={suburb.name}>
                  {suburb.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles["filter-info"]}>
            <p>Filter by specific suburb</p>
          </div>
        </div>

        <div className={styles["stats-section"]}>
          <h3>Current View</h3>
          <div className={styles["stat-item"]}>
            <span className={styles["stat-label"]}>Suburbs Shown:</span>
            <span id="suburbsShown" className={styles["stat-value"]}>
              {stats.suburbsShown}
            </span>
          </div>
          <div className={styles["stat-item"]}>
            <span className={styles["stat-label"]}>Average Mood:</span>
            <span id="avgSentiment" className={styles["stat-value"]}>
              {stats.avgSentiment}
            </span>
          </div>
        </div>

        <div
          className={styles["mood-breakdown-section"]}
          id="moodBreakdown"
          style={{ display: "none" }}
        >
          <h3>Mood Breakdown</h3>
          <div className={styles["mood-bar"]}>
            <div className={styles["mood-label"]}>Happy 😊</div>
            <div className={styles["mood-bar-container"]}>
              <div
                className={`${styles["mood-bar-fill"]} ${styles.happy}`}
                id="happyBar"
              ></div>
            </div>
            <div className={styles["mood-percentage"]} id="happyPercentage">
              0%
            </div>
          </div>
          <div className={styles["mood-bar"]}>
            <div className={styles["mood-label"]}>Neutral 😐</div>
            <div className={styles["mood-bar-container"]}>
              <div
                className={`${styles["mood-bar-fill"]} ${styles.neutral}`}
                id="neutralBar"
              ></div>
            </div>
            <div className={styles["mood-percentage"]} id="neutralPercentage">
              0%
            </div>
          </div>
          <div className={styles["mood-bar"]}>
            <div className={styles["mood-label"]}>Angry 😠</div>
            <div className={styles["mood-bar-container"]}>
              <div
                className={`${styles["mood-bar-fill"]} ${styles.angry}`}
                id="angryBar"
              ></div>
            </div>
            <div className={styles["mood-percentage"]} id="angryPercentage">
              0%
            </div>
          </div>
          <div className={styles["total-submissions"]}>
            <span>Total Submissions: </span>
            <span id="totalSubmissions">0</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles["main-content"]}>
        <div className={styles["content-header"]}>
          <div className={styles["content-title"]}>
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
          <button
            className={styles["hide-button"]}
            onClick={toggleSuburbOverlays}
          >
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

        <div className={styles["map-container"]}>
          {isMapLoading && (
            <div
              style={{
                width: "100%",
                height: "600px",
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
                height: "600px",
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
              height: "600px",
              borderRadius: "12px",
              display: isMapLoading || mapError ? "none" : "block",
            }}
          />
        </div>
      </main>

      {/* Right Panel */}
      <aside className={styles["right-panel"]}>
        <div className={styles["panel-section"]}>
          <h3>Key Metrics</h3>
          <div className={styles["metric-item"]}>
            <svg
              className={styles["metric-icon"]}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              ></path>
            </svg>
            <div className={styles["metric-content"]}>
              <h4>Overall Sentiment</h4>
              <div className={styles["metric-value"]}>
                72% <span className={styles.positive}>Positive</span>
              </div>
            </div>
          </div>
          <div className={styles["metric-item"]}>
            <svg
              className={styles["metric-icon"]}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
            </svg>
            <div className={styles["metric-content"]}>
              <h4>Active Residents</h4>
              <div className={styles["metric-value"]}>1,247</div>
            </div>
          </div>
          <div className={styles["metric-item"]}>
            <svg
              className={styles["metric-icon"]}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              ></path>
            </svg>
            <div className={styles["metric-content"]}>
              <h4>Total Comments</h4>
              <div className={styles["metric-value"]}>3,891</div>
            </div>
          </div>
          <div className={styles["metric-item"]}>
            <svg
              className={styles["metric-icon"]}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
            </svg>
            <div className={styles["metric-content"]}>
              <h4>Weekly Growth</h4>
              <div className={styles["metric-value"]}>
                <span className={styles.growth}>+12%</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles["panel-section"]}>
          <h3>Recent Activity</h3>
          <div className={styles["activity-item"]}>
            <div className={`${styles["activity-dot"]} ${styles.green}`}></div>
            <div className={styles["activity-content"]}>
              <div className={styles["activity-text"]}>
                New positive feedback in Downtown area
              </div>
              <div className={styles["activity-time"]}>2 minutes ago</div>
            </div>
          </div>
          <div className={styles["activity-item"]}>
            <div className={`${styles["activity-dot"]} ${styles.yellow}`}></div>
            <div className={styles["activity-content"]}>
              <div className={styles["activity-text"]}>
                Neutral sentiment spike in Park District
              </div>
              <div className={styles["activity-time"]}>15 minutes ago</div>
            </div>
          </div>
          <div className={styles["activity-item"]}>
            <div className={`${styles["activity-dot"]} ${styles.red}`}></div>
            <div className={styles["activity-content"]}>
              <div className={styles["activity-text"]}>
                Concerns raised about traffic in Main St
              </div>
              <div className={styles["activity-time"]}>1 hour ago</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Call to Action Button */}
      <button className={styles["cta-button"]}>
        <svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
            clipRule="evenodd"
          ></path>
        </svg>
        Submit Feedback
      </button>
    </div>
  );
}
