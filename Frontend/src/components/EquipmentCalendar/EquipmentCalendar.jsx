import { useState, useEffect } from 'react'
import { equipmentAPI } from '../../services/api'
import './EquipmentCalendar.css'

const EquipmentCalendar = ({ equipmentId, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailability] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    if (equipmentId) {
      fetchAvailability()
    }
  }, [equipmentId, currentDate])

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      const response = await equipmentAPI.getAvailability(equipmentId, { year, month })
      setAvailability(response.data.availability || {})
    } catch (error) {
      console.error('Error fetching availability:', error)
      // Fallback to mock availability
      const mockAvailability = {}
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        // Random availability for demo
        mockAvailability[dateKey] = Math.random() > 0.3 // 70% available
      }
      setAvailability(mockAvailability)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isDateAvailable = (day) => {
    const dateKey = formatDateKey(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      day
    )
    return availability[dateKey] !== false // Default to available if not specified
  }

  const isDateSelected = (day) => {
    if (!selectedDate) return false
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === currentDate.getMonth() &&
           selectedDate.getFullYear() === currentDate.getFullYear()
  }

  const isDateToday = (day) => {
    const today = new Date()
    return today.getDate() === day &&
           today.getMonth() === currentDate.getMonth() &&
           today.getFullYear() === currentDate.getFullYear()
  }

  const isDatePast = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

    if (isDatePast(day)) return // Can't select past dates

    if (isDateSelected(day)) {
      setSelectedDate(null)
      onDateSelect && onDateSelect(null)
    } else {
      setSelectedDate(clickedDate)
      onDateSelect && onDateSelect(clickedDate)
    }
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + direction)
      return newDate
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isAvailable = isDateAvailable(day)
      const isSelected = isDateSelected(day)
      const isToday = isDateToday(day)
      const isPast = isDatePast(day)

      days.push(
        <div
          key={day}
          className={`calendar-day ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      )
    }

    return days
  }

  if (loading) {
    return <div className="equipment-calendar loading">Loading calendar...</div>
  }

  return (
    <div className="equipment-calendar">
      <div className="calendar-header">
        <button onClick={() => navigateMonth(-1)} className="nav-btn">
          <i className="fas fa-chevron-left"></i>
        </button>
        <h3>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={() => navigateMonth(1)} className="nav-btn">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="calendar-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-grid">
        {renderCalendarDays()}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color unavailable"></div>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  )
}

export default EquipmentCalendar