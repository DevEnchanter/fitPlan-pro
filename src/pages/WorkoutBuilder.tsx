import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { exerciseDatabase } from '../utils/exerciseDatabase';
import useLocalStorage from '../hooks/useLocalStorage';

type CustomExercise = {
  exercise: Exercise;
  sets: number;
  reps: string;
  restTime: number;
};

type CustomWorkout = {
  id: string;
  name: string;
  description: string;
  exercises: CustomExercise[];
  createdAt: string;
};

const WorkoutBuilder: React.FC = () => {
  // State for the workout being built
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<CustomExercise[]>([]);
  
  // State for exercise selection
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(exerciseDatabase);
  
  // Saved workouts
  const [savedWorkouts, setSavedWorkouts] = useLocalStorage<CustomWorkout[]>('custom-workouts', []);
  
  // Get unique categories and equipment for filters
  const categories = ['All', ...Array.from(new Set(exerciseDatabase.map(exercise => exercise.category)))];
  const equipmentOptions = ['All', ...Array.from(new Set(exerciseDatabase.flatMap(exercise => exercise.equipment)))];
  
  // Filter exercises based on selected filters
  useEffect(() => {
    let result = exerciseDatabase;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        ex => ex.name.toLowerCase().includes(query) || ex.description.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter !== 'All') {
      result = result.filter(ex => ex.category === categoryFilter);
    }
    
    if (equipmentFilter !== 'All') {
      result = result.filter(ex => ex.equipment.includes(equipmentFilter));
    }
    
    setFilteredExercises(result);
  }, [searchQuery, categoryFilter, equipmentFilter]);
  
  // Add exercise to workout
  const addExerciseToWorkout = (exercise: Exercise) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        exercise,
        sets: 3,
        reps: '10-12',
        restTime: 60
      }
    ]);
  };
  
  // Remove exercise from workout
  const removeExerciseFromWorkout = (index: number) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises.splice(index, 1);
    setSelectedExercises(updatedExercises);
  };
  
  // Update exercise details
  const updateExerciseDetails = (index: number, field: keyof Omit<CustomExercise, 'exercise'>, value: any) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setSelectedExercises(updatedExercises);
  };
  
  // Reorder exercises in the workout
  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === selectedExercises.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedExercises = [...selectedExercises];
    const temp = updatedExercises[index];
    updatedExercises[index] = updatedExercises[newIndex];
    updatedExercises[newIndex] = temp;
    setSelectedExercises(updatedExercises);
  };
  
  // Save workout
  const saveWorkout = () => {
    // Validate inputs
    const trimmedName = workoutName.trim();
    const trimmedDescription = workoutDescription.trim();
    
    if (!trimmedName || selectedExercises.length === 0) return;
    
    const newWorkout: CustomWorkout = {
      id: Date.now().toString(),
      name: trimmedName,
      description: trimmedDescription,
      exercises: selectedExercises,
      createdAt: new Date().toISOString()
    };
    
    setSavedWorkouts([...savedWorkouts, newWorkout]);
    
    // Reset form
    setWorkoutName('');
    setWorkoutDescription('');
    setSelectedExercises([]);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Custom Workout Builder</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise Selection Panel */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Exercise Library</h2>
          
          {/* Search and Filters */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search exercises..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={equipmentFilter}
                  onChange={(e) => setEquipmentFilter(e.target.value)}
                >
                  {equipmentOptions.map((equipment) => (
                    <option key={equipment} value={equipment}>{equipment}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Exercise List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <div 
                  key={exercise.id}
                  className="border border-gray-200 rounded-md p-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{exercise.name}</h3>
                      <p className="text-xs text-gray-500">{exercise.category} • {exercise.difficulty}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {exercise.equipment.map((item, i) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      onClick={() => addExerciseToWorkout(exercise)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No exercises found matching your criteria.
              </div>
            )}
          </div>
        </div>
        
        {/* Workout Builder Panel */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Build Your Workout</h2>
          
          {/* Workout Details */}
          <div className="mb-6">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Workout Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="My Custom Workout"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
                placeholder="A brief description of your workout goal or focus"
                value={workoutDescription}
                onChange={(e) => setWorkoutDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
          
          {/* Selected Exercises */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Selected Exercises</h3>
            
            {selectedExercises.length > 0 ? (
              <div className="space-y-4">
                {selectedExercises.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">{item.exercise.name}</h4>
                      <div className="flex space-x-1">
                        <button
                          className="text-gray-500 hover:text-blue-500"
                          onClick={() => moveExercise(index, 'up')}
                          disabled={index === 0}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          className="text-gray-500 hover:text-blue-500"
                          onClick={() => moveExercise(index, 'down')}
                          disabled={index === selectedExercises.length - 1}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          className="text-gray-500 hover:text-red-500"
                          onClick={() => removeExerciseFromWorkout(index)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Sets</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          value={item.sets}
                          onChange={(e) => updateExerciseDetails(index, 'sets', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reps</label>
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          value={item.reps}
                          onChange={(e) => updateExerciseDetails(index, 'reps', e.target.value)}
                          placeholder="e.g., 10 or 8-12"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rest (secs)</label>
                        <input
                          type="number"
                          min="0"
                          step="5"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          value={item.restTime}
                          onChange={(e) => updateExerciseDetails(index, 'restTime', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No exercises added</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start adding exercises from the library on the left.
                </p>
              </div>
            )}
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={saveWorkout}
              disabled={!workoutName || selectedExercises.length === 0}
            >
              Save Workout
            </button>
          </div>
        </div>
      </div>
      
      {/* Saved Workouts Section */}
      {savedWorkouts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Saved Workouts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedWorkouts.map((workout) => (
              <div key={workout.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{workout.name}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {workout.description || 'No description provided'}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Created: {new Date(workout.createdAt).toLocaleDateString()}
                </p>
                <div className="space-y-1">
                  {workout.exercises.map((exercise, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{exercise.exercise.name}</span>
                      <span className="text-gray-500"> - {exercise.sets} sets x {exercise.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutBuilder; 