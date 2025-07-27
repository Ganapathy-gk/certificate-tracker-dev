// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // This useEffect hook will run once when the app loads
  // It checks if user data is stored in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      // The URL to your backend login endpoint
      const { data } = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data; // Return data to redirect based on role
    } catch (error) {
      console.error("Login failed", error.response.data);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};