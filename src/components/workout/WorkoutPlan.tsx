import React, { useEffect, useState, useCallback } from 'react';
import { Exercise, WorkoutDay, UserPreferences } from '../../types';
import { exerciseDatabase } from '../../utils/exerciseDatabase';
import { useNavigate } from 'react-router-dom';

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
    
    // Filter exercises based on equipment and environment
    const filteredExercises = exerciseDatabase.filter(exercise => {
      // Check if at least one of the exercise's required equipment is available to the user
      // or if the exercise can be done with no equipment
      return exercise.equipment.some(item => equipment.includes(item)) || 
             exercise.equipment.includes('None');
    });

    // Group exercises by category
    const exercisesByCategory: { [key: string]: Exercise[] } = {};
    filteredExercises.forEach(exercise => {
      if (!exercisesByCategory[exercise.category]) {
        exercisesByCategory[exercise.category] = [];
      }
      exercisesByCategory[exercise.category].push(exercise);
    });

    // Create workout days
    const workout: WorkoutDay[] = [];
    const difficultyLevels = {
      'beginner': { sets: 2, reps: '10-12', rest: 60 },
      'intermediate': { sets: 3, reps: '8-10', rest: 90 },
      'advanced': { sets: 4, reps: '6-8', rest: 120 }
    };

    const difficulty = difficultyLevels[fitnessLevel as keyof typeof difficultyLevels] || difficultyLevels.beginner;

    // Generate workout for each selected day
    workoutDays.forEach(day => {
      const exercises: { exercise: Exercise; sets: number; reps: string; restTime: number }[] = [];
      
      // Add 1-2 exercises from each relevant category based on goals
      let relevantCategories = Object.keys(exercisesByCategory);
      
      // Adjust categories based on goals
      if (goals.includes('Strength')) {
        relevantCategories = relevantCategories.filter(
          category => ['Compound', 'Upper Body', 'Lower Body'].includes(category)
        );
      } else if (goals.includes('Weight Loss')) {
        relevantCategories = relevantCategories.filter(
          category => ['Cardio', 'HIIT', 'Compound'].includes(category)
        );
      } else if (goals.includes('Muscle Gain')) {
        relevantCategories = relevantCategories.filter(
          category => ['Upper Body', 'Lower Body', 'Core'].includes(category)
        );
      }
      
      // If no relevant categories after filtering, use all
      if (relevantCategories.length === 0) {
        relevantCategories = Object.keys(exercisesByCategory);
      }

      // Select exercises from each category
      relevantCategories.forEach(category => {
        const categoryExercises = exercisesByCategory[category];
        if (categoryExercises && categoryExercises.length > 0) {
          // Pick 1-2 random exercises from the category
          const numExercises = Math.min(Math.floor(Math.random() * 2) + 1, categoryExercises.length);
          
          // Shuffle the exercises and pick the top few
          const shuffled = [...categoryExercises].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, numExercises);
          
          selected.forEach(exercise => {
            exercises.push({
              exercise,
              sets: difficulty.sets,
              reps: difficulty.reps,
              restTime: difficulty.rest
            });
          });
        }
      });

      // Limit to a reasonable number of exercises per day
      const maxExercises = fitnessLevel === 'beginner' ? 5 : (fitnessLevel === 'intermediate' ? 6 : 8);
      const limitedExercises = exercises.slice(0, maxExercises);

      workout.push({
        day,
        exercises: limitedExercises
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

  // Export workout plan to Google Calendar
  const exportToGoogleCalendar = () => {
    try {
      // Calculate start date (next Monday) and end date based on duration
      const today = new Date();
      const startDate = new Date(today);
      const daysUntilMonday = (8 - startDate.getDay()) % 7;
      startDate.setDate(startDate.getDate() + daysUntilMonday);
      
      // Create events for each workout day in the plan
      const calendarEvents = [];
      const workoutsByDay = workoutPlan.reduce((acc, day) => {
        if (!day || !day.day) {
          console.warn('Invalid workout day data found');
          return acc;
        }
        acc[day.day] = day;
        return acc;
      }, {} as Record<string, WorkoutDay>);
      
      // Calculate how many weeks to generate based on plan duration
      let totalDays: number;
      if (planDuration.unit === 'weeks') {
        totalDays = planDuration.value * 7;
      } else {
        totalDays = planDuration.value * 30; // approximate for months
      }
      
      // Create multiple date events spanning the plan duration
      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        
        const weekdayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        if (workoutsByDay[weekdayName]) {
          const workoutDay = workoutsByDay[weekdayName];
          if (!workoutDay.exercises || !workoutDay.exercises.length) {
            continue; // Skip days with no exercises
          }

          const firstExercise = workoutDay.exercises[0]?.exercise?.name || 'Exercise';
          const lastExercise = workoutDay.exercises[workoutDay.exercises.length - 1]?.exercise?.name || 'Exercise';
          
          // Set an hour for the workout (default to 5pm)
          currentDate.setHours(17, 0, 0, 0);
          const endDate = new Date(currentDate);
          endDate.setHours(endDate.getHours() + 1);
          
          // Format dates for Google Calendar
          const startIso = currentDate.toISOString().replace(/-|:|\.\d+/g, '');
          const endIso = endDate.toISOString().replace(/-|:|\.\d+/g, '');
          
          // Create event title and description
          const eventTitle = `Workout: ${workoutDay.exercises.length} Exercises`;
          const eventDescription = `FitPlan Pro Workout\n\nExercises include: ${firstExercise}${workoutDay.exercises.length > 1 ? ` to ${lastExercise}` : ''}\n\nTotal exercises: ${workoutDay.exercises.length}`;
          
          // Limit URL length to avoid issues with long descriptions
          const maxDescLength = 500;
          const truncatedDesc = eventDescription.length > maxDescLength ? 
                               eventDescription.substring(0, maxDescLength) + '...' : 
                               eventDescription;
          
          // Properly encode URL components
          const encodedTitle = encodeURIComponent(eventTitle);
          const encodedDesc = encodeURIComponent(truncatedDesc);
          
          // Create Google Calendar URL with proper encoding
          const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startIso}/${endIso}&details=${encodedDesc}`;
          
          if (googleCalendarUrl.length > 2000) {
            // URL too long, create simplified version
            const simpleDesc = encodeURIComponent(`FitPlan Pro Workout (${workoutDay.exercises.length} exercises)`);
            const simpleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startIso}/${endIso}&details=${simpleDesc}`;
            calendarEvents.push({
              date: currentDate,
              title: eventTitle,
              description: 'Workout details (simplified due to length)',
              url: simpleUrl
            });
          } else {
            calendarEvents.push({
              date: currentDate,
              title: eventTitle,
              description: truncatedDesc,
              url: googleCalendarUrl
            });
          }
        }
      }
      
      // Open the first event in a new tab
      if (calendarEvents.length > 0) {
        window.open(calendarEvents[0].url, '_blank');
        
        // Show success message with event count
        alert(`Created ${calendarEvents.length} calendar events. The first one has been opened in a new tab.`);
      } else {
        alert('No workout days found that match your weekly schedule.');
      }
    } catch (error) {
      console.error('Error creating Google Calendar events:', error);
      alert('Failed to create Google Calendar events. Please try again later.');
    }
  };
  
  // Export workout plan to Apple Calendar (generates an ICS file)
  const exportToAppleCalendar = () => {
    // Calculate start date (next Monday) and end date based on duration
    const today = new Date();
    const startDate = new Date(today);
    const daysUntilMonday = (8 - startDate.getDay()) % 7;
    startDate.setDate(startDate.getDate() + daysUntilMonday);
    
    // Calculate how many weeks to generate based on plan duration
    let totalDays: number;
    if (planDuration.unit === 'weeks') {
      totalDays = planDuration.value * 7;
    } else {
      totalDays = planDuration.value * 30; // approximate for months
    }
    
    // Start building the ICS file
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN'
    ];
    
    const workoutsByDay = workoutPlan.reduce((acc, day) => {
      acc[day.day] = day;
      return acc;
    }, {} as Record<string, WorkoutDay>);
    
    let eventCount = 0;
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      const weekdayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (workoutsByDay[weekdayName]) {
        const workoutDay = workoutsByDay[weekdayName];
        const firstExercise = workoutDay.exercises[0]?.exercise.name || '';
        const lastExercise = workoutDay.exercises[workoutDay.exercises.length - 1]?.exercise.name || '';
        
        // Set an hour for the workout (default to 5pm)
        currentDate.setHours(17, 0, 0, 0);
        const endDate = new Date(currentDate);
        endDate.setHours(endDate.getHours() + 1);
        
        // Format dates for ICS
        const formatDate = (date: Date) => {
          return date.toISOString().replace(/-|:|\.\d+/g, '');
        };
        
        // Create event title and description
        const eventTitle = `Workout: ${workoutDay.exercises.length} Exercises`;
        const eventDescription = `FitPlan Pro Workout\\nExercises include: ${firstExercise}${workoutDay.exercises.length > 1 ? ` to ${lastExercise}` : ''}\\nTotal exercises: ${workoutDay.exercises.length}`;
        
        icsContent = [
          ...icsContent,
          'BEGIN:VEVENT',
          `SUMMARY:${eventTitle}`,
          `DTSTART:${formatDate(currentDate)}`,
          `DTEND:${formatDate(endDate)}`,
          `DESCRIPTION:${eventDescription}`,
          'STATUS:CONFIRMED',
          'SEQUENCE:0',
          'END:VEVENT'
        ];
        
        eventCount++;
      }
    }
    
    icsContent.push('END:VCALENDAR');
    
    const blob = new Blob([icsContent.join('\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and click it to download the file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fitplan_workouts.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    return eventCount;
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
                  onClick={exportToGoogleCalendar}
                  className="inline-flex items-center px-3 py-1 rounded text-sm bg-white border border-blue-500 text-blue-700 hover:bg-blue-50"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#fff"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.2 14.8V7.2L16 12l-5.2 4.8z" fill="#4285F4"/>
                  </svg>
                  Add to Google Calendar
                </button>
                <button 
                  onClick={exportToAppleCalendar}
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