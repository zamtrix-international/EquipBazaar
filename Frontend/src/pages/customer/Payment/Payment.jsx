// pages/customer/Payment/Payment.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI, paymentAPI } from '../../../services/api';
import './Payment.css';

// ─── Icon Components ───────────────────────────────────────────────────────────
const Icons = {
  CreditCard: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  ),
  MoneyBill: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
      <circle cx="12" cy="12" r="2"></circle>
      <line x1="6" y1="12" x2="6.01" y2="12"></line>
      <line x1="18" y1="12" x2="18.01" y2="12"></line>
    </svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  Spinner: () => (
    <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.9 17.1l-2.82 2.82M17.1 6.9l2.82-2.82M4.93 19.07l2.83-2.83"></path>
    </svg>
  ),
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // EquipmentDetail se aata hai: { equipment, bookingDetails }
  const { equipment, bookingDetails } = location.state || {};
  const { duration, date, hours, total } = bookingDetails || {};

  const [paymentMethod, setPaymentMethod] = useState('online');
  const [processing, setProcessing] = useState(false);
  const [stepText, setStepText] = useState('');
  const [error, setError] = useState('');
  const [isStubMode, setIsStubMode] = useState(false);

  // ── Check if Razorpay is available ──────────────────────────────────────────
  useEffect(() => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const hasValidKey = razorpayKey && razorpayKey !== 'your_razorpay_key_id_here';
    
    if (!hasValidKey) {
      setIsStubMode(true);
      console.log('🔧 Demo mode active - booking requests will be submitted without a live Razorpay payment');
    }
  }, []);

  // ── Helper function to prepare booking data ─────────────────────────────────
  const prepareBookingData = (isCash = false) => {
    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : null;

    const locationText = equipment?.location ||
      equipment?.locationText ||
      equipment?.address ||
      equipment?.vendor?.address ||
      equipment?.deliveryAddress ||
      'Delivery at vendor location';

    const bookingData = {
      equipmentId: equipment.id,
      serviceDate: formattedDate,
      startDate: formattedDate,
      locationText,
      city: equipment?.city || 'Meerut',
      notes: isCash ? 'Cash payment selected from frontend' : 'Online/demo booking initiated from frontend',
    };

    if (duration === 'hourly' && hours) {
      bookingData.estimatedHours = Number(hours);
    }

    if (duration === 'daily') {
      bookingData.days = 1;
    }

    if (duration === 'weekly') {
      bookingData.days = 7;
    }

    return bookingData;
  };

  // ── Stub Payment Handler (No Razorpay Key Needed) ──────────────────────────
  const handleStubPayment = async () => {
    setProcessing(true);
    setError('');
    setStepText('Booking request create ho rahi hai...');

    try {
      const bookingData = prepareBookingData(false);
      console.log('📤 Sending booking data (Demo Mode):', bookingData);

      const bookingRes = await bookingAPI.create(bookingData);

      if (!bookingRes?.data?.success) {
        throw new Error(bookingRes?.data?.message || 'Booking create nahi hui');
      }

      const newBookingId = bookingRes.data.data.id;

      // STEP 2 — Payment initiate karo (stub mode)
      setStepText('Payment initiate ho rahi hai...');
      const initiateRes = await paymentAPI.initiatePayment(newBookingId, {
        gateway: 'RAZORPAY',
      });

      if (!initiateRes?.data?.success) {
        throw new Error('Payment initiate nahi hua');
      }

      const orderId = initiateRes.data.data.gatewayOrder.id;

      // STEP 3 — Payment verify karo (stub mode)
      setStepText('Payment verify ho rahi hai...');
      const verifyRes = await paymentAPI.verifyPayment(newBookingId, {
        orderId,
      });

      if (!verifyRes?.data?.success) {
        throw new Error('Payment verify nahi hua');
      }

      setStepText('');
      navigate('/customer/booking-success', {
        state: {
          bookingId: newBookingId,
          equipment,
          total,
          date,
          duration,
          hours,
          isStub: true,
          paymentId: verifyRes.data.data.payment.id,
        },
      });
    } catch (err) {
      console.error('Demo booking error:', err);
      setError(err?.response?.data?.message || err.message || 'Booking request fail ho gayi');
      setProcessing(false);
      setStepText('');
    }
  };

  // ── Razorpay online payment handler (Original) ────────────────────────────────
  const handleRazorpayPayment = async () => {
    setProcessing(true);
    setError('');

    try {
      // STEP 1 — Booking create karo
      setStepText('Booking create ho rahi hai...');
      
      const bookingData = prepareBookingData(false);
      console.log('📤 Sending booking data:', bookingData);
      
      const bookingRes = await bookingAPI.create(bookingData);

      if (!bookingRes?.data?.success) {
        throw new Error(bookingRes?.data?.message || 'Booking create nahi hui');
      }

      const newBookingId = bookingRes.data.data.id;

      // STEP 2 — Payment initiate karo (Razorpay order ID lo backend se)
      setStepText('Payment gateway se connect ho raha hai...');
      const payRes = await paymentAPI.initiatePayment(newBookingId, {
        gateway: 'RAZORPAY',
      });

      if (!payRes?.data?.success) {
        throw new Error('Payment initiate nahi hua');
      }

      const { gatewayOrder } = payRes.data.data;

      // STEP 3 — Razorpay popup kholo
      setStepText('');
      setProcessing(false);

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key missing — .env mein VITE_RAZORPAY_KEY_ID set karo');
      }

      const options = {
        key: razorpayKey,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency || 'INR',
        order_id: gatewayOrder.id,
        name: 'EquipBazaar',
        description: `${equipment.name} — Rental Booking`,
        image: '/logo.png',
        handler: async function (response) {
          // STEP 4 — Backend se verify karo
          setProcessing(true);
          setStepText('Payment verify ho rahi hai...');
          try {
            const verifyRes = await paymentAPI.verifyPayment(newBookingId, {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (verifyRes?.data?.success) {
              navigate('/customer/booking-success', {
                state: {
                  bookingId: newBookingId,
                  equipment,
                  total,
                  date,
                  duration,
                  hours,
                  paymentId: response.razorpay_payment_id,
                },
              });
            } else {
              setError('Payment verify nahi hua. Support se contact karo.');
              setProcessing(false);
            }
          } catch (verifyErr) {
            setError(
              'Verification mein error aaya: ' +
                (verifyErr?.response?.data?.message || verifyErr.message)
            );
            setProcessing(false);
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
          contact: localStorage.getItem('userPhone') || '',
        },
        theme: {
          color: '#FFC107',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            setError('Payment cancel kar di. Dobara try karo.');
          },
          escape: false,
          backdropclose: false,
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay load nahi hua. Page refresh karke try karo.');
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setError('Payment fail ho gayi: ' + resp.error.description);
        setProcessing(false);
      });
      rzp.open();

    } catch (err) {
      console.error('Payment error:', err);
      console.error('Error response:', err.response?.data);
      setError(err?.response?.data?.message || err.message || 'Kuch galat ho gaya, dobara try karo.');
      setProcessing(false);
      setStepText('');
    }
  };

  // ── Cash on Delivery handler ────────────────────────────────────────────────
  const handleCashPayment = async () => {
    setProcessing(true);
    setError('');
    setStepText('Booking confirm ho rahi hai...');

    try {
      const bookingData = prepareBookingData(true);
      console.log('📤 Sending cash booking data:', bookingData);
      
      const bookingRes = await bookingAPI.create(bookingData);

      if (!bookingRes?.data?.success) {
        throw new Error(bookingRes?.data?.message || 'Booking create nahi hui');
      }

      const newBookingId = bookingRes.data.data.id;

      navigate('/customer/booking-success', {
        state: {
          bookingId: newBookingId,
          equipment,
          total,
          date,
          duration,
          hours,
          isCash: true,
        },
      });
    } catch (err) {
      console.error('Cash booking error:', err);
      console.error('Error response:', err.response?.data);
      setError(err?.response?.data?.message || err.message || 'Booking fail ho gayi');
      setProcessing(false);
      setStepText('');
    }
  };

  // ── Main handler ──────────────────────────────────────────────────────────
  const handlePayment = () => {
    if (!equipment || !date) {
      navigate('/equipment');
      return;
    }
    
    if (paymentMethod === 'cash') {
      handleCashPayment();
    } else if (paymentMethod === 'online') {
      // If in stub mode, use stub payment handler
      if (isStubMode) {
        handleStubPayment();
      } else {
        handleRazorpayPayment();
      }
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not selected';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDurationLabel = () => {
    if (duration === 'hourly') return `${hours} ghante`;
    if (duration === 'daily') return '1 din';
    if (duration === 'weekly') return '1 hafta';
    return duration;
  };

  // ── No data guard ──────────────────────────────────────────────────────────
  if (!equipment || !bookingDetails) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="error-state">
            <Icons.AlertCircle />
            <h2>Booking Data Nahi Mila</h2>
            <p>Equipment select karke dobara try karo.</p>
            <button className="btn btn-primary" onClick={() => navigate('/equipment')}>
              Equipment Browse Karo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="payment-page">
      <div className="container">
        <h1 className="page-title">Booking Complete Karo</h1>

        {/* Stub Mode Warning */}
        {isStubMode && (
          <div className="stub-mode-warning">
            <div className="stub-warning-icon">🔧</div>
            <div className="stub-warning-content">
              <strong>Development Mode</strong>
              <p>Razorpay key configured nahi hai. Stub payment use ho raha hai. Actual payment nahi hoga.</p>
            </div>
          </div>
        )}

        <div className="payment-grid">
          {/* ── Booking Summary ── */}
          <div className="summary-card">
            <h2>Booking Summary</h2>

            <div className="equipment-info">
              <h3>{equipment.name}</h3>
              <span className="equipment-category">{equipment.category}</span>
            </div>

            <div className="summary-details">
              <div className="summary-item">
                <Icons.Calendar />
                <span className="label">Tarikh</span>
                <span className="value">{formatDate(date)}</span>
              </div>

              <div className="summary-item">
                <Icons.Clock />
                <span className="label">Duration</span>
                <span className="value">{getDurationLabel()}</span>
              </div>

              <div className="summary-item">
                <Icons.User />
                <span className="label">Vendor</span>
                <span className="value">
                  {equipment.vendor?.name || equipment.vendor || 'N/A'}
                </span>
              </div>
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Base Price</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="price-row">
                <span>Tax & Fees</span>
                <span>Included</span>
              </div>
              <div className="price-row total">
                <span>Total Amount</span>
                <span className="total-price">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* ── Payment Methods ── */}
          <div className="payment-card">
            <h2>Payment Method Chuno</h2>

            {error && (
              <div className="error-message">
                <Icons.AlertCircle />
                <span>{error}</span>
              </div>
            )}

            {processing && stepText && (
              <div className="step-indicator">
                <Icons.Spinner />
                <span>{stepText}</span>
              </div>
            )}

            <div className="payment-methods">
              {/* Online Payment */}
              <label className={`payment-method ${paymentMethod === 'online' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setError('');
                  }}
                  disabled={processing}
                />
                <div className="method-content">
                  <div className="method-icon">
                    <Icons.CreditCard />
                  </div>
                  <div className="method-info">
                    <h3>Online Payment {isStubMode && <span className="stub-badge">(Stub)</span>}</h3>
                    <p>{isStubMode ? 'Test payment - No actual charge' : 'UPI, Card, NetBanking — Razorpay se secure payment'}</p>
                  </div>
                  <div className="method-check">
                    <span className="checkmark"></span>
                  </div>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label className={`payment-method ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setError('');
                  }}
                  disabled={processing}
                />
                <div className="method-content">
                  <div className="method-icon">
                    <Icons.MoneyBill />
                  </div>
                  <div className="method-info">
                    <h3>Cash on Delivery</h3>
                    <p>Equipment aane par payment karo</p>
                  </div>
                  <div className="method-check">
                    <span className="checkmark"></span>
                  </div>
                </div>
              </label>
            </div>

            {/* Online payment info box */}
            {paymentMethod === 'online' && !isStubMode && (
              <div className="razorpay-info">
                <div className="razorpay-info-icon">🔒</div>
                <div>
                  <p className="razorpay-info-title">Razorpay Secure Checkout</p>
                  <p className="razorpay-info-text">
                    Button dabane ke baad Razorpay ka popup khulega jahan aap UPI,
                    Debit/Credit Card ya NetBanking se pay kar sakte ho.
                  </p>
                </div>
              </div>
            )}

            {/* Stub mode info box */}
            {paymentMethod === 'online' && isStubMode && (
              <div className="stub-info">
                <div className="stub-info-icon">🧪</div>
                <div>
                  <p className="stub-info-title">Test Mode Active</p>
                  <p className="stub-info-text">
                    This is a test payment. No actual money will be charged.
                    Booking will be confirmed instantly.
                  </p>
                </div>
              </div>
            )}

            {/* Cash info box */}
            {paymentMethod === 'cash' && (
              <div className="cash-info">
                <div className="cash-info-icon">💵</div>
                <div>
                  <p className="cash-info-title">Cash on Delivery</p>
                  <p className="cash-info-text">
                    Booking confirm hogi, equipment delivery ke waqt{' '}
                    <strong>{formatCurrency(total)}</strong> cash mein pay karo.
                  </p>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              className={`pay-now-btn ${isStubMode && paymentMethod === 'online' ? 'stub-btn' : ''}`}
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Icons.Spinner />
                  {stepText || 'Processing...'}
                </>
              ) : paymentMethod === 'cash' ? (
                'Booking Confirm Karo'
              ) : isStubMode ? (
                `Test Payment ₹${total}`
              ) : (
                `Pay ${formatCurrency(total)}`
              )}
            </button>

            <p className="secure-text">
              <Icons.Lock />
              {isStubMode && paymentMethod === 'online' 
                ? 'Test mode - No actual payment required'
                : 'Tumhari payment information secure aur encrypted hai'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;