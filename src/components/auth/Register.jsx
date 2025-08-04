
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
import { IconAlertCircle, IconUserPlus, IconSparkles } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { notifications } from '@mantine/notifications';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => !value ? 'Name is required' : null,
      username: (value) => {
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return null;
      },
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email format';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain at least one special character';
        return null;
      },
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...userData } = values;
      const result = await register(userData);
      console.log(result)
      if (result?.user?.created_at) {
        notifications.show({
          title: 'Verification Email Sent!',
          message: 'You will receive an email shortly. Please click the link to verify your account.',
          color: 'teal',
          autoClose: 4000,
        });
        setTimeout(() => navigate('/login'), 4000); // Wait 4 seconds then redirect
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
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Container size={460}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper radius="xl" p="xl" shadow="xl" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
            <Box ta="center" mb="xl">
              <Text size="4rem" mb="sm">🎉</Text>
              <Title order={2} ta="center" fw={700} style={{ color: '#f5576c' }}>
                Join the Fun!
              </Title>
              <Text c="dimmed" size="sm" ta="center" mt="sm">
                Create your account and start splitting bills with friends! ✨
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
                  label="Full Name"
                  placeholder="Enter your full name"
                  size="md"
                  radius="lg"
                  {...form.getInputProps('name')}
                />

                <TextInput
                  label="Username"
                  placeholder="Choose a cool username"
                  size="md"
                  radius="lg"
                  {...form.getInputProps('username')}
                />

                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  size="md"
                  radius="lg"
                  {...form.getInputProps('email')}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Create a strong password"
                  size="md"
                  radius="lg"
                  {...form.getInputProps('password')}
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  size="md"
                  radius="lg"
                  {...form.getInputProps('confirmPassword')}
                />

                <Button
                  type="submit"
                  size="md"
                  radius="lg"
                  loading={loading}
                  leftSection={<IconUserPlus size="1rem" />}
                  style={{
                    background: 'linear-gradient(45deg, #f5576c, #f093fb)',
                    marginTop: '1rem'
                  }}
                >
                  Create Account
                </Button>

                <Group justify="center" mt="md">
                  <Text size="sm" c="dimmed">
                    Already have an account?{' '}
                    <Text
                      component={Link}
                      to="/login"
                      size="sm"
                      fw={500}
                      style={{ color: '#f5576c', textDecoration: 'none' }}
                    >
                      Log in here!
                    </Text>
                  </Text>
                </Group>
              </Stack>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Register;
