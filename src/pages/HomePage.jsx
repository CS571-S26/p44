import { useEffect, useState } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase.js'
import StatCard from '../components/StatCard.jsx'
import '../App.css'

export default function HomePage() {
  const [stats, setStats] = useState({
    totalSignals: null,
    todaySignals: null,
    lastScanDate: null,
    totalDaysScanned: null,
    avgSignalsPerDay: null,
    winRate: null,
  })

  const [recentSignals, setRecentSignals] = useState([])
  const [recentDate, setRecentDate] = useState(null)

  useEffect(() => {
    fetchStats()
    fetchRecentSignals()
  }, [])

  async function fetchStats() {

    const { data: scanStats } = await supabase
      .from('scan_stats')
      .select('*')
      .single()

    const totalSignals = scanStats.total_signals
    const totalDaysScanned = scanStats.total_days_scanned

    const { data: latestRow } = await supabase
      .from('signals')
      .select('last_date')
      .order('last_date', { ascending: false })
      .limit(1)

    const lastScanDate = latestRow?.[0]?.last_date ?? null


    const today = new Date().toISOString().split('T')[0]
    const { count: todaySignals } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .eq('last_date', today)
      .eq('has_signal_today', true)

    const avgSignalsPerDay = totalDaysScanned > 0
      ? (totalSignals / totalDaysScanned).toFixed(1)
      : 0

    const { data: trades } = await supabase
      .from('trades')
      .select('"Win/Loss"')

    const total = trades.length
    const wins = trades.filter(t => t['Win/Loss'] > 0).length
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) + '%' : 'N/A'

    setStats({
      totalSignals,
      todaySignals,
      lastScanDate,
      totalDaysScanned,
      avgSignalsPerDay,
      winRate,
    })
  }

  async function fetchRecentSignals() {
    const today = new Date().toISOString().split('T')[0]
    setRecentDate(today)

    const { data: signals } = await supabase
      .from('signals')
      .select('ticker, relative_strength')
      .eq('last_date', today)
      .eq('has_signal_today', true)
      .order('relative_strength', { ascending: false })
      .limit(10)

    setRecentSignals(signals ?? [])
  }

  function timeSince(dateStr) {
    const diff = new Date() - new Date(dateStr)
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    {/*if (hours < 1) return 'just now'
    if (hours < 24) return `${hours} hours ago` */}
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <span className="last-scanned-text">
          Last Scanned: {stats.lastScanDate ?? '...'} {stats.lastScanDate ? `(${timeSince(stats.lastScanDate)})` : ''}
        </span>
      </div>

      <div className="row g-3 mb-4">
        <StatCard label="Total Signals" value={stats.totalSignals?.toLocaleString() ?? '...' } tooltip="total signals ever collected"/>
        <StatCard label="Today's Signals" value={stats.todaySignals ?? '...'} tooltip="Amount of stocks that met criteria today"/>
        <StatCard label="Last Scan Date" value={stats.lastScanDate ?? '...'} tooltip="Last day a scan occurred (YYYY-MM-DD)"/>
        <StatCard label="Days Scanned" value={stats.totalDaysScanned ?? '...'} tooltip="Total days the system has scanned"/>
        <StatCard label="Avg Signals / Day" value={stats.avgSignalsPerDay ?? '...'} tooltip="Average signals per day scanned"/>
        <StatCard label="Win Rate" value={stats.winRate ?? '...'} tooltip="Selected stocks that met an exit clause and had a positive return"/>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-label mb-3">Latest Scan — {recentDate ?? '...'}</div>
              {recentSignals.length === 0 ? (
                <p className="text-secondary">No stocks met the criteria today.</p>
              ) : (
                <table className="w-100 signals-table">
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th>Relative Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSignals.map(s => (
                      <tr key={s.ticker}>
                        <td className="ticker-cell">{s.ticker}</td>
                        <td className="rs-cell">{s.relative_strength?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6">
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-label mb-3">Strategy Summary</div>
              <p className="strategy-description">
                The pullback strategy scans the S&P 500 and NASDAQ 100 daily, looking for stocks 
                in an uptrend that have pulled back to their 20-day moving average and are showing 
                signs of recovery with volume confirmation.
              </p>
              <p className="strategy-description">
                Signals are ranked by relative strength vs SPY. Only the highest ranked signals 
                are considered high quality trades.
              </p>
              <Link to="/about/" className="about-link">Learn more →</Link>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
}