import { useEffect, useState } from 'react';

export default function RulesSearch() {
  const [rulesData, setRulesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRules = async () => {
      try {
        const response = await fetch('/rules.json');
        const data = await response.json();
        setRulesData(data.mtgrules || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading rules:', error);
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      // Show first 10 rules as examples
      const exampleResults = [];
      let count = 0;
      
      for (const section of rulesData) {
        for (const rule of section.rules) {
          if (count >= 10) break;
          exampleResults.push({
            section: section.section,
            sectionTitle: section.title,
            rule: rule.rule,
            title: rule.title,
            subrules: rule.subrules,
            isPartialMatch: false
          });
          count++;
        }
        if (count >= 10) break;
      }
      
      setFilteredResults(exampleResults);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const results = [];

    rulesData.forEach(section => {
      section.rules.forEach(rule => {
        // Check if rule number matches
        const ruleNumberMatch = rule.rule.includes(searchTerm);
        
        // Check if rule title matches
        const titleMatch = rule.title.toLowerCase().includes(searchLower);
        
        // Check subrules for matches
        const matchingSubrules = rule.subrules.filter(subrule => {
          const subruleNumberMatch = subrule.subrule.includes(searchTerm);
          const textMatch = subrule.text.toLowerCase().includes(searchLower);
          return subruleNumberMatch || textMatch;
        });

        if (ruleNumberMatch || titleMatch || matchingSubrules.length > 0) {
          results.push({
            section: section.section,
            sectionTitle: section.title,
            rule: rule.rule,
            title: rule.title,
            subrules: matchingSubrules.length > 0 ? matchingSubrules : rule.subrules,
            isPartialMatch: matchingSubrules.length > 0 && matchingSubrules.length < rule.subrules.length
          });
        }
      });
    });

    setFilteredResults(results);
  }, [searchTerm, rulesData]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading rules...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rules by number (e.g., 603) or keywords (e.g., damage, stack, triggered)..."
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Found {filteredResults.length} matching rules
          </div>
        )}
        
        {!searchTerm && filteredResults.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Showing first 10 rules as examples
          </div>
        )}
      </div>

      {filteredResults.length > 0 && (
        <div className="space-y-6">
          {filteredResults.map((result, index) => (
            <div key={`${result.rule}-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">
                  Section {result.section}: {result.sectionTitle}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {result.rule}. {result.title}
                </h3>
                {result.isPartialMatch && (
                  <div className="text-sm text-blue-600 mt-1">
                    Showing {result.subrules.length} matching subrules
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {result.subrules.map((subrule, subIndex) => (
                  <div key={subIndex} className="border-l-2 border-gray-200 pl-4">
                    <div className="text-sm font-medium text-blue-600 mb-1">
                      {subrule.subrule}
                    </div>
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(subrule.text, searchTerm) 
                      }}
                    />
                    {subrule.examples && subrule.examples.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600 italic">
                        Examples: {subrule.examples.join('; ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {searchTerm && filteredResults.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            No rules found matching "{searchTerm}". Try different keywords or rule numbers.
          </div>
        </div>
      )}
      
      {!searchTerm && filteredResults.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            Enter a rule number or keywords to search the MTG rules database
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Try searching for: "603", "damage", "stack", "triggered", "priority"
          </div>
        </div>
      )}
    </div>
  );
} 