
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import CreateBill from './components/bills/CreateBill';
import History from './components/history/History';
import Profile from './components/profile/Profile';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import FancyLoader from './components/ui/FancyLoader';
import Groups from './components/groups/Groups';


// Vibrant teen-friendly theme
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
      light: '#a5b4fc',
      dark: '#4338ca',
    },
    secondary: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

const mantineTheme = {
  primaryColor: 'violet',
  colors: {
    violet: ['#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#6366f1', '#4338ca', '#3730a3', '#312e81', '#1e1b4b'],
  },
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
};

function Pages() {
  const { loading } = useAuth();

  if (loading) return <FancyLoader />;

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="create-bill" element={<CreateBill />} />
            <Route path="history" element={<History />} />
            <Route path="groups" element={<Groups />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

function App() {
  return (
    <MantineProvider theme={mantineTheme}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Notifications />
        <AuthProvider>
          <Pages />
        </AuthProvider>
      </ThemeProvider>
    </MantineProvider>
  );
}

export default App;
