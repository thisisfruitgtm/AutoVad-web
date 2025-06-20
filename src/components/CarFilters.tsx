'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, X } from 'lucide-react';
import { Car } from '@/types/car';
import { trackSearch, trackFilter } from '@/lib/analytics';

interface FilterOptions {
  makes: string[];
  years: string[];
  fuelTypes: string[];
  bodyTypes: string[];
  locations: string[];
  priceRanges: { label: string; min: number; max: number | null }[];
}

interface CarFiltersProps {
  cars: Car[];
  onFiltersChange: (filteredCars: Car[]) => void;
  className?: string;
}

export function CarFilters({ cars, onFiltersChange, className = '' }: CarFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedMake, setSelectedMake] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('All');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');
  
  // Track previous filter states for analytics
  const [previousFilters, setPreviousFilters] = useState<Record<string, any>>({});
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    makes: ['All'],
    years: ['All'],
    fuelTypes: ['All'],
    bodyTypes: ['All'],
    locations: ['All'],
    priceRanges: [
      { label: 'All', min: 0, max: null },
      { label: 'Sub 25k', min: 0, max: 25000 },
      { label: '25k - 50k', min: 25000, max: 50000 },
      { label: '50k - 100k', min: 50000, max: 100000 },
      { label: '100k - 200k', min: 100000, max: 200000 },
      { label: 'Peste 200k', min: 200000, max: null },
    ],
  });

  // Generate filter options from cars data
  useEffect(() => {
    if (cars.length > 0) {
      const makes = Array.from(new Set(cars.map(car => car.make))).sort();
      const years = Array.from(new Set(cars.map(car => car.year.toString()))).sort((a, b) => parseInt(b) - parseInt(a));
      const fuelTypes = Array.from(new Set(cars.map(car => car.fuel_type))).sort();
      const bodyTypes = Array.from(new Set(cars.map(car => car.body_type))).sort();
      const locations = Array.from(new Set(cars.map(car => car.location.split(',')[0].trim()))).sort();

      setFilterOptions(prev => ({
        ...prev,
        makes: ['All', ...makes],
        years: ['All', ...years],
        fuelTypes: ['All', ...fuelTypes],
        bodyTypes: ['All', ...bodyTypes],
        locations: ['All', ...locations],
      }));
    }
  }, [cars]);

  // Apply filters to cars
  const applyFilters = useCallback(() => {
    let filtered = cars;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(car => 
        car.make.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        `${car.make} ${car.model}`.toLowerCase().includes(query)
      );
    }

    // Make filter
    if (selectedMake !== 'All') {
      filtered = filtered.filter(car => car.make === selectedMake);
    }

    // Year filter
    if (selectedYear !== 'All') {
      filtered = filtered.filter(car => car.year.toString() === selectedYear);
    }

    // Fuel type filter
    if (selectedFuelType !== 'All') {
      filtered = filtered.filter(car => car.fuel_type === selectedFuelType);
    }

    // Body type filter
    if (selectedBodyType !== 'All') {
      filtered = filtered.filter(car => car.body_type === selectedBodyType);
    }

    // Location filter
    if (selectedLocation !== 'All') {
      filtered = filtered.filter(car => car.location.includes(selectedLocation));
    }

    // Price range filter
    if (selectedPriceRange !== 'All') {
      const priceRange = filterOptions.priceRanges.find(range => range.label === selectedPriceRange);
      if (priceRange) {
        filtered = filtered.filter(car => {
          const price = car.price;
          const inRange = price >= priceRange.min && (priceRange.max === null || price <= priceRange.max);
          return inRange;
        });
      }
    }

    onFiltersChange(filtered);
  }, [cars, searchQuery, selectedMake, selectedYear, selectedFuelType, selectedBodyType, selectedLocation, selectedPriceRange, filterOptions.priceRanges, onFiltersChange]);

  // Track search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const currentFilters = {
        make: selectedMake,
        year: selectedYear,
        fuelType: selectedFuelType,
        bodyType: selectedBodyType,
        location: selectedLocation,
        priceRange: selectedPriceRange,
      };

      trackSearch({
        query: searchQuery,
        filters: currentFilters,
        resultsCount: cars.filter(car => 
          car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase())
        ).length,
      });
    }
  }, [searchQuery, selectedMake, selectedYear, selectedFuelType, selectedBodyType, selectedLocation, selectedPriceRange, cars]);

  // Track filter changes
  const trackFilterChange = (filterType: string, filterValue: any) => {
    const currentFilters = {
      make: selectedMake,
      year: selectedYear,
      fuelType: selectedFuelType,
      bodyType: selectedBodyType,
      location: selectedLocation,
      priceRange: selectedPriceRange,
    };

    trackFilter({
      filterType,
      filterValue,
      previousFilters,
    });

    setPreviousFilters(currentFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMake('All');
    setSelectedYear('All');
    setSelectedFuelType('All');
    setSelectedBodyType('All');
    setSelectedLocation('All');
    setSelectedPriceRange('All');
    
    // Track filter clear
    trackFilter({
      filterType: 'clear_all',
      filterValue: 'all_filters_cleared',
      previousFilters,
    });
  };

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const SelectFilter = ({ title, value, onChange, options, filterType }: {
    title: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    filterType: string;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wider">
        {title}
      </label>
      <select
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          onChange(newValue);
          if (newValue !== 'All') {
            trackFilterChange(filterType, newValue);
          }
        }}
        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-gray-800">
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  const PriceRangeSection = () => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wider">
        Preț
      </label>
      <select
        value={selectedPriceRange}
        onChange={(e) => {
          const newValue = e.target.value;
          setSelectedPriceRange(newValue);
          if (newValue !== 'All') {
            trackFilterChange('price_range', newValue);
          }
        }}
        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none"
      >
        {filterOptions.priceRanges.map((range) => (
          <option key={range.label} value={range.label} className="bg-gray-800">
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );

  const activeFiltersCount = [
    selectedMake !== 'All',
    selectedYear !== 'All',
    selectedFuelType !== 'All',
    selectedBodyType !== 'All',
    selectedLocation !== 'All',
    selectedPriceRange !== 'All',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  return (
    <div className={`bg-gray-900/50 rounded-xl border border-gray-800 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-white">Filtre</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-orange-500 text-white">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wider">
          Caută
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Marca, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <SelectFilter
          title="Marca"
          value={selectedMake}
          onChange={setSelectedMake}
          options={filterOptions.makes}
          filterType="make"
        />
        
        <SelectFilter
          title="An"
          value={selectedYear}
          onChange={setSelectedYear}
          options={filterOptions.years}
          filterType="year"
        />
        
        <SelectFilter
          title="Combustibil"
          value={selectedFuelType}
          onChange={setSelectedFuelType}
          options={filterOptions.fuelTypes}
          filterType="fuel_type"
        />
        
        <SelectFilter
          title="Tip Caroserie"
          value={selectedBodyType}
          onChange={setSelectedBodyType}
          options={filterOptions.bodyTypes}
          filterType="body_type"
        />
        
        <SelectFilter
          title="Locație"
          value={selectedLocation}
          onChange={setSelectedLocation}
          options={filterOptions.locations}
          filterType="location"
        />
        
        <PriceRangeSection />
      </div>
    </div>
  );
} 