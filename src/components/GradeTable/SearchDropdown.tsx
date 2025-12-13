import React from "react";
import type { SubjectData } from "../../types";

interface SearchDropdownProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: { category: string; subjects: SubjectData[] }[];
  expandedCategories: Set<string>;
  setExpandedCategories: (cats: Set<string>) => void;
  onSelect: (subject: SubjectData) => void;
  autoFocus?: boolean;
  minWidth?: number;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  searchTerm,
  setSearchTerm,
  searchResults,
  expandedCategories,
  setExpandedCategories,
  onSelect,
  autoFocus = false,
  minWidth = 260, // Reduced default width
}) => {
  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    <div
      className="dropdown-menu"
      style={{
        minWidth: minWidth,
        maxWidth: "90vw",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* SEARCH */}
      <div className="dropdown-search-container">
        <div className="search-input-wrapper">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="2"
            className="search-icon"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            autoFocus={autoFocus}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dropdown-input"
            aria-label="Search subjects"
          />
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="dropdown-content">
        {searchResults.map(({ category, subjects }) => {
          const isExpanded = expandedCategories.has(category);
          const hasSearchResults = searchTerm.trim() && subjects.length > 0;

          return (
            <div key={category} className="category-group">
              <div
                className="category-header"
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onKeyDown={(e) => handleKeyDown(e, () => toggleCategory(category))}
                onClick={() => toggleCategory(category)}
              >
                <span className="category-title">{category}</span>
                <span className="category-arrow">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ 
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                      transition: 'transform 0.2s ease' 
                    }}
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </div>

              {/* SUBJECTS */}
              {(isExpanded || hasSearchResults) && (
                <div className="subject-list" role="list">
                  {subjects.map((subject) => (
                    <div
                      key={subject.code}
                      className="subject-item"
                      role="listitem"
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, () => onSelect(subject))}
                      onClick={() => onSelect(subject)}
                    >
                      <span className="subject-code">
                        {subject.code}
                      </span>
                      <span className="subject-name">{subject.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchDropdown;