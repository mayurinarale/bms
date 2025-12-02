import { useMemo, useState } from 'react'
import mopedArt from './assets/moped.png'

const showTimes = [
  { id: '10:25', label: '10:25 AM', meta: 'Kannada • 2D', status: 'almost-full' },
  { id: '13:40', label: '01:40 PM', meta: 'Kannada • 2D', status: 'available' },
  { id: '19:00', label: '07:00 PM', meta: 'Kannada • 2D', status: 'fast-filling' },
  { id: '22:10', label: '10:10 PM', meta: 'Kannada • 2D', status: 'available' }
]

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

const getTotalAvailableSeats = () =>
  seatGroups.reduce(
    (total, group) =>
      total +
      group.rows.reduce(
        (rowTotal, row) =>
          rowTotal +
          row.seats.reduce((seatTotal, seat) => {
            if (seat.type === 'gap') {
              return seatTotal
            }
            return seat.status === 'available' ? seatTotal + 1 : seatTotal
          }, 0),
        0
      ),
    0
  )

const totalAvailableSeats = getTotalAvailableSeats()
const quantityOptions = Array.from({ length: totalAvailableSeats }, (_, index) => index + 1)

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value)

function App() {
  const [activeShow, setActiveShow] = useState(showTimes[0].id)
  const [ticketCount, setTicketCount] = useState(2)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [isTicketModalOpen, setTicketModalOpen] = useState(false)
  const [isPaymentPageOpen, setIsPaymentPageOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi')

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
  
  const selectedShow = showTimes.find(slot => slot.id === activeShow)
  const convenienceFee = Math.round(selectedTotal.amount * 0.154) // ~15.4% convenience fee
  const orderTotal = selectedTotal.amount + convenienceFee

  if (isPaymentPageOpen) {
    return (
      <div className="min-h-screen bg-[#0f1219] text-white">
        {/* Header */}
        <div className="bg-[#1a1d29] border-b border-[#2a2d3a] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <button 
              onClick={() => setIsPaymentPageOpen(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ←
            </button>
            <div>
              <h1 className="text-xl font-semibold mb-1">Maarutha • U/A</h1>
              <p className="text-sm text-gray-400">PVR: Orion Mall, Dr Rajkumar Road • {selectedShow?.label} • {selectedShow?.meta}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
          {/* Left Column: Payment Options (divided into two parts) */}
          <div className="bg-[#1a1d29] border border-[#2a2d3a] rounded-lg p-6 grid grid-cols-[280px_1fr] gap-6">
            {/* Left Part: Payment Options List (Tab Menu) */}
            <div>
              <h2 className="text-lg font-semibold mb-6 text-white">Payment options</h2>
              <div className="space-y-3">
                {[
                  { id: 'upi', label: 'Pay by any UPI App', icon: 'UPI' },
                  { id: 'card', label: 'Debit/Credit Card', icon: '💳' },
                  { id: 'wallet', label: 'Mobile Wallets', icon: '👛' },
                  { id: 'gift', label: 'Gift Voucher', icon: '🎁' },
                  { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
                  { id: 'paylater', label: 'Pay Later', icon: '₹' },
                  { id: 'points', label: 'Redeem Points', icon: '123' }
                ].map((method) => (
                  <button
                    key={method.id}
                    className={`w-full text-left px-4 py-3.5 rounded-lg transition-all flex items-center gap-3 relative ${
                      selectedPaymentMethod === method.id
                        ? 'bg-gradient-to-r from-[#ff4d5a] to-[#e63946] text-white border-l-4 border-[#ff6b7a]'
                        : 'bg-[#252833] text-gray-300 hover:bg-[#2d3140] border-l-4 border-transparent'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    {method.id === 'upi' && selectedPaymentMethod === 'upi' ? (
                      <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                        <span className="text-xs font-bold">UPI</span>
                      </div>
                    ) : (
                      <span className="text-lg">{method.icon}</span>
                    )}
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
              {/* Divider line after payment options */}
              <div className="mt-6 border-t border-[#2a2d3a]"></div>
            </div>

            {/* Right Part: Payment Method Details */}
            <div className="pt-[60px]">
              {selectedPaymentMethod === 'upi' && (
                <div className="space-y-3">
                  <button className="w-full bg-[#252833] hover:bg-[#2d3140] px-4 py-4 rounded-lg flex items-center justify-between text-gray-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#4285f4]">G</span>
                      </div>
                      <span className="font-medium">Google Pay</span>
                    </div>
                    <span className="text-xl">→</span>
                  </button>
                  <button className="w-full bg-[#252833] hover:bg-[#2d3140] px-4 py-4 rounded-lg flex items-center justify-between text-gray-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#2d3140] rounded-lg flex items-center justify-center">
                        <span className="text-2xl">+</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium mb-1">Add new UPI</div>
                        <div className="text-xs text-gray-500">You need to have a registered UPI ID</div>
                      </div>
                    </div>
                    <span className="text-xl">→</span>
                  </button>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-[#2d3140]"></div>
                    <span className="text-sm text-gray-500">Or</span>
                    <div className="flex-1 h-px bg-[#2d3140]"></div>
                  </div>
                  <button className="w-full bg-[#252833] hover:bg-[#2d3140] px-4 py-4 rounded-lg flex items-center justify-between text-gray-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#2d3140] rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gray-500 rounded"></div>
                      </div>
                      <div className="text-left">
                        <div className="font-medium mb-1">Scan QR code</div>
                        <div className="text-xs text-gray-500">You need to have a registered UPI ID</div>
                      </div>
                    </div>
                    <span className="text-xl">→</span>
                  </button>
                </div>
              )}
              {selectedPaymentMethod !== 'upi' && (
                <div className="text-center text-gray-400 py-12">
                  <p>Payment method details will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary (Sticky Sidebar) */}
          <div className="bg-[#1a1d29] border border-[#2a2d3a] rounded-lg p-6 sticky top-6 h-fit">
            <h2 className="text-lg font-semibold mb-4 text-white">Order Summary</h2>
            
            {/* Module 1: Event Details */}
            <div className="bg-[#252833] border border-[#2a2d3a] rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 text-white">Maarutha</h3>
                  <p className="text-sm text-gray-400 mb-1">Fri, 21 Nov 2025 | {selectedShow?.label}</p>
                  <p className="text-sm text-gray-400 mb-1">{selectedShow?.meta}</p>
                  <p className="text-sm text-gray-300 font-medium">Seats: {selectedTotal.labels.join(', ')}</p>
                  <p className="text-sm text-gray-400 mt-1">PVR: Orion Mall, Dr Rajkumar Road • IMAX 2D</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-gray-400 font-medium">{selectedSeats.length}</span>
                  <div className="w-8 h-8 bg-[#ff4d5a] rounded flex items-center justify-center">
                    <span className="text-xs text-white font-bold">M</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 2: Status Banner */}
            <div className="bg-[#1e3a2e] border border-[#2d5a42] rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-[#4caf50] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <div>
                  <p className="font-bold text-[#4caf50] mb-1 text-base">Cancellation Available</p>
                  <p className="text-sm text-gray-300">
                    This venue supports booking cancellation. To know more{' '}
                    <button className="text-[#4caf50] underline hover:text-[#66bb6a]">view cancellation policy</button>
                  </p>
                </div>
              </div>
            </div>

            {/* Module 3: Price Accordion */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-300 text-sm">
                <span>Ticket(s) price:</span>
                <span className="font-medium">{formatCurrency(selectedTotal.amount)}</span>
              </div>
              <div className="flex justify-between text-gray-300 text-sm">
                <div className="flex items-center gap-2">
                  <span>Convenience fees:</span>
                  <button className="text-gray-500 hover:text-gray-400">▼</button>
                </div>
                <span className="font-medium">{formatCurrency(convenienceFee)}</span>
              </div>
              <div className="flex justify-between items-start text-gray-300 text-sm">
                <div>
                  <span>Give to Underprivileged Musicians:</span>
                  <div className="text-xs text-gray-500 mt-0.5">(₹1 per ticket) VIEW T&C</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(0)}</span>
                  <button className="bg-[#2d3140] hover:bg-[#353945] px-3 py-1.5 rounded text-xs border border-[#3a3f4d]">Add ₹2.00</button>
                </div>
              </div>
              <div className="border-t border-dashed border-[#2d3140] pt-3 mt-3 flex justify-between">
                <span className="text-base font-bold text-white">Order total:</span>
                <span className="text-lg font-bold text-white">{formatCurrency(orderTotal)}</span>
              </div>
            </div>

            {/* Module 4: Contact Info */}
            <div className="bg-[#252833] border border-[#2a2d3a] rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-sm text-white">For Sending Booking Details</h3>
                <button className="text-[#ff4d5a] text-sm font-medium hover:text-[#ff6b7a]">Edit</button>
              </div>
              <p className="text-sm text-gray-300 mb-1 font-medium">+91-9545583061</p>
              <p className="text-sm text-gray-300 mb-1">mayurinarale0@gmail.com</p>
              <p className="text-sm text-gray-400">Karnataka (for GST purposes)</p>
            </div>

            {/* Module 5: Promos */}
            <button className="w-full bg-[#252833] border border-[#2a2d3a] hover:bg-[#2d3140] px-4 py-3 rounded-lg flex items-center justify-between text-gray-300 mb-4 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-xl">⭐</span>
                <span className="font-medium">Apply Offers</span>
              </div>
              <span className="text-xl">→</span>
            </button>

            {/* Consent */}
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">By proceeding, I express my consent to complete this transaction.</p>

            {/* Module 6: Sticky Footer - Amount Payable */}
            <div className="flex justify-between items-center bg-[#252833] border border-[#2a2d3a] rounded-lg p-4 sticky bottom-0">
              <span className="font-bold text-base text-white">Amount Payable</span>
              <span className="text-2xl font-bold text-[#ff4d5a]">{formatCurrency(orderTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-white text-sm font-semibold">book my show</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 pb-12 md:px-6 md:py-10 md:pb-16 flex flex-col gap-6">
      <header className="bg-gradient-to-br from-[#1f2538] to-[#2c3551] rounded-3xl p-8 text-white flex flex-col md:flex-row items-start justify-between gap-6">
        <div>
          <p className="uppercase tracking-wider text-xs opacity-80 m-0">Maarutha • U/A</p>
          <h1 className="mt-1 mb-2 text-[clamp(1.75rem,2.5vw,2.4rem)] m-0">Seat layout</h1>
          <p className="m-0 opacity-70 text-[0.95rem]">PVR: Orion Mall, Dr Rajkumar Road • Fri, 21 Nov 2025 • IMAX 2D</p>
        </div>
        <div className="bg-white/10 rounded-2xl px-5 py-4 min-w-[200px] text-right">
          <p className="m-0">Kannada • 2D</p>
          <span>102 min</span>
        </div>
      </header>

      <section className="bg-white rounded-3xl p-7 shadow-[0_25px_65px_rgba(15,23,42,0.08)]">
        <div className="mb-6">
          <h2 className="m-0 text-xl">Choose show time</h2>
          <p className="mt-1.5 mb-0 text-[#5a6274] text-[0.95rem]">Select a slot that works best for you. Data pulled from BookMyShow.</p>
        </div>
        <div className="mt-6 grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
          {showTimes.map((slot) => (
            <button
              key={slot.id}
              className={`border rounded-2xl p-4 bg-white text-left flex flex-col gap-1 transition-all text-base ${
                activeShow === slot.id
                  ? 'border-[#ff4d5a] shadow-[0_10px_30px_rgba(255,77,90,0.25)]'
                  : 'border-[#d7dbe7] hover:border-[#ff4d5a]/50'
              }`}
              onClick={() => {
                setActiveShow(slot.id)
                resetSelection()
              }}
            >
              <span>{slot.label}</span>
              <small className="text-[0.85rem] text-[#6b7285]">{slot.meta}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="px-6 py-5 rounded-[18px] bg-white shadow-[0_15px_45px_rgba(15,23,42,0.08)] flex items-center justify-between">
        <div>
          <p className="m-0 uppercase text-xs tracking-wider text-[#8b92a7]">Tickets</p>
          <p className="mt-0.5 mb-0 text-[1.05rem] font-semibold">Tap to adjust seat count</p>
        </div>
        <button
          className="min-w-[140px] px-6 py-3.5 rounded-full border-none bg-[#ff4d5a] text-white font-semibold text-base shadow-[0_10px_20px_rgba(255,77,90,0.35)]"
          onClick={() => setTicketModalOpen(true)}
        >
          {ticketCount} Ticket{ticketCount > 1 ? 's' : ''}
        </button>
      </div>

      <section className="bg-white rounded-3xl p-7 shadow-[0_25px_65px_rgba(15,23,42,0.08)]">
        <div className="mb-6">
          <h2 className="m-0 text-xl">Select seats</h2>
          <p className="mt-1.5 mb-0 text-[#5a6274] text-[0.95rem]">Scroll to explore recliner, prime and classic sections. Data mirrored from the saved `BMS.html`.</p>
        </div>

        <div className="flex gap-6 my-6 text-[#5a6274]">
          <span className="inline-flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded bg-[#e4f5ed] border border-[#5db075] inline-block" />
            Available
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded bg-[#e4f5ed] border border-[#5db075] inline-block" />
            Selected
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded bg-[#fee2e2] border border-[#ef4444] inline-block" />
            Sold
          </span>
        </div>

        {seatGroups.map((group) => (
          <div key={group.key} className="border border-[#edf1fb] rounded-[20px] p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="m-0 font-semibold">{group.label}</p>
                <p className="mt-0.5 mb-0 text-[0.85rem] text-[#6d7384]">{group.statusTag}</p>
              </div>
              <span className="font-bold text-[#151a2d]">{formatCurrency(group.price)}</span>
            </div>

            <div className="border-t border-dashed border-[#e2e5ef] pt-4">
              {group.rows.map((row) => (
                <div key={row.rowLabel} className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 font-semibold text-center text-[#5a6274]">{row.rowLabel}</div>
                  <div className="flex gap-1.5 flex-1 flex-wrap md:flex-wrap flex-nowrap overflow-x-auto">
                    {row.seats.map((seat) =>
                      seat.type === 'gap' ? (
                        <span key={seat.id} className="w-6 h-2.5" aria-hidden="true" />
                      ) : (
                        <button
                          key={seat.id}
                          className={`w-10 h-9 rounded-[10px] border-[1.5px] font-semibold text-[0.85rem] transition-all ${
                            seat.status === 'sold'
                              ? 'bg-[#fee2e2] border-[#ef4444] text-[#dc2626] cursor-not-allowed'
                              : seat.status === 'blocked'
                              ? 'invisible'
                              : selectedSeats.some((item) => item.id === seat.id)
                              ? 'bg-[#5db075] border-[#5db075] text-white'
                              : 'bg-white border-[#c6cce0] hover:border-[#5db075] hover:shadow-[0_10px_30px_rgba(93,176,117,0.25)]'
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

        <div className="mt-8 py-5 text-center font-semibold uppercase text-[#6b7285] rounded-[18px] bg-gradient-to-r from-[#f5f6fa] to-white border border-[#eaedf6]">
          Screen this side
        </div>
      </section>

      <section className="bg-white rounded-3xl p-7 shadow-[0_25px_65px_rgba(15,23,42,0.08)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="m-0 font-semibold text-lg">
            {selectedSeats.length ? `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected` : 'Waiting for your selection'}
          </p>
          <p className="mt-1 mb-0 text-[#5a6274]">
            {selectedSeats.length ? selectedTotal.labels.join(', ') : `Pick up to ${ticketCount} seat${ticketCount > 1 ? 's' : ''}.`}
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="text-2xl font-bold">{selectedTotal.amount ? formatCurrency(selectedTotal.amount) : formatCurrency(0)}</div>
          <button
            className="bg-[#ff4d5a] text-white rounded-full px-9 py-4 border-none font-semibold text-base transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!selectedSeats.length}
            onClick={() => setIsPaymentPageOpen(true)}
          >
            Pay {selectedTotal.amount ? formatCurrency(selectedTotal.amount) : formatCurrency(0)}
          </button>
        </div>
      </section>

      {isTicketModalOpen && (
        <div className="fixed inset-0 bg-[rgba(12,18,34,0.65)] flex items-center justify-center p-6 z-10" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-[0_30px_70px_rgba(15,23,42,0.35)]">
            <button
              className="absolute top-4 right-4 border-none bg-transparent text-2xl text-[#6d7384]"
              aria-label="Close"
              onClick={closeTicketModal}
            >
              ×
            </button>
            <div className="text-center">
              <h3 className="m-0 mb-3 text-lg">How many seats?</h3>
              <div className="flex items-center justify-center mb-5">
                <img src={mopedArt} alt="Illustration of a moped" className="max-w-[140px] w-[55%] h-auto" />
              </div>
            </div>
            <div className="flex gap-2 justify-start flex-nowrap overflow-x-auto pb-3 mb-5 scroll-snap-x-proximity [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-[#d4d8e7] [&::-webkit-scrollbar-thumb]:rounded-full">
              {quantityOptions.map((value) => (
                <button
                  key={value}
                  className={`w-[42px] h-[42px] rounded-full border flex-shrink-0 font-semibold transition-all scroll-snap-center ${
                    ticketCount === value
                      ? 'bg-[#fef2f3] border-[#ff4d5a] text-[#ff4d5a]'
                      : 'border-[#d6dae7] bg-white'
                  }`}
                  onClick={() => handleTicketChange(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] mb-6">
              {seatGroups.map((group) => (
                <div key={group.key} className="border border-[#ebeef6] rounded-2xl px-4 py-3 text-center">
                  <p className="m-0 text-[0.85rem] text-[#5a6274] uppercase tracking-wider">{group.label}</p>
                  <p className="my-0.5 mb-0 font-semibold">{formatCurrency(group.price)}</p>
                  <p
                    className={`m-0 text-[0.85rem] font-semibold ${
                      group.statusTag.toLowerCase().includes('fast') ? 'text-[#ffae1a]' : 'text-[#4caf50]'
                    }`}
                  >
                    {group.statusTag}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button className="bg-[#ff4d5a] text-white rounded-full px-9 py-4 border-none font-semibold text-base" onClick={closeTicketModal}>
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
