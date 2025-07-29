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
        for (const subsection of section.rules) {
          for (const rule of subsection.rules) {
            if (count >= 3) break;
            exampleResults.push({
              section: section.section,
              sectionTitle: section.title,
              subsection: subsection.subsection,
              subsectionTitle: subsection.title,
              rule: rule.rule,
              text: rule.text,
              examples: rule.examples,
              subrules: rule.subrules,
              isPartialMatch: false
            });
            count++;
          }
          if (count >= 3) break;
        }
        if (count >= 3) break;
      }
      
      setFilteredResults(exampleResults);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const results = [];

    rulesData.forEach(section => {
      section.rules.forEach(subsection => {
        subsection.rules.forEach(rule => {
          // Check if rule number matches
          const ruleNumberMatch = rule.rule.includes(searchTerm);
          
          // Check if rule text matches
          const textMatch = rule.text.toLowerCase().includes(searchLower);
          
          // Check subrules for matches
          const matchingSubrules = rule.subrules.filter(subrule => {
            const subruleNumberMatch = subrule.subrule.includes(searchTerm);
            const subruleTextMatch = subrule.text.toLowerCase().includes(searchLower);
            return subruleNumberMatch || subruleTextMatch;
          });

          if (ruleNumberMatch || textMatch || matchingSubrules.length > 0) {
            results.push({
              section: section.section,
              sectionTitle: section.title,
              subsection: subsection.subsection,
              subsectionTitle: subsection.title,
              rule: rule.rule,
              text: rule.text,
              examples: rule.examples,
              subrules: matchingSubrules.length > 0 ? matchingSubrules : rule.subrules,
              isPartialMatch: matchingSubrules.length > 0 && matchingSubrules.length < rule.subrules.length
            });
          }
        });
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
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-500 dark:text-gray-900">$1</mark>');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading rules...</div>
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
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredResults.length} matching rules
          </div>
        )}
        
        {!searchTerm && filteredResults.length > 0 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Showing first 10 rules as examples
          </div>
        )}
      </div>

      {filteredResults.length > 0 && (
        <div className="space-y-6">
          {filteredResults.map((result, index) => (
            <div key={`${result.rule}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Section {result.section}: {result.sectionTitle} → {result.subsection}: {result.subsectionTitle}
                </div>
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  {result.rule}
                </h3>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(result.text, searchTerm) 
                    }}
                  />
                </div>
                {result.examples && result.examples.length > 0 && (
                  <div className="mb-3 text-sm text-gray-600 dark:text-gray-400 italic bg-gray-100 dark:bg-gray-800 p-2 rounded border-l-2 border-gray-300 dark:border-gray-500">
                    <strong>Example{result.examples.length > 1 ? 's' : ''}:</strong>
                    <div className="mt-1 space-y-1">
                      {result.examples.map((example, exIndex) => (
                        <div key={exIndex}>{example}</div>
                      ))}
                    </div>
                  </div>
                )}
                {result.isPartialMatch && (
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Showing {result.subrules.length} matching subrules
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {result.subrules.map((subrule, subIndex) => (
                  <div key={subIndex} className="border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                      {subrule.subrule}
                    </div>
                    <div 
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(subrule.text, searchTerm) 
                      }}
                    />
                    {subrule.examples && subrule.examples.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
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
          <div className="text-gray-500 dark:text-gray-400 text-lg">
            No rules found matching "{searchTerm}". Try different keywords or rule numbers.
          </div>
        </div>
      )}
      
      {!searchTerm && filteredResults.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg">
            Enter a rule number or keywords to search the MTG rules database
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Try searching for: "603", "damage", "stack", "triggered", "priority"
          </div>
        </div>
      )}
    </div>
  );
} 