import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import WorkoutForm from './components/workout/WorkoutForm';
import WorkoutPlan from './components/workout/WorkoutPlan';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutCalendar from './pages/WorkoutCalendar';
import WorkoutBuilder from './pages/WorkoutBuilder';
import ProgressTracker from './pages/ProgressTracker';
import WorkoutTemplates from './pages/WorkoutTemplates';
import { UserPreferences } from './types';

// Navigation link component with active state
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive 
          ? 'bg-blue-700 text-white' 
          : 'text-gray-300 hover:bg-blue-600 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
};

// Main app header with navigation
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-900 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          FitPlan Pro
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4">
          <Link to="/templates" className="text-white hover:text-purple-200 transition">Templates</Link>
          <Link to="/exercises" className="text-white hover:text-purple-200 transition">Exercises</Link>
          <Link to="/builder" className="text-white hover:text-purple-200 transition">Builder</Link>
          <Link to="/calendar" className="text-white hover:text-purple-200 transition">Calendar</Link>
          <Link to="/progress" className="text-white hover:text-purple-200 transition">Progress</Link>
        </nav>
        
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          {mobileMenuOpen && (
            <div className="absolute top-16 right-0 bg-indigo-900 p-4 rounded-bl-lg shadow-lg z-10">
              <Link to="/" className="block py-2 text-white hover:text-purple-200">Home</Link>
              <Link to="/templates" className="block py-2 text-white hover:text-purple-200">Templates</Link>
              <Link to="/exercises" className="block py-2 text-white hover:text-purple-200">Exercises</Link>
              <Link to="/builder" className="block py-2 text-white hover:text-purple-200">Builder</Link>
              <Link to="/calendar" className="block py-2 text-white hover:text-purple-200">Calendar</Link>
              <Link to="/progress" className="block py-2 text-white hover:text-purple-200">Progress</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Footer component
const Footer = () => (
  <footer className="bg-gray-800 text-white py-6 mt-12">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.2929 9.707C20.6834 9.31652 20.6834 8.68335 20.2929 8.29287L17.4645 5.46446C17.074 5.07398 16.4408 5.07398 16.0503 5.46446C15.6598 5.85493 15.6598 6.4881 16.0503 6.87858L18.1716 8.99993L16.0503 11.1213C15.6598 11.5118 15.6598 12.1449 16.0503 12.5354C16.4408 12.9259 17.074 12.9259 17.4645 12.5354L20.2929 9.707Z" fill="currentColor"/>
              <path d="M3.70711 15.293C3.31658 15.6835 3.31658 16.3166 3.70711 16.7071L6.53553 19.5355C6.926 19.926 7.55917 19.926 7.94964 19.5355C8.34017 19.1451 8.34017 18.5119 7.94964 18.1214L5.82843 16.0001L7.94964 13.8788C8.34017 13.4883 8.34017 12.8552 7.94964 12.4647C7.55917 12.0742 6.926 12.0742 6.53553 12.4647L3.70711 15.293Z" fill="currentColor"/>
              <path d="M7 6H11V8H7V6Z" fill="currentColor"/>
              <path d="M7 10H17V12H7V10Z" fill="currentColor"/>
              <path d="M7 14H15V16H7V14Z" fill="currentColor"/>
              <path d="M7 18H11V20H7V18Z" fill="currentColor"/>
            </svg>
            <span className="font-bold text-lg">FitPlan Pro</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Your personalized workout planning solution</p>
        </div>
        <div className="text-gray-400 text-sm text-center md:text-right">
          <p>© 2025 FitPlan Pro. All rights reserved.</p>
          <p className="mt-1">Always consult a healthcare professional before starting any new exercise program.</p>
        </div>
      </div>
    </div>
  </footer>
);

// HomePage component (formerly in App component)
const HomePage = () => {
  const [showWorkoutPlan, setShowWorkoutPlan] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  const handleCreateWorkout = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setShowWorkoutPlan(true);
  };

  const handleCloseWorkoutPlan = () => {
    setShowWorkoutPlan(false);
  };
  
  return (
    <main className="container mx-auto p-4 md:p-8 mt-4 md:mt-8">
      {!showWorkoutPlan ? (
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Quick Setup</h3>
              <p className="text-gray-600">Create your personalized workout plan in just 3 simple steps</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Custom Plans</h3>
              <p className="text-gray-600">Tailored workouts based on your goals, equipment, and experience</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Detailed Instructions</h3>
              <p className="text-gray-600">Step-by-step guidance for each exercise in your plan</p>
            </div>
          </div>
          
          <WorkoutForm onCreateWorkout={handleCreateWorkout} />
        </div>
      ) : (
        userPreferences && (
          <WorkoutPlan 
            workoutEnvironment={userPreferences.workoutEnvironment}
            fitnessLevel={userPreferences.fitnessLevel}
            goals={userPreferences.goals}
            equipment={userPreferences.availableEquipment}
            workoutDays={userPreferences.workoutDays || []}
            planDuration={userPreferences.planDuration}
            onClose={handleCloseWorkoutPlan}
          />
        )
      )}
    </main>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
            <Route path="/templates" element={<WorkoutTemplates />} />
            <Route path="/builder" element={<WorkoutBuilder />} />
            <Route path="/calendar" element={<WorkoutCalendar />} />
            <Route path="/progress" element={<ProgressTracker />} />
          </Routes>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App; 