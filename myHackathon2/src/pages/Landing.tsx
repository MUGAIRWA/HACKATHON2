import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, HeartIcon, UtensilsIcon } from 'lucide-react';
const Landing = () => {
  return <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-gray-800">Smart Hub</div>
          <div className="space-x-2">
            <Link to="/auth" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Login
            </Link>
            <Link to="/auth?register=true" className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition">
              Register
            </Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Smart Hub for Education, Health & Hunger
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connecting students with resources they need to thrive in
              academics and life.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Link to="/auth" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-lg">
                Get Started
              </Link>
              <Link to="/auth?register=true" className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition text-lg">
                Learn More
              </Link>
            </div>
          </div>
          {/* Feature Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-gray-50 transition">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <BookOpenIcon size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Education
              </h3>
              <p className="text-gray-600">
                Access to educational resources, tutoring, and academic support.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-gray-50 transition">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                <HeartIcon size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Health
              </h3>
              <p className="text-gray-600">
                Health tips, wellness resources, and medical assistance
                information.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-gray-50 transition">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-amber-100 mb-4">
                <UtensilsIcon size={32} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nutrition
              </h3>
              <p className="text-gray-600">
                Meal assistance, nutrition guidance, and food security support.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            © 2023 Smart Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>;
};
export default Landing;