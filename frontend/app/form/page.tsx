"use client"
import "./form.css";

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, Users, MessageSquare, TrendingUp, MapPin, Heart, Meh, Frown, Angry, Smile } from "lucide-react"

// Simplified Sydney suburbs list matching the main page
const SYDNEY_SUBURBS = [
  'Sydney', 'Parramatta', 'Liverpool', 'Penrith', 'Blacktown', 'Campbelltown',
  'Hurstville', 'Bankstown', 'Auburn', 'Fairfield', 'Cabramatta', 'Canterbury',
  'Rockdale', 'Kogarah', 'Maroubra', 'Randwick', 'Bondi', 'Manly', 'Chatswood', 'Hornsby'
]

// Mood options with corresponding icons
const MOOD_OPTIONS = [
  { value: "Happy", label: "Happy", icon: Smile, color: "text-green-500" },
  { value: "Neutral", label: "Neutral", icon: Meh, color: "text-gray-500" },
  { value: "Stressed", label: "Stressed", icon: Frown, color: "text-yellow-500" },
  { value: "Angry", label: "Angry", icon: Angry, color: "text-red-500" },
  { value: "Sad", label: "Sad", icon: Heart, color: "text-blue-500" },
]

export default function FeedbackPage() {
  // Form state management
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [reasonText, setReasonText] = useState<string>("")
  const [selectedSuburb, setSelectedSuburb] = useState<string>("")
  const [suburbSearch, setSuburbSearch] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Filter suburbs based on search input
  const filteredSuburbs = SYDNEY_SUBURBS.filter((suburb) => 
    suburb.toLowerCase().includes(suburbSearch.toLowerCase())
  )

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Form validation
    if (!selectedMood || !selectedSuburb) {
      setSubmitMessage({ type: 'error', text: 'Please select both a mood and a suburb' })
      return
    }

    if (!reasonText.trim()) {
      setSubmitMessage({ type: 'error', text: 'Please provide a reason for your mood' })
      return
    }

    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const response = await fetch('http://localhost:3000/v1/citysense/mood/form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedMood: selectedMood,
          reasonText: reasonText.trim(),
          selectedSuburb: selectedSuburb,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setSubmitMessage({ type: 'success', text: 'Thank you for your feedback! Your mood has been recorded.' })
        
        // Reset form
        setSelectedMood("")
        setReasonText("")
        setSelectedSuburb("")
        setSuburbSearch("")
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmitMessage(null)
        }, 5000)
      } else {
        setSubmitMessage({ type: 'error', text: `Error: ${result.message || 'Failed to submit feedback'}` })
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitMessage({ 
        type: 'error', 
        text: `Error submitting feedback: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="feedback-page-container">
      {/* Main layout wrapper with sidebar and content */}
      <div className="page-layout-grid">
        {/* Left Sidebar Navigation */}
        <aside className="sidebar-navigation">
          <div className="sidebar-header">
            <h1 className="sidebar-brand-title">CitySense</h1>
            <p className="sidebar-subtitle">Community Feedback Hub</p>
          </div>

          {/* Quick Stats */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Today's Activity</h3>
            <div className="sidebar-stats">
              <div className="stat-item">
                <div className="stat-icon-container">
                  <MessageSquare className="stat-icon" />
                </div>
                <div className="stat-content">
                  <span className="stat-value">24</span>
                  <span className="stat-label">New Feedback</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon-container">
                  <Users className="stat-icon" />
                </div>
                <div className="stat-content">
                  <span className="stat-value">18</span>
                  <span className="stat-label">Active Users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Recent Submissions</h3>
            <div className="recent-submissions">
              <div className="submission-item">
                <div className="submission-mood happy">😊</div>
                <div className="submission-details">
                  <span className="submission-suburb">Bondi</span>
                  <span className="submission-time">2 min ago</span>
                </div>
              </div>
              <div className="submission-item">
                <div className="submission-mood neutral">😐</div>
                <div className="submission-details">
                  <span className="submission-suburb">Parramatta</span>
                  <span className="submission-time">5 min ago</span>
                </div>
              </div>
              <div className="submission-item">
                <div className="submission-mood stressed">😰</div>
                <div className="submission-details">
                  <span className="submission-suburb">Liverpool</span>
                  <span className="submission-time">8 min ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Quick Actions</h3>
            <div className="quick-actions">
              <a href="/main-page" className="quick-action-link">
                <BarChart3 className="quick-action-icon" />
                <span>View Heatmap</span>
              </a>
              <button className="quick-action-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <TrendingUp className="quick-action-icon" />
                <span>Top of Form</span>
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Need Help?</h3>
            <div className="help-content">
              <p className="help-text">Your feedback helps improve our community. Be honest and specific about your experience.</p>
              <div className="help-tips">
                <div className="tip-item">
                  <span className="tip-icon">💡</span>
                  <span className="tip-text">Select your current mood</span>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">💡</span>
                  <span className="tip-text">Explain what's happening</span>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">💡</span>
                  <span className="tip-text">Choose your suburb</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content-area">
          {/* Page Header Section */}
          <header className="page-header-section">
            <div className="page-title-container">
              <h1 className="page-main-title">Community Feedback</h1>
              <p className="page-subtitle">Share your thoughts and help improve our community</p>
            </div>
            <div className="header-buttons">
              <a href="/main-page" className="back-to-main-button">
                <BarChart3 className="button-icon" />
                Back to Heatmap
              </a>
              <Button className="submit-feedback-button">
                <MessageSquare className="button-icon" />
                Submit Feedback
              </Button>
            </div>
          </header>

          {/* Submit Message Display */}
          {submitMessage && (
            <div className={`submit-message ${submitMessage.type}`}>
              {submitMessage.text}
            </div>
          )}

          {/* Content Grid Layout */}
          <div className="content-grid-layout">
            {/* Feedback Form Card */}
            <Card className="feedback-form-card">
              <CardHeader className="form-card-header">
                <CardTitle className="form-card-title">Share Your Feedback</CardTitle>
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
                    <Select value={selectedMood} onValueChange={setSelectedMood}>
                      <SelectTrigger className="mood-select-trigger">
                        <SelectValue placeholder="Select your mood" />
                      </SelectTrigger>
                      <SelectContent className="mood-select-content">
                        {MOOD_OPTIONS.map((mood) => {
                          const IconComponent = mood.icon
                          return (
                            <SelectItem key={mood.value} value={mood.value} className="mood-select-item">
                              <div className="mood-option-container">
                                <IconComponent className={`mood-icon ${mood.color}`} />
                                <span className="mood-label">{mood.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Question 2: Why reason */}
                  <div className="form-field-group">
                    <Label htmlFor="reason-textarea" className="form-field-label">
                      Why so? 
                    </Label>
                    <Textarea
                      id="reason-textarea"
                      placeholder="Tell us what's on your mind..."
                      value={reasonText}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReasonText(e.target.value)}
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
                        placeholder="Search suburbs..."
                        value={suburbSearch}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSuburbSearch(e.target.value)}
                        className="suburb-search-input"
                      />
                      <Select value={selectedSuburb} onValueChange={setSelectedSuburb}>
                        <SelectTrigger className="suburb-select-trigger">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent className="suburb-select-content">
                          {filteredSuburbs.map((suburb) => (
                            <SelectItem key={suburb} value={suburb} className="suburb-select-item">
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
                  <Button 
                    type="submit" 
                    className="form-submit-button"
                    disabled={isSubmitting}
                  >
                    <MessageSquare className="button-icon" />
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Key Metrics Sidebar */}
            <Card className="metrics-sidebar-card">
              <CardHeader className="metrics-card-header">
                <CardTitle className="metrics-card-title">Key Metrics</CardTitle>
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
  )
}