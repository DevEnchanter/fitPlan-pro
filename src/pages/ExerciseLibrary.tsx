import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { exerciseDatabase } from '../utils/exerciseDatabase';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">{exercise.name}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : 
            exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
          </span>
        </div>
        <p className="text-gray-600 text-sm mt-1">{exercise.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {exercise.equipment.map((item, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {item}
            </span>
          ))}
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 text-blue-600 text-sm font-medium flex items-center"
        >
          {showDetails ? 'Hide details' : 'Show details'}
          <svg
            className={`ml-1 w-4 h-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      {showDetails && (
        <div className="px-4 pb-4 pt-1 bg-gray-50 border-t">
          <h4 className="font-semibold text-gray-700 mb-2">Instructions</h4>
          <ol className="list-decimal pl-5">
            {exercise.instructions.map((step, index) => (
              <li key={index} className="text-gray-600 text-sm mb-1">{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

const ExerciseLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(exerciseDatabase);

  // Get unique categories for filter
  const categories = ['All', ...Array.from(new Set(exerciseDatabase.map(exercise => exercise.category)))];
  
  // Get unique equipment options for filter
  const equipmentOptions = ['All', ...Array.from(new Set(exerciseDatabase.flatMap(exercise => exercise.equipment)))];
  
  // Difficulty levels
  const difficultyLevels = ['All', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    let result = [];
    
    try {
      // Start with full database
      result = [...exerciseDatabase];
      
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(
          exercise => 
            exercise.name.toLowerCase().includes(term) || 
            exercise.description.toLowerCase().includes(term)
        );
      }
      
      // Apply category filter
      if (selectedCategory !== 'All') {
        result = result.filter(exercise => exercise.category === selectedCategory);
      }
      
      // Apply equipment filter
      if (selectedEquipment !== 'All') {
        result = result.filter(exercise => exercise.equipment.includes(selectedEquipment));
      }
      
      // Apply difficulty filter
      if (selectedDifficulty !== 'All') {
        result = result.filter(exercise => exercise.difficulty === selectedDifficulty);
      }
    } catch (error) {
      console.error('Error filtering exercises:', error);
      result = exerciseDatabase; // Fallback to full database if there's an error
    }
    
    setFilteredExercises(result);
  }, [searchTerm, selectedCategory, selectedEquipment, selectedDifficulty]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Exercise Library</h1>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search exercises..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <select
              id="equipment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
            >
              {equipmentOptions.map((equipment) => (
                <option key={equipment} value={equipment}>{equipment}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              id="difficulty"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {difficultyLevels.map((level) => (
                <option key={level} value={level}>{level === 'All' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Exercise List */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No exercises found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary; 