import { useState } from 'react'
import './TicketForm.css'

function TicketForm({ onAddTicket }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    step: '',
    solution: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.step || !formData.solution) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const ticket = {
        title: formData.title.trim(),
        problemsSolutions: [
          {
            step: formData.step.trim(),
            solution: formData.solution.trim()
          }
        ]
      }

      const newTicket = await onAddTicket(ticket)
      
      // Upload file if selected
      if (selectedFile && newTicket) {
        const formDataFile = new FormData()
        formDataFile.append('file', selectedFile)
        
        await fetch(`http://localhost:5000/api/tickets/${newTicket._id}/problems/${newTicket.problemsSolutions[0]._id}/upload`, {
          method: 'POST',
          body: formDataFile
        })
      }
      
      setFormData({
        title: '',
        step: '',
        solution: ''
      })
      setSelectedFile(null)
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="ticket-form-container">
      {!isOpen ? (
        <button 
          className="open-form-btn"
          onClick={() => setIsOpen(true)}
        >
          + Add New Ticket
        </button>
      ) : (
        <div className="ticket-form-card">
          <div className="form-header">
            <h2>Create New Ticket</h2>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Ticket Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., INC-12345 - Network Issue"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="step">Step *</label>
              <textarea
                id="step"
                name="step"
                value={formData.step}
                onChange={handleChange}
                placeholder="Describe the step..."
                rows="3"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="solution">Solution *</label>
              <textarea
                id="solution"
                name="solution"
                value={formData.solution}
                onChange={handleChange}
                placeholder="Describe the solution..."
                rows="3"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="file">Attach File (Optional)</label>
              <input
                type="file"
                id="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                disabled={loading}
              />
              {selectedFile && <p className="file-name">Selected: {selectedFile.name}</p>}
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setIsOpen(false)} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default TicketForm
