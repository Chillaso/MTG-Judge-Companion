import { useEffect, useState } from 'react';

const CATEGORIES = [
  { id: '1', title: 'Game Concepts', description: 'Basic game rules and fundamental concepts' },
  { id: '2', title: 'Parts of a Card', description: 'Card anatomy and components' },
  { id: '3', title: 'Card Types', description: 'Different types of cards (creatures, instants, etc.)' },
  { id: '4', title: 'Zones', description: 'Game zones like battlefield, graveyard, library' },
  { id: '5', title: 'Turn Structure', description: 'How turns work and game phases' },
  { id: '6', title: 'Spells, Abilities, and Effects', description: 'How spells and abilities work' },
  { id: '7', title: 'Additional Rules', description: 'Special rules and interactions' },
  { id: '8', title: 'Multiplayer Rules', description: 'Rules for multiplayer games' },
  { id: '9', title: 'Casual Variants', description: 'Alternative game formats' }
];

export default function CategoriesView() {
  const [rulesData, setRulesData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryRules, setCategoryRules] = useState([]);
  const [expandedRules, setExpandedRules] = useState(new Set());
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

  const handleCategorySelect = (categoryId) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    const sectionData = rulesData.find(section => section.section === categoryId);
    
    if (sectionData) {
      setSelectedCategory(category);
      setCategoryRules(sectionData.rules);
      setExpandedRules(new Set());
    }
  };

  const toggleRuleExpansion = (ruleNumber) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleNumber)) {
      newExpanded.delete(ruleNumber);
    } else {
      newExpanded.add(ruleNumber);
    }
    setExpandedRules(newExpanded);
  };

  const goBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryRules([]);
    setExpandedRules(new Set());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading categories...</div>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={goBackToCategories}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Section {selectedCategory.id}: {selectedCategory.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedCategory.description}</p>
          <div className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            {categoryRules.length} rules in this category
          </div>
        </div>

        <div className="space-y-3">
          {categoryRules.map((rule) => (
            <div key={rule.rule} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toggleRuleExpansion(rule.rule)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {rule.rule}. {rule.title}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {rule.subrules.length} subrule{rule.subrules.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="ml-4">
                    <svg
                      className={`w-5 h-5 text-gray-400 dark:text-gray-500 transform transition-transform duration-200 ${
                        expandedRules.has(rule.rule) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              {expandedRules.has(rule.rule) && (
                <div className="px-6 pb-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="space-y-4 mt-4">
                    {rule.subrules.map((subrule, index) => (
                      <div key={index} className="border-l-2 border-blue-200 dark:border-blue-600 pl-4">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                          {subrule.subrule}
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                          {subrule.text}
                        </div>
                        {subrule.examples && subrule.examples.length > 0 && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700 p-3 rounded border-l-2 border-gray-300 dark:border-gray-600">
                            <strong>Example{subrule.examples.length > 1 ? 's' : ''}:</strong>
                            <div className="mt-1 space-y-1">
                              {subrule.examples.map((example, exIndex) => (
                                <div key={exIndex}>{example}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Rule Categories</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Browse Magic: The Gathering rules by category</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-left hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                {category.id}
              </div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{category.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
} 