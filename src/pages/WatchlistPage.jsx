import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import WatchlistButton from '../components/WatchlistButton.jsx'
import '../App.css'

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([])
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('watchlist') ?? '[]')
    setWatchlist(stored)
  }, [])

  useEffect(() => {
    if (watchlist.length > 0) fetchSignals()
    else setSignals([])
  }, [watchlist])

  async function fetchSignals() {
    setLoading(true)
    const { data } = await supabase
      .from('signals_with_trades')
      .select('*')
      .in('ticker', watchlist)
      .order('last_date', { ascending: false })

    // Keep only most recent signal per ticker
    const seen = new Set()
    const latest = data?.filter(s => {
      if (seen.has(s.ticker)) return false
      seen.add(s.ticker)
      return true
    }) ?? []

    setSignals(latest)
    setLoading(false)
  }

  function isOpen(exitDate) {
    if (!exitDate) return true
    return new Date(exitDate) > new Date()
  }

  function handleRemove(ticker) {
    const updated = watchlist.filter(t => t !== ticker)
    localStorage.setItem('watchlist', JSON.stringify(updated))
    setWatchlist(updated)
  }

  return (
    <div>
      <h1 className="mb-4">Watchlist</h1>

      {watchlist.length === 0 ? (
        <p className="text-secondary">No tickers bookmarked yet. Go to the Signals page and click the bookmark icon to add stocks.</p>
      ) : loading ? (
        <p className="text-secondary">Loading...</p>
      ) : (
        <table className="w-100 signals-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Signal Date</th>
              <th>Relative Strength</th>
              <th>Buy Price</th>
              <th>P&L</th>
              <th>Exit Reason</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {signals.map(s => (
              <tr key={s.ticker}>
                <td className="ticker-cell">{s.ticker}</td>
                <td className="text-secondary">{s.last_date}</td>
                <td className="rs-cell">{s.relative_strength?.toFixed(2)}</td>
                <td className="text-secondary">${s.buy_price?.toFixed(2) ?? '—'}</td>
                <td className={isOpen(s.exit_date) ? 'open-cell' : s.win_loss > 0 ? 'rs-cell' : 'loss-cell'}>
                  {isOpen(s.exit_date) ? 'Open' : `${(s.win_loss * 100).toFixed(2)}%`}
                </td>
                <td className="text-secondary">{s.exit_reason ?? '—'}</td>
                <td>
                  <WatchlistButton ticker={s.ticker} onRemove={() => handleRemove(s.ticker)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}