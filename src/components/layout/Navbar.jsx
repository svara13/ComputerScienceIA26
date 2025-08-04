
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stack,
  Text,
  UnstyledButton,
  Group,
  Avatar,
  Box,
  Divider,
  Button
} from '@mantine/core';
import {
  IconHome2,
  IconPlus,
  IconHistory,
  IconUser,
  IconLogout,
  IconSparkles,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';

const NavbarLink = ({ icon: Icon, label, to, color = '#6366f1' }) => (
  <UnstyledButton
    component={NavLink}
    to={to}
    style={({ isActive }) => ({
      display: 'block',
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      textDecoration: 'none',
      color: isActive ? '#ffffff' : '#64748b',
      background: isActive
        ? `linear-gradient(45deg, ${color}, ${color}dd)`
        : 'transparent',
      transition: 'all 0.2s ease',
      transform: isActive ? 'scale(1.02)' : 'scale(1)',
      boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
    })}
  >
    <Group>
      <Icon size="1.2rem" />
      <Text fw={500} size="sm">
        {label}
      </Text>
    </Group>
  </UnstyledButton>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: IconHome2, label: 'Dashboard', to: '/', color: '#6366f1' },
    { icon: IconPlus, label: 'Create Bill', to: '/create-bill', color: '#10b981' },
    { icon: IconHistory, label: 'History', to: '/history', color: '#f59e0b' },
    { icon: IconUsersGroup, label: 'Groups', to: '/groups', color: '#f59e0b' },
    { icon: IconUser, label: 'Profile', to: '/profile', color: '#8b5cf6' },
  ];

  return (
    <Box h="100%" p="md" style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0' }}>
      <Stack h="100%">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box ta="center" py="xl">
            <Text size="2.5rem" mb="xs">💰</Text>
            <Text fw={700} size="lg" style={{ color: '#6366f1' }}>
              BillSplit
            </Text>
          </Box>
        </motion.div>

        <Divider />

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Group py="md">
            <Avatar
              size="md"
              radius="xl"
              style={{
                background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                color: '#ffffff'
              }}
            >
              {user?.user_metadata?.full_name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={500} style={{ color: '#1e293b' }}>
                {user?.user_metadata?.full_name}
              </Text>
              <Text size="xs" c="dimmed">
                @{user?.user_metadata?.username}
              </Text>
            </Box>
          </Group>
        </motion.div>

        <Divider />

        {/* Navigation Links */}
        <Stack gap="xs" style={{ flex: 1 }}>
          {navItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * (index + 2) }}
            >
              <NavbarLink {...item} />
            </motion.div>
          ))}
        </Stack>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button
            variant="light"
            color="red"
            leftSection={<IconLogout size="1rem" />}
            onClick={handleLogout}
            style={{ width: '100%' }}
            radius="lg"
          >
            Logout
          </Button>
        </motion.div>
      </Stack>
    </Box>
  );
};

export default Navbar;
