import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

type TrackingMetric = {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  workoutsCompleted: number;
  notes: string;
};

const ProgressTracker: React.FC = () => {
  const [trackingData, setTrackingData] = useLocalStorage<TrackingMetric[]>('workout-tracking-data', []);
  const [weight, setWeight] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [workoutsCompleted, setWorkoutsCompleted] = useState<number>(0);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [chartMetric, setChartMetric] = useState<'weight' | 'bodyFat' | 'workouts'>('weight');
  
  // Get workouts completed this week
  useEffect(() => {
    // Get calendar events from localStorage
    const calendarEvents = JSON.parse(localStorage.getItem('workout-calendar-events') || '[]');
    
    // Count completed workouts this week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    const completedWorkouts = calendarEvents.filter((event: any) => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate < endOfWeek;
    });
    
    setWorkoutsCompleted(completedWorkouts.length);
  }, []);
  
  const handleAddEntry = () => {
    const newEntry: TrackingMetric = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      weight: weight ? parseFloat(weight) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      workoutsCompleted,
      notes
    };
    
    setTrackingData([...trackingData, newEntry]);
    
    // Reset form
    setWeight('');
    setBodyFat('');
    setNotes('');
    setShowForm(false);
  };
  
  const handleDeleteEntry = (id: string) => {
    setTrackingData(trackingData.filter(entry => entry.id !== id));
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Simple line chart for visualization
  const renderChart = () => {
    if (trackingData.length < 2) {
      return (
        <div className="text-center p-6 text-gray-500">
          Add at least two entries to see your progress chart
        </div>
      );
    }
    
    // Sort data by date
    const sortedData = [...trackingData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get values based on selected metric
    const values = sortedData.map(entry => {
      if (chartMetric === 'weight') return entry.weight || 0;
      if (chartMetric === 'bodyFat') return entry.bodyFat || 0;
      return entry.workoutsCompleted;
    }).filter(value => value > 0);
    
    // If no valid values for this metric
    if (values.length < 2) {
      return (
        <div className="text-center p-6 text-gray-500">
          Not enough data for selected metric
        </div>
      );
    }
    
    // Calculate min and max for scale
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Normalize values to 0-100 range for display
    const normalizedValues = values.map(value => 
      range === 0 ? 50 : Math.round(((value - min) / range) * 100)
    );
    
    return (
      <div className="relative h-64 mt-4">
        <div className="absolute inset-0 flex items-end">
          {normalizedValues.map((value, index) => (
            <div 
              key={index} 
              className="relative flex-1 mx-1"
              title={`${sortedData[index].date}: ${values[index]}`}
            >
              <div 
                className="bg-blue-500 rounded-t" 
                style={{ height: `${value}%` }}
              />
              <span className="absolute bottom-0 left-0 right-0 text-center text-xs overflow-hidden whitespace-nowrap">
                {formatDate(sortedData[index].date).split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Progress Tracker</h1>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Progress</h2>
            <p className="text-gray-600">Track your fitness journey over time</p>
          </div>
          
          <button
            className="mt-3 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setShowForm(true)}
          >
            Add New Entry
          </button>
        </div>
        
        {/* Entry Form */}
        {showForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium mb-3">New Progress Entry</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter your weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Fat (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter body fat percentage"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="How are you feeling? Any achievements to note?"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Workouts Completed This Week</label>
              <div className="flex items-center">
                <button
                  className="px-3 py-1 bg-gray-200 rounded-l"
                  onClick={() => setWorkoutsCompleted(Math.max(0, workoutsCompleted - 1))}
                >
                  -
                </button>
                <span className="px-4 py-1 border-t border-b text-center min-w-[40px]">
                  {workoutsCompleted}
                </span>
                <button
                  className="px-3 py-1 bg-gray-200 rounded-r"
                  onClick={() => setWorkoutsCompleted(workoutsCompleted + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleAddEntry}
              >
                Save Entry
              </button>
            </div>
          </div>
        )}
        
        {/* Visualization */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Progress Visualization</h3>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded ${
                  chartMetric === 'weight' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                }`}
                onClick={() => setChartMetric('weight')}
              >
                Weight
              </button>
              <button
                className={`px-3 py-1 text-sm rounded ${
                  chartMetric === 'bodyFat' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                }`}
                onClick={() => setChartMetric('bodyFat')}
              >
                Body Fat
              </button>
              <button
                className={`px-3 py-1 text-sm rounded ${
                  chartMetric === 'workouts' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                }`}
                onClick={() => setChartMetric('workouts')}
              >
                Workouts
              </button>
            </div>
          </div>
          
          {renderChart()}
        </div>
      </div>
      
      {/* Entry History */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-medium mb-3">Entry History</h3>
        
        {trackingData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Body Fat</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workouts</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...trackingData]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.weight ? `${entry.weight} kg` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.bodyFat ? `${entry.bodyFat}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.workoutsCompleted}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {entry.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No entries yet. Add your first progress entry to start tracking!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker; 