import React from 'react'

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', color: 'black', backgroundColor: 'white' }}>
      <h1>Test Page - If you see this, React is working!</h1>
      <p>Server time: {new Date().toISOString()}</p>
    </div>
  )
}

export default TestPage