import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutCalendarEvent, WorkoutTemplate, Exercise } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { 
  createGoogleCalendarLink, 
  createIcsFileContent, 
  downloadIcsFile 
} from '../utils/calendarExport';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { workoutTemplates } from '../utils/workoutTemplates';
import { exerciseDatabase } from '../utils/exerciseDatabase';

// Define structure for conflict data stored in state
interface ConflictData {
  newEventData: Omit<WorkoutCalendarEvent, 'id'>;
  existingEvents: WorkoutCalendarEvent[];
  onResolution?: () => void; // Optional callback for after resolution
}

const WorkoutCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [workoutEvents, setWorkoutEvents] = useLocalStorage<WorkoutCalendarEvent[]>('workout-calendar-events', []);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'scheduled' | 'template'>('scheduled');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportRange, setExportRange] = useState<'day'|'week'|'month'>('week');
  const [viewMode, setViewMode] = useState<'month'|'week'>('month');
  const [currentMonthDays, setCurrentMonthDays] = useState<Date[]>([]);
  
  // Track if we've already processed pending events
  const pendingEventsProcessed = React.useRef(false);
  
  // State for the custom conflict modal
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);

  // State for viewing event details
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [viewingEvents, setViewingEvents] = useState<WorkoutCalendarEvent[]>([]);
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  // Add a new state for the plan conflict modal
  const [showPlanConflictModal, setShowPlanConflictModal] = useState(false);
  const [conflictingPlanId, setConflictingPlanId] = useState<string | null>(null);
  const [newTemplateEvents, setNewTemplateEvents] = useState<WorkoutCalendarEvent[]>([]);

  // Get start of current month
  const getStartOfMonth = (date: Date): Date => {
    const result = new Date(date.getFullYear(), date.getMonth(), 1);
    return result;
  };

  // Get end of current month
  const getEndOfMonth = (date: Date): Date => {
    const result = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return result;
  };

  // Get start of current week (Sunday)
  const getStartOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    return result;
  };

  // Generate days for current week
  const generateWeekDays = (): Date[] => {
    const startOfWeek = getStartOfWeek(selectedDate || new Date());
    const weekDays: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      weekDays.push(day);
    }
    
    return weekDays;
  };

  // Generate days for current month view
  const generateMonthDays = (): Date[] => {
    const startOfMonth = getStartOfMonth(selectedDate || new Date());
    const endOfMonth = getEndOfMonth(selectedDate || new Date());
    const startOfFirstWeek = getStartOfWeek(startOfMonth);
    
    // Get the end of the last week that contains the last day of the month
    const endOfLastWeek = new Date(endOfMonth);
    const daysToAdd = 6 - endOfMonth.getDay();
    endOfLastWeek.setDate(endOfLastWeek.getDate() + daysToAdd);
    
    const days: Date[] = [];
    let currentDay = new Date(startOfFirstWeek);
    
    while (currentDay <= endOfLastWeek) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Update month days when selected date changes
  useEffect(() => {
    if (viewMode === 'month') {
      setCurrentMonthDays(generateMonthDays());
    }
  }, [selectedDate, viewMode]);

  const weekDays = generateWeekDays();
  
  const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate || new Date());
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate || new Date());
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate || new Date());
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate || new Date());
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const getDayEvents = (date: Date) => {
    const dateString = formatDate(date);
    return workoutEvents.filter(event => event.date === dateString);
  };

  const handleDayClick = (date: Date) => {
    console.log('handleDayClick called with date:', date);
    const dayString = formatDate(date);
    setSelectedDay(dayString); // Set selectedDay for the form
    
    // 1. Check for existing events on the clicked day
    const eventsOnDay = workoutEvents.filter(event => event.date === dayString);
    console.log(`Events found on ${dayString}:`, eventsOnDay);

    if (eventsOnDay.length > 0) {
      // If events exist, open the details modal
      console.log(`Opening details modal for ${dayString}`);
      setViewingEvents(eventsOnDay);
      setSelectedDayString(dayString);
      setShowEventDetailsModal(true);
      setShowEventForm(false); // Ensure add form is closed
      setSelectedDate(date); // Keep track of the actual date clicked
    } else {
      // 2. If no existing events, open the add event form
      console.log(`No existing events for ${dayString}, opening add form.`);
      setSelectedDate(date);
      setSelectedDayString(dayString); // Set the string date for the form
      setShowEventForm(true);
      setShowEventDetailsModal(false); // Ensure details modal is closed
    }
  };

  // Updated function to handle adding event: triggers modal on conflict
  const addEventWithConflictCheck = (newEventData: Omit<WorkoutCalendarEvent, 'id'>) => {
    const targetDate = newEventData.date;
    const existingEventsOnDate = workoutEvents.filter(event => event.date === targetDate);
    
    if (existingEventsOnDate.length > 0) {
      // Conflict: Show the modal
      setConflictData({
        newEventData,
        existingEvents: existingEventsOnDate,
        onResolution: () => {
          // After resolution, process the next event
          addEventWithConflictCheck(newEventData);
        }
      });
      setIsConflictModalOpen(true);
    } else {
      // No conflict: Add the event directly
      setWorkoutEvents(prevEvents => {
        const newEvent = { ...newEventData, id: uuidv4() };
        console.log("Adding new event to calendar:", newEvent);
        return [...prevEvents, newEvent];
      });
      
      // Reset form state
      setNewEventTitle('');
      setNewEventType('scheduled');
      setShowEventForm(false);
    }
  };

  // Updated conflict resolution handler to support replacing entire plans
  const handleConflictResolution = (choice: 'replace' | 'keep' | 'cancel' | 'replace-plan') => {
    if (!conflictData) return;

    console.log('Event conflict resolution - choice:', choice);
    
    const { newEventData, existingEvents, onResolution } = conflictData;
    const targetDate = newEventData.date;
    const templateId = newEventData.templateId;

    switch (choice) {
      case 'replace':
        // Replace existing events with the new one
        setWorkoutEvents(prevEvents => {
          const eventsToKeep = prevEvents.filter(event => event.date !== targetDate);
          const newEvent = { ...newEventData, id: uuidv4() };
          return [...eventsToKeep, newEvent];
        });
        break;
      case 'replace-plan':
        // For the current event, handle it directly
        setWorkoutEvents(prevEvents => {
          // Find all events from conflicting template
          const conflictingTemplateId = existingEvents.find(e => e.templateId)?.templateId;
          
          console.log('Replace-plan with conflictingTemplateId:', conflictingTemplateId);
          
          if (conflictingTemplateId) {
            // Set flag for any future events in this template batch to replace the plan
            sessionStorage.setItem('replacePlan', 'true');
            
            // Remove all events with the matching templateId
            const filteredEvents = prevEvents.filter(event => event.templateId !== conflictingTemplateId);
            
            // Add the new event
            const newEvent = { ...newEventData, id: uuidv4() };
            return [...filteredEvents, newEvent];
          } else {
            // If no template ID found, just replace this day
            const eventsToKeep = prevEvents.filter(event => event.date !== targetDate);
            const newEvent = { ...newEventData, id: uuidv4() };
            return [...eventsToKeep, newEvent];
          }
        });
        break;
      case 'keep':
        // Keep both existing and new events
        setWorkoutEvents(prevEvents => {
          const newEvent = { ...newEventData, id: uuidv4() };
          return [...prevEvents, newEvent];
        });
        break;
      case 'cancel':
        // Do nothing, just close the modal
        break;
    }

    // Close the conflict modal
    setIsConflictModalOpen(false);
    setConflictData(null);
    
    // Call the onResolution callback if provided
    if (onResolution) {
      console.log('Calling onResolution callback');
      setTimeout(onResolution, 100);
    }
  };

  // Modify handleAddEvent (from form) to use the check logic
  const handleAddEvent = () => {
    if (!selectedDay || !newEventTitle) return;
    const trimmedTitle = newEventTitle.trim();
    if (!trimmedTitle) return;

    const newEvent: Omit<WorkoutCalendarEvent, 'id'> = {
      date: selectedDay,
      title: trimmedTitle,
      type: newEventType
    };

    // Use the central conflict check logic
    addEventWithConflictCheck(newEvent);

    // Reset form state is handled in addEventWithConflictCheck
    // Don't reset selectedDay here to allow for adding multiple events to the same day
  };

  const handleRemoveEvent = (eventId: string) => {
    setWorkoutEvents(workoutEvents.filter(
      (event: WorkoutCalendarEvent) => event.id !== eventId
    ));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'template': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  // Updated export function using centralized utilities
  const exportToExternalCalendar = (calendarType: 'google' | 'apple', events: WorkoutCalendarEvent[]) => {
    if (events.length === 0) {
      toast.error('No events selected for export.');
      return;
    }

    // Map internal event structure to the structure expected by the export utils
    const eventsToExport = events.map(event => ({
      date: event.date,
      title: `Workout: ${event.title}`,
      description: `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} workout from FitPlan Pro`,
      durationHours: 1 // Default to 1 hour, could be made configurable
      // startTime could be added if available/needed
    }));

    if (calendarType === 'google') {
      if (eventsToExport.length === 1) {
        const link = createGoogleCalendarLink(eventsToExport[0]);
        if (link) window.open(link, '_blank');
      } else {
        toast(
          'Opening multiple Google Calendar links. Your browser might block popups. Consider exporting smaller ranges if needed.', 
          { duration: 4000, icon: 'ℹ️' }
        );
        eventsToExport.forEach((eventData, index) => {
          const link = createGoogleCalendarLink(eventData);
          if (link) {
            setTimeout(() => window.open(link, '_blank'), index * 300);
          }
        });
      }
    } else { // apple
      const icsContent = createIcsFileContent(eventsToExport);
      const rangeSuffix = exportRange === 'day' ? selectedDay : exportRange; // Add range to filename
      downloadIcsFile(icsContent, `fitplan_workouts_${rangeSuffix}.ics`);
      toast.success('Generating .ics file for download.');
    }
  };
  
  // Function to get events based on export range
  const getEventsForExport = (): WorkoutCalendarEvent[] => {
    if (exportRange === 'day' && selectedDay) {
      return workoutEvents.filter(event => event.date === selectedDay);
    } else if (exportRange === 'week') {
      const dates = weekDays.map(day => formatDate(day));
      return workoutEvents.filter(event => dates.includes(event.date));
    } else if (exportRange === 'month') {
      const currentMonth = selectedDate?.getMonth() || 0;
      const currentYear = selectedDate?.getFullYear() || 0;
      
      return workoutEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      });
    }
    
    return [];
  };

  // Helper to get exercise details by ID
  const getExerciseById = (id: string): Exercise | undefined => {
    return exerciseDatabase.find(ex => ex.id === id);
  };

  // Helper to get template details by ID
  const getTemplateById = (id: string): WorkoutTemplate | undefined => {
    return workoutTemplates.find(t => t.id === id);
  };

  // Render a tag with color based on difficulty
  const renderDifficultyTag = (difficulty: string) => {
    let bgColor = 'bg-green-100 text-green-800';
    if (difficulty === 'intermediate') bgColor = 'bg-yellow-100 text-yellow-800';
    else if (difficulty === 'advanced') bgColor = 'bg-red-100 text-red-800';
    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bgColor}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  };

  // New function to handle plan-level conflict resolution
  const handlePlanConflictResolution = (keepBoth: boolean) => {
    if (!newTemplateEvents.length) return;
    
    console.log('Plan conflict resolution - keepBoth:', keepBoth, 'conflictingPlanId:', conflictingPlanId);
    
    // Update the events right away
    setWorkoutEvents(prevEvents => {
      if (keepBoth) {
        // Keep both plans - just add the new events
        return [...prevEvents, ...newTemplateEvents];
      } else {
        // Replace old plan - remove all events with the conflicting templateId
        const filteredEvents = conflictingPlanId 
          ? prevEvents.filter(event => event.templateId !== conflictingPlanId)
          : prevEvents;
        
        return [...filteredEvents, ...newTemplateEvents];
      }
    });
    
    // Close modal and clean up
    setShowPlanConflictModal(false);
    setConflictingPlanId(null);
    setNewTemplateEvents([]);
    pendingEventsProcessed.current = true;
    
    // Clean up session storage
    console.log('Removing pendingEvents and replacePlan from sessionStorage');
    sessionStorage.removeItem('pendingEvents');
    sessionStorage.removeItem('replacePlan');
  };

  // Check for pending template events on component mount
  useEffect(() => {
    // Only process pending events once
    if (pendingEventsProcessed.current) return;
    
    console.log('Calendar mounted, checking for pending template events');
    const pendingEventsStr = sessionStorage.getItem('pendingEvents');
    
    if (pendingEventsStr) {
      try {
        const pendingEvents = JSON.parse(pendingEventsStr);
        console.log('Found pending template events:', pendingEvents);
        
        // Format all the events first
        const formattedEvents = pendingEvents.map((event: any) => ({
          id: event.id || uuidv4(),
          date: formatDate(new Date(event.start)),
          title: event.title,
          type: event.type as 'scheduled' | 'template',
          templateId: event.templateId
        }));
        
        console.log('Formatted events to add:', formattedEvents);
        
        // Check if we have any existing template workouts
        if (formattedEvents.length > 0 && formattedEvents[0].templateId) {
          // Find if there are any existing template events (from any template)
          // Get a snapshot of current events to avoid dependency on workoutEvents state
          const currentEvents = [...workoutEvents];
          const existingTemplateEvents = currentEvents.filter(event => event.templateId);
          
          if (existingTemplateEvents.length > 0) {
            // We have existing template events - show the plan conflict modal
            console.log('Found existing template events, showing plan conflict modal');
            
            // Store the most common templateId from existing events
            // This helps identify which plan we're potentially replacing
            const templateIds = existingTemplateEvents.map(e => e.templateId);
            const mostCommonTemplateId = templateIds.sort((a, b) => 
              templateIds.filter(id => id === a).length - templateIds.filter(id => id === b).length
            ).pop() || null;
            
            setConflictingPlanId(mostCommonTemplateId);
            setNewTemplateEvents(formattedEvents);
            setShowPlanConflictModal(true);
            return; // Wait for user decision
          } else {
            // No existing template events - simply add all events
            setWorkoutEvents(prevEvents => {
              return [...prevEvents, ...formattedEvents];
            });
            
            pendingEventsProcessed.current = true;
            sessionStorage.removeItem('pendingEvents');
          }
        } else {
          console.log('No template ID found in pending events');
          pendingEventsProcessed.current = true;
          sessionStorage.removeItem('pendingEvents');
        }
      } catch (error) {
        console.error('Error processing pending template events:', error);
        
        // Only show an error message if it's a real error, not a planned cancel action
        if (error instanceof Error && error.message !== 'Plan conflict resolution canceled') {
          toast.error('Error processing scheduled workouts');
        }
        
        // Clean up
        sessionStorage.removeItem('pendingEvents');
        sessionStorage.removeItem('replacePlan');
        pendingEventsProcessed.current = true;
      }
    } else {
      pendingEventsProcessed.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Workout Calendar</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'month' 
                    ? 'bg-white text-indigo-700 font-medium' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'week' 
                    ? 'bg-white text-indigo-700 font-medium' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                Week
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={viewMode === 'month' ? handlePrevMonth : handlePrevWeek}
                className="p-1 rounded-full hover:bg-indigo-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h2 className="text-xl font-semibold">
                {viewMode === 'month' 
                  ? selectedDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                }
              </h2>
              
              <button 
                onClick={viewMode === 'month' ? handleNextMonth : handleNextWeek}
                className="p-1 rounded-full hover:bg-indigo-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleToday}
                className="px-3 py-1 bg-indigo-500 rounded hover:bg-indigo-600 text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={() => setShowExportOptions(true)}
                className="px-3 py-1 bg-indigo-500 rounded hover:bg-indigo-600 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Export
              </button>
              <button
                onClick={() => handleDayClick(new Date())}
                className="px-3 py-1 bg-white text-indigo-700 rounded hover:bg-indigo-50 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Workout
              </button>
            </div>
          </div>
        </div>
        
        {/* Calendar Content */}
        <div className="p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2 text-center font-medium text-gray-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Month View */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {currentMonthDays.map((day, index) => {
                const dateString = formatDate(day);
                const dayEvents = getDayEvents(day);
                const isToday = new Date().toDateString() === day.toDateString();
                const isCurrentMonth = day.getMonth() === selectedDate?.getMonth();
                
                return (
                  <div 
                    key={index}
                    className={`min-h-[100px] border rounded-lg ${
                      isToday 
                        ? 'border-blue-500 bg-blue-50' 
                        : isCurrentMonth 
                          ? 'border-gray-200 hover:border-gray-300 bg-white' 
                          : 'border-gray-100 bg-gray-50'
                    } transition-colors cursor-pointer`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className={`p-1 text-right ${
                      isToday 
                        ? 'text-blue-600 font-bold' 
                        : isCurrentMonth 
                          ? 'text-gray-700' 
                          : 'text-gray-400'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    <div className="p-1 overflow-y-auto h-[70px]">
                      {dayEvents.length > 0 ? (
                        <div className="space-y-1">
                          {dayEvents.map((event, eventIndex) => (
                            <div 
                              key={event.id || eventIndex} 
                              className={`text-xs px-2 py-1 rounded flex justify-between items-center ${getEventTypeColor(event.type)}`}
                            >
                              <span className="truncate flex-1">{event.title}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveEvent(event.id);
                                }}
                                className="text-gray-400 hover:text-red-500 ml-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-gray-300 w-6 h-6">
                            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Week View */}
          {viewMode === 'week' && (
            <div className="flex flex-col">
              <div className="grid grid-cols-7 gap-4">
                {weekDays.map((day, index) => {
                  const dayEvents = getDayEvents(day);
                  const isToday = new Date().toDateString() === day.toDateString();
                  
                  return (
                    <div 
                      key={index}
                      className={`border rounded-lg overflow-hidden ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className={`p-2 text-center ${isToday ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                        <div className="text-xs font-medium">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-sm font-bold">{day.getDate()}</div>
                      </div>
                      
                      <div className="p-2 min-h-[200px]">
                        {dayEvents.length > 0 ? (
                          <div className="space-y-2">
                            {dayEvents.map((event, eventIndex) => (
                              <div 
                                key={event.id || eventIndex}
                                className={`rounded-lg p-2 ${getEventTypeColor(event.type)} flex justify-between items-start`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div>
                                  <div className="font-medium">{event.title}</div>
                                  <div className="text-xs capitalize mt-1">{event.type}</div>
                                </div>
                                <button 
                                  onClick={() => handleRemoveEvent(event.id)}
                                  className="text-gray-500 hover:text-red-500"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div 
                            className="h-full flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-blue-500"
                            onClick={() => handleDayClick(day)}
                          >
                            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-xs">Add Workout</span>
                          </div>
                        )}
                        
                        {dayEvents.length > 0 && (
                          <div 
                            className="mt-2 text-center cursor-pointer text-blue-500 text-xs"
                            onClick={() => handleDayClick(day)}
                          >
                            Add Workout
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Daily Timeline - could be expanded in a future version */}
              <div className="mt-8 border-t pt-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Today's Workout Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {getDayEvents(new Date()).length > 0 ? (
                    <div className="space-y-3">
                      {getDayEvents(new Date()).map((event, index) => (
                        <div key={index} className={`p-3 rounded-lg ${getEventTypeColor(event.type)}`}>
                          <div className="flex justify-between">
                            <h4 className="font-medium">{event.title}</h4>
                            <span className="text-sm capitalize">{event.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      <p>No workouts scheduled for today</p>
                      <button 
                        onClick={() => handleDayClick(new Date())}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                      >
                        Add a Workout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Workout Form */}
      {showEventForm && selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Add Workout for {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button
                onClick={() => {
                  setShowEventForm(false);
                  setSelectedDay(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Workout Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Upper Body, Leg Day, Cardio, etc."
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Workout Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['scheduled', 'template'].map(type => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setNewEventType(type as 'scheduled' | 'template')}
                    className={`py-2 px-3 rounded-md capitalize text-sm ${
                      newEventType === type
                        ? 'bg-blue-100 border border-blue-500 text-blue-700'
                        : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => {
                  setShowEventForm(false);
                  // Don't reset selectedDay to allow for adding workouts to the same day later
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddEvent}
                disabled={!newEventTitle}
              >
                Add Workout
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Export Workouts to Calendar</h3>
              <button
                onClick={() => setShowExportOptions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Range</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setExportRange('day')}
                  className={`px-3 py-2 rounded border ${
                    exportRange === 'day'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Current Day
                </button>
                <button
                  onClick={() => setExportRange('week')}
                  className={`px-3 py-2 rounded border ${
                    exportRange === 'week'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Current Week
                </button>
                <button
                  onClick={() => setExportRange('month')}
                  className={`px-3 py-2 rounded border ${
                    exportRange === 'month'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Current Month
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Calendar</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => exportToExternalCalendar('google', getEventsForExport())}
                  className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#fff"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.2 14.8V7.2L16 12l-5.2 4.8z" fill="#4285F4"/>
                  </svg>
                  <span className="font-medium">Google Calendar</span>
                </button>
                <button
                  onClick={() => exportToExternalCalendar('apple', getEventsForExport())}
                  className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="currentColor">
                    <rect width="24" height="24" fill="white"/>
                    <path d="M19 4H5a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3z" fill="#FF2D55"/>
                    <path d="M12 15.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="white"/>
                    <path d="M10 10h4v1h-4v-1zm-2-3h8v1H8V7z" fill="white"/>
                  </svg>
                  <span className="font-medium">Apple Calendar</span>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {getEventsForExport().length} workout(s) will be exported.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Resolution Modal */}
      {isConflictModalOpen && conflictData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Workout Conflict</h3>
            <p className="mb-4 text-gray-700">
              You already have{' '}
              {conflictData.existingEvents.map((e, i) => (
                <React.Fragment key={e.id}>
                  <span className="font-semibold">"{e.title}"</span>
                  {i < conflictData.existingEvents.length - 1 ? ' and ' : ''}
                </React.Fragment>
              ))}
              {' '}scheduled for {conflictData.newEventData.date}. What would you like to do with the new workout{' '}
              <span className="font-semibold">"{conflictData.newEventData.title}"</span>?
            </p>
            
            <div className="flex flex-col space-y-3 justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                onClick={() => handleConflictResolution('replace')}
              >
                Replace This Day Only
              </button>
              
              {/* Only show the replace plan option if there is a template event with a templateId */}
              {conflictData.existingEvents.some(e => e.templateId) && (
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  onClick={() => handleConflictResolution('replace-plan')}
                >
                  Replace Entire Plan
                </button>
              )}
              
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => handleConflictResolution('keep')}
              >
                Keep Both
              </button>
              
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => handleConflictResolution('cancel')}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetailsModal && viewingEvents.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Workouts for {selectedDayString}</h3>
              <button
                onClick={() => setShowEventDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {viewingEvents.map(event => {
                const template = event.templateId ? getTemplateById(event.templateId) : null;
                const exercises = template ? template.days.flatMap(day => day.exercises) : [];
                
                return (
                  <div key={event.id} className="border rounded-lg p-4 bg-gray-50 relative">
                    <h4 className="font-semibold text-lg mb-2 flex justify-between items-center">
                      <span>{event.title}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getEventTypeColor(event.type)}`}>
                        {event.type === 'template' ? 'Template Workout' : 'Scheduled Workout'}
                      </span>
                    </h4>
                    
                    {template && (
                      <div className="mb-3 text-sm text-gray-600">
                        Based on Template: {template.name} ({template.difficulty})
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        handleRemoveEvent(event.id);
                        // Update the viewing events state immediately
                        const updatedViewingEvents = viewingEvents.filter(e => e.id !== event.id);
                        setViewingEvents(updatedViewingEvents);
                        // Close the modal if no events are left for the day
                        if (updatedViewingEvents.length === 0) {
                          setShowEventDetailsModal(false);
                          setSelectedDayString(null);
                        }
                      }}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                      title="Remove this workout"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {exercises.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2 text-gray-700">Exercises:</h5>
                        <ul className="space-y-2 pl-4 list-disc text-sm">
                          {exercises.map((ex, index) => {
                            const exerciseDetail = getExerciseById(ex.exerciseId);
                            return (
                              <li key={`${event.id}-ex-${index}`}>
                                <span className="font-semibold">{exerciseDetail?.name || `Unknown Exercise (${ex.exerciseId})`}</span>:
                                {' '}{ex.sets} sets x {ex.reps} reps, {ex.restTime}s rest
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    
                    {!template && event.type === 'scheduled' && (
                      <p className="text-sm text-gray-500 italic">No specific exercises listed for this scheduled event.</p>
                    )}
                    
                    {template && exercises.length === 0 && (
                      <p className="text-sm text-gray-500 italic">Template found, but no exercises defined in it.</p>
                    )}
                    
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div className="flex space-x-3">
                {/* Conditionally render Start Workout button */} 
                {selectedDayString === formatDate(new Date()) && viewingEvents.length > 0 && (
                  <button
                    // TODO: Implement navigation to workout session page
                    onClick={() => {
                      console.log('Start Workout Clicked for event:', viewingEvents[0].id); // Log the ID of the first event
                      setShowEventDetailsModal(false); // Close modal after clicking
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                  >
                    Start Workout
                  </button>
                )}
                {/* Add Another Workout Button */} 
                <button
                  onClick={() => {
                    setShowEventDetailsModal(false); // Close details modal
                    setShowEventForm(true); // Open add form (selectedDayString is already set)
                    setSelectedDay(selectedDayString); // Make sure selectedDay is set for the form
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                >
                  Add Another Workout
                </button>
              </div>

              <button
                onClick={() => setShowEventDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan-level Conflict Modal */}
      {showPlanConflictModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Workout Plan Conflict</h3>
            
            <p className="mb-4 text-gray-700">
              You already have a workout plan on your calendar.
              What would you like to do with the new workout plan 
              (<span className="font-semibold">{newTemplateEvents.length > 0 ? newTemplateEvents[0].title : 'New Plan'}</span>)?
            </p>
            
            <div className="flex flex-col space-y-3">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => handlePlanConflictResolution(true)}
              >
                Keep Both Plans
              </button>
              
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                onClick={() => handlePlanConflictResolution(false)}
              >
                Replace Old Plan with New Plan
              </button>
              
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowPlanConflictModal(false);
                  setNewTemplateEvents([]);
                  setConflictingPlanId(null);
                  pendingEventsProcessed.current = true;
                  sessionStorage.removeItem('pendingEvents');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCalendar; 