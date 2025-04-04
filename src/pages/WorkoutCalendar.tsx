import React, { useState, useEffect } from 'react';
import { WorkoutPlan } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

const WorkoutCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workoutEvents, setWorkoutEvents] = useLocalStorage<{ date: string; title: string; type: string }[]>(
    'workout-calendar-events', 
    []
  );
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('strength');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportRange, setExportRange] = useState<'day'|'week'|'month'>('week');
  const [viewMode, setViewMode] = useState<'month'|'week'>('month');
  const [currentMonthDays, setCurrentMonthDays] = useState<Date[]>([]);

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
    const startOfWeek = getStartOfWeek(selectedDate);
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
    const startOfMonth = getStartOfMonth(selectedDate);
    const endOfMonth = getEndOfMonth(selectedDate);
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
    return date.toISOString().split('T')[0];
  };
  
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
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
    setSelectedDay(formatDate(date));
    setShowEventForm(true);
  };

  const handleAddEvent = () => {
    if (!selectedDay || !newEventTitle) return;
    
    // Trim the title and make sure it's not just whitespace
    const trimmedTitle = newEventTitle.trim();
    if (!trimmedTitle) return;
    
    setWorkoutEvents([
      ...workoutEvents,
      {
        date: selectedDay,
        title: trimmedTitle,
        type: newEventType
      }
    ]);
    
    setNewEventTitle('');
    setNewEventType('strength');
    setShowEventForm(false);
    setSelectedDay(null);
  };

  const handleRemoveEvent = (date: string, title: string) => {
    setWorkoutEvents(workoutEvents.filter(
      event => !(event.date === date && event.title === title)
    ));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-blue-100 text-blue-800';
      case 'cardio': return 'bg-red-100 text-red-800';
      case 'flexibility': return 'bg-purple-100 text-purple-800';
      case 'rest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  // Function to create Google Calendar link
  const createGoogleCalendarLink = (event: { date: string; title: string; type: string }) => {
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1); // Default to 1 hour workout
    
    const startIso = eventDate.toISOString().replace(/-|:|\.\d+/g, '');
    const endIso = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    
    const eventTitle = `Workout: ${event.title}`;
    const eventDescription = `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} workout from FitPlan Pro`;
    
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(eventDescription)}`;
    
    return googleCalendarUrl;
  };
  
  // Function to create Apple Calendar link (ics file format)
  const createAppleCalendarLink = (event: { date: string; title: string; type: string }) => {
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1); // Default to 1 hour workout
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:Workout: ${event.title}`,
      `DTSTART:${formatDate(eventDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `DESCRIPTION:${event.type.charAt(0).toUpperCase() + event.type.slice(1)} workout from FitPlan Pro`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  };
  
  // Function to export events to external calendar
  const exportToExternalCalendar = (calendarType: 'google' | 'apple', events: { date: string; title: string; type: string }[]) => {
    // If only one event, open the calendar link directly
    if (events.length === 1) {
      const event = events[0];
      const calendarLink = calendarType === 'google' 
        ? createGoogleCalendarLink(event)
        : createAppleCalendarLink(event);
      
      window.open(calendarLink, '_blank');
      return;
    }
    
    // For multiple events (batch export), handle differently based on calendar type
    if (calendarType === 'google') {
      // Google Calendar can handle multiple links, so we'll open them in sequence
      events.forEach((event, index) => {
        // Delay opening each link to avoid popup blockers
        setTimeout(() => {
          window.open(createGoogleCalendarLink(event), '_blank');
        }, index * 500);
      });
    } else {
      // For Apple Calendar, create a single ICS file with all events
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
      };
      
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'CALSCALE:GREGORIAN'
      ];
      
      events.forEach(event => {
        const eventDate = new Date(event.date);
        const endDate = new Date(eventDate);
        endDate.setHours(endDate.getHours() + 1);
        
        icsContent = [
          ...icsContent,
          'BEGIN:VEVENT',
          `SUMMARY:Workout: ${event.title}`,
          `DTSTART:${formatDate(eventDate)}`,
          `DTEND:${formatDate(endDate)}`,
          `DESCRIPTION:${event.type.charAt(0).toUpperCase() + event.type.slice(1)} workout from FitPlan Pro`,
          'STATUS:CONFIRMED',
          'SEQUENCE:0',
          'END:VEVENT'
        ];
      });
      
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
    }
  };
  
  // Function to get events based on export range
  const getEventsForExport = () => {
    if (exportRange === 'day' && selectedDay) {
      return workoutEvents.filter(event => event.date === selectedDay);
    } else if (exportRange === 'week') {
      const dates = weekDays.map(day => formatDate(day));
      return workoutEvents.filter(event => dates.includes(event.date));
    } else if (exportRange === 'month') {
      const currentMonth = selectedDate.getMonth();
      const currentYear = selectedDate.getFullYear();
      
      return workoutEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      });
    }
    
    return [];
  };

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
                  ? selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                
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
                              key={eventIndex} 
                              className={`text-xs px-2 py-1 rounded flex justify-between items-center ${getEventTypeColor(event.type)}`}
                            >
                              <span className="truncate flex-1">{event.title}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveEvent(event.date, event.title);
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
                                key={eventIndex} 
                                className={`rounded-lg p-2 ${getEventTypeColor(event.type)} flex justify-between items-start`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div>
                                  <div className="font-medium">{event.title}</div>
                                  <div className="text-xs capitalize mt-1">{event.type}</div>
                                </div>
                                <button 
                                  onClick={() => handleRemoveEvent(event.date, event.title)}
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
                {['strength', 'cardio', 'flexibility', 'rest'].map(type => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setNewEventType(type)}
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
                  setSelectedDay(null);
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
    </div>
  );
};

export default WorkoutCalendar; 