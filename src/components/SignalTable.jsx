import '../App.css'
import WatchlistButton from './WatchlistButton.jsx'

export default function SignalTable({ signals, isOpen, sortSignals }) {
  const sorted = sortSignals(signals)
  const open = sorted.filter(s => isOpen(s.exit_date))
  const closed = sorted.filter(s => !isOpen(s.exit_date))

  return (
    <>
      {open.length > 0 && (
        <>
          <p className="signals-sub-header">Open</p>
          <table className="w-100 signals-table mb-4">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Ticker</th>
                <th>Relative Strength</th>
                <th>Buy Price</th>
              </tr>
            </thead>
            <tbody>
              {open.map(s => (
                <tr key={s.ticker}>
                  <td className="text-secondary">#{s.rank}</td>
                  <td className="ticker-cell">{s.ticker}</td>
                  <td className="rs-cell">{s.relative_strength?.toFixed(2)}</td>
                  <td className="text-secondary">${s.buy_price?.toFixed(2) ?? '—'}</td>
                  <td><WatchlistButton ticker={s.ticker} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {closed.length > 0 && (
        <>
          <p className="signals-sub-header">Closed</p>
          <table className="w-100 signals-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Ticker</th>
                <th>Relative Strength</th>
                <th>P&L</th>
                <th>Exit Reason</th>
              </tr>
            </thead>
            <tbody>
              {closed.map(s => (
                <tr key={s.ticker}>
                  <td className="text-secondary">#{s.rank}</td>
                  <td className="ticker-cell">{s.ticker}</td>
                  <td className="rs-cell">{s.relative_strength?.toFixed(2)}</td>
                  <td className={s.win_loss > 0 ? 'rs-cell' : 'loss-cell'}>
                    {(s.win_loss * 100).toFixed(2)}%
                  </td>
                  <td className="text-secondary">{s.exit_reason ?? '—'}</td>
                  <td><WatchlistButton ticker={s.ticker} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  )
}