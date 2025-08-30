"use client"
import "./signup.css";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="signup-page-container min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="signup-form-wrapper w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="signup-header-section text-center space-y-4">
          <div className="signup-icon-container mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <UserPlus className="signup-user-icon w-8 h-8 text-white" />
          </div>
          <div className="signup-title-group">
            <h1 className="signup-main-title text-3xl font-bold text-gray-900 text-balance">Create Account</h1>
            <p className="signup-subtitle text-gray-600 mt-2">Join us today and start your journey</p>
          </div>
        </div>

        {/* Sign Up Form Card */}
        <Card className="signup-form-card shadow-lg border-0">
          <CardHeader className="signup-card-header text-center pb-4">
            <CardTitle className="signup-card-title text-xl font-semibold text-gray-900">Sign Up</CardTitle>
            <p className="signup-card-description text-sm text-gray-600">
              Fill in your information to create your account
            </p>
          </CardHeader>
          <CardContent className="signup-card-content space-y-4">
            <div className="fullname-field-container space-y-2">
              <Label htmlFor="fullName" className="signup-field-label text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className="signup-input-field h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="email-field-container space-y-2">
              <Label htmlFor="email" className="signup-field-label text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="signup-input-field h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="username-field-container space-y-2">
              <Label htmlFor="username" className="signup-field-label text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                className="signup-input-field h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="password-field-container space-y-2">
              <Label htmlFor="password" className="signup-field-label text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="signup-input-field h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="confirm-password-field-container space-y-2">
              <Label htmlFor="confirmPassword" className="signup-field-label text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="signup-input-field h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <Button className="signup-submit-button w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium mt-6">
              Create Account
            </Button>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="signup-footer-section text-center space-y-4">
          <p className="signin-link-text text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="signin-link text-green-500 hover:text-green-600 font-medium">
              Sign in here
            </Link>
          </p>
          <p className="legal-links-text text-xs text-gray-500">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="terms-link text-green-500 hover:text-green-600">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="privacy-link text-green-500 hover:text-green-600">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
