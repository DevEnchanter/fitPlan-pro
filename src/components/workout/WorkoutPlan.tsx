import React, { useEffect, useState, useCallback } from 'react';
import { Exercise, WorkoutDay, UserPreferences } from '../../types';
import { exerciseDatabase } from '../../utils/exerciseDatabase';
import { useNavigate } from 'react-router-dom';
import { 
  createGoogleCalendarLink, 
  createIcsFileContent, 
  downloadIcsFile 
} from '../../utils/calendarExport';

interface WorkoutPlanProps {
  workoutEnvironment: string;
  fitnessLevel: string;
  goals: string[];
  equipment: string[];
  workoutDays: string[];
  planDuration: {
    value: number;
    unit: 'weeks' | 'months';
  };
  onClose: () => void;
}

const WorkoutPlan: React.FC<WorkoutPlanProps> = ({ 
  workoutEnvironment, 
  fitnessLevel, 
  goals, 
  equipment, 
  workoutDays,
  planDuration,
  onClose 
}) => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Generate a workout based on preferences
  const generateWorkout = useCallback(() => {
    setIsLoading(true);
    
    // Filter exercises based on available equipment
    const availableExercises = exerciseDatabase.filter(exercise => {
      // Handle exercises requiring no equipment
      if (exercise.equipment.includes('None')) {
        return true;
      }
      // Handle exercises requiring specific equipment
      // All required equipment must be in the user's available list
      return exercise.equipment.every(req => equipment.includes(req));
    });

    // Filter exercises based on environment (secondary check, primarily done by equipment)
    // This might be redundant if equipment lists are accurate per environment
    // const environmentFiltered = availableExercises.filter(exercise => ...);

    // Group exercises by category
    const exercisesByCategory: { [key: string]: Exercise[] } = {};
    availableExercises.forEach(exercise => {
      // Use a fallback category if needed
      const category = exercise.category || 'Uncategorized'; 
      if (!exercisesByCategory[category]) {
        exercisesByCategory[category] = [];
      }
      exercisesByCategory[category].push(exercise);
    });

    // Define relevant categories for goals
    const goalCategories: { [key: string]: string[] } = {
      'Strength': ['Upper Body Push', 'Upper Body Pull', 'Lower Body', 'Full Body'],
      'Muscle Gain': ['Upper Body Push', 'Upper Body Pull', 'Lower Body'],
      'Weight Loss': ['Cardio', 'Full Body', 'HIIT'], // Added HIIT
      'Endurance': ['Cardio', 'Full Body'],
      'Flexibility': ['Flexibility', 'Core'], // Assuming Flexibility category exists
      'General Fitness': ['Upper Body Push', 'Upper Body Pull', 'Lower Body', 'Core', 'Cardio', 'Full Body']
    };

    // Determine relevant categories based on *all* selected goals
    let relevantCategories = new Set<string>();
    goals.forEach(goal => {
      if (goalCategories[goal]) {
        goalCategories[goal].forEach(cat => relevantCategories.add(cat));
      }
    });

    // If no specific goals match or set is empty, use all available categories
    if (relevantCategories.size === 0) {
      relevantCategories = new Set(Object.keys(exercisesByCategory));
    }

    // Create workout days
    const workout: WorkoutDay[] = [];
    const difficultyLevels = {
      'beginner': { sets: 3, reps: '10-12', rest: 60 },
      'intermediate': { sets: 3, reps: '8-10', rest: 75 },
      'advanced': { sets: 4, reps: '6-8', rest: 90 }
    };

    // Assert fitnessLevel type to index difficultyLevels object
    const difficulty = difficultyLevels[fitnessLevel as keyof typeof difficultyLevels] || difficultyLevels.beginner;

    // Define target number of exercises per category group
    const exercisesPerDay = fitnessLevel === 'beginner' ? 4 : (fitnessLevel === 'intermediate' ? 5 : 6);

    // Generate workout for each selected day
    workoutDays.forEach(day => {
      let selectedExercisesForDay: { exercise: Exercise; sets: number; reps: string; restTime: number }[] = [];
      let usedExerciseIds = new Set<string>();

      // Prioritize categories based on goals if specific goals were selected
      const categoriesToUse = Array.from(relevantCategories);
      
      // Simple distribution: try to pick exercises evenly from relevant categories
      let exercisesNeeded = exercisesPerDay;
      let categoryIndex = 0;

      while (exercisesNeeded > 0 && categoriesToUse.length > 0) {
        const currentCategory = categoriesToUse[categoryIndex % categoriesToUse.length];
        const availableInCategory = (exercisesByCategory[currentCategory] || []).filter(ex => !usedExerciseIds.has(ex.id));

        if (availableInCategory.length > 0) {
          // Pick a random exercise from the category
          const randomIndex = Math.floor(Math.random() * availableInCategory.length);
          const chosenExercise = availableInCategory[randomIndex];

          selectedExercisesForDay.push({
            exercise: chosenExercise,
            sets: difficulty.sets,
            reps: difficulty.reps,
            restTime: difficulty.rest
          });
          usedExerciseIds.add(chosenExercise.id);
          exercisesNeeded--;
        }
        
        // Move to the next category, remove category if exhausted (or handle infinite loop potential)
        // Basic handling: remove if no exercises left for this attempt
        if (availableInCategory.length === 0) {
           categoriesToUse.splice(categoryIndex % categoriesToUse.length, 1);
           // Adjust index if needed after splice
           if (categoriesToUse.length === 0) break; // Exit if no categories left
           categoryIndex--; // Decrement index to re-evaluate the potentially new element at the current position
        } 

        categoryIndex++;
        // Prevent potential infinite loops if categories exist but have no selectable exercises
        if (categoryIndex > categoriesToUse.length * 2 && exercisesNeeded > 0) { 
             console.warn("Potential issue selecting exercises, breaking loop.");
             break; 
        }
      }

      workout.push({
        day,
        exercises: selectedExercisesForDay
      });
    });

    setWorkoutPlan(workout);
    setIsLoading(false);
    
    // After generating the workout, add it to the calendar
    addToCalendar(workout);
    
  }, [workoutEnvironment, fitnessLevel, goals, equipment, workoutDays]);

  // Add workout to calendar
  const addToCalendar = (workout: WorkoutDay[]) => {
    // Find the earliest selected weekday to use as the starting point
    const today = new Date();
    const dayIndices: Record<string, number> = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 
      'Friday': 5, 'Saturday': 6, 'Sunday': 0
    };
    
    // Sort workout days by their weekday index
    const sortedWorkoutDays = [...workoutDays].sort((a, b) => 
      (dayIndices[a] || 0) - (dayIndices[b] || 0)
    );
    
    // If no workout days, exit early
    if (sortedWorkoutDays.length === 0) {
      console.warn('No workout days specified, unable to add to calendar');
      return;
    }
    
    // Find days until the first workout day
    const firstWorkoutDay = sortedWorkoutDays[0];
    const currentDayIndex = today.getDay();
    const targetDayIndex = dayIndices[firstWorkoutDay] || 1;
    
    // Calculate days until first workout day (if today is the day, schedule for next week)
    let daysUntilStart = targetDayIndex - currentDayIndex;
    if (daysUntilStart <= 0) {
      daysUntilStart += 7;
    }
    
    // Calculate start date
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() + daysUntilStart);
    
    // Calculate how many weeks/months to generate
    let totalDays: number;
    if (planDuration.unit === 'weeks') {
      totalDays = planDuration.value * 7;
    } else {
      totalDays = planDuration.value * 30; // approximate for months
    }
    
    // Get existing calendar events
    const existingEvents = JSON.parse(localStorage.getItem('workout-calendar-events') || '[]');
    
    // Create new events for each workout day in the duration
    const newEvents = [];
    const workoutsByDay = workout.reduce((acc, day) => {
      if (!day || !day.day) {
        console.warn('Invalid workout day:', day);
        return acc;
      }
      acc[day.day] = day;
      return acc;
    }, {} as Record<string, WorkoutDay>);
    
    // Generate dates and events for the entire duration
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      const weekdayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (workoutsByDay[weekdayName]) {
        const workoutDay = workoutsByDay[weekdayName];
        if (!workoutDay.exercises || workoutDay.exercises.length === 0) {
          console.warn(`Skipping workout for ${weekdayName} as it has no exercises`);
          continue;
        }
        
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Calculate main workout type based on exercises
        const exerciseCategories = workoutDay.exercises.map(ex => ex.exercise?.category || 'unknown');
        let workoutType = 'strength';
        
        if (exerciseCategories.includes('Cardio') || exerciseCategories.includes('HIIT')) {
          workoutType = 'cardio';
        } else if (exerciseCategories.includes('Flexibility')) {
          workoutType = 'flexibility';
        }
        
        newEvents.push({
          date: dateString,
          title: `${workoutDay.exercises.length} Exercise Workout`,
          type: workoutType
        });
      }
    }
    
    // Combine with existing events, avoiding duplicates
    const existingDates = new Set(existingEvents.map((e: any) => e.date));
    const uniqueNewEvents = newEvents.filter(e => !existingDates.has(e.date));
    const combinedEvents = [...existingEvents, ...uniqueNewEvents];
    
    // Save to localStorage
    localStorage.setItem('workout-calendar-events', JSON.stringify(combinedEvents));
    
    console.log(`Added ${uniqueNewEvents.length} workout events to calendar spanning ${totalDays} days`);
  };

  // New function to handle exports using the utility functions
  const handleExport = (type: 'google' | 'apple') => {
    const eventsToExport = workoutPlan.flatMap(dayPlan => {
      const eventDate = findNextDateForDay(dayPlan.day); // Need a helper to find the *next* date for this weekday
      if (!eventDate) return []; // Skip if we can't find a date (shouldn't happen with valid days)

      return [{
        date: eventDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        title: `Workout: ${dayPlan.day} - ${dayPlan.exercises.length} exercises`,
        description: `FitPlan Pro Workout (${fitnessLevel}).\nExercises: ${dayPlan.exercises.map(ex => ex.exercise.name).join(', ')}`,
        durationHours: 1 // Default to 1 hour
        // startTime could potentially be added based on user preference if collected
      }];
    });

    if (eventsToExport.length === 0) {
      alert('No valid workout days to export.');
      return;
    }

    // TODO: Implement logic to find the *next* date for a given weekday
    // For now, this might export only the first occurrence or incorrect dates.
    // The full multi-week export logic from old functions needs integrating here
    // or adapting the calendarExport utils to handle recurrence/ranges.

    alert('Multi-day export logic needs refinement. Exporting first occurrences for now.'); 

    if (type === 'google') {
      // Open first event link for now (simplification)
      const link = createGoogleCalendarLink(eventsToExport[0]);
      if (link) {
        window.open(link, '_blank');
        alert(`Opened Google Calendar link for ${eventsToExport[0].title}. Multi-day export needs refinement.`);
      } else {
        alert('Could not generate Google Calendar link.');
      }
      // // Attempt to open multiple links (popup blocker issues likely)
      // eventsToExport.forEach((event, index) => {
      //   const link = createGoogleCalendarLink(event);
      //   if (link) {
      //     setTimeout(() => window.open(link, '_blank'), index * 500);
      //   }
      // });
      // alert(`Attempting to open ${eventsToExport.length} Google Calendar links...`);

    } else if (type === 'apple') {
      const icsContent = createIcsFileContent(eventsToExport);
      downloadIcsFile(icsContent, `fitplan_${workoutPlan[0]?.day?.toLowerCase()}.ics`);
      alert(`Generated ICS file for ${eventsToExport.length} workout(s).`);
    }
  };

  // Helper function placeholder (needs implementation)
  const findNextDateForDay = (dayName: string): Date | null => {
      // Simple placeholder: find the next date matching dayName starting from tomorrow
      const dayIndices: Record<string, number> = {
          'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
          'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };
      const targetDayIndex = dayIndices[dayName];
      if (targetDayIndex === undefined) return null;

      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow
      while (currentDate.getDay() !== targetDayIndex) {
          currentDate.setDate(currentDate.getDate() + 1);
      }
      return currentDate;
  };

  useEffect(() => {
    generateWorkout();
  }, [generateWorkout]);

  const handleSaveAndViewCalendar = () => {
    onClose();
    navigate('/calendar');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      {isLoading ? (
        <div className="flex flex-col items-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-700">Generating your personalized workout plan...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Personalized Workout Plan</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-blue-700">
                <span className="font-medium">Plan Duration:</span> {planDuration.value} {planDuration.unit}
              </p>
              <p className="text-blue-700 mt-1">
                Your plan has been added to the calendar. You can view and manage your schedule there.
              </p>
              <div className="mt-3 flex space-x-2">
                <button 
                  onClick={() => handleExport('google')}
                  className="inline-flex items-center px-3 py-1 rounded text-sm bg-white border border-blue-500 text-blue-700 hover:bg-blue-50"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#fff"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.2 14.8V7.2L16 12l-5.2 4.8z" fill="#4285F4"/>
                  </svg>
                  Add to Google Calendar
                </button>
                <button 
                  onClick={() => handleExport('apple')}
                  className="inline-flex items-center px-3 py-1 rounded text-sm bg-white border border-blue-500 text-blue-700 hover:bg-blue-50"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <rect width="24" height="24" fill="white"/>
                    <path d="M19 4H5a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3z" fill="#FF2D55"/>
                    <path d="M12 15.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="white"/>
                    <path d="M10 10h4v1h-4v-1zm-2-3h8v1H8V7z" fill="white"/>
                  </svg>
                  Add to Apple Calendar
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workoutPlan.map((day, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3">
                    <h3 className="text-lg font-medium text-white">{day.day}</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-3">
                      {day.exercises.map((item, i) => (
                        <li key={i} className="border-b pb-2 last:border-b-0 last:pb-0">
                          <p className="font-medium text-gray-900">{item.exercise.name}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.sets} sets × {item.reps} reps • {item.restTime}s rest
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={handleSaveAndViewCalendar}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              View Calendar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkoutPlan; 