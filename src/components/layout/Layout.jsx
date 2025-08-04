
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const Layout = () => {
  return (
    <AppShell
      navbar={{ width: 300, breakpoint: 'md' }}
      padding="md"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
    >
      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>
      
      <AppShell.Main>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%' }}
        >
          <Outlet />
        </motion.div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;
