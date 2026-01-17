import { useState, useEffect } from 'react'
import './App.css'
import TicketForm from './components/TicketForm'
import TicketList from './components/TicketList'
import SearchBar from './components/SearchBar'

const API_URL = 'http://localhost:5000/api/tickets'

function App() {
  const [tickets, setTickets] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [highlightedPsId, setHighlightedPsId] = useState(null)
  const [expandedTicketId, setExpandedTicketId] = useState(null)

  // Fetch tickets from MongoDB on mount
  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch tickets')
      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const addTicket = async (ticket) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ticket.title,
          problemsSolutions: ticket.problemsSolutions || []
        })
      })
      if (!response.ok) throw new Error('Failed to create ticket')
      const newTicket = await response.json()
      setTickets([newTicket, ...tickets])
      return newTicket
    } catch (error) {
      console.error('Error adding ticket:', error)
      setError(error.message)
    }
  }

  const addProblemSolution = async (ticketId, step, solution) => {
    try {
      const response = await fetch(`${API_URL}/${ticketId}/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, solution })
      })
      if (!response.ok) throw new Error('Failed to add problem/solution')
      const updated = await response.json()
      setTickets(tickets.map(t => t._id === ticketId ? updated : t))
    } catch (error) {
      console.error('Error adding problem/solution:', error)
      setError(error.message)
    }
  }

  const updateProblemSolution = async (ticketId, psId, step, solution) => {
    try {
      const response = await fetch(`${API_URL}/${ticketId}/problems/${psId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, solution })
      })
      if (!response.ok) throw new Error('Failed to update problem/solution')
      const updated = await response.json()
      setTickets(tickets.map(t => t._id === ticketId ? updated : t))
    } catch (error) {
      console.error('Error updating problem/solution:', error)
      setError(error.message)
    }
  }

  const deleteProblemSolution = async (ticketId, psId) => {
    try {
      const response = await fetch(`${API_URL}/${ticketId}/problems/${psId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete problem/solution')
      const updated = await response.json()
      setTickets(tickets.map(t => t._id === ticketId ? updated : t))
    } catch (error) {
      console.error('Error deleting problem/solution:', error)
      setError(error.message)
    }
  }

  const deleteTicket = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete ticket')
      setTickets(tickets.filter(ticket => ticket._id !== id))
    } catch (error) {
      console.error('Error deleting ticket:', error)
      setError(error.message)
    }
  }

  const updateTicketTitle = async (ticketId, newTitle) => {
    try {
      const response = await fetch(`${API_URL}/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      })
      if (!response.ok) throw new Error('Failed to update ticket')
      const updated = await response.json()
      setTickets(tickets.map(t => t._id === ticketId ? updated : t))
    } catch (error) {
      console.error('Error updating ticket:', error)
      setError(error.message)
    }
  }

  // Get all unique tags from all tickets
  const allTags = []

  // Handle navigation to a specific problem/solution
  const handleNavigateToTicket = (result) => {
    setExpandedTicketId(result.ticketId)
    setHighlightedPsId(result.psId)
    // Clear highlight after 3 seconds
    setTimeout(() => setHighlightedPsId(null), 3000)
  }

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchQuery === '' || 
      (ticket.title && ticket.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ticket.problemsSolutions?.some(ps => {
        const stepText = ps.step || ps.problem || ''
        const solutionText = ps.solution || ''
        const lowerQuery = searchQuery.toLowerCase()
        return (stepText && stepText.toLowerCase().includes(lowerQuery)) ||
               (solutionText && solutionText.toLowerCase().includes(lowerQuery))
      })
    return matchesSearch
  })

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎫 IT Step & Solution Tracker</h1>
        <p>Track and search your IT ticket solutions</p>
        {error && <div className="error-banner">{error}</div>}
      </header>

      <main className="app-main">
        {loading ? (
          <div className="loading">Loading tickets...</div>
        ) : (
          <>
            <TicketForm onAddTicket={addTicket} />
            
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              allTags={allTags}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              tickets={tickets}
              onNavigateToTicket={handleNavigateToTicket}
            />

            <TicketList 
              tickets={filteredTickets}
              onDeleteTicket={deleteTicket}
              onAddProblemSolution={addProblemSolution}
              onUpdateProblemSolution={updateProblemSolution}
              onDeleteProblemSolution={deleteProblemSolution}
              onUpdateTicketTitle={updateTicketTitle}
              highlightedPsId={highlightedPsId}
              expandedTicketId={expandedTicketId}
              setExpandedTicketId={setExpandedTicketId}
              searchQuery={searchQuery}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default App
