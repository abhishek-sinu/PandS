import './FormattingToolbar.css'

export default function FormattingToolbar({ onFormat, onColor }) {
  return (
    <div className="formatting-toolbar">
      <button type="button" className="format-btn" title="Bold" onClick={() => onFormat('bold')}><b>B</b></button>
      <button type="button" className="format-btn" title="Italic" onClick={() => onFormat('italic')}><i>I</i></button>
      <button type="button" className="format-btn" title="Underline" onClick={() => onFormat('underline')}><u>U</u></button>
      <input
        type="color"
        className="color-picker"
        title="Text Color"
        onChange={e => onColor(e.target.value)}
      />
    </div>
  )
}
