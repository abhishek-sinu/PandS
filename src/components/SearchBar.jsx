import { useState } from 'react'
import './SearchBar.css'

function SearchBar({ searchQuery, setSearchQuery, allTags, selectedTags, setSelectedTags, tickets, onNavigateToTicket }) {
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
  }

  // Find search matches
  const getSearchResults = () => {
    if (!searchQuery.trim()) return []
    
    const results = []
    const lowerQuery = searchQuery.toLowerCase()
    
    tickets.forEach(ticket => {
      ticket.problemsSolutions?.forEach((ps, psIndex) => {
        // Check if step matches (handle both 'step' and 'problem' field names)
        const stepText = ps.step || ps.problem || ''
        if (stepText && stepText.toLowerCase().includes(lowerQuery)) {
          results.push({
            ticketId: ticket._id,
            ticketTitle: ticket.title,
            psIndex: psIndex,
            psId: ps._id,
            type: 'step',
            text: stepText.substring(0, 80),
            fullText: stepText
          })
        }
        // Check if solution matches
        const solutionText = ps.solution || ''
        if (solutionText && solutionText.toLowerCase().includes(lowerQuery)) {
          results.push({
            ticketId: ticket._id,
            ticketTitle: ticket.title,
            psIndex: psIndex,
            psId: ps._id,
            type: 'solution',
            text: solutionText.substring(0, 80),
            fullText: solutionText
          })
        }
      })
    })
    
    return results
  }

  const handleResultClick = (result) => {
    onNavigateToTicket(result)
    setShowSearchResults(false)
    setSearchQuery('')  // Clear search query to show all tickets
  }

  const searchResults = getSearchResults()

  return (
    <div className="search-bar-container">
      <div className="search-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by ticket number, step, solution, or tags..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSearchResults(true)
            }}
            onFocus={() => {
              if (searchQuery) setShowSearchResults(true)
            }}
            onBlur={() => {
              setShowSearchResults(false)
            }}
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}

          {/* Search Results Dropdown - Simplified */}
          {showSearchResults && searchQuery.trim() && (
            <div 
              className="search-results-dropdown"
            >
              {searchResults.length > 0 ? (
                <>
                  <div className="results-header">
                    Found {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''}
                  </div>
                  <div className="results-list">
                    {searchResults.slice(0, 10).map((result, idx) => (
                      <div 
                        key={idx}
                        className="search-result-item"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleResultClick(result)
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleResultClick(result)
                          }
                        }}
                      >
                        <div className="result-ticket-title">
                          📋 {result.ticketTitle}
                        </div>
                        <div className="result-path">
                          Problem/Solution #{result.psIndex + 1} → <span className="result-type">{result.type.toUpperCase()}</span>
                        </div>
                        <div className="result-preview">
                          {result.text}
                          {result.fullText.length > 80 ? '...' : ''}
                        </div>
                      </div>
                    ))}
                    {searchResults.length > 10 && (
                      <div className="results-more">
                        +{searchResults.length - 10} more results
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="results-empty">No matches found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="tags-filter-section">
          <div className="tags-header">
            <h3>Filter by Tags:</h3>
            {(searchQuery || selectedTags.length > 0) && (
              <button className="clear-all-btn" onClick={clearFilters}>
                Clear All Filters
              </button>
            )}
          </div>
          
          <div className="tags-container">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`filter-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && <span className="check-mark"> ✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
