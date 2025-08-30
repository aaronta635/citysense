"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  MapPin,
  Heart,
  Meh,
  Frown,
  Angry,
  Smile,
} from "lucide-react";

// Sydney suburbs data for the searchable dropdown
const SYDNEY_SUBURBS = [
  // Eastern Suburbs
  "Bondi",
  "Bondi Beach",
  "Bondi Junction",
  "Bellevue Hill",
  "Dover Heights",
  "North Bondi",
  "Tamarama",
  "Bronte",
  "Waverley",
  "Clovelly",
  "Coogee",
  "Randwick",
  "Kingsford",
  "Malabar",
  "Little Bay",
  "La Perouse",
  "Phillip Bay",
  "Chifley",
  "Matraville",
  "Maroubra",
  "Pagewood",
  "Eastgardens",
  "Hillsdale",
  "Banksmeadow",
  "Botany",
  "Daceyville",
  "Eastlakes",
  "Mascot",

  // Inner City & Inner West
  "Surry Hills",
  "Paddington",
  "Newtown",
  "Glebe",
  "Darlinghurst",
  "Potts Point",
  "Kings Cross",
  "Woollahra",
  "Double Bay",
  "Rose Bay",
  "Vaucluse",
  "Watsons Bay",
  "Alexandria",
  "Redfern",
  "Chippendale",
  "Ultimo",
  "Pyrmont",
  "The Rocks",
  "Circular Quay",
  "Millers Point",
  "Balmain",
  "Rozelle",
  "Leichhardt",
  "Annandale",
  "Camperdown",
  "Enmore",
  "Stanmore",
  "Petersham",
  "Lilyfield",
  "Birchgrove",
  "Drummoyne",
  "Waterloo",
  "Zetland",
  "Rosebery",
  "Beaconsfield",
  "Eveleigh",
  "Erskineville",
  "St Peters",
  "Sydenham",
  "Tempe",
  "Wolli Creek",
  "Arncliffe",
  "Banksia",
  "Rockdale",
  "Kogarah",
  "Carlton",
  "Allawah",
  "Hurstville",
  "Penshurst",
  "Mortdale",
  "Oatley",
  "Como",
  "Peakhurst",
  "Lugarno",
  "Riverwood",

  // Northern Beaches
  "Fairlight",
  "Manly",
  "Seaforth",
  "Balgowlah",
  "Clontarf",
  "Mosman",
  "Cremorne",
  "Neutral Bay",
  "North Sydney",
  "Crows Nest",
  "Cammeray",
  "Kirribilli",
  "Milsons Point",
  "Lavender Bay",
  "Waverton",
  "Wollstonecraft",
  "Greenwich",
  "Artarmon",
  "Chatswood",
  "Roseville",
  "Lindfield",
  "Killara",
  "Gordon",
  "Pymble",
  "Turramurra",
  "St Ives",
  "Belrose",
  "Frenchs Forest",
  "Forestville",
  "Davidson",
  "Dee Why",
  "Curl Curl",
  "Freshwater",
  "Queenscliff",
  "Collaroy",
  "Narrabeen",
  "Warriewood",
  "Mona Vale",
  "Newport",
  "Avalon",
  "Palm Beach",
  "Whale Beach",

  // Sutherland Shire
  "Cronulla",
  "Caringbah",
  "Miranda",
  "Sylvania",
  "Gymea",
  "Kirrawee",
  "Sutherland",
  "Engadine",
  "Heathcote",
  "Loftus",
  "Yarrawarrah",
  "Bundeena",
  "Maianbar",
  "Kurnell",
  "Grays Point",
  "Yowie Bay",
  "Lilli Pilli",
  "Port Hacking",
  "Dolans Bay",
  "Burraneer",
  "Woolooware",
  "Taren Point",
  "Sans Souci",
  "Ramsgate",
  "Kogarah Bay",
  "Beverley Park",
  "Monterey",
  "Brighton-Le-Sands",

  // Western Suburbs
  "Padstow",
  "Revesby",
  "Panania",
  "East Hills",
  "Milperra",
  "Condell Park",
  "Bankstown",
  "Yagoona",
  "Birrong",
  "Regents Park",
  "Chullora",
  "Greenacre",
  "Lakemba",
  "Wiley Park",
  "Punchbowl",
  "Roselands",
  "Campsie",
  "Belmore",
  "Canterbury",
  "Hurlstone Park",
  "Dulwich Hill",
  "Marrickville",
  "Ashfield",
  "Summer Hill",
  "Croydon",
  "Burwood",
  "Strathfield",
  "Homebush",
  "Concord",
  "Cabarita",
  "Rhodes",
  "Liberty Grove",
  "Breakfast Point",
  "Meadowbank",
  "Ryde",
  "Putney",
  "Gladesville",
  "Hunters Hill",
  "Woolwich",
  "Henley",
  "Abbotsford",
  "Wareemba",
  "Russell Lea",
  "Five Dock",
  "Canada Bay",
  "Chiswick",
  "North Ryde",
  "East Ryde",
  "Macquarie Park",
  "West Ryde",
  "Denistone",
  "Eastwood",
  "Epping",
  "Carlingford",
  "Telopea",
  "Dundas",
  "Ermington",
  "Rydalmere",
  "Parramatta",
  "North Parramatta",
  "Westmead",
  "Wentworthville",
  "Pendle Hill",
  "Toongabbie",
  "Seven Hills",
  "Blacktown",
  "Marayong",
  "Kings Park",
  "Quakers Hill",
  "Acacia Gardens",
  "Kellyville",
  "Baulkham Hills",
  "Castle Hill",
  "Winston Hills",
  "Northmead",
  "Constitution Hill",
  "Girraween",
  "Greystanes",
  "Pemulwuy",
  "Prospect",
  "Merrylands",
  "Guildford",
  "Yennora",
  "Chester Hill",
  "Sefton",
  "Bass Hill",
  "Lansvale",
  "Canley Vale",
  "Canley Heights",
  "Cabramatta",
  "Lansdowne",
  "Villawood",
  "Fairfield",
  "Carramar",
  "Smithfield",
  "Wetherill Park",
  "Prairiewood",
  "Wakeley",
  "Edensor Park",
  "Abbotsbury",
  "Cecil Hills",
  "Bonnyrigg",
  "Greenfield Park",
  "Mount Pritchard",
  "Liverpool",
  "Warwick Farm",
  "Chipping Norton",
  "Hammondville",
  "Moorebank",
  "Wattle Grove",
  "Holsworthy",
  "Casula",
  "Prestons",
  "Lurnea",
  "Cartwright",
  "Sadleir",
  "Ashcroft",
  "Busby",
  "Heckenberg",
  "Green Valley",
  "Hinchinbrook",
  "Cecil Park",
  "Kemps Creek",
  "Austral",
  "Leppington",
  "Denham Court",
  "Ingleburn",
  "Macquarie Fields",
  "Minto",
  "St Andrews",
  "Raby",
  "Kearns",
  "Eschol Park",
  "Eagle Vale",
  "Claymore",
  "Campbelltown",
  "Leumeah",
  "Blair Athol",
  "Woodbine",
  "Ambarvale",
  "Rosemeadow",
  "Bradbury",
  "Airds",
  "Kentlyn",
  "Wedderburn",
  "Appin",
  "Menangle",
  "Douglas Park",
  "Picton",
  "Tahmoor",
  "Bargo",
  "Yanderra",
  "Mittagong",
  "Bowral",
  "Moss Vale",
  "Berrima",
  "Robertson",
  "Kangaroo Valley",

  // South Coast
  "Nowra",
  "Bomaderry",
  "North Nowra",
  "South Nowra",
  "West Nowra",
  "Berry",
  "Gerringong",
  "Kiama",
  "Shellharbour",
  "Warilla",
  "Barrack Heights",
  "Oak Flats",
  "Albion Park",
  "Albion Park Rail",
  "Dapto",
  "Horsley",
  "Koonawarra",
  "Kanahooka",
  "Berkeley",
  "Lake Heights",
  "Cringila",
  "Warrawong",
  "Port Kembla",
  "Wollongong",
  "North Wollongong",
  "Fairy Meadow",
  "Towradgi",
  "East Corrimal",
  "Corrimal",
  "Bellambi",
  "Russell Vale",
  "Thirroul",
  "Austinmer",
  "Coledale",
  "Wombarra",
  "Scarborough",
  "Clifton",
  "Coalcliff",
  "Stanwell Park",
  "Helensburgh",
  "Waterfall",

  // North Shore
  "Moore Park",
  "Centennial Park",
  "Sydney",
  "Haymarket",
  "Dawes Point",
  "Walsh Bay",
  "McMahons Point",
  "Blues Point",
  "Cremorne Point",
  "Kurraba Point",
  "Northbridge",
  "Willoughby",
  "Castlecrag",
  "Middle Cove",
  "Castle Cove",
  "Chatswood West",
  "Lane Cove",
  "Lane Cove North",
  "Lane Cove West",
  "Linley Point",
  "Riverview",
  "Longueville",
  "Northwood",
];

// Mood options with corresponding icons
const MOOD_OPTIONS = [
  { value: "happy", label: "Happy", icon: Smile, color: "text-green-500" },
  { value: "neutral", label: "Neutral", icon: Meh, color: "text-gray-500" },
  {
    value: "stressed",
    label: "Stressed",
    icon: Frown,
    color: "text-yellow-500",
  },
  { value: "angry", label: "Angry", icon: Angry, color: "text-red-500" },
  { value: "sad", label: "Sad", icon: Heart, color: "text-blue-500" },
];

export default function FeedbackPage() {
  // Form state management
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [reasonText, setReasonText] = useState<string>("");
  const [selectedSuburb, setSelectedSuburb] = useState<string>("");
  const [suburbSearch, setSuburbSearch] = useState<string>("");

  // Filter suburbs based on search input
  const filteredSuburbs = SYDNEY_SUBURBS.filter((suburb) =>
    suburb.toLowerCase().includes(suburbSearch.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Feedback submitted:", {
      mood: selectedMood,
      reason: reasonText,
      suburb: selectedSuburb,
    });
    // Here you would typically send the data to your backend
  };

  return (
    <div className="feedback-page-container">
      {/* Main layout wrapper with sidebar and content */}
      <div className="page-layout-grid">
        {/* Left Sidebar Navigation */}
        <aside className="sidebar-navigation">
          <div className="sidebar-header">
            <h1 className="sidebar-brand-title">CitySense</h1>
          </div>

          <nav className="sidebar-menu">
            <div className="sidebar-menu-item active">
              <BarChart3 className="sidebar-menu-icon" />
              <span className="nav-bar-txt">Heat Map</span>
            </div>
            <div className="sidebar-menu-item current">
              <MessageSquare className="sidebar-menu-icon" />
              <span className="nav-bar-txt">Feedback</span>
            </div>
            {/* <div className="sidebar-menu-item"> */}
            {/* <TrendingUp className="sidebar-menu-icon" /> */}
            {/* <span>Settings</span> */}
            {/* </div> */}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="main-content-area">
          {/* Page Header Section */}
          <header className="page-header-section">
            <div className="page-title-container">
              <h1 className="page-main-title">Community Feedback</h1>
              <p className="page-subtitle">
                Share your thoughts and help improve our community
              </p>
            </div>
            <Button className="submit-feedback-button">
              <MessageSquare className="button-icon" />
              Submit Feedback
            </Button>
          </header>

          {/* Content Grid Layout */}
          <div className="content-grid-layout">
            {/* Feedback Form Card */}
            <Card className="feedback-form-card">
              <CardHeader className="form-card-header">
                <CardTitle className="form-card-title">
                  Share Your Feedback
                </CardTitle>
                <CardDescription className="form-card-description">
                  Help us understand what's happening in your community
                </CardDescription>
              </CardHeader>

              <CardContent className="form-card-content">
                <form onSubmit={handleSubmit} className="feedback-form">
                  {/* Question 1: How are you feeling today? */}
                  <div className="form-field-group">
                    <Label htmlFor="mood-select" className="form-field-label">
                      How are you feeling today?
                    </Label>
                    <Select
                      value={selectedMood}
                      onValueChange={setSelectedMood}
                    >
                      <SelectTrigger className="mood-select-trigger">
                        <SelectValue placeholder="Select your mood" />
                      </SelectTrigger>
                      <SelectContent className="mood-select-content">
                        {MOOD_OPTIONS.map((mood) => {
                          const IconComponent = mood.icon;
                          return (
                            <SelectItem
                              key={mood.value}
                              value={mood.value}
                              className="mood-select-item"
                            >
                              <div className="mood-option-container">
                                <IconComponent
                                  className={`mood-icon ${mood.color}`}
                                />
                                <span className="mood-label">{mood.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Question 2: Why reason (Vietnamese) */}
                  <div className="form-field-group">
                    <Label
                      htmlFor="reason-textarea"
                      className="form-field-label"
                    >
                      Why so?
                    </Label>
                    <Textarea
                      id="reason-textarea"
                      placeholder="Tell us what's on your mind..."
                      value={reasonText}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setReasonText(e.target.value)
                      }
                      className="reason-textarea"
                      rows={4}
                    />
                  </div>

                  {/* Question 3: Suburbs in Sydney */}
                  <div className="form-field-group">
                    <Label htmlFor="suburb-select" className="form-field-label">
                      Suburbs in Sydney
                    </Label>
                    <div className="suburb-search-container">
                      <Input
                        type="text"
                        placeholder="Search Suburbs"
                        value={suburbSearch}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSuburbSearch(e.target.value)
                        }
                        className="suburb-search-input"
                      />
                      <Select
                        value={selectedSuburb}
                        onValueChange={setSelectedSuburb}
                      >
                        <SelectTrigger className="suburb-select-trigger">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent className="suburb-select-content">
                          {filteredSuburbs.map((suburb) => (
                            <SelectItem
                              key={suburb}
                              value={suburb}
                              className="suburb-select-item"
                            >
                              <div className="suburb-option-container">
                                <MapPin className="suburb-icon" />
                                <span className="suburb-name">{suburb}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="form-submit-button">
                    <MessageSquare className="button-icon" />
                    Submit Feedback
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Key Metrics Sidebar */}
            <Card className="metrics-sidebar-card">
              <CardHeader className="metrics-card-header">
                <CardTitle className="metrics-card-title">
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="metrics-card-content">
                <div className="metric-item">
                  <div className="metric-icon-container sentiment">
                    <Heart className="metric-icon" />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">Overall Sentiment</span>
                    <span className="metric-value">72%</span>
                    <span className="metric-sublabel">Positive</span>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-icon-container residents">
                    <Users className="metric-icon" />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">Active Residents</span>
                    <span className="metric-value">1,247</span>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-icon-container comments">
                    <MessageSquare className="metric-icon" />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">Total Comments</span>
                    <span className="metric-value">3,891</span>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-icon-container growth">
                    <TrendingUp className="metric-icon" />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">Weekly Growth</span>
                    <span className="metric-value growth-positive">+12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
