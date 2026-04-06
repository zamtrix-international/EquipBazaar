import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const extractListFromResponse = (response, preferredKey = 'rows') => {
  const payload = response?.data?.data

  if (Array.isArray(payload?.[preferredKey])) return payload[preferredKey]
  if (Array.isArray(payload?.rows)) return payload.rows
  if (Array.isArray(payload?.bookings)) return payload.bookings
  if (Array.isArray(payload?.users)) return payload.users
  if (Array.isArray(payload?.tickets)) return payload.tickets
  if (Array.isArray(payload)) return payload

  if (Array.isArray(response?.data?.[preferredKey])) return response.data[preferredKey]
  if (Array.isArray(response?.data?.rows)) return response.data.rows
  if (Array.isArray(response?.data?.bookings)) return response.data.bookings
  if (Array.isArray(response?.data?.users)) return response.data.users
  if (Array.isArray(response?.data?.tickets)) return response.data.tickets
  if (Array.isArray(response?.data)) return response.data

  return []
}

const normalizePagedResponse = (response, collectionKey = 'rows') => {
  const items = extractListFromResponse(response, collectionKey)
  const payload = response?.data?.data
  const total =
    payload?.count ??
    payload?.total ??
    response?.data?.count ??
    response?.data?.total ??
    items.length

  const safeLimit =
    Number(payload?.limit ?? response?.config?.params?.limit ?? items.length) || 1

  const pages = payload?.pages ?? Math.max(1, Math.ceil(total / safeLimit))

  return {
    ...response,
    data: {
      ...(response?.data || {}),
      success: response?.data?.success ?? true,
      data: {
        ...(payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {}),
        [collectionKey]: items,
        rows: items,
        count: total,
        total,
        pages,
      },
    },
  }
}

const normalizeUserRecord = (user = {}) => ({
  ...user,
  role: String(user.role || '').toLowerCase(),
  status: String(user.status || 'active').toLowerCase(),
  joinedDate: user.joinedDate || user.createdAt,
  totalBookings: Number(user.totalBookings || user.bookingCount || 0),
})

const getNormalizedUsers = async (params = {}) => {
  const response = normalizePagedResponse(await api.get('/users', { params }), 'users')
  let users = response.data.data.rows.map(normalizeUserRecord)

  if (params?.role) {
    users = users.filter((user) => user.role === String(params.role).toLowerCase())
  }

  if (params?.search) {
    const query = String(params.search).toLowerCase()
    users = users.filter((user) =>
      [user.name, user.email, user.phone]
        .some((value) => String(value || '').toLowerCase().includes(query))
    )
  }

  if (params?.status) {
    const statusQuery = String(params.status).toLowerCase()
    users = users.filter((user) => {
      const normalizedStatus =
        user.status === 'blocked'
          ? 'suspended'
          : user.status === 'active'
            ? 'approved'
            : user.status

      return normalizedStatus === statusQuery
    })
  }

  return {
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        users,
        rows: users,
        total: users.length,
        count: users.length,
        pages: 1,
      },
    },
  }
}

const enrichBookingList = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0 || items.length > 15) {
    return items
  }

  return Promise.all(
    items.map(async (item) => {
      if (item?.equipment || item?.vendor || item?.customer) {
        return item
      }

      const bookingId = item.id || item._id
      if (!bookingId) {
        return item
      }

      try {
        const detailResponse = await api.get(`/bookings/${bookingId}`)
        return {
          ...item,
          ...(detailResponse?.data?.data || {}),
        }
      } catch {
        return item
      }
    })
  )
}

const getNormalizedBookings = async (params = {}) => {
  const response = normalizePagedResponse(await api.get('/bookings', { params }), 'bookings')
  let bookings = await enrichBookingList(response.data.data.rows)

  return {
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        bookings,
        rows: bookings,
        total: response.data.data.total || bookings.length,
        count: response.data.data.count || bookings.length,
        pages: response.data.data.pages || 1,
      },
    },
  }
}

const buildAdminAnalyticsData = async () => {
  const [dashboardRes, usersRes, bookingsRes] = await Promise.all([
    api.get('/admin/dashboard'),
    getNormalizedUsers({ page: 1, limit: 200 }),
    getNormalizedBookings({ page: 1, limit: 200 }),
  ])

  const dashboardStats = dashboardRes?.data?.data || {}
  const users = usersRes?.data?.data?.users || []
  const bookings = bookingsRes?.data?.data?.bookings || []

  const groupedBookings = bookings.reduce((acc, booking) => {
    const dateKey = String(booking.serviceDate || booking.startDate || booking.createdAt || new Date().toISOString()).slice(0, 10)
    acc[dateKey] = (acc[dateKey] || 0) + 1
    return acc
  }, {})

  const bookingsTrend = Object.entries(groupedBookings)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([date, count]) => ({ date, bookings: count }))

  const revenueTotal = bookings.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0)

  const revenueByCategoryMap = bookings.reduce((acc, booking) => {
    const category = booking.equipment?.category || booking.equipment?.type || 'Other'
    acc[category] = (acc[category] || 0) + Number(booking.totalAmount || 0)
    return acc
  }, {})

  const revenueByCategory = Object.entries(revenueByCategoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, revenue]) => ({
      category,
      revenue,
      percentage: revenueTotal ? Number(((revenue / revenueTotal) * 100).toFixed(1)) : 0,
    }))

  const topEquipmentMap = bookings.reduce((acc, booking) => {
    const equipmentName = booking.equipment?.name || booking.equipment?.title || `Equipment #${booking.equipmentId || 'N/A'}`
    if (!acc[equipmentName]) {
      acc[equipmentName] = { name: equipmentName, bookings: 0, revenue: 0 }
    }
    acc[equipmentName].bookings += 1
    acc[equipmentName].revenue += Number(booking.totalAmount || 0)
    return acc
  }, {})

  const topEquipment = Object.values(topEquipmentMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const userGrowthMap = users.reduce((acc, user) => {
    const dateKey = String(user.joinedDate || user.createdAt || new Date().toISOString()).slice(0, 10)
    acc[dateKey] = (acc[dateKey] || 0) + 1
    return acc
  }, {})

  const userGrowth = Object.entries(userGrowthMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([date, totalUsers]) => ({ date, users: totalUsers }))

  return {
    overview: {
      totalBookings: Number(dashboardStats.totalBookings || bookings.length || 0),
      bookingsChange: 0,
      totalRevenue: Number(dashboardStats.totalRevenue || revenueTotal || 0),
      revenueChange: 0,
      activeEquipment: new Set(bookings.map((booking) => booking.equipmentId).filter(Boolean)).size,
      equipmentChange: 0,
      totalUsers: Number(dashboardStats.totalUsers || users.length || 0),
      usersChange: 0,
    },
    bookingsTrend: bookingsTrend.length > 0 ? bookingsTrend : [{ date: new Date().toISOString().slice(0, 10), bookings: 0 }],
    revenueByCategory: revenueByCategory.length > 0 ? revenueByCategory : [{ category: 'No data', revenue: 0, percentage: 0 }],
    topEquipment,
    userGrowth: userGrowth.length > 0 ? userGrowth : [{ date: new Date().toISOString().slice(0, 10), users: Number(dashboardStats.totalUsers || 0) }],
    rawUsers: users,
    rawBookings: bookings,
  }
}

const buildAdminReportData = async () => {
  const analyticsData = await buildAdminAnalyticsData()
  const topVendorsMap = analyticsData.rawBookings.reduce((acc, booking) => {
    const vendorName =
      booking.vendor?.businessName ||
      booking.vendor?.ownerName ||
      booking.vendor?.name ||
      `Vendor #${booking.vendorId || 'N/A'}`

    if (!acc[vendorName]) {
      acc[vendorName] = { name: vendorName, bookings: 0, revenue: 0, rating: 0 }
    }

    acc[vendorName].bookings += 1
    acc[vendorName].revenue += Number(booking.totalAmount || 0)
    return acc
  }, {})

  const topVendors = Object.values(topVendorsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    summary: {
      totalBookings: analyticsData.overview.totalBookings,
      totalRevenue: analyticsData.overview.totalRevenue,
      activeVendors: analyticsData.rawUsers.filter((user) => user.role === 'vendor').length,
      avgRating: 0,
      bookingGrowth: analyticsData.overview.bookingsChange,
      revenueGrowth: analyticsData.overview.revenueChange,
      vendorGrowth: 0,
      ratingGrowth: 0,
    },
    chartData: {
      labels: analyticsData.bookingsTrend.map((item) => new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
      values: analyticsData.bookingsTrend.map((item) => item.bookings),
    },
    equipmentData: analyticsData.topEquipment.map((item) => ({
      name: item.name,
      bookings: item.bookings,
      revenue: item.revenue,
    })),
    topVendors,
  }
}

const getStoredSupportTickets = () => {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(window.localStorage.getItem('supportTicketsLocal') || '[]')
  } catch {
    return []
  }
}

const saveStoredSupportTickets = (tickets) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('supportTicketsLocal', JSON.stringify(tickets))
}

const buildSupportResponse = (tickets) => ({
  data: {
    success: true,
    message: 'Support tickets retrieved',
    data: {
      tickets,
      rows: tickets,
      count: tickets.length,
      total: tickets.length,
      pages: 1,
    },
  },
})

const buildCsvString = (rows = []) => {
  if (!rows.length) return 'No data available\n'

  const headers = Object.keys(rows[0])
  const csvRows = [headers.join(',')]

  rows.forEach((row) => {
    csvRows.push(
      headers
        .map((header) => {
          const value = row[header] ?? ''
          return `"${String(value).replace(/"/g, '""')}"`
        })
        .join(',')
    )
  })

  return csvRows.join('\n')
}

const WITHDRAWAL_REQUESTS_STORAGE_KEY = 'trackedWithdrawalRequests'

const normalizeWithdrawalRequestRecord = (request = {}) => {
  const normalizedAmount = Number(request.requestedAmount ?? request.amount ?? 0)

  return {
    ...request,
    id: request.id || request.requestId || request._id || null,
    vendorId: request.vendorId || request.vendor?.id || request.vendor?.vendorId || null,
    bankAccountId: request.bankAccountId || request.bankAccount?.id || null,
    bankAccount: request.bankAccount || null,
    requestedAmount: normalizedAmount,
    amount: normalizedAmount,
    status: String(request.status || 'PENDING').toUpperCase(),
    requestedAt: request.requestedAt || request.createdAt || new Date().toISOString(),
  }
}

const getStoredWithdrawalRequests = () => {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(window.localStorage.getItem(WITHDRAWAL_REQUESTS_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const saveStoredWithdrawalRequests = (requests = []) => {
  if (typeof window === 'undefined') return

  const normalizedRequests = requests
    .map((request) => normalizeWithdrawalRequestRecord(request))
    .filter((request) => request.id)
    .sort(
      (a, b) =>
        new Date(b.requestedAt || b.createdAt || 0).getTime() -
        new Date(a.requestedAt || a.createdAt || 0).getTime()
    )

  const dedupedRequests = Array.from(
    new Map(normalizedRequests.map((request) => [String(request.id), request])).values()
  )

  window.localStorage.setItem(
    WITHDRAWAL_REQUESTS_STORAGE_KEY,
    JSON.stringify(dedupedRequests)
  )
}

const rememberWithdrawalRequest = (request) => {
  const normalizedRequest = normalizeWithdrawalRequestRecord(request)

  if (!normalizedRequest.id) {
    return normalizedRequest
  }

  const storedRequests = getStoredWithdrawalRequests()
  const existingRequest = storedRequests.find(
    (item) => String(item.id) === String(normalizedRequest.id)
  )

  const mergedRequest = normalizeWithdrawalRequestRecord({
    ...(existingRequest || {}),
    ...normalizedRequest,
    bankAccount:
      normalizedRequest.bankAccount || existingRequest?.bankAccount || null,
    bankAccountId:
      normalizedRequest.bankAccountId || existingRequest?.bankAccountId || null,
  })

  const remainingRequests = storedRequests.filter(
    (item) => String(item.id) !== String(mergedRequest.id)
  )

  saveStoredWithdrawalRequests([mergedRequest, ...remainingRequests])
  return mergedRequest
}

const syncStoredWithdrawalRequests = async () => {
  const storedRequests = getStoredWithdrawalRequests()

  if (storedRequests.length === 0) {
    return []
  }

  const syncedResults = await Promise.allSettled(
    storedRequests.map(async (storedRequest) => {
      if (!storedRequest?.id) {
        return null
      }

      try {
        const response = await api.get(`/payouts/withdrawal-request/${storedRequest.id}`)
        return rememberWithdrawalRequest(response?.data?.data || response?.data || storedRequest)
      } catch {
        return normalizeWithdrawalRequestRecord(storedRequest)
      }
    })
  )

  const syncedRequests = syncedResults
    .filter((result) => result.status === 'fulfilled' && result.value?.id)
    .map((result) => result.value)

  if (syncedRequests.length > 0) {
    saveStoredWithdrawalRequests(syncedRequests)
  }

  return syncedRequests
}

const buildWithdrawalRequestResponse = (requests = []) => ({
  data: {
    success: true,
    message: 'Withdrawal requests retrieved',
    data: {
      requests,
      rows: requests,
      count: requests.length,
      total: requests.length,
      pages: 1,
    },
  },
})

// Health Check
export const healthAPI = {
  check: () => api.get('/health'),
}

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: (params) => api.get('/users', { params }),
}

// Equipment APIs
export const equipmentAPI = {
  getAll: (params) => api.get('/equipments', { params }),
  getById: (id) => api.get(`/equipments/${id}`),
  create: (data) => api.post('/equipments', data),
  update: (id, data) => api.put(`/equipments/${id}`, data),
  updateStatus: (id, data) => api.put(`/equipments/${id}`, data),
  delete: (id) => api.delete(`/equipments/${id}`),
  getMyEquipment: (params) => api.get('/equipments/vendor/my-equipment', { params }),
  getByVendor: (vendorId, params) => api.get('/equipments', { params: { vendorId, ...params } }),
  search: (params) => api.get('/equipments', { params }),
  getFeatured: (limit = 4) => api.get('/equipments', { params: { limit, featured: true } }),
  getCategories: () => api.get('/equipments', { params: { categories: true } }),
  addImage: (id, data) => api.post(`/equipments/${id}/images`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getImages: (id) => api.get(`/equipments/${id}/images`),
  deleteImage: (id, imageId) => api.delete(`/equipments/${id}/images/${imageId}`),
  setAvailability: (id, data) => api.post(`/equipments/${id}/availability`, data),
  getAvailability: (id, params) => api.get(`/equipments/${id}/availability`, { params }),
}

// Vendor APIs
export const vendorAPI = {
  createProfile: (data) => api.post('/vendors', data),
  getProfile: (vendorId) => api.get(`/vendors/${vendorId}`),
  getMyProfile: () => api.get('/vendors/me'),
  updateProfile: (vendorId, data) => api.put(`/vendors/${vendorId}`, data),
  updateMyProfile: (data) => api.put('/vendors/me', data),
  uploadKYC: (vendorId, data) => api.post(`/vendors/${vendorId}/kyc`, data),
  uploadMyKYC: (data) => api.post('/vendors/me/kyc', data),
  addBankAccount: (vendorId, data) => api.post(`/vendors/${vendorId}/bank-account`, data),
  addMyBankAccount: (data) => api.post('/vendors/me/bank-account', data),
  getMyBankAccounts: async () => {
    try {
      return await api.get('/vendors/me/bank-accounts')
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        const profileResponse = await api.get('/vendors/me')
        const bankAccounts =
          profileResponse?.data?.data?.bankAccounts ||
          profileResponse?.data?.bankAccounts ||
          []

        return {
          ...profileResponse,
          data: {
            ...(profileResponse.data || {}),
            success: true,
            message: 'Vendor bank accounts retrieved',
            data: bankAccounts,
          },
        }
      }

      throw error
    }
  },
  getDashboard: () => api.get('/vendors/me'),
  getEarnings: (params) => api.get('/payouts', { params }),
  getEarningsSummary: (params) => api.get('/payouts', { params }),
  getEarningsTransactions: (params) => api.get('/payouts', { params }),
  search: (params) => api.get('/vendors', { params }),
}

// Booking APIs - UPDATED with return status support
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  createBooking: (data) => api.post('/bookings', data),
  getAll: (params) => getNormalizedBookings(params),
  getById: (id) => api.get(`/bookings/${id}`),
  
  updateStatus: (id, status, reason = '') => {
    const normalizedStatus = String(status || '').toUpperCase()
    return api.patch(`/bookings/${id}/status`, {
      newStatus: normalizedStatus,
      status: normalizedStatus,
      reason,
    })
  },
  
  // 🆕 Update return status for vendor pickup flow
  updateReturnStatus: async (id, returnStatus) => {
    const normalizedStatus = String(returnStatus || '').toUpperCase()
    const payload = { returnStatus: normalizedStatus }
    
    // Try multiple possible endpoints
    const endpoints = [
      `/bookings/${id}/return-status`,
      `/bookings/${id}/return`,
      `/delivery/${id}/return-status`,
      `/vendor/bookings/${id}/return`
    ]
    
    let lastError = null
    
    for (const endpoint of endpoints) {
      try {
        const response = await api.patch(endpoint, payload)
        if (response?.data?.success !== false) {
          return response
        }
      } catch (error) {
        lastError = error
      }
    }
    
    // If all PATCH attempts fail, try PUT
    try {
      return await api.put(`/bookings/${id}/return-status`, payload)
    } catch (error) {
      throw lastError || new Error('Failed to update return status')
    }
  },
  
  // 🆕 Get booking with return details
  getBookingWithReturn: (id) => api.get(`/bookings/${id}/return-details`),
  
  getMyBookings: (params) => getNormalizedBookings(params),
  getVendorBookings: (params) => getNormalizedBookings(params),
  
  updatePaymentStatus: () => Promise.resolve({
    data: {
      success: false,
      message: 'Payment status update is not supported by the current backend',
    },
  }),
}

// Payment APIs
export const paymentAPI = {
  initiatePayment: (bookingId, data) =>
    api.post(`/payments/${bookingId}/initiate`, data),

  verifyPayment: (bookingId, data) =>
    api.post(`/payments/${bookingId}/verify`, data),

  verifyStubPayment: () => Promise.reject(new Error('Stub payment verification is not available on the current backend')),

  getPaymentDetails: (paymentId) =>
    api.get(`/payments/${paymentId}`),
}

// Delivery APIs
export const deliveryAPI = {
  confirmPickup: (bookingId, data) => api.post(`/delivery/${bookingId}/confirm-pickup`, data),
  confirmReturn: (bookingId, data) => api.post(`/delivery/${bookingId}/confirm-return`, data),
  getDeliveryStatus: (bookingId) => api.get(`/delivery/${bookingId}/status`),
  
  // 🆕 Vendor confirms pickup for return
  vendorConfirmReturnPickup: (bookingId, data = {}) => 
    api.post(`/delivery/${bookingId}/return-pickup-confirm`, data),
  
  // 🆕 Vendor marks pickup as completed
  vendorCompleteReturnPickup: (bookingId, data = {}) => 
    api.post(`/delivery/${bookingId}/return-pickup-complete`, data),
}

// Dispute APIs
export const disputeAPI = {
  createDispute: (bookingId, data) => api.post(`/dispute/${bookingId}/dispute`, data),
  getDispute: (disputeId) => api.get(`/dispute/${disputeId}`),
  addMessage: (disputeId, data) => api.post(`/dispute/${disputeId}/message`, data),
  resolveDispute: (disputeId) => api.patch(`/dispute/${disputeId}/resolve`),
}

// Review APIs
export const reviewAPI = {
  createReview: (bookingId, data) => api.post(`/review/${bookingId}`, data),
  getEquipmentReviews: (equipmentId) => api.get(`/review/equipment/${equipmentId}`),
  getVendorReviews: (vendorId) => api.get(`/review/vendor/${vendorId}`),
}

// Wallet & Payout APIs
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getLedger: (params) => api.get('/wallet/ledger', { params }),
}

export const payoutAPI = {
  createWithdrawalRequest: async (data) => {
    const amount = Number(data?.amount ?? data?.requestedAmount ?? 0)
    const payload = {
      ...data,
      amount,
      requestedAmount: amount,
    }

    const response = await api.post('/payouts/withdrawal-request', payload)
    const request = response?.data?.data || response?.data

    if (request?.id || request?.requestId) {
      rememberWithdrawalRequest(request)
    }

    return response
  },
  getWithdrawalRequest: async (requestId) => {
    const response = await api.get(`/payouts/withdrawal-request/${requestId}`)
    const request = response?.data?.data || response?.data

    if (request?.id || request?.requestId) {
      rememberWithdrawalRequest(request)
    }

    return response
  },
  getPayouts: (params) => api.get('/payouts', { params }),
  processWithdrawal: async (requestId) => {
    const response = await api.patch(`/payouts/withdrawal-request/${requestId}/process`)
    const request = response?.data?.data || response?.data

    if (request?.id || request?.requestId) {
      rememberWithdrawalRequest(request)
    }

    return response
  },
  getWithdrawalRequests: async () => {
    try {
      const response = normalizePagedResponse(await api.get('/payouts/pending'), 'requests')
      const requests = response.data.data.rows.map((request) => rememberWithdrawalRequest(request))

      return {
        ...response,
        data: {
          ...response.data,
          data: {
            ...response.data.data,
            requests,
            rows: requests,
            count: requests.length,
            total: requests.length,
            pages: 1,
          },
        },
      }
    } catch (error) {
      if (error.response?.status && ![404, 405].includes(error.response.status)) {
        throw error
      }

      const requests = await syncStoredWithdrawalRequests()
      return buildWithdrawalRequestResponse(requests)
    }
  },
}

// Commission APIs
export const commissionAPI = {
  getCommissionRule: async () => {
    const response = await api.get('/commission')
    const rule = response?.data?.data || response?.data || {}
    const normalizedRule = {
      id: rule.id || 1,
      equipmentType: rule.scope || 'GLOBAL',
      commissionPercentage: Number(rule.commissionPct || 10),
      minCommission: Number(rule.minCommission || 0),
      maxCommission: Number(rule.maxCommission || 100000),
      isActive: rule.isActive ?? true,
    }

    return {
      ...response,
      data: {
        ...(response?.data || {}),
        success: response?.data?.success ?? true,
        data: {
          ...normalizedRule,
          rules: [normalizedRule],
        },
      },
    }
  },
  updateCommissionRule: (data) => {
    const firstRule = Array.isArray(data?.rules) ? data.rules[0] : data
    return api.put('/commission', {
      commissionPct: Number(firstRule?.commissionPercentage ?? firstRule?.commissionPct ?? 10),
    })
  },
  calculateCommission: (bookingId) => api.post(`/commission/${bookingId}/calculate`),
}

// Report APIs
export const reportAPI = {
  generateBookingReport: (params) => api.get('/reports/booking', { params }),
  exportReport: (data) => api.post('/reports/export', data),
  getExportStatus: (exportId) => api.get(`/reports/export/${exportId}`),
  listVendorReports: (params) => api.get('/reports', { params }),
}

// Settings APIs
export const settingsAPI = {
  getPaymentGatewayConfig: () => api.get('/settings/payment-gateway'),
  updatePaymentGatewayConfig: (data) => api.put('/settings/payment-gateway', data),
  getAppSettings: () => api.get('/settings/app'),
  updateAppSetting: (data) => api.put('/settings/app', data),
}

// Admin APIs
export const adminAPI = {
  getDashboard: async () => {
    const [dashboardRes, usersRes, pendingKycRes] = await Promise.all([
      api.get('/admin/dashboard'),
      getNormalizedUsers({ page: 1, limit: 200 }),
      api.get('/admin/kyc/pending').catch(() => ({ data: { success: true, data: [] } })),
    ])

    const users = usersRes?.data?.data?.users || []
    const pendingKyc = extractListFromResponse(pendingKycRes)

    return {
      ...dashboardRes,
      data: {
        ...(dashboardRes?.data || {}),
        success: dashboardRes?.data?.success ?? true,
        data: {
          ...(dashboardRes?.data?.data || {}),
          totalVendors: users.filter((user) => user.role === 'vendor').length,
          pendingVendors:
            new Set(
              pendingKyc
                .map((item) => item.vendorId || item.vendor?.id || item.id)
                .filter(Boolean)
            ).size || pendingKyc.length,
        },
      },
    }
  },
  getApprovals: () => api.get('/admin/approvals'),
  getPendingKyc: () => api.get('/admin/kyc/pending'),
  reviewKyc: (kycId, data) => api.patch(`/admin/kyc/${kycId}/review`, data),
  getLogs: (params) => api.get('/admin/logs', { params }),
  getVendors: async (params) => {
    const response = await getNormalizedUsers(params)
    const vendors = response.data.data.users.filter((user) => user.role === 'vendor')

    return {
      ...response,
      data: {
        ...response.data,
        data: {
          ...response.data.data,
          users: vendors,
          rows: vendors,
          total: vendors.length,
          count: vendors.length,
          pages: 1,
        },
      },
    }
  },
  approveVendor: () => Promise.resolve({
    data: {
      success: false,
      message: 'Vendor approval is handled through KYC review on this backend',
    },
  }),
  getUsers: (params) => getNormalizedUsers(params),
  getReports: async () => {
    const reportData = await buildAdminReportData()
    return { data: { success: true, data: reportData } }
  },
  exportReport: async () => {
    const reportData = await buildAdminReportData()
    const csvRows = reportData.equipmentData.map((item) => ({
      equipment: item.name,
      bookings: item.bookings,
      revenue: item.revenue,
    }))

    return {
      data: {
        success: true,
        data: buildCsvString(csvRows),
      },
    }
  },
  getAnalytics: async () => {
    const analyticsData = await buildAdminAnalyticsData()
    return { data: { success: true, data: analyticsData } }
  },
  getBookings: (params) => getNormalizedBookings(params),
  updateUserStatus: () => Promise.resolve({
    data: {
      success: false,
      message: 'User status update is not supported by the current backend',
    },
  }),
  updateVendorStatus: () => Promise.resolve({
    data: {
      success: false,
      message: 'Vendor status update is not supported by the current backend',
    },
  }),
  getAllSupportTickets: (params) => api.get('/admin/support', { params }),
  getSupportTicketDetails: (ticketId) => api.get(`/admin/support/${ticketId}`),
  addSupportTicketMessage: (ticketId, data) => api.post(`/admin/support/${ticketId}/message`, data),
  closeSupportTicket: (ticketId, data = {}) => api.patch(`/admin/support/${ticketId}/close`, data),
}

// Customer APIs
export const customerAPI = {
  getDashboard: async () => {
    const bookingsRes = await getNormalizedBookings({ page: 1, limit: 100 })
    const bookings = bookingsRes?.data?.data?.bookings || []

    const stats = {
      totalBookings: bookings.length,
      activeBookings: bookings.filter((booking) => ['paid', 'accepted', 'on_the_way', 'work_started', 'delivered'].includes(String(booking.status || '').toLowerCase())).length,
      completedBookings: bookings.filter((booking) => String(booking.status || '').toLowerCase() === 'completed').length,
      totalSpent: bookings.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0),
    }

    return {
      data: {
        success: true,
        data: { stats },
      },
    }
  },
}

// Support APIs
export const supportAPI = {
  getMyTickets: async () => {
    try {
      const response = normalizePagedResponse(await api.get('/support'), 'tickets')
      const tickets = response.data.data.rows
      return {
        ...response,
        data: {
          ...response.data,
          data: {
            ...response.data.data,
            tickets,
            rows: tickets,
          },
        },
      }
    } catch {
      const tickets = getStoredSupportTickets()
      return buildSupportResponse(tickets)
    }
  },
  createTicket: async (data) => {
    const payload = {
      ...data,
      createdByUserId: data.createdByUserId || localStorage.getItem('userId') || undefined,
      role: String(data.role || localStorage.getItem('role') || 'CUSTOMER').toUpperCase(),
      category: String(data.category || 'OTHER').toUpperCase(),
      priority: String(data.priority || 'MEDIUM').toUpperCase(),
    }

    try {
      const response = await api.post('/support', payload)
      const ticket = response?.data?.data?.ticket || response?.data?.data || payload

      return {
        ...response,
        data: {
          ...(response?.data || {}),
          success: response?.data?.success ?? true,
          data: {
            ticket,
          },
        },
      }
    } catch {
      const localTickets = getStoredSupportTickets()
      const ticket = {
        id: Date.now(),
        subject: payload.subject,
        category: payload.category,
        priority: payload.priority,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        messages: payload.message
          ? [{ id: Date.now() + 1, message: payload.message, senderUserId: payload.createdByUserId }]
          : [],
      }

      const updatedTickets = [ticket, ...localTickets]
      saveStoredSupportTickets(updatedTickets)

      return {
        data: {
          success: true,
          message: 'Support ticket saved locally',
          data: { ticket },
        },
      }
    }
  },
  getTicketById: (id) => api.get(`/support/${id}`),
  sendMessage: async (ticketId, data) => {
    const payload = {
      ...data,
      senderUserId: data.senderUserId || localStorage.getItem('userId') || undefined,
    }

    try {
      return await api.post(`/support/${ticketId}/message`, payload)
    } catch {
      const localTickets = getStoredSupportTickets()
      const updatedTickets = localTickets.map((ticket) =>
        String(ticket.id) === String(ticketId)
          ? {
              ...ticket,
              messages: [
                ...(ticket.messages || []),
                {
                  id: Date.now(),
                  message: payload.message,
                  senderUserId: payload.senderUserId,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : ticket
      )

      saveStoredSupportTickets(updatedTickets)
      return { data: { success: true, message: 'Message saved locally' } }
    }
  },
  closeTicket: async (id, data = {}) => {
    try {
      return await api.patch(`/support/${id}/close`, data)
    } catch {
      const localTickets = getStoredSupportTickets()
      const updatedTickets = localTickets.map((ticket) =>
        String(ticket.id) === String(id)
          ? { ...ticket, status: 'CLOSED', closedAt: new Date().toISOString() }
          : ticket
      )

      saveStoredSupportTickets(updatedTickets)
      return { data: { success: true, message: 'Ticket closed locally' } }
    }
  },
}

// Notification APIs
export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
}