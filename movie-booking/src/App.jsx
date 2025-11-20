import { useMemo, useState } from 'react'
import mopedArt from './assets/moped.png'
import './App.css'

const showTimes = [
  { id: '10:25', label: '10:25 AM', meta: 'Kannada • 2D', status: 'almost-full' },
  { id: '13:40', label: '01:40 PM', meta: 'Kannada • 2D', status: 'available' },
  { id: '19:00', label: '07:00 PM', meta: 'Kannada • 2D', status: 'fast-filling' },
  { id: '22:10', label: '10:10 PM', meta: 'Kannada • 2D', status: 'available' }
]

const quantityOptions = Array.from({ length: 10 }, (_, index) => index + 1)

const createRow = (rowLabel, seatCount, price, options = {}) => {
  const { sold = [], blocked = [], gapAfter = [] } = options
  const soldSet = new Set(sold)
  const blockedSet = new Set(blocked)

  const seats = []
  for (let seatNumber = 1; seatNumber <= seatCount; seatNumber += 1) {
    const id = `${rowLabel}${String(seatNumber).padStart(2, '0')}`
    let status = 'available'
    if (blockedSet.has(seatNumber)) {
      status = 'blocked'
    } else if (soldSet.has(seatNumber)) {
      status = 'sold'
    }

    seats.push({
      id,
      row: rowLabel,
      number: seatNumber,
      label: String(seatNumber).padStart(2, '0'),
      status,
      price
    })

    if (gapAfter.includes(seatNumber)) {
      seats.push({
        id: `${id}-gap`,
        type: 'gap'
      })
    }
  }

  return {
    rowLabel,
    seats
  }
}

const seatGroups = [
  {
    key: 'recliner',
    label: '₹360 Recliner Rows',
    price: 360,
    statusTag: 'Filling fast',
    rows: [createRow('N', 10, 360, { sold: [1, 2, 3, 4, 5, 6], blocked: [7, 8], gapAfter: [5] })]
  },
  {
    key: 'prime',
    label: '₹210 Prime Rows',
    price: 210,
    statusTag: 'Available',
    rows: [
      createRow('M', 18, 210, { sold: [7, 8, 9], gapAfter: [9] }),
      createRow('L', 18, 210, { sold: [10, 11], gapAfter: [9] }),
      createRow('K', 18, 210, { sold: [3, 4, 5, 6], gapAfter: [9] }),
      createRow('J', 18, 210, { sold: [15, 16, 17], gapAfter: [9] }),
      createRow('H', 18, 210, { gapAfter: [9] }),
      createRow('G', 18, 210, { gapAfter: [9] })
    ]
  },
  {
    key: 'classic-plus',
    label: '₹180 Classic Plus Rows',
    price: 180,
    statusTag: 'Available',
    rows: [
      createRow('F', 18, 180, { gapAfter: [9] }),
      createRow('E', 18, 180, { sold: [1, 2], gapAfter: [9] }),
      createRow('D', 18, 180, { gapAfter: [9] }),
      createRow('C', 18, 180, { sold: [12, 13], gapAfter: [9] })
    ]
  },
  {
    key: 'classic',
    label: '₹160 Classic Rows',
    price: 160,
    statusTag: 'Available',
    rows: [
      createRow('B', 18, 160, { sold: [1, 2], gapAfter: [9] }),
      createRow('A', 18, 160, { sold: [15, 16, 17, 18], gapAfter: [9] })
    ]
  }
]

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

function App() {
  const [activeShow, setActiveShow] = useState(showTimes[0].id)
  const [ticketCount, setTicketCount] = useState(2)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [isTicketModalOpen, setTicketModalOpen] = useState(false)

  const selectedTotal = useMemo(
    () =>
      selectedSeats.reduce(
        (acc, seat) => {
          acc.amount += seat.price
          acc.labels.push(seat.id)
          return acc
        },
        { amount: 0, labels: [] }
      ),
    [selectedSeats]
  )

  const handleSeatToggle = (seat) => {
    if (seat.status !== 'available') {
      return
    }

    setSelectedSeats((prev) => {
      const exists = prev.some((item) => item.id === seat.id)

      if (exists) {
        return prev.filter((item) => item.id !== seat.id)
      }

      if (prev.length >= ticketCount) {
        return prev
      }

      return [...prev, seat]
    })
  }

  const resetSelection = () => setSelectedSeats([])

  const handleTicketChange = (value) => {
    setTicketCount(value)
    setSelectedSeats((prev) => prev.slice(0, value))
  }

  const closeTicketModal = () => setTicketModalOpen(false)

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Maarutha • U/A</p>
          <h1>Seat layout</h1>
          <p className="subdued">PVR: Orion Mall, Dr Rajkumar Road • Fri, 21 Nov 2025 • IMAX 2D</p>
        </div>
        <div className="hero-meta">
          <p>Kannada • 2D</p>
          <span>102 min</span>
        </div>
      </header>

      <section className="panel">
        <div className="panel-head">
          <h2>Choose show time</h2>
          <p>Select a slot that works best for you. Data pulled from BookMyShow.</p>
        </div>
        <div className="chip-grid">
          {showTimes.map((slot) => (
            <button
              key={slot.id}
              className={`chip ${activeShow === slot.id ? 'chip--active' : ''}`}
              onClick={() => {
                setActiveShow(slot.id)
                resetSelection()
              }}
            >
              <span>{slot.label}</span>
              <small>{slot.meta}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="tickets-trigger">
        <div>
          <p className="tickets-trigger__eyebrow">Tickets</p>
          <p className="tickets-trigger__title">Tap to adjust seat count</p>
        </div>
        <button className="ticket-button" onClick={() => setTicketModalOpen(true)}>
          {ticketCount} Ticket{ticketCount > 1 ? 's' : ''}
        </button>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Select seats</h2>
          <p>Scroll to explore recliner, prime and classic sections. Data mirrored from the saved `BMS.html`.</p>
        </div>

        <div className="legend">
          <span className="legend-item">
            <span className="legend-dot legend-dot--available" />
            Available
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--selected" />
            Selected
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--sold" />
            Sold
          </span>
        </div>

        {seatGroups.map((group) => (
          <div key={group.key} className="seat-group">
            <div className="seat-group__header">
              <div>
                <p className="seat-group__title">{group.label}</p>
                <p className="seat-group__meta">{group.statusTag}</p>
              </div>
              <span className="seat-group__price">{formatCurrency(group.price)}</span>
            </div>

            <div className="seat-grid">
              {group.rows.map((row) => (
                <div key={row.rowLabel} className="seat-row">
                  <div className="seat-row__label">{row.rowLabel}</div>
                  <div className="seat-row__seats">
                    {row.seats.map((seat) =>
                      seat.type === 'gap' ? (
                        <span key={seat.id} className="seat-gap" aria-hidden="true" />
                      ) : (
                        <button
                          key={seat.id}
                          className={`seat seat--${seat.status} ${
                            selectedSeats.some((item) => item.id === seat.id) ? 'seat--selected' : ''
                          }`}
                          onClick={() => handleSeatToggle(seat)}
                        >
                          {seat.label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="screen">Screen this side</div>
      </section>

      <section className="panel summary">
        <div>
          <p className="summary__title">
            {selectedSeats.length ? `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected` : 'Waiting for your selection'}
          </p>
          <p className="summary__subtitle">
            {selectedSeats.length ? selectedTotal.labels.join(', ') : `Pick up to ${ticketCount} seat${ticketCount > 1 ? 's' : ''}.`}
          </p>
        </div>
        <div className="summary__cta">
          <div className="summary__price">{selectedTotal.amount ? formatCurrency(selectedTotal.amount) : formatCurrency(0)}</div>
          <button className="cta" disabled={!selectedSeats.length}>
            Pay {selectedTotal.amount ? formatCurrency(selectedTotal.amount) : formatCurrency(0)}
          </button>
        </div>
      </section>

      {isTicketModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="ticket-modal">
            <button className="modal-close" aria-label="Close" onClick={closeTicketModal}>
              ×
            </button>
            <div className="modal-header">
              <h3>How many seats?</h3>
              <div className="modal-illustration">
                <img src={mopedArt} alt="Illustration of a moped" />
              </div>
            </div>
            <div className="modal-quantity">
              {quantityOptions.map((value) => (
                <button
                  key={value}
                  className={`quantity-chip ${ticketCount === value ? 'quantity-chip--active' : ''}`}
                  onClick={() => handleTicketChange(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="category-pills">
              {seatGroups.map((group) => (
                <div key={group.key} className="category-pill">
                  <p className="category-pill__label">{group.label}</p>
                  <p className="category-pill__price">{formatCurrency(group.price)}</p>
                  <p className={`category-pill__status ${group.statusTag.toLowerCase().includes('fast') ? 'status-warn' : 'status-safe'}`}>
                    {group.statusTag}
                  </p>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="cta" onClick={closeTicketModal}>
                Select Seats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
