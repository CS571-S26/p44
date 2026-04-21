import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import { supabase } from '../supabase.js'
import SignalTable from '../components/SignalTable.jsx'
import '../App.css'

function DashStatCard({ label, value, sub, highlight }) {
  return (
    <div className="col">
      <div className="stat-card h-100">
        <div className="stat-label">{label}</div>
        <div
          className="stat-value"
          style={highlight === 'green' ? { color: '#4a7c59' } : undefined}
        >
          {value ?? '...'}
        </div>
        {sub && (
          <div className="mt-1" style={{ fontSize: '0.75rem', color: '#7a8a78' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [stats, setStats] = useState({
    totalSignals: null,
    todaySignals: null,
    lastScanDate: null,
    totalDaysScanned: null,
    avgSignalsPerDay: null,
    winRateRS50: null,
    avgPLRS50: null,
    winRateAll: null,
    avgPLAll: null,
  })

  const [signals, setSignals] = useState([])
  const [rsFilter, setRsFilter] = useState('all')
  const [sortBy, setSortBy] = useState('rank')

  useEffect(() => {
    fetchStats()
    fetchSignals()
    document.title = 'SwingTrade | Dashboard'
  }, [])

  async function fetchStats() {
    const { data: scanStats } = await supabase
      .from('scan_stats')
      .select('*')
      .single()

    const totalSignals     = scanStats?.total_signals ?? null
    const totalDaysScanned = scanStats?.total_days_scanned ?? null

    const { data: latestRow } = await supabase
      .from('signals')
      .select('last_date')
      .order('last_date', { ascending: false })
      .limit(1)

    const lastScanDate = latestRow?.[0]?.last_date ?? null

    // All signals for the day — no RS filter
    const { count: todaySignals } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .eq('last_date', lastScanDate)
      .eq('has_signal_today', true)

    const avgSignalsPerDay =
      totalDaysScanned > 0
        ? (totalSignals / totalDaysScanned).toFixed(1)
        : 0

    // RS > 50 closed signals
    const { data: closedRS50 } = await supabase
      .from('signals')
      .select('win_loss')
      .eq('status', 'closed')
      .gt('relative_strength', 50)

    const rs50     = closedRS50 ?? []
    const winsRS50 = rs50.filter(s => (s.win_loss ?? 0) > 0).length
    const winRateRS50 =
      rs50.length > 0
        ? ((winsRS50 / rs50.length) * 100).toFixed(0) + '%'
        : 'N/A'
    const sumPLRS50 = rs50.reduce((acc, s) => acc + (s.win_loss ?? 0), 0)
    const avgPLRS50 =
      rs50.length > 0
        ? (sumPLRS50 >= 0 ? '+' : '') + ((sumPLRS50 / rs50.length) * 100).toFixed(2) + '%'
        : 'N/A'

    // Unfiltered closed signals
    const { data: closedAll } = await supabase
      .from('signals')
      .select('win_loss')
      .eq('status', 'closed')

    const all      = closedAll ?? []
    const winsAll  = all.filter(s => (s.win_loss ?? 0) > 0).length
    const winRateAll =
      all.length > 0
        ? ((winsAll / all.length) * 100).toFixed(0) + '%'
        : 'N/A'
    const sumPLAll = all.reduce((acc, s) => acc + (s.win_loss ?? 0), 0)
    const avgPLAll =
      all.length > 0
        ? (sumPLAll >= 0 ? '+' : '') + ((sumPLAll / all.length) * 100).toFixed(2) + '%'
        : 'N/A'

    setStats({
      totalSignals,
      todaySignals,
      lastScanDate,
      totalDaysScanned,
      avgSignalsPerDay,
      winRateRS50,
      avgPLRS50,
      winRateAll,
      avgPLAll,
    })
  }

  async function fetchSignals() {
    const { data: latestRow } = await supabase
      .from('signals')
      .select('last_date')
      .order('last_date', { ascending: false })
      .limit(1)

    const latestDate = latestRow?.[0]?.last_date
    if (!latestDate) return

    const { data } = await supabase
      .from('signals')
      .select('*')
      .eq('last_date', latestDate)
      .order('rank', { ascending: true })

    setSignals(data ?? [])
  }

  function timeSince(dateStr) {
    if (!dateStr) return ''
    const days = Math.floor((new Date() - new Date(dateStr)) / 86400000)
    if (days === 0) return 'today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  function sortSignals(sigs) {
    const filtered = sigs.filter(s => {
      if (rsFilter === '25') return (s.relative_strength ?? 0) > 25
      if (rsFilter === '50') return (s.relative_strength ?? 0) > 50
      if (rsFilter === '75') return (s.relative_strength ?? 0) > 75
      return true
    })

    if (sortBy === 'pnl') {
      return [...filtered].sort((a, b) => (b.win_loss ?? -999) - (a.win_loss ?? -999))
    }
    return [...filtered].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
  }

  return (
    <div>

      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="mb-1">Dashboard</h1>
          <span className="last-scanned-text">
            Last scanned: {stats.lastScanDate ?? '...'}
            {stats.lastScanDate ? ` · 6:00 PM CT (${timeSince(stats.lastScanDate)})` : ''}
          </span>
        </div>
        <Link
          to="/signals/"
          className="btn btn-sm fw-semibold"
          style={{
            background: '#4a7c59',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '0.8rem',
            padding: '7px 14px',
            textDecoration: 'none',
            marginTop: '4px',
          }}
        >
          View all signals →
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-3 mb-4">
        <DashStatCard
          label="Latest signals"
          value={stats.todaySignals ?? '...'}
          sub="All signals today"
        />
        <DashStatCard
          label="Total signals"
          value={stats.totalSignals?.toLocaleString() ?? '...'}
          sub="All time"
        />
        <DashStatCard
          label="Days scanned"
          value={stats.totalDaysScanned ?? '...'}
          sub={`Avg ${stats.avgSignalsPerDay ?? '...'} / day`}
        />
        <DashStatCard
          label="Win rate (RS>50)"
          value={stats.winRateRS50 ?? '...'}
          sub={`vs ${stats.winRateAll ?? '...'} unfiltered`}
          highlight="green"
        />
        <DashStatCard
          label="Avg P&L (RS>50)"
          value={stats.avgPLRS50 ?? '...'}
          sub={`vs ${stats.avgPLAll ?? '...'} unfiltered`}
          highlight="green"
        />
        <DashStatCard
          label="Universe"
          value="517"
          sub="S&P 500 + NDX"
        />
      </div>

      {/* ── Signal table card ── */}
      <Card className="stat-card">
        <Card.Body className="p-0">

          {/* Card header */}
          <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3">
            <div className="d-flex align-items-baseline gap-2">
              <span style={{ fontWeight: 500, color: '#2c3a2c', fontSize: '0.95rem' }}>
                Latest signals
              </span>
              <span className="last-scanned-text">{stats.lastScanDate ?? '...'}</span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '0.75rem', color: '#7a8a78' }}>Sort by</span>
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${sortBy === 'rank' ? 'active' : ''}`}
                  onClick={() => setSortBy('rank')}
                >
                  Rank
                </button>
                <button
                  className={`toggle-btn ${sortBy === 'pnl' ? 'active' : ''}`}
                  onClick={() => setSortBy('pnl')}
                >
                  P&amp;L
                </button>
              </div>
            </div>
          </div>

          {/* RS filter pills */}
          <div className="d-flex align-items-center gap-2 px-4 pb-3">
            <span style={{ fontSize: '0.75rem', color: '#7a8a78' }}>RS filter</span>
            {[
              { key: 'all', label: 'All RS'  },
              { key: '25',  label: 'RS > 25' },
              { key: '50',  label: 'RS > 50' },
              { key: '75',  label: 'RS > 75' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRsFilter(key)}
                className="btn btn-sm rounded-pill"
                style={{
                  background: rsFilter === key ? '#4a7c59' : 'transparent',
                  color: rsFilter === key ? '#fff' : '#7a8a78',
                  border: '1px solid',
                  borderColor: rsFilter === key ? '#4a7c59' : '#dde0db',
                  fontSize: '0.75rem',
                  padding: '2px 12px',
                  fontWeight: rsFilter === key ? 600 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="px-2 pb-3">
            <SignalTable signals={signals} sortSignals={sortSignals} />
          </div>

        </Card.Body>
      </Card>

    </div>
  )
}