import React, { useState } from 'react'
import { createReservation } from '../services/api'

export default function Reservations() {
  const [time, setTime] = useState('')
  const [party_size, setPartySize] = useState(2)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null); setResult(null)
    try {
      const res = await createReservation({ time_slot: time, party_size, name, email, phone })
      setResult(res.reservation)
      setTime(''); setPartySize(2); setName(''); setEmail(''); setPhone('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card">
      <h1>Reserve a Table</h1>
      <form onSubmit={onSubmit}>
        <div className="row">
          <div>
            <label>Date & Time<br/>
              <input type="datetime-local" value={time} onChange={(e)=>setTime(e.target.value)} required />
            </label>
          </div>
          <div>
            <label>Guests<br/>
              <input type="number" min="1" value={party_size} onChange={(e)=>setPartySize(parseInt(e.target.value || '1', 10))} required />
            </label>
          </div>
        </div>
        <div className="row" style={{marginTop:12}}>
          <div><label>Name<br/><input value={name} onChange={(e)=>setName(e.target.value)} required /></label></div>
          <div><label>Email<br/><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label></div>
        </div>
        <div style={{marginTop:12}}><label>Phone (optional)<br/><input value={phone} onChange={(e)=>setPhone(e.target.value)} /></label></div>
        <div style={{marginTop:12}}><button className="btn" type="submit">Book Now</button></div>
        {result && (
          <p style={{color:'green'}}>
            Reservation confirmed for table #{result.table_number} at {new Date(result.time_slot).toLocaleString()}. (ID: {result.id})
          </p>
        )}
        {error && <p style={{color:'crimson'}}>{error}</p>}
      </form>
      <p style={{marginTop:16, opacity:.8}}>We have 30 tables per time slot. If a time is fully booked, please try another.</p>
    </div>
  )
}
