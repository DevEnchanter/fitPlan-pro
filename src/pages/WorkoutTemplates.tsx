import React, { useState, useEffect } from 'react';
import { workoutTemplates } from '../utils/workoutTemplates';
import { Exercise, WorkoutPlan, TemplateExercise, TemplateDay, isTemplateDay, isTemplateExercise } from '../types';
import { exerciseDatabase } from '../utils/exerciseDatabase';
import useLocalStorage from '../hooks/useLocalStorage';

// Type for the saved template with workout data
interface SavedTemplate {
  id: string;
  templateId: string;
  name: string;
  savedDate: string;
  version: number; // Add version tracking
  goal?: string;
  difficulty?: string;
  days: any[]; // Store complete day data
}

const WorkoutTemplates: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutPlan | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkoutPlan[]>(workoutTemplates);
  const [savedTemplates, setSavedTemplates] = useLocalStorage<SavedTemplate[]>('saved-workout-templates', []);
  
  // Add versioning constant - increment this when template structure changes
  const TEMPLATE_VERSION = 1;
  
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
    const exercise = exerciseDatabase.find(exercise => exercise.id === id);
    if (!exercise) {
      console.warn(`Exercise with ID ${id} not found in the database`);
    }
    return exercise;
  };
  
  // View template details
  const handleViewTemplate = (template: WorkoutPlan) => {
    if (!template) {
      console.error('Attempted to view undefined template');
      return;
    }
    
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
      savedDate: new Date().toISOString(),
      version: TEMPLATE_VERSION,
      goal: template.goal,
      difficulty: template.difficulty,
      days: template.days // Store complete day data
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
  
  // Get template data, either from current templates or saved data
  const getTemplateData = (savedTemplate: SavedTemplate): WorkoutPlan => {
    // First try to find the template in the current templates
    const currentTemplate = workoutTemplates.find(t => t.id === savedTemplate.templateId);
    
    // If found and versions match, use current template
    if (currentTemplate && savedTemplate.version === TEMPLATE_VERSION) {
      return currentTemplate;
    }
    
    // Otherwise, construct from saved data
    return {
      id: savedTemplate.templateId,
      name: savedTemplate.name,
      goal: savedTemplate.goal,
      difficulty: savedTemplate.difficulty || 'beginner',
      days: savedTemplate.days || [],
      duration: 45, // Default values if not saved
      equipment: [],
      frequency: 3
    };
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
          
          {/* No templates found message */}
          {filteredTemplates.length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-lg shadow-inner">
              <p className="text-lg text-gray-600">No templates found with the selected filters.</p>
              <p className="mt-2">Try changing your filter criteria.</p>
            </div>
          )}
          
          {/* Saved Templates */}
          {savedTemplates.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Your Saved Templates</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {savedTemplates.map((saved) => {
                    const templateData = getTemplateData(saved);
                    return (
                      <li key={saved.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-800">{saved.name}</h3>
                            <p className="text-gray-500 text-sm">
                              Saved on {new Date(saved.savedDate).toLocaleDateString()}
                              {saved.version !== TEMPLATE_VERSION && (
                                <span className="ml-2 text-orange-500">(Using saved version)</span>
                              )}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewTemplate(templateData)}
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
            {/* Template details header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">{selectedTemplate.description || 'No description available.'}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-500 block text-sm">Goal</span>
                  <span className="font-medium">{selectedTemplate.goal || 'General fitness'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-sm">Difficulty</span>
                  <span className="font-medium">{formatDifficulty(selectedTemplate.difficulty)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-sm">Duration</span>
                  <span className="font-medium">{selectedTemplate.duration} minutes</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-sm">Frequency</span>
                  <span className="font-medium">{selectedTemplate.frequency || '3-4'} days/week</span>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-gray-500 block text-sm mb-2">Equipment Needed</span>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.equipment && selectedTemplate.equipment.length > 0 ? (
                    selectedTemplate.equipment.map((item, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-600">No equipment specified</span>
                  )}
                </div>
              </div>
              
              {!isTemplateSaved(selectedTemplate.id) ? (
                <button
                  onClick={() => handleSaveTemplate(selectedTemplate)}
                  className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Save This Workout
                </button>
              ) : (
                <button
                  className="mt-6 bg-gray-300 text-gray-700 py-2 px-4 rounded cursor-not-allowed"
                  disabled
                >
                  Already Saved
                </button>
              )}
            </div>
            
            {/* Workout schedule */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Workout Schedule</h3>
              
              {!selectedTemplate.days || selectedTemplate.days.length === 0 ? (
                <p className="text-gray-500">No workout days defined in this template.</p>
              ) : (
                <div className="space-y-4">
                  {selectedTemplate.days.map((day, dayIndex) => {
                    if (!day) return null;
                    
                    const dayName = isTemplateDay(day) ? day.name : `Day ${dayIndex + 1}`;
                    const exercises = 'exercises' in day ? day.exercises : [];
                    
                    return (
                      <div key={dayIndex} className="mb-4">
                        <div 
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer"
                          onClick={() => toggleDayExpansion(dayIndex)}
                        >
                          <h3 className="font-semibold">{dayName}</h3>
                          <span>
                            {expandedDay === dayIndex ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </span>
                        </div>
                        
                        {expandedDay === dayIndex && (
                          <div className="mt-2 p-4 bg-white rounded-lg border border-gray-100">
                            {exercises.length === 0 ? (
                              <p className="text-gray-500">No exercises defined for this day.</p>
                            ) : (
                              <ul className="divide-y divide-gray-100">
                                {exercises.map((item: any, exIndex) => {
                                  // Handle both template exercise format and workout day format
                                  const exerciseId = isTemplateExercise(item) ? item.exerciseId : item.exercise?.id;
                                  const exercise = isTemplateExercise(item) ? getExerciseById(item.exerciseId) : item.exercise;
                                  
                                  if (!exercise) {
                                    return (
                                      <li key={exIndex} className="py-3 flex flex-col">
                                        <div className="text-red-500">Exercise data missing (ID: {exerciseId || 'unknown'})</div>
                                      </li>
                                    );
                                  }
                                  
                                  return (
                                    <li key={exIndex} className="py-3 flex flex-col">
                                      <div className="flex justify-between">
                                        <span className="font-medium">{exercise.name}</span>
                                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                          {item.sets} sets × {item.reps} reps
                                        </span>
                                      </div>
                                      <div className="text-gray-500 text-sm mt-1">{exercise.description}</div>
                                      <div className="flex items-center mt-2 text-sm text-gray-600">
                                        <span className="mr-4">Rest: {item.restTime}s</span>
                                        <span>{renderDifficultyTag(exercise.difficulty)}</span>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
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