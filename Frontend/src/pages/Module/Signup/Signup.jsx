import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../../../services/api'
import './Signup.css'

const Signup = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',  // DEFAULT CUSTOMER
    businessName: '',
    ownerName: '',
    city: '',
    gstNumber: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // URL मध्ये role=VENDOR असेल तर role set करा
  useEffect(() => {
    const roleFromUrl = searchParams.get('role')
    if (roleFromUrl === 'VENDOR') {
      setFormData(prev => ({ ...prev, role: 'VENDOR' }))
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      }

      // जर role VENDOR असेल तर extra fields add करा
      if (formData.role === 'VENDOR') {
        signupData.businessName = formData.businessName
        signupData.ownerName = formData.ownerName
        signupData.city = formData.city
        if (formData.gstNumber) signupData.gstNumber = formData.gstNumber
        if (formData.address) signupData.address = formData.address
      }

      const response = await authAPI.register(signupData)
      
      if (response.data && response.data.data) {
        navigate('/login')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>{formData.role === 'VENDOR' ? 'Become a Vendor' : 'Create Customer Account'}</h2>
        <p>
          {formData.role === 'VENDOR' 
            ? 'Join EquipBazzar as a vendor and grow your business' 
            : 'Join EquipBazzar to rent equipment'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          {/* VENDOR साठी extra fields */}
          {formData.role === 'VENDOR' && (
            <>
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your business name"
                />
              </div>

              <div className="form-group">
                <label>Owner Name</label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                  placeholder="Enter owner name"
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="Enter your city"
                />
              </div>

              <div className="form-group">
                <label>GST Number (Optional)</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter GST number"
                />
              </div>

              <div className="form-group">
                <label>Business Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter your business address"
                ></textarea>
              </div>
            </>
          )}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading 
              ? 'Creating account...' 
              : formData.role === 'VENDOR' 
                ? 'Register as Vendor' 
                : 'Sign Up as Customer'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup