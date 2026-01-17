import { useState, useEffect, useRef } from 'react'
import './TicketList.css'
import FormattingToolbar from './FormattingToolbar'

function TicketList({ tickets, onDeleteTicket, onAddProblemSolution, onUpdateProblemSolution, onDeleteProblemSolution, onUpdateTicketTitle, highlightedPsId, expandedTicketId, setExpandedTicketId, searchQuery }) {

  const [expandedId, setExpandedId] = useState(null)
  // Handle external expansion from search navigation
  useEffect(() => {
    if (expandedTicketId) {
      setExpandedId(expandedTicketId)
      // Scroll to ticket
      const ticketElement = document.getElementById(`ticket-${expandedTicketId}`)
      if (ticketElement) {
        ticketElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [expandedTicketId])

  // Helper function to check if attachment is an image
  const isImageFile = (filename) => {
    if (!filename) return false
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp']
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    return imageExtensions.includes(ext)
  }
  // Helper: convert URLs in text to clickable links, preserving highlight
  const linkifyAndHighlight = (text, query) => {
    if (!text) return text
    // Regex for URLs (http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/g
    // Split by URLs
    const urlParts = text.split(urlRegex)
    return urlParts.map((part, i) => {
      if (urlRegex.test(part)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="solution-link">{part}</a>
      } else if (query) {
        // Highlight query in non-URL text
        const highlightParts = part.split(new RegExp(`(${query})`, 'gi'))
        return highlightParts.map((sub, j) =>
          sub.toLowerCase() === query.toLowerCase() ?
            <span key={i + '-' + j} className="search-highlight">{sub}</span> :
            sub
        )
      } else {
        return part
      }
    })
  }
  // Original highlightText for step
  const highlightText = (text, query) => {
    if (!text || !query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, idx) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <span key={idx} className="search-highlight">{part}</span> : 
        part
    )
  }
  const [editingPsId, setEditingPsId] = useState(null)
  const [editingStep, setEditingStep] = useState('')
  const [editingSolution, setEditingSolution] = useState('')
  const [editingTicketId, setEditingTicketId] = useState(null)
  const [newStep, setNewStep] = useState('')
  const [newSolution, setNewSolution] = useState('')
  const [newFiles, setNewFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [editFiles, setEditFiles] = useState([])
  const [editDragActive, setEditDragActive] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editingTitleId, setEditingTitleId] = useState(null)
  const [deletingAttachments, setDeletingAttachments] = useState([])
  const [showSavePrompt, setShowSavePrompt] = useState(false)

  const autoExpandTextarea = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 500) + 'px'
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const startEditProblemSolution = (step, solution, psId, ticketId) => {
    setEditingPsId(psId)
    setEditingTicketId(ticketId)
    setEditingStep(step)
    setEditingSolution(solution)
  }

  // --- Formatting logic ---
  const editStepRef = useRef();
  const editSolutionRef = useRef();
  const newStepRef = useRef();
  const newSolutionRef = useRef();

  function applyFormatToTextarea(type, format, color) {
    let ref;
    let value;
    let setValue;
    if (type === 'editStep') {
      ref = editStepRef;
      value = editingStep;
      setValue = setEditingStep;
    } else if (type === 'editSolution') {
      ref = editSolutionRef;
      value = editingSolution;
      setValue = setEditingSolution;
    } else if (type === 'newStep') {
      ref = newStepRef;
      value = newStep;
      setValue = setNewStep;
    } else if (type === 'newSolution') {
      ref = newSolutionRef;
      value = newSolution;
      setValue = setNewSolution;
    } else {
      return;
    }
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    let before = value.slice(0, start);
    let selected = value.slice(start, end);
    let after = value.slice(end);
    if (!selected) return; // Only format if text is selected
    let formatted;
    if (format === 'bold') {
      formatted = `<b>${selected}</b>`;
    } else if (format === 'italic') {
      formatted = `<i>${selected}</i>`;
    } else if (format === 'underline') {
      formatted = `<u>${selected}</u>`;
    } else if (format === 'color' && color) {
      formatted = `<span style="color:${color}">${selected}</span>`;
    } else {
      return;
    }
    setValue(before + formatted + after);
    // Restore selection
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = start + formatted.length;
    }, 0);
  }

  const saveProblemSolution = async () => {
    if (!editingStep.trim() || !editingSolution.trim()) {
      alert('Please fill in both step and solution');
      return;
    }
    try {
      // Delete marked attachments first
      if (deletingAttachments.length > 0) {
        console.log(`Deleting ${deletingAttachments.length} attachment(s)`)
        for (const attachmentId of deletingAttachments) {
          try {
            await deleteAttachmentFromServer(editingTicketId, editingPsId, attachmentId)
            console.log(`Deleted attachment: ${attachmentId}`)
          } catch (error) {
            console.error(`Failed to delete attachment ${attachmentId}:`, error)
          }
        }
      }

      // Update the step/solution
      await onUpdateProblemSolution(editingTicketId, editingPsId, editingStep.trim(), editingSolution.trim())
      
      // Upload new files if selected
      if (editFiles.length > 0) {
        console.log(`Uploading ${editFiles.length} file(s) for ticket ${editingTicketId}, step/solution ${editingPsId}`)
        
        for (const file of editFiles) {
          const formData = new FormData()
          formData.append('file', file)
          
          console.log(`Uploading file: ${file.name}`)
          
          const uploadResponse = await fetch(`http://localhost:5000/api/tickets/${editingTicketId}/problems/${editingPsId}/upload`, {
            method: 'POST',
            body: formData
          })
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            console.error('File upload error:', errorData)
          } else {
            const result = await uploadResponse.json()
            console.log('File uploaded successfully:', result)
          }
        }
      }
      
      cancelEditProblemSolution()
    } catch (error) {
      console.error('Error in saveProblemSolution:', error)
      alert('Error saving step/solution. Check console for details.')
    }
  }

  const handleAddProblemSolution = async (ticketId, currentTicket) => {
    console.log('Step:', newStep, 'Solution:', newSolution);
    if (!newStep.trim() || !newSolution.trim()) {
      alert('Please fill in both step and solution')
      return
    }
    
    try {
      console.log('Adding new step/solution...')
      onAddProblemSolution(ticketId, newStep.trim(), newSolution.trim())
      
      // Upload files if selected
      if (newFiles.length > 0 && currentTicket) {
        // Wait a moment for the problem/solution to be created and state updated
        await new Promise(resolve => setTimeout(resolve, 100))
        
        console.log('Fetching updated ticket to get new step/solution ID...')
        const updatedTicket = await fetch(`http://localhost:5000/api/tickets/${ticketId}`).then(r => r.json())
        const newPsId = updatedTicket.problemsSolutions[updatedTicket.problemsSolutions.length - 1]?._id
        
        console.log(`New step/solution ID: ${newPsId}`)
        console.log(`Uploading ${newFiles.length} file(s)...`)
        
        if (newPsId) {
          for (const file of newFiles) {
            const formData = new FormData()
            formData.append('file', file)
            
            console.log(`Uploading file: ${file.name}`)
            
            const uploadResponse = await fetch(`http://localhost:5000/api/tickets/${ticketId}/problems/${newPsId}/upload`, {
              method: 'POST',
              body: formData
            })
            
            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json()
              console.error('File upload error:', errorData)
            } else {
              const result = await uploadResponse.json()
              console.log('File uploaded successfully:', result)
            }
          }
        } else {
          console.error('Could not find new step/solution ID')
        }
      }
      
      setNewStep('')
      setNewSolution('')
      setNewFiles([])
      setEditingTicketId(null)
    } catch (error) {
      console.error('Error in handleAddProblemSolution:', error)
      alert('Error adding step/solution. Check console for details.')
    }
  }

  const handleFileInput = (files) => {
    if (files) {
      setNewFiles(prev => [...prev, ...Array.from(files)])
    }
  }

  const removeFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleEditFileInput = (files) => {
    if (files) {
      setEditFiles(prev => [...prev, ...Array.from(files)])
    }
  }

  const removeEditFile = (index) => {
    setEditFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleEditDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setEditDragActive(true)
    } else if (e.type === 'dragleave') {
      setEditDragActive(false)
    }
  }

  const handleEditDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setEditDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleEditFileInput(e.dataTransfer.files)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileInput(e.dataTransfer.files)
    }
  }

  const startEditTitle = (ticket) => {
    setEditingTitleId(ticket._id)
    setEditTitle(ticket.title)
  }

  const saveTitle = () => {
    if (!editTitle.trim()) {
      alert('Title cannot be empty')
      return
    }
    onUpdateTicketTitle(editingTitleId, editTitle.trim())
    setEditingTitleId(null)
    setEditTitle('')
  }

  const cancelEditProblemSolution = () => {
    setEditingPsId(null);
    setEditingTicketId(null);
    setEditingStep('');
    setEditingSolution('');
    setEditFiles([]);
    setDeletingAttachments([]);
    setShowSavePrompt(false);
  }

  function linkifyHtml(text) {
    if (!text) return '';
    // Replace URLs with clickable links
    return text.replace(/(https?:\/\/[^\s]+)/g, function(url) {
      return `<a href="${url}" style="color:#00eaff;text-decoration:underline" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  }

  if (tickets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No tickets found</h3>
        <p>Add your first ticket to start tracking problems and solutions</p>
      </div>
    )
  }

  return (
    <div className="ticket-list">
      <h2 className="list-header">
        {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'} Found
      </h2>
      
      {tickets.map(ticket => (
        <div 
          key={ticket._id} 
          className="ticket-card"
          id={`ticket-${ticket._id}`}
        >
          <div 
            className="ticket-header" 
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={() => toggleExpand(ticket._id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="ticket-title-section">
              {editingTitleId === ticket._id ? (
                <div className="edit-title-inline">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      saveTitle()
                    }} 
                    className="save-small-btn"
                    title="Save"
                  >✓</button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setEditingTitleId(null)
                    }} 
                    className="cancel-small-btn"
                    title="Cancel"
                  >✕</button>
                </div>
              ) : (
                <>
                  <h3 className="ticket-number">{ticket.title}</h3>
                  <button 
                    className="edit-title-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditTitle(ticket)
                    }}
                    title="Edit title"
                  >
                    ✏️
                  </button>
                </>
              )}
              <span className="ticket-date">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="ticket-actions">
              <button 
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm('Are you sure you want to delete this ticket?')) {
                    onDeleteTicket(ticket._id)
                  }
                }}
              >
                🗑️ Delete
              </button>
              <button 
                className="expand-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(ticket._id)
                }}
              >
                {expandedId === ticket._id ? '▲' : '▼'}
              </button>
            </div>
          </div>

          <div className="ps-count">
            {ticket.problemsSolutions?.length || 0} step{(ticket.problemsSolutions?.length || 0) !== 1 ? 's' : ''}/solution(s)
          </div>

          {expandedId === ticket._id && (
            <div className="ticket-expanded">
              <div className="problems-solutions">
                {ticket.problemsSolutions?.map((ps, index) => (
                  <div 
                    key={ps._id} 
                    className={`ps-item ${highlightedPsId === ps._id ? 'highlighted' : ''}`}
                    id={`ps-${ps._id}`}
                  >
                    {editingPsId === ps._id && editingTicketId === ticket._id ? (
                      // Edit Mode
                      <div className="ps-edit">
                        <div className="form-group">
                          <label>Step</label>
                          <FormattingToolbar
                            onFormat={fmt => applyFormatToTextarea('editStep', fmt)}
                            onColor={color => applyFormatToTextarea('editStep', 'color', color)}
                          />
                          <textarea
                            ref={editStepRef}
                            value={editingStep}
                            onChange={(e) => {
                              setEditingStep(e.target.value)
                              autoExpandTextarea(e)
                            }}
                            onInput={autoExpandTextarea}
                            onClick={(e) => e.stopPropagation()}
                            rows="2"
                            className="auto-expand-textarea"
                          />
                        </div>
                        <div className="form-group">
                          <label>Solution</label>
                          <FormattingToolbar
                            onFormat={fmt => applyFormatToTextarea('editSolution', fmt)}
                            onColor={color => applyFormatToTextarea('editSolution', 'color', color)}
                          />
                          <textarea
                            ref={editSolutionRef}
                            value={editingSolution}
                            onChange={(e) => {
                              setEditingSolution(e.target.value)
                              autoExpandTextarea(e)
                            }}
                            onInput={autoExpandTextarea}
                            onClick={(e) => e.stopPropagation()}
                            rows="2"
                            className="auto-expand-textarea"
                          />
                        </div>
                        
                        <div className="form-group file-group">
                          <label>📎 Attach Files (Optional)</label>
                          <div 
                            className={`file-input-wrapper ${editDragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleEditDrag}
                            onDragLeave={handleEditDrag}
                            onDragOver={handleEditDrag}
                            onDrop={handleEditDrop}
                          >
                            <input
                              type="file"
                              id={`editPsFile-${ps._id}`}
                              multiple
                              onChange={(e) => handleEditFileInput(e.target.files)}
                              className="file-input"
                            />
                            <label htmlFor={`editPsFile-${ps._id}`} className="file-label">
                              📎 Choose Files or Drag & Drop
                            </label>
                          </div>
                          {editFiles.length > 0 && (
                            <div className="files-list">
                              {editFiles.map((file, fileIdx) => (
                                <div key={fileIdx} className="file-item">
                                  <span className="file-name">{file.name}</span>
                                  <button
                                    type="button"
                                    className="remove-file-btn"
                                    onClick={() => removeEditFile(fileIdx)}
                                    title="Remove file"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {ps.attachments && ps.attachments.length > 0 && (
                            <div className="existing-attachments">
                              <h5>Existing Files:</h5>
                              <div className="attachments-list">
                                {ps.attachments.map((attachment, idx) => (
                                  <div key={idx} className="attachment-item">
                                    {isImageFile(attachment.originalName) ? (
                                      <div className="attachment-preview-container">
                                        <img 
                                          src={`http://localhost:5000${attachment.filePath}`}
                                          alt={attachment.originalName}
                                          className="attachment-image-preview"
                                          title={attachment.originalName}
                                        />
                                        <div className="attachment-preview-info">
                                          <span className={`attachment-name ${deletingAttachments.includes(attachment._id) ? 'marked-for-deletion' : ''}`}>
                                            {attachment.originalName}
                                          </span>
                                          <div className="attachment-actions">
                                            <a 
                                              href={`http://localhost:5000${attachment.filePath}`}
                                              download={attachment.originalName}
                                              className="download-btn"
                                              title="Download"
                                            >
                                              ⬇️ Download
                                            </a>
                                            <button
                                              type="button"
                                              className={`delete-attachment-btn ${deletingAttachments.includes(attachment._id) ? 'marked' : ''}`}
                                              onClick={() => markAttachmentForDeletion(attachment._id)}
                                              title="Mark for deletion"
                                            >
                                              🗑️
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <span className={`attachment-name ${deletingAttachments.includes(attachment._id) ? 'marked-for-deletion' : ''}`}>
                                          {attachment.originalName}
                                        </span>
                                        <a 
                                          href={`http://localhost:5000${attachment.filePath}`}
                                          download={attachment.originalName}
                                          className="download-btn"
                                          title="Download"
                                        >
                                          ⬇️ Download
                                        </a>
                                        <button
                                          type="button"
                                          className={`delete-attachment-btn ${deletingAttachments.includes(attachment._id) ? 'marked' : ''}`}
                                          onClick={() => markAttachmentForDeletion(attachment._id)}
                                          title="Mark for deletion"
                                        >
                                          🗑️
                                        </button>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {showSavePrompt && deletingAttachments.length > 0 && (
                                <div className="delete-prompt">
                                  <p>⚠️ You have marked {deletingAttachments.length} file(s) for deletion. Click Save to confirm.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="ps-actions">
                          <button className="save-btn" onClick={(e) => {
                            e.stopPropagation()
                            saveProblemSolution()
                          }}>
                            Save
                          </button>
                          <button className="cancel-btn" onClick={(e) => {
                            e.stopPropagation()
                            cancelEditProblemSolution()
                          }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="ps-number">#{index + 1}</div>
                        <div className="ps-content">
                          <div className="ps-step" style={{wordBreak: 'break-word', whiteSpace: 'pre-wrap', color: '#fff'}}>
                            <h4>STEP:</h4>
                            <div style={{maxWidth: '100%', overflowWrap: 'break-word', whiteSpace: 'pre-wrap', color: '#fff'}} dangerouslySetInnerHTML={{ __html: linkifyHtml(ps.step || '<span style="color:red">No step provided</span>') }} />
                          </div>
                          <div className="ps-solution" style={{wordBreak: 'break-word', whiteSpace: 'pre-wrap', color: '#fff'}}>
                            <h4>SOLUTION:</h4>
                            <div style={{maxWidth: '100%', overflowWrap: 'break-word', whiteSpace: 'pre-wrap', color: '#fff'}} dangerouslySetInnerHTML={{ __html: linkifyHtml(ps.solution || '') }} />
                          </div>
                          
                          {ps.attachments && ps.attachments.length > 0 && (
                            <div className="ps-attachments">
                              <h4>📎 Attachments:</h4>
                              <div className="attachments-list">
                                {ps.attachments.map((attachment, idx) => (
                                  <div key={idx} className="attachment-item">
                                    {isImageFile(attachment.originalName) ? (
                                      <div className="attachment-preview-container">
                                        <img 
                                          src={`http://localhost:5000${attachment.filePath}`}
                                          alt={attachment.originalName}
                                          className="attachment-image-preview"
                                          title={attachment.originalName}
                                        />
                                        <div className="attachment-preview-info">
                                          <span className="attachment-name">{attachment.originalName}</span>
                                          <a 
                                            href={`http://localhost:5000${attachment.filePath}`}
                                            download={attachment.originalName}
                                            className="download-btn"
                                            title="Download"
                                          >
                                            ⬇️ Download
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="attachment-name">{attachment.originalName}</span>
                                        <a 
                                          href={`http://localhost:5000${attachment.filePath}`}
                                          download={attachment.originalName}
                                          className="download-btn"
                                          title="Download"
                                        >
                                          ⬇️ Download
                                        </a>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="ps-date">{new Date(ps.addedAt).toLocaleDateString()}</div>
                        </div>
                        <div className="ps-item-actions">
                          <button 
                            className="edit-ps-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditProblemSolution(ps.step, ps.solution, ps._id, ticket._id)
                            }}
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-ps-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (window.confirm('Delete this step/solution?')) {
                                onDeleteProblemSolution(ticket._id, ps._id)
                              }
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new step/solution */}
              {editingTicketId === ticket._id ? (
                <div className="add-ps-form">
                  <h4>Add New Step/Solution</h4>
                  <div className="form-group">
                    <label>Step</label>
                    <FormattingToolbar
                      onFormat={fmt => applyFormatToTextarea('newStep', fmt)}
                      onColor={color => applyFormatToTextarea('newStep', 'color', color)}
                    />
                    <textarea
                      ref={newStepRef}
                      value={newStep}
                      onChange={(e) => {
                        setNewStep(e.target.value)
                        autoExpandTextarea(e)
                      }}
                      onInput={autoExpandTextarea}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Enter step..."
                      rows="2"
                      className="auto-expand-textarea"
                    />
                  </div>
                  <div className="form-group">
                    <label>Solution</label>
                    <FormattingToolbar
                      onFormat={fmt => applyFormatToTextarea('newSolution', fmt)}
                      onColor={color => applyFormatToTextarea('newSolution', 'color', color)}
                    />
                    <textarea
                      ref={newSolutionRef}
                      value={newSolution}
                      onChange={(e) => {
                        setNewSolution(e.target.value)
                        autoExpandTextarea(e)
                      }}
                      onInput={autoExpandTextarea}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Enter solution..."
                      rows="2"
                      className="auto-expand-textarea"
                    />
                  </div>

                  <div className="form-group file-group">
                    <label>📎 Attach Files (Optional)</label>
                    <div 
                      className={`file-input-wrapper ${dragActive ? 'drag-active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        id="newPsFile"
                        multiple
                        onChange={(e) => handleFileInput(e.target.files)}
                        className="file-input"
                      />
                      <label htmlFor="newPsFile" className="file-label">
                        📎 Choose Files or Drag & Drop
                      </label>
                    </div>
                    {newFiles.length > 0 && (
                      <div className="files-list">
                        {newFiles.map((file, index) => (
                          <div key={index} className="file-item">
                            <span className="file-name">{file.name}</span>
                            <button
                              type="button"
                              className="remove-file-btn"
                              onClick={() => removeFile(index)}
                              title="Remove file"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button"
                      className="save-btn" 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAddProblemSolution(ticket._id, ticket)
                      }}
                    >
                      Add
                    </button>
                    <button 
                      type="button"
                      className="cancel-btn" 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setEditingTicketId(null)
                        setNewStep('')
                        setNewSolution('')
                        setNewFiles([])
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="add-ps-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTicketId(ticket._id)
                  }}
                >
                  + Add Step/Solution
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
  }

export default TicketList
