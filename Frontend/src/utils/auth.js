// utils/auth.js — Auth helper functions

export const getToken = () => localStorage.getItem('token')

export const getUser = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export const isLoggedIn = () => {
  return !!getToken() && !!getUser()
}

export const getUserRole = () => {
  const user = getUser()
  return user?.role || null
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}