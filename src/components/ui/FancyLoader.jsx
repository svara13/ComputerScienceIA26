// src/components/ui/FancyLoader.jsx
import React from 'react';
import { Loader, Text, Stack, Title } from '@mantine/core';
import { motion } from 'framer-motion';

const FancyLoader = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                color: '#fff',
                fontFamily: 'Poppins, sans-serif',
            }}
        >
            <Stack align="center" gap="sm">
                <Loader color="white" size="lg" variant="bars" />
                <Title
                    order={2}
                    style={{
                        background: 'linear-gradient(90deg, #ffffff, #ffe0f7)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Getting your squad ready 💃🏽🕺🏻
                </Title>
                <Text size="sm" c="gray.0">
                    One moment... vibes loading 💫
                </Text>
            </Stack>
        </motion.div>
    );
};

export default FancyLoader;
