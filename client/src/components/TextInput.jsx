import React from 'react'

function TextInput({ label, name, type = 'text', value, onChange }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <label>
        {label}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          style={{ display: 'block', width: '100%', padding: '0.4rem' }}
        />
      </label>
    </div>
  )
}

export default TextInput