"use client"
import "./signup.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="fullname-field-container space-y-2">
                <Label htmlFor="fullName" className="signup-field-label text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
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
                  value={formData.email}
                  onChange={handleInputChange}
                  required
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
                  value={formData.username}
                  onChange={handleInputChange}
                  required
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
                  value={formData.password}
                  onChange={handleInputChange}
                  required
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
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="signup-input-field h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="signup-submit-button w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
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
