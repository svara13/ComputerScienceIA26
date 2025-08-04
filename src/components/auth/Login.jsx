
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Alert,
  Group,
  Stack,
  Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconLogin, IconSparkles } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => !value ? 'Username or email is required' : null,
      password: (value) => !value ? 'Password is required' : null,
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(values.username, values.password);
      if (result?.user?.aud === "authenticated") {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Container size={420}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper radius="xl" p="xl" shadow="xl" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
            <Box ta="center" mb="xl">
              <Text size="4rem" mb="sm">💰</Text>
              <Title order={2} ta="center" fw={700} style={{ color: '#6366f1' }}>
                Welcome Back!
              </Title>
              <Text c="dimmed" size="sm" ta="center" mt="sm">
                Ready to split some bills? Let's go! 🚀
              </Text>
            </Box>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                {error && (
                  <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
                    {error}
                  </Alert>
                )}

                <TextInput
                  label="Email"
                  placeholder="Enter your  email"
                  size="md"
                  radius="lg"
                  {...form.getInputProps('username')}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  size="md"
                  radius="lg"
                  {...form.getInputProps('password')}
                />

                <Button
                  type="submit"
                  size="md"
                  radius="lg"
                  loading={loading}
                  leftSection={<IconLogin size="1rem" />}
                  style={{
                    background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                    marginTop: '1rem'
                  }}
                >
                  Log In
                </Button>

                <Group justify="center" mt="md">
                  <Text size="sm" c="dimmed">
                    Don't have an account?{' '}
                    <Text
                      component={Link}
                      to="/register"
                      size="sm"
                      fw={500}
                      style={{ color: '#6366f1', textDecoration: 'none' }}
                    >
                      Sign up here!
                    </Text>
                  </Text>
                </Group>
              </Stack>
            </form>

            <Box mt="xl" p="md" style={{ background: '#f8fafc', borderRadius: '12px' }}>
              <Text size="xs" c="dimmed" ta="center" fw={500}>
                Demo Credentials 🎮
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                Username: alex_teen | Password: password123
              </Text>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
