import React, { useState } from 'react';
import { UserPreferences } from '../../types';

interface WorkoutFormProps {
  onCreateWorkout: (preferences: UserPreferences) => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onCreateWorkout }) => {
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [goals, setGoals] = useState<string[]>([]);
  const [workoutEnvironment, setWorkoutEnvironment] = useState<'home' | 'gym' | 'outdoors'>('home');
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
  const [timePerSession, setTimePerSession] = useState<number>(30);
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);
  const [planDuration, setPlanDuration] = useState<{value: number; unit: 'weeks' | 'months'}>({ value: 4, unit: 'weeks' });
  const [activeSection, setActiveSection] = useState(1);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const allGoals = ['Strength', 'Muscle Gain', 'Weight Loss', 'Endurance', 'Flexibility'];
  const allEquipment = {
    'home': ['None', 'Dumbbells', 'Resistance Bands', 'Pull-up Bar', 'Kettlebells', 'Yoga Mat'],
    'gym': ['Dumbbells', 'Barbells', 'Resistance Machines', 'Cable Machine', 'Treadmill', 'Rowing Machine', 'Stair Climber', 'Bench'],
    'outdoors': ['None', 'Resistance Bands', 'Bodyweight', 'Park Bench', 'Pull-up Bar']
  };
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleGoalChange = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
    
    if (formErrors.goals) {
      setFormErrors({...formErrors, goals: ''});
    }
  };

  const handleEquipmentChange = (equipment: string) => {
    if (availableEquipment.includes(equipment)) {
      setAvailableEquipment(availableEquipment.filter(e => e !== equipment));
    } else {
      setAvailableEquipment([...availableEquipment, equipment]);
    }
    
    if (formErrors.equipment) {
      setFormErrors({...formErrors, equipment: ''});
    }
  };

  const handleDayChange = (day: string) => {
    if (workoutDays.includes(day)) {
      setWorkoutDays(workoutDays.filter(d => d !== day));
    } else {
      setWorkoutDays([...workoutDays, day]);
    }
    
    if (formErrors.days) {
      setFormErrors({...formErrors, days: ''});
    }
  };

  const handleEnvironmentChange = (env: 'home' | 'gym' | 'outdoors') => {
    setWorkoutEnvironment(env);
    // Clear equipment selection when environment changes
    setAvailableEquipment([]);
  };

  const validateSection = (section: number): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (section === 1) {
      if (!fitnessLevel) {
        newErrors.fitnessLevel = 'Please select your fitness level';
      }
      if (goals.length === 0) {
        newErrors.goals = 'Please select at least one goal';
      }
    } else if (section === 2) {
      if (availableEquipment.length === 0) {
        newErrors.equipment = 'Please select at least one equipment option';
      }
    } else if (section === 3) {
      if (workoutDays.length === 0) {
        newErrors.days = 'Please select at least one workout day';
      }
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextSection = () => {
    if (validateSection(activeSection)) {
      setActiveSection(activeSection + 1);
    }
  };

  const handlePrevSection = () => {
    setActiveSection(activeSection - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSection(activeSection)) {
      return;
    }
    
    const preferences: UserPreferences = {
      fitnessLevel,
      goals,
      workoutEnvironment,
      availableEquipment,
      timePerSession,
      workoutDays,
      planDuration
    };
    
    onCreateWorkout(preferences);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold text-white">Create Your Personalized Workout Plan</h2>
        <p className="text-blue-100 mt-1">Tell us about your fitness goals and preferences</p>
        
        <div className="flex items-center mt-6">
          <div className="relative w-full flex">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 
                    ${activeSection >= step 
                      ? 'bg-white text-blue-600' 
                      : 'bg-blue-400 text-white'}`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div 
                    className={`flex-1 h-1 ${
                      activeSection > step ? 'bg-white' : 'bg-blue-400'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      <form className="p-6">
        {/* Step 1: Goals and Fitness Level */}
        <div className={activeSection === 1 ? 'block' : 'hidden'}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Fitness Level & Goals</h3>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">Select your fitness level</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <div 
                  key={level}
                  onClick={() => setFitnessLevel(level as any)}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-colors
                    ${fitnessLevel === level 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                      fitnessLevel === level ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {fitnessLevel === level && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <span className="capitalize font-medium">{level}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {level === 'beginner' && 'New to fitness or returning after a long break'}
                    {level === 'intermediate' && 'Consistent with workouts for several months'}
                    {level === 'advanced' && 'Experienced with years of consistent training'}
                  </p>
                </div>
              ))}
            </div>
            {formErrors.fitnessLevel && (
              <p className="mt-2 text-red-600 text-sm">{formErrors.fitnessLevel}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              What are your fitness goals? (Select at least one)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {allGoals.map((goal) => (
                <div 
                  key={goal}
                  onClick={() => handleGoalChange(goal)}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-colors
                    ${goals.includes(goal) 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded flex items-center justify-center mr-2 ${
                      goals.includes(goal) 
                        ? 'bg-blue-500 text-white' 
                        : 'border border-gray-300'
                    }`}>
                      {goals.includes(goal) && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{goal}</span>
                  </div>
                </div>
              ))}
            </div>
            {formErrors.goals && (
              <p className="mt-2 text-red-600 text-sm">{formErrors.goals}</p>
            )}
          </div>
          
          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={handleNextSection}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              Next Step
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      
        {/* Step 2: Workout Environment & Equipment */}
        <div className={activeSection === 2 ? 'block' : 'hidden'}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Workout Environment & Equipment</h3>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">Where will you be working out?</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['home', 'gym', 'outdoors'].map((env) => (
                <div 
                  key={env}
                  onClick={() => handleEnvironmentChange(env as any)}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-colors
                    ${workoutEnvironment === env 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                      workoutEnvironment === env ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {workoutEnvironment === env && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <span className="capitalize font-medium">{env}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {env === 'home' && 'Working out in the comfort of your home'}
                    {env === 'gym' && 'Access to gym equipment and machines'}
                    {env === 'outdoors' && 'Exercising outside in parks or open spaces'}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              What equipment do you have access to? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allEquipment[workoutEnvironment].map((equipment) => (
                <div 
                  key={equipment}
                  onClick={() => handleEquipmentChange(equipment)}
                  className={`
                    border rounded-lg p-3 cursor-pointer transition-colors
                    ${availableEquipment.includes(equipment) 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded flex items-center justify-center mr-2 ${
                      availableEquipment.includes(equipment) 
                        ? 'bg-blue-500 text-white' 
                        : 'border border-gray-300'
                    }`}>
                      {availableEquipment.includes(equipment) && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span>{equipment}</span>
                  </div>
                </div>
              ))}
            </div>
            {formErrors.equipment && (
              <p className="mt-2 text-red-600 text-sm">{formErrors.equipment}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              How much time do you have for each workout session?
            </label>
            <div className="px-4">
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={timePerSession}
                onChange={(e) => setTimePerSession(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>15 min</span>
                <span>30 min</span>
                <span>45 min</span>
                <span>60 min</span>
                <span>75 min</span>
                <span>90 min</span>
                <span>105 min</span>
                <span>120 min</span>
              </div>
              <div className="text-center mt-4">
                <span className="text-xl font-bold text-blue-600">{timePerSession} minutes</span>
                <p className="text-sm text-gray-600 mt-1">
                  {timePerSession <= 30 
                    ? 'Quick and efficient workouts' 
                    : timePerSession <= 60 
                      ? 'Standard workout duration' 
                      : 'Extended training sessions'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevSection}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium flex items-center"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              type="button"
              onClick={handleNextSection}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              Next Step
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Step 3: Schedule */}
        <div className={activeSection === 3 ? 'block' : 'hidden'}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Workout Schedule</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-3">How many days per week can you workout?</label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`px-4 py-2 rounded-md ${
                      workoutDays.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleDayChange(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {formErrors.days && <p className="text-red-500 text-sm mt-1">{formErrors.days}</p>}
            </div>
            
            <div>
              <label className="block font-medium mb-3">
                How long do you want your workout plan to last?
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={planDuration.value}
                  onChange={(e) => setPlanDuration({
                    ...planDuration,
                    value: parseInt(e.target.value) || 1
                  })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                />
                <select
                  value={planDuration.unit}
                  onChange={(e) => setPlanDuration({
                    ...planDuration,
                    unit: e.target.value as 'weeks' | 'months'
                  })}
                  className="ml-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block font-medium mb-2">How much time can you spend per workout?</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={timePerSession}
                  onChange={(e) => setTimePerSession(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="ml-3 w-20 text-center">{timePerSession} min</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-5 mb-6 border border-blue-100">
            <h4 className="font-medium text-blue-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Workout Plan Summary
            </h4>
            <div className="mt-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-600">Fitness Level:</p>
                  <p className="font-medium capitalize">{fitnessLevel}</p>
                </div>
                <div>
                  <p className="text-gray-600">Workout Location:</p>
                  <p className="font-medium capitalize">{workoutEnvironment}</p>
                </div>
                <div>
                  <p className="text-gray-600">Primary Goal:</p>
                  <p className="font-medium">{goals.length > 0 ? goals[0] : 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Session Duration:</p>
                  <p className="font-medium">{timePerSession} minutes</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Workout Days:</p>
                  <p className="font-medium">{workoutDays.length > 0 ? workoutDays.join(', ') : 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevSection}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium flex items-center"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium flex items-center"
              disabled={goals.length === 0 || workoutDays.length === 0 || availableEquipment.length === 0}
            >
              Create Workout Plan
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WorkoutForm; 