import { useEffect, useState } from 'react';

export default function GlossarySearch() {
  const [glossaryData, setGlossaryData] = useState([]);
  const [termSearch, setTermSearch] = useState('');
  const [textSearch, setTextSearch] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGlossary = async () => {
      try {
        const response = await fetch('/glossary.json');
        const data = await response.json();
        setGlossaryData(data.glossary || []);
        setFilteredResults(data.glossary || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading glossary:', error);
        setLoading(false);
      }
    };

    loadGlossary();
  }, []);

  useEffect(() => {
    const filtered = glossaryData.filter((item) => {
      const termMatch = termSearch === '' || 
        item.term.toLowerCase().includes(termSearch.toLowerCase());
      
      const textMatch = textSearch === '' || 
        item.text.toLowerCase().includes(textSearch.toLowerCase());
      
      return termMatch && textMatch;
    });

    setFilteredResults(filtered);
  }, [termSearch, textSearch, glossaryData]);

  const clearFilters = () => {
    setTermSearch('');
    setTextSearch('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading glossary...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">MTG Glossary</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="term-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search by Term
            </label>
            <input
              id="term-search"
              type="text"
              value={termSearch}
              onChange={(e) => setTermSearch(e.target.value)}
              placeholder="Search terms (e.g., Abandon, Ability)..."
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="text-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search by Definition Text
            </label>
            <input
              id="text-search"
              type="text"
              value={textSearch}
              onChange={(e) => setTextSearch(e.target.value)}
              placeholder="Search definitions (e.g., stack, permanent, rule)..."
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {(termSearch || textSearch) && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredResults.length} of {glossaryData.length} terms
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {termSearch || textSearch ? 'No terms found matching your search.' : 'No glossary terms available.'}
            </div>
          </div>
        ) : (
          filteredResults.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {item.term}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 