import { useState } from 'react'
import '../App.css'
import { Button, Card } from 'react-bootstrap'

export default function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <div className="w-100 h-100 d-flex justify-content-center align-items-center">
      <Card className='m-4 p-2'>
        <Card.Body className="text-center card">
          <h1>Releasing Soon</h1>
          <h2>Swing Trade Project!</h2>
        </Card.Body>
      </Card>
    </div>
  )
}
