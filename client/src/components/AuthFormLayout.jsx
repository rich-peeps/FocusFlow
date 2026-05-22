import React from 'react'
import PageLayout from './PageLayout'

function AuthFormLayout({ title, onSubmit, children, error, loading, buttonLabel }) {
  return (
    <PageLayout width={400}>
      <h1>{title}</h1>
      <form onSubmit={onSubmit} style={{ marginTop: '1rem' }}>
        {children}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {buttonLabel}
        </button>
      </form>
    </PageLayout>
  )
}

export default AuthFormLayout
