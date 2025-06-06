import { useState } from 'react'
import { DateRangePicker } from './components/DateRangePicker'
import { FilterOptions } from './components/FilterOptions'
import { ApiStatus } from './components/ApiStatus'
import './App.css'

interface FilterState {
  showAssignee: boolean;
  showDate: boolean;
  showDescription: boolean;
  client?: string;
  project?: string;
}

function App() {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    showAssignee: true,
    showDate: true,
    showDescription: true,
  })

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Toggl WebSense</h1>
          <ApiStatus />
        </div>
        
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-lg border border-gray-100">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Zeitraum
                </h2>
                <DateRangePicker onDateChange={handleDateChange} />
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter & Optionen
                </h2>
                <FilterOptions onFilterChange={handleFilterChange} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
