import React, { useState, useEffect } from 'react';
import { Exercise, CustomExercise, CustomWorkout } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import useExerciseFilter from '../hooks/useExerciseFilter';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const WorkoutBuilder: React.FC = () => {
  // State for the workout being built
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<CustomExercise[]>([]);
  
  // Use hook for exercise selection filtering
  const {
    searchTerm: searchQuery,
    setSearchTerm: setSearchQuery,
    category: categoryFilter,
    setCategory: setCategoryFilter,
    equipment: equipmentFilter,
    setEquipment: setEquipmentFilter,
    filteredExercises,
    categories,
    equipmentOptions
  } = useExerciseFilter();
  
  // State for editing
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  
  // Saved workouts
  const [savedWorkouts, setSavedWorkouts] = useLocalStorage<CustomWorkout[]>('custom-workouts', []);
  
  // State for Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workoutToDeleteId, setWorkoutToDeleteId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
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
  
  // Update exercise details - use specific types for value based on field
  const updateExerciseDetails = (
    index: number, 
    field: keyof Omit<CustomExercise, 'exercise'>, 
    value: string | number // More specific than 'any'
  ) => {
    const updatedExercises = [...selectedExercises];
    const currentExercise = updatedExercises[index];

    // Type assertion or checking based on field might be needed if parsing required
    let processedValue = value;
    if (field === 'sets' || field === 'restTime') {
      processedValue = typeof value === 'string' ? parseInt(value) || (field === 'sets' ? 1 : 0) : value;
    } 

    updatedExercises[index] = {
      ...currentExercise,
      [field]: processedValue
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
  
  // Save or Update workout
  const saveOrUpdateWorkout = () => {
    console.log("saveOrUpdateWorkout called"); // Log start
    console.log("Current savedWorkouts:", savedWorkouts); // Log existing state
    const trimmedName = workoutName.trim();
    const trimmedDescription = workoutDescription.trim();
    console.log("Workout Name:", trimmedName, "Exercises Count:", selectedExercises.length);
    
    if (!trimmedName || selectedExercises.length === 0) {
      console.log("Validation failed: Name or exercises missing."); // Log validation fail
      toast.error("Please enter a workout name and add at least one exercise.");
      return;
    }
    
    if (editingWorkoutId) {
      console.log("Attempting to UPDATE workout ID:", editingWorkoutId);
      const nameConflict = savedWorkouts.find(
        workout => workout.id !== editingWorkoutId && workout.name === trimmedName
      );
      if (nameConflict) {
        console.log("Update failed: Name conflict found."); // Log name conflict
        toast.error(`Another workout named "${trimmedName}" already exists. Please choose a different name.`);
        return;
      }
      
      console.log("Updating workout..."); // Log update action
      // Use a callback to ensure we're working with the latest state
      setSavedWorkouts(prevWorkouts => {
        const updatedWorkouts = prevWorkouts.map(workout => 
          workout.id === editingWorkoutId 
            ? { ...workout, name: trimmedName, description: trimmedDescription, exercises: selectedExercises } 
            : workout
        );
        console.log("New workouts after update:", updatedWorkouts); // Log new state
        return updatedWorkouts;
      });
      
      toast.success('Workout updated successfully!');
      console.log("Workout updated."); // Log success
    } else {
      console.log("Attempting to SAVE NEW workout.");
      const nameConflict = savedWorkouts.find(workout => workout.name === trimmedName);
      if (nameConflict) {
        console.log("Save failed: Name conflict found."); // Log name conflict
        toast.error(`A workout named "${trimmedName}" already exists. Please choose a different name or edit the existing one.`);
        return;
      }
      
      const newWorkout: CustomWorkout = {
        id: uuidv4(),
        name: trimmedName,
        description: trimmedDescription,
        exercises: selectedExercises,
        createdAt: new Date().toISOString()
      };
      console.log("Saving new workout:", newWorkout); // Log save action
      
      // Use a callback to ensure we're working with the latest state
      setSavedWorkouts(prevWorkouts => {
        const newWorkouts = [...prevWorkouts, newWorkout];
        console.log("New workouts state:", newWorkouts);
        return newWorkouts;
      });
      
      toast.success('Workout saved successfully!');
      console.log("New workout saved."); // Log success
    }
    
    console.log("Resetting form."); // Log form reset
    resetForm();
  };

  // Start editing a workout
  const startEditing = (workout: CustomWorkout) => {
    setEditingWorkoutId(workout.id);
    setWorkoutName(workout.name);
    setWorkoutDescription(workout.description);
    setSelectedExercises(workout.exercises);
    // Optionally scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // Cancel editing
  const cancelEditing = () => {
    resetForm();
  };

  // Reset form fields and editing state
  const resetForm = () => {
    setEditingWorkoutId(null);
    setWorkoutName('');
    setWorkoutDescription('');
    setSelectedExercises([]);
  };

  // Delete a saved workout - triggers confirmation modal
  const deleteWorkout = (id: string) => {
    // Store the ID and open the modal instead of confirming directly
    setWorkoutToDeleteId(id);
    setIsDeleteModalOpen(true);
  };
  
  // Handles the confirmation action from the delete modal
  const handleDeleteConfirmation = (confirm: boolean) => {
    if (confirm && workoutToDeleteId) {
      // Use callback form to ensure we're working with the latest state
      setSavedWorkouts(prevWorkouts => {
        return prevWorkouts.filter(workout => workout.id !== workoutToDeleteId);
      });
      
      toast.success('Workout deleted.');
      // If currently editing the deleted workout, reset the form
      if (editingWorkoutId === workoutToDeleteId) {
        resetForm();
      }
    }
    // Always close the modal and clear the ID
    setIsDeleteModalOpen(false);
    setWorkoutToDeleteId(null);
  };
  
  // Function to prepare a saved workout for adding to the calendar
  const handleScheduleWorkout = (workout: CustomWorkout) => {
    console.log("handleScheduleWorkout called for:", workout.name);
    const eventData = {
      title: workout.name,
      type: 'custom',
    };
    try {
      // Use sessionStorage instead of localStorage for more reliable cross-page persistence
      sessionStorage.setItem('pending-calendar-add', JSON.stringify(eventData));
      console.log("Stored in sessionStorage:", sessionStorage.getItem('pending-calendar-add'));
      toast.success(`"${workout.name}" is ready to add to the calendar. Click a date on the Calendar page.`, { duration: 5000 });
      // Navigate programmatically to calendar
      navigate('/calendar'); 
    } catch (error) {
      console.error("Error setting sessionStorage:", error);
      toast.error("Could not prepare workout for scheduling.");
    }
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
                          onChange={(e) => updateExerciseDetails(index, 'sets', e.target.value)}
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
                          onChange={(e) => updateExerciseDetails(index, 'restTime', e.target.value)}
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
          
          {/* Save/Update Button */}
          <div className="flex justify-end space-x-2">
            {editingWorkoutId && (
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => {
                  console.log("Cancel Edit button clicked");
                  cancelEditing();
                }}
              >
                Cancel Edit
              </button>
            )}
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={() => {
                console.log("Save/Update button clicked");
                saveOrUpdateWorkout();
              }}
              disabled={!workoutName || selectedExercises.length === 0}
            >
              {editingWorkoutId ? 'Update Workout' : 'Save Workout'}
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
              <div key={workout.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{workout.name}</h3>
                <p className="text-sm text-gray-500 mb-3 flex-grow">
                  {workout.description || 'No description provided'}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Created: {new Date(workout.createdAt).toLocaleDateString()}
                </p>
                <div className="space-y-1 mb-4">
                  {workout.exercises.slice(0, 3).map((exercise, i) => (
                    <div key={i} className="text-sm truncate">
                      <span className="font-medium">{exercise.exercise.name}</span>
                      <span className="text-gray-500"> - {exercise.sets} sets x {exercise.reps}</span>
                    </div>
                  ))}
                  {workout.exercises.length > 3 && (
                    <div className="text-sm text-gray-500">... and {workout.exercises.length - 3} more</div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-auto">
                   <button
                     onClick={() => startEditing(workout)}
                     className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                   >
                     Edit
                   </button>
                   <button
                     onClick={() => deleteWorkout(workout.id)}
                     className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                   >
                     Delete
                   </button>
                   {/* Add to Calendar Button */}
                   <button
                     onClick={() => {
                       console.log("Add to Calendar button clicked for workout:", workout.name);
                       handleScheduleWorkout(workout);
                     }}
                     className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                   >
                     Add to Calendar
                   </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this workout? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => handleDeleteConfirmation(false)} // Call handler with false
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                onClick={() => handleDeleteConfirmation(true)} // Call handler with true
              >
                Delete Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutBuilder; 