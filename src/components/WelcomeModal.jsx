import { useState, useEffect } from 'react'
import '../App.css'

export default function WelcomeModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('welcomeSeen')
    if (!seen) setShow(true)
  }, [])

  function dismiss() {
    localStorage.setItem('welcomeSeen', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Welcome to SwingTrade</h2>
        <p className="modal-text">
          SwingTrade is an automated stock scanning system that analyzes the S&P 500 
          and NASDAQ 100 every weekday after market close, looking for short-term trading 
          opportunities using a pullback uptrend strategy.
        </p>
        <p className="modal-text">
          Browse daily scan results, track signals over time, and bookmark stocks 
          you're interested in following.
        </p>
        <p className="modal-disclaimer">
          ⚠️ This site is for informational purposes only and does not constitute financial advice.
        </p>
        <button className="modal-btn" onClick={dismiss}>
          Got it
        </button>
      </div>
    </div>
  )
}