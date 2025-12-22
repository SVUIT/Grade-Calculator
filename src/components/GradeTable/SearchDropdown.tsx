import React from "react";
import type { Course } from "../../types";

interface SearchDropdownProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: { category: string; subjects: Course[] }[];
  expandedCategories: Set<string>;
  setExpandedCategories: (cats: Set<string>) => void;
  onSelect: (subject: Course) => void;
  autoFocus?: boolean;
  minWidth?: number;
}

// Extracted SubjectItem to reduce nesting
const SubjectItem: React.FC<{
  subject: Course;
  onSelect: (s: Course) => void;
}> = ({
  subject,
  onSelect,
}) => (
  <li style={{ listStyle: "none", margin: 0, padding: 0 }}>
    <button
      type="button"
      className="subject-item"
      onClick={() => onSelect(subject)}
      style={{
        width: "100%",
        textAlign: "left",
        background: "transparent",
        borderTop: "none",
        borderRight: "none",
        borderBottom: "none",
        // borderLeft is handled by class for hover effect
        borderRadius: 0,
        fontFamily: "inherit",
        fontSize: "inherit",
        margin: 0,
        // padding is handled by class
      }}
    >
      <span className="subject-code">{subject.courseCode}</span>
      <span className="subject-name">{subject.courseNameVi}</span>
    </button>
  </li>
);

// Extracted CategoryGroup to reduce nesting
const CategoryGroup: React.FC<{
  category: string;
  subjects: Course[];
  isExpanded: boolean;
  hasSearchResults: boolean;
  toggleCategory: (c: string) => void;
  onSelect: (s: Course) => void;
}> = ({
  category,
  subjects,
  isExpanded,
  hasSearchResults,
  toggleCategory,
  onSelect,
}) => {
  return (
    <div className="category-group">
      <button
        type="button"
        className="category-header"
        aria-expanded={isExpanded}
        onClick={() => toggleCategory(category)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "transparent",
          border: "none",
          borderRadius: 0,
          fontFamily: "inherit",
          fontSize: "inherit",
          margin: 0,
          // padding is handled by class
        }}
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
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>

      {(isExpanded || hasSearchResults) && (
        <ul className="subject-list" style={{ padding: 0, margin: 0, listStyle: "none" }}>
          {subjects.map((subject) => (
            <SubjectItem
              key={subject.courseCode}
              subject={subject}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

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

  return (
    <div
      className="dropdown-menu"
      role="dialog"
      aria-modal="false"
      aria-label="Search Subjects"
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
            <CategoryGroup
              key={category}
              category={category}
              subjects={subjects}
              isExpanded={isExpanded}
              hasSearchResults={!!hasSearchResults}
              toggleCategory={toggleCategory}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SearchDropdown;
