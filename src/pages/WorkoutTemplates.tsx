import React, { useState } from 'react';
import { workoutTemplates } from '../utils/workoutTemplates';
import { 
  WorkoutTemplate, 
  Exercise, 
  CustomWorkout, 
  CustomExercise, 
  WorkoutCalendarEvent,
  TemplateExercise,
  TemplateDay,
  isTemplateDay,
  isTemplateExercise
} from '../types';
import { exerciseDatabase } from '../utils/exerciseDatabase';
import useLocalStorage from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Unique goals and difficulty levels from the templates
const goals = ['All', ...Array.from(new Set(workoutTemplates.map(t => t.goal || 'Other')))];
const difficultyLevels = ['All', 'beginner', 'intermediate', 'advanced'];

const WorkoutTemplates: React.FC = () => {
  // State for category and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkoutTemplate[]>(workoutTemplates);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingTemplate, setSchedulingTemplate] = useState<WorkoutTemplate | null>(null);
  
  // Use localStorage hooks for custom workouts
  const [customWorkouts, setCustomWorkouts] = useLocalStorage<CustomWorkout[]>('custom-workouts', []);
  const [workoutEvents] = useLocalStorage<WorkoutCalendarEvent[]>('workout-calendar-events', []);
  const navigate = useNavigate();
  
  // Filter templates when filter criteria change
  React.useEffect(() => {
    let result = [...workoutTemplates];
    
    if (category !== 'All') {
      result = result.filter(template => template.goal === category);
    }
    
    if (difficulty !== 'All') {
      result = result.filter(template => template.difficulty === difficulty);
    }
    
    setFilteredTemplates(result);
  }, [category, difficulty]);
  
  // Get exercise details from exercise ID
  const getExerciseById = (id: string): Exercise | undefined => {
    const exercise = exerciseDatabase.find(exercise => exercise.id === id);
    if (!exercise) {
      console.warn(`Exercise with ID ${id} not found in the database`);
    }
    return exercise;
  };
  
  // Function to show template details
  const handleViewTemplate = (template: WorkoutTemplate) => {
    if (expandedTemplate === template.id) {
      // If already expanded, close it
      setExpandedTemplate(null);
      return;
    }
    
    setExpandedTemplate(template.id);
    setExpandedDay(null);
  };
  
  // Copy template to Custom Workouts (Workout Builder)
  const handleCopyToBuilder = (template: WorkoutTemplate) => {
    // Map TemplateDay[] to CustomExercise[] structure
    // For simplicity, this example flattens all days into one workout
    // A more complex approach could create multiple custom workouts or prompt user
    const allTemplateExercises = template.days.flatMap(day => day.exercises);
    
    const customExercises: CustomExercise[] = allTemplateExercises.map(item => {
      const exerciseDetail = getExerciseById(item.exerciseId);
      // Return a default/placeholder if exercise not found
      if (!exerciseDetail) {
        return {
          exercise: { id: item.exerciseId, name: `Unknown Exercise (${item.exerciseId})`, description: '', category: '', equipment: [], difficulty: 'beginner', instructions: [] },
          sets: item.sets,
          reps: typeof item.reps === 'number' ? item.reps.toString() : item.reps,
          restTime: item.restTime
        };
      }
      return {
        exercise: exerciseDetail,
        sets: item.sets,
        reps: typeof item.reps === 'number' ? item.reps.toString() : item.reps, // Ensure reps is string
        restTime: item.restTime
      };
    }).filter(Boolean) as CustomExercise[]; // Filter out potential nulls/undefined if error handling was different

    if (customExercises.length === 0) {
      toast.error('Could not extract exercises from this template.');
      return;
    }

    const newWorkoutName = `${template.name} (Copied)`;
    
    const nameConflict = customWorkouts.find(workout => workout.name === newWorkoutName);
    if (nameConflict) {
      toast.error(`A custom workout named "${newWorkoutName}" already exists. Rename or delete it in the Builder first.`);
      return;
    }

    // Create new custom workout from the template
    const newCustomWorkout: CustomWorkout = {
      id: uuidv4(),
      name: newWorkoutName,
      description: template.description || '',
      exercises: customExercises,
      createdAt: new Date().toISOString()
    };
    
    // Use callback form to ensure we're working with the latest state
    setCustomWorkouts(prevWorkouts => {
      console.log("Adding new custom workout from template:", newCustomWorkout);
      const newWorkouts = [...prevWorkouts, newCustomWorkout];
      console.log("New custom workouts state:", newWorkouts);
      return newWorkouts;
    });
    
    toast.success(`"${template.name}" copied to Workout Builder!`);
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
  
  // Function to prepare a template for adding to the calendar
  const handleScheduleTemplate = (template: WorkoutTemplate) => {
    setSchedulingTemplate(template);
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = () => {
    if (!schedulingTemplate) return;

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const currentDay = today.getDay();
    
    // Get plan duration - default to 8 weeks if not specified
    const planDuration = schedulingTemplate.planDuration || { value: 8, unit: 'weeks' as const };
    
    // Calculate how many weeks to schedule for
    const weeksToSchedule = planDuration.unit === 'weeks' 
      ? planDuration.value 
      : planDuration.value * 4; // Approximate weeks if unit is months
      
    console.log(`Scheduling plan for ${weeksToSchedule} weeks total`);
    
    // Create all events for the full plan duration
    const events: Array<{
      id: string;
      title: string;
      start: Date;
      end: Date;
      templateId: string;
      type: 'template';
      planId: string;
    }> = [];
    
    // For each week in the plan duration
    for (let week = 0; week < weeksToSchedule; week++) {
      // For each selected day of the week
      selectedDays.forEach((selectedDayIndex, i) => {
        // Calculate the next occurrence of this day
        let daysUntilNext = selectedDayIndex - currentDay;
        
        // If it's the current day, still schedule it for today (daysUntilNext = 0)
        // For past days in the week, schedule for next week (daysUntilNext + 7)
        if (daysUntilNext < 0) {
          daysUntilNext += 7; // Schedule for next week
        }
        
        // Add the weeks offset (7 days per week)
        const daysToAdd = daysUntilNext + (week * 7);
        
        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + daysToAdd);
        
        // Get the corresponding workout day from the template (cycle through days if needed)
        const templateDayIndex = i % schedulingTemplate.days.length;
        const workoutDay = schedulingTemplate.days[templateDayIndex];
        
        // Create event with workout day information
        events.push({
          id: uuidv4(),
          title: `${schedulingTemplate.name} - ${workoutDay.name}`,
          start: eventDate,
          end: new Date(eventDate.getTime() + (schedulingTemplate.duration * 60 * 1000)), // Use template session duration
          templateId: schedulingTemplate.id,
          type: 'template' as const,
          planId: schedulingTemplate.id
        });
      });
    }
    
    // Store events in sessionStorage
    const pendingEvents = JSON.stringify(events);
    console.log(`WorkoutTemplates - Scheduling ${events.length} events across ${weeksToSchedule} weeks`);
    sessionStorage.setItem('pendingEvents', pendingEvents);
    
    // Close the schedule modal
    setShowScheduleModal(false);
    setSelectedDays([]);
    
    // Navigate to calendar page
    navigate('/calendar');
  };

  // Format a date to MM/DD/YYYY
  const formatDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Workout Templates</h1>
      
      {!expandedTemplate ? (
        <div>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-3">Find Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Goal</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
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
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    {renderDifficultyTag(template.difficulty)}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {template.equipment.map((item, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                        {item}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3 text-sm">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>{template.frequency || '3-4'} days/week</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{template.duration} mins/session</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>{template.goal || 'General'}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {template.planDuration 
                          ? `${template.planDuration.value} ${template.planDuration.unit}` 
                          : '8-12 weeks'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <button 
                      onClick={() => handleViewTemplate(template)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      View Details
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-500">{template.days.length} workouts</span>
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    <button 
                      onClick={() => handleCopyToBuilder(template)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Copy to Builder
                    </button>
                    <button 
                      onClick={() => handleScheduleTemplate(template)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Add to Calendar
                    </button>
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
        </div>
      ) : (
        (() => {
          // Get the selected template
          const selectedTemplate = filteredTemplates.find(t => t.id === expandedTemplate);
          if (!selectedTemplate) return null;
          
          return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Template details header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
                  <button
                    onClick={() => setExpandedTemplate(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <span className="text-gray-500 block text-sm">Workout Duration</span>
                    <span className="font-medium">{selectedTemplate.duration} minutes/session</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-sm">Frequency</span>
                    <span className="font-medium">{selectedTemplate.frequency || '3-4'} days/week</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-sm">Program Duration</span>
                    <div className="flex items-center">
                      <span className="font-medium">
                        {selectedTemplate.planDuration 
                          ? `${selectedTemplate.planDuration.value} ${selectedTemplate.planDuration.unit}` 
                          : '8-12 weeks'} 
                      </span>
                      <div className="relative ml-2 group">
                        <div className="text-blue-600 cursor-help">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <p className="font-semibold mb-1">Scientific Recommendation:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Beginners typically see significant strength gains in 6-8 weeks of consistent training (Abe et al., 2000)</li>
                            <li>Weight loss programs are most effective with 12+ weeks of sustained adherence (Donnelly et al., 2009)</li>
                            <li>Muscle hypertrophy programs show optimal results after 8-12 weeks (Schoenfeld et al., 2017)</li>
                            <li>Initial fitness adaptations occur in 4-6 weeks, but sustainable results require 12+ weeks (ACSM, 2009)</li>
                            <li>For elite athletes, periodized training blocks of 4-8 weeks optimize performance (Bompa & Haff, 2009)</li>
                          </ul>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500 block text-sm mb-2">Equipment Needed</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.equipment.length > 0 ? (
                      selectedTemplate.equipment.map((item, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No special equipment needed</span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleCopyToBuilder(selectedTemplate)}
                  className="mt-6 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Copy to Builder
                </button>
                
                <button
                  onClick={() => handleScheduleTemplate(selectedTemplate)}
                  className="mt-6 ml-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Add to Calendar
                </button>
              </div>
              
              {/* Workout days */}
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
                                  {exercises.map((item: TemplateExercise, exIndex) => {
                                    // Handle both template exercise format and workout day format
                                    const exercise = getExerciseById(item.exerciseId);
                                    
                                    if (!exercise) {
                                      return (
                                        <li key={exIndex} className="py-3 flex flex-col">
                                          <div className="text-red-500">Exercise data missing (ID: {item.exerciseId || 'unknown'})</div>
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
              </div>
            </div>
          );
        })()
      )}

      {/* Schedule Modal */}
      {showScheduleModal && schedulingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Schedule Workout Days</h2>
            <p className="mb-4">
              This plan requires {schedulingTemplate.days.length} workout days. 
              Please select {schedulingTemplate.days.length} days for your workouts:
            </p>
            
            <div className="space-y-2 mb-4">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                <label key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(index)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (selectedDays.length < schedulingTemplate.days.length) {
                          setSelectedDays([...selectedDays, index]);
                        } else {
                          toast.error(`You can only select ${schedulingTemplate.days.length} days for this plan.`);
                        }
                      } else {
                        setSelectedDays(selectedDays.filter(d => d !== index));
                      }
                    }}
                    className="rounded text-purple-600"
                    disabled={selectedDays.length >= schedulingTemplate.days.length && !selectedDays.includes(index)}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSchedulingTemplate(null);
                  setSelectedDays([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleConfirm}
                disabled={selectedDays.length !== schedulingTemplate.days.length}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutTemplates; 