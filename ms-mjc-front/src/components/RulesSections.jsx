import { useEffect, useState } from 'react';

export default function RulesSections() {
  const [sections, setSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadRulesIndex = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}/rules-index.json`);
        const data = await response.json();
        setSections(data.sections || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading rules index:', error);
        setLoading(false);
      }
    };

    loadRulesIndex();
  }, []);

  const toggleSection = (sectionId) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);
  };

  const handleSubsectionClick = (subsectionId, subsectionTitle) => {
    // For now, just log the click - you can implement navigation logic here
    console.log(`Clicked subsection: ${subsectionId} - ${subsectionTitle}`);
    // TODO: Navigate to rule detail view
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading rules sections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Rules by Category</h2>
      
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        
        return (
          <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {section.id}. {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {section.subsections.length} subsections
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Subsections */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {section.subsections.map((subsection) => (
                      <button
                        key={subsection.id}
                        onClick={() => handleSubsectionClick(subsection.id, subsection.title)}
                        className="text-left p-3 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200 group"
                      >
                        <div className="flex items-start">
                          <span className="text-sm font-medium text-blue-600 mr-3 flex-shrink-0">
                            {subsection.id}.
                          </span>
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">
                            {subsection.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 