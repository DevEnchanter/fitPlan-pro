import { useState, useEffect, useMemo } from 'react';
import { Exercise } from '../types';
import { exerciseDatabase } from '../utils/exerciseDatabase';

interface UseExerciseFilterProps {
  initialSearchTerm?: string;
  initialCategory?: string;
  initialEquipment?: string;
}

interface UseExerciseFilterReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  category: string;
  setCategory: (category: string) => void;
  equipment: string;
  setEquipment: (equipment: string) => void;
  filteredExercises: Exercise[];
  categories: string[];
  equipmentOptions: string[];
}

function useExerciseFilter({
  initialSearchTerm = '',
  initialCategory = 'All',
  initialEquipment = 'All'
}: UseExerciseFilterProps = {}): UseExerciseFilterReturn {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [category, setCategory] = useState(initialCategory);
  const [equipment, setEquipment] = useState(initialEquipment);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(exerciseDatabase);

  // Memoize categories and equipment options derived from the database
  const categories = useMemo(() => 
    ['All', ...Array.from(new Set(exerciseDatabase.map(ex => ex.category).filter(Boolean)))].sort()
  , []);

  const equipmentOptions = useMemo(() => 
    ['All', ...Array.from(new Set(exerciseDatabase.flatMap(ex => ex.equipment))).filter(Boolean)].sort()
  , []);

  useEffect(() => {
    let result = [...exerciseDatabase];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        exercise => 
          exercise.name.toLowerCase().includes(term) || 
          exercise.description.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (category !== 'All') {
      result = result.filter(exercise => exercise.category === category);
    }
    
    // Apply equipment filter
    if (equipment !== 'All') {
      // Ensure exercise requires the selected equipment
      result = result.filter(exercise => exercise.equipment.includes(equipment));
    }
    
    setFilteredExercises(result);
  }, [searchTerm, category, equipment]);

  return {
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    equipment,
    setEquipment,
    filteredExercises,
    categories,
    equipmentOptions
  };
}

export default useExerciseFilter; 