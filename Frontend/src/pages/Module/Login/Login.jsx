import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../../services/api'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    phoneOrEmail: '',  // email ऐवजी phoneOrEmail
    password: '',
    role: 'CUSTOMER'   // uppercase मध्ये role
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    try {
      // Postman प्रमाणे फक्त phoneOrEmail आणि password पाठवा
      const loginData = {
        phoneOrEmail: formData.phoneOrEmail,
        password: formData.password
      }
      
      const response = await authAPI.login(loginData)
      
      if (response.data && response.data.data) {
        const { token, user } = response.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Backend मध्ये role uppercase मध्ये येतो
        switch(user.role) {
          case 'CUSTOMER':
            navigate('/customer/dashboard')
            break
          case 'VENDOR':
            navigate('/vendor/dashboard')
            break
          case 'ADMIN':
            navigate('/admin/dashboard')
            break
          default:
            navigate('/')
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <p>Login to your EquipBazzar account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or Phone</label>
            <input
              type="text"
              name="phoneOrEmail"
              value={formData.phoneOrEmail}
              onChange={handleChange}
              required
              placeholder="Enter your email or phone"
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login