import React from 'react'
import { Calendar, ArrowRight, Users, Star, User } from 'lucide-react'

function Hero() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-20 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Revolutionize Your <span className="text-indigo-600">School Scheduling</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Streamline teacher schedules, optimize resources, and enhance educational efficiency with our intelligent scheduling platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2">
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3">
              <div className="bg-indigo-600 rounded-lg p-4 mb-4">
                <Calendar className="h-8 w-8 text-white mx-auto" />
              </div>
              <div className="space-y-3">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500 rounded-full w-3 h-3"></div>
                    <span className="text-sm font-medium">Math - Room 204</span>
                  </div>
                  <span className="text-xs text-gray-500">9:00 AM - 10:30 AM</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 rounded-full w-3 h-3"></div>
                    <span className="text-sm font-medium">Science - Lab 1</span>
                  </div>
                  <span className="text-xs text-gray-500">11:00 AM - 12:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
