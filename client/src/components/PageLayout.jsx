import React from 'react'

function PageLayout({ width = 800, children }) {
  return (
    <main
      style={{
        maxWidth: width,
        margin: '2rem auto',
        padding: '1rem',
      }}
    >
      {children}
    </main>
  )
}

export default PageLayout