import React, { useState, useEffect } from 'react';
import { workoutTemplates } from '../utils/workoutTemplates';
import { Exercise, WorkoutPlan, TemplateExercise, TemplateDay } from '../types';
import { exerciseDatabase } from '../utils/exerciseDatabase';
import useLocalStorage from '../hooks/useLocalStorage';

// Type for the saved template with workout data
interface SavedTemplate {
  id: string;
  templateId: string;
  name: string;
  savedDate: string;
}

const WorkoutTemplates: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutPlan | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkoutPlan[]>(workoutTemplates);
  const [savedTemplates, setSavedTemplates] = useLocalStorage<SavedTemplate[]>('saved-workout-templates', []);
  
  // Unique goals and difficulty levels from the templates
  const goals = ['All', ...Array.from(new Set(workoutTemplates.map(t => t.goal || 'Other')))];
  const difficultyLevels = ['All', 'beginner', 'intermediate', 'advanced'];
  
  // Filter templates when filter criteria change
  useEffect(() => {
    let result = [...workoutTemplates];
    
    if (selectedGoal !== 'All') {
      result = result.filter(template => template.goal === selectedGoal);
    }
    
    if (selectedDifficulty !== 'All') {
      result = result.filter(template => template.difficulty === selectedDifficulty);
    }
    
    setFilteredTemplates(result);
  }, [selectedGoal, selectedDifficulty]);
  
  // Get exercise details from exercise ID
  const getExerciseById = (id: string): Exercise | undefined => {
    return exerciseDatabase.find(exercise => exercise.id === id);
  };
  
  // View template details
  const handleViewTemplate = (template: WorkoutPlan) => {
    setSelectedTemplate(template);
    setShowDetails(true);
    setExpandedDay(null);
  };
  
  // Save template to user's saved workouts
  const handleSaveTemplate = (template: WorkoutPlan) => {
    const newSavedTemplate: SavedTemplate = {
      id: Date.now().toString(),
      templateId: template.id,
      name: template.name,
      savedDate: new Date().toISOString()
    };
    
    setSavedTemplates([...savedTemplates, newSavedTemplate]);
    alert(`"${template.name}" has been saved to your workouts!`);
  };
  
  // Remove template from saved workouts
  const handleRemoveSavedTemplate = (id: string) => {
    setSavedTemplates(savedTemplates.filter(template => template.id !== id));
  };
  
  // Check if a template is already saved
  const isTemplateSaved = (templateId: string): boolean => {
    return savedTemplates.some(saved => saved.templateId === templateId);
  };
  
  // Toggle day expansion in template details
  const toggleDayExpansion = (index: number) => {
    if (expandedDay === index) {
      setExpandedDay(null);
    } else {
      setExpandedDay(index);
    }
  };
  
  // Format difficulty text for display
  const formatDifficulty = (difficulty: string): string => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };
  
  // Render a tag with color based on difficulty
  const renderDifficultyTag = (difficulty: string) => {
    let bgColor = 'bg-green-100 text-green-800';
    
    if (difficulty === 'intermediate') {
      bgColor = 'bg-yellow-100 text-yellow-800';
    } else if (difficulty === 'advanced') {
      bgColor = 'bg-red-100 text-red-800';
    }
    
    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bgColor}`}>
        {formatDifficulty(difficulty)}
      </span>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Workout Templates</h1>
      
      {!showDetails ? (
        <div>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-3">Find Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Goal</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                >
                  {goals.map((goal) => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Difficulty</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  {difficultyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level === 'All' ? 'All' : formatDifficulty(level)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Template Listing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{template.name}</h3>
                    {renderDifficultyTag(template.difficulty)}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {template.goal}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {template.frequency} days/week
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {template.duration} min
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.equipment.map((item, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleViewTemplate(template)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    
                    {isTemplateSaved(template.id) ? (
                      <button
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                        disabled
                      >
                        Saved
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSaveTemplate(template)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Saved Templates */}
          {savedTemplates.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Your Saved Templates</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {savedTemplates.map((saved) => {
                    const template = workoutTemplates.find(t => t.id === saved.templateId);
                    return (
                      <li key={saved.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-800">{saved.name}</h3>
                            <p className="text-gray-500 text-sm">Saved on {new Date(saved.savedDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => template && handleViewTemplate(template)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleRemoveSavedTemplate(saved.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        selectedTemplate && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Template Details Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{selectedTemplate.name}</h2>
                  <p className="text-blue-100 mt-1">{selectedTemplate.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-white bg-opacity-20 text-white text-sm px-2 py-1 rounded">
                      {selectedTemplate.goal}
                    </span>
                    <span className="bg-white bg-opacity-20 text-white text-sm px-2 py-1 rounded">
                      {formatDifficulty(selectedTemplate.difficulty)}
                    </span>
                    <span className="bg-white bg-opacity-20 text-white text-sm px-2 py-1 rounded">
                      {selectedTemplate.frequency} days/week
                    </span>
                    <span className="bg-white bg-opacity-20 text-white text-sm px-2 py-1 rounded">
                      {selectedTemplate.duration} min
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowDetails(false)}
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
                >
                  Back to List
                </button>
              </div>
            </div>
            
            {/* Days Listing */}
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-4">Workout Schedule</h3>
              
              <div className="space-y-4">
                {(selectedTemplate.days as TemplateDay[]).map((day, dayIndex) => (
                  <div key={dayIndex} className="border rounded-lg overflow-hidden">
                    <div
                      className={`p-4 cursor-pointer ${
                        expandedDay === dayIndex ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                      onClick={() => toggleDayExpansion(dayIndex)}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{day.name}</h4>
                        <svg
                          className={`w-5 h-5 transition-transform ${
                            expandedDay === dayIndex ? 'transform rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    
                    {expandedDay === dayIndex && (
                      <div className="p-4 border-t">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Exercise
                              </th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sets
                              </th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reps
                              </th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rest
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {day.exercises.map((exerciseItem: TemplateExercise, exIndex) => {
                              const exercise = getExerciseById(exerciseItem.exerciseId);
                              
                              return exercise ? (
                                <tr key={exIndex}>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {exercise.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {exercise.equipment.join(', ')}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {exerciseItem.sets}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {exerciseItem.reps}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {exerciseItem.restTime}s
                                  </td>
                                </tr>
                              ) : (
                                <tr key={exIndex}>
                                  <td colSpan={4} className="px-3 py-2 text-sm text-red-500">
                                    Exercise not found: {exerciseItem.exerciseId}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Save Template Button */}
              <div className="mt-6 flex justify-end">
                {isTemplateSaved(selectedTemplate.id) ? (
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    disabled
                  >
                    Already Saved
                  </button>
                ) : (
                  <button
                    onClick={() => handleSaveTemplate(selectedTemplate)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save This Template
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default WorkoutTemplates; 