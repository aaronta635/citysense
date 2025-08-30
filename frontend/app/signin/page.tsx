"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPasswordError, setShowPasswordError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setShowPasswordError(true)
    } else {
      setShowPasswordError(false)
      // Handle sign in logic here
      console.log("Sign in attempted with:", { username, password })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-medium text-gray-600 text-balance">Welcome Back</h1>
          <p className="text-gray-500 text-lg">Sign in to your account to continue</p>
        </div>

        {/* Sign In Card */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-medium text-gray-600">Sign In</CardTitle>
            <p className="text-gray-500 text-sm">Enter your credentials to access your account</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-600 font-normal">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 text-gray-700 placeholder:text-gray-400 focus:bg-white focus:border-gray-300"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-600 font-normal">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (showPasswordError && e.target.value) {
                        setShowPasswordError(false)
                      }
                    }}
                    className="h-12 bg-gray-50 border-gray-200 text-gray-700 placeholder:text-gray-400 focus:bg-white focus:border-gray-300"
                  />
                  {showPasswordError && (
                    <div className="absolute -bottom-8 left-0">
                      <div className="bg-white border border-gray-300 rounded px-3 py-1 text-sm text-gray-600 shadow-sm">
                        Please fill out this field.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-left">
                <button type="button" className="text-cyan-600 hover:text-cyan-700 text-sm font-normal">
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-normal text-base"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-500">
            Don&apos;t have an account?{" "}
            <button className="text-cyan-600 hover:text-cyan-700 font-normal">Sign up here</button>
          </p>
        </div>
      </div>
    </div>
  )
}
