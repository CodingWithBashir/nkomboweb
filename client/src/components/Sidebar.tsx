'use client';

import { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface SidebarProps {
  onFilter: (filters: any) => void;
}

export default function Sidebar({ onFilter }: SidebarProps) {
  const [level, setLevel] = useState('olevel');
  const [classId, setClassId] = useState('');
  const [year, setYear] = useState('2026');
  const [term, setTerm] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ level, class_id: classId, year, term });
  };

  const handleReset = () => {
    setLevel('olevel');
    setClassId('');
    setYear('2026');
    setTerm('1');
    onFilter({});
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="h-5 w-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-navy-700">Filter Holidays</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Level</label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setLevel('olevel')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                level === 'olevel'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              O&apos; Level (S1-S3)
            </button>
            <button
              type="button"
              onClick={() => setLevel('alevel')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                level === 'alevel'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              A&apos; Level (S4-S6)
            </button>
          </div>
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Classes</option>
            {level === 'olevel' ? (
              <>
                <option value="1">S1</option>
                <option value="2">S2</option>
                <option value="3">S3</option>
              </>
            ) : (
              <>
                <option value="4">S4</option>
                <option value="5">S5</option>
                <option value="6">S6</option>
              </>
            )}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>

        {/* Term */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Term</label>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
        </div>

        {/* Buttons */}
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-full border border-gray-300 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Filters
        </button>
      </form>

      {/* Help Box */}
      <div className="mt-6 p-4 bg-navy-50 rounded-lg">
        <p className="text-sm font-medium text-navy-700">Need Help?</p>
        <p className="text-xs text-gray-600 mt-1">
          If you can&apos;t find your holiday materials, contact your class teacher or admin.
        </p>
      </div>
    </div>
  );
}
