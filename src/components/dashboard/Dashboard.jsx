
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Badge,
  Box,
  SimpleGrid,
  Progress,
  Divider
} from '@mantine/core';
import {
  IconPlus,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCreditCard,
  IconSparkles
} from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <Card
      padding="lg"
      radius="xl"
      shadow="md"
      style={{
        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        border: `1px solid ${color}30`,
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          <Title order={2} style={{ color: color }} mt="xs">
            {value}
          </Title>
          {subtitle && (
            <Text size="xs" c="dimmed" mt="xs">
              {subtitle}
            </Text>
          )}
          {trend && (
            <Badge
              variant="light"
              color={trend > 0 ? 'red' : 'green'}
              size="sm"
              mt="xs"
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </Box>
        <Box
          style={{
            padding: '12px',
            borderRadius: '12px',
            background: color,
            color: '#ffffff'
          }}
        >
          <Icon size="1.5rem" />
        </Box>
      </Group>
    </Card>
  </motion.div>
);

const RecentActivity = ({ bills, friends }) => (
  <Card padding="lg" radius="xl" shadow="md">
    <Group justify="space-between" mb="md">
      <Title order={3} style={{ color: '#1e293b' }}>
        Recent Activity 🔥
      </Title>
      <Button variant="subtle" size="xs">
        View All
      </Button>
    </Group>

    <Stack gap="md">
      {bills.slice(0, 3).map((bill, index) => (
        <motion.div
          key={bill.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Box
            p="md"
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <Group justify="space-between">
              <Box>
                <Text fw={500} size="sm">
                  {bill.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {bill.date.toLocaleDateString()}
                </Text>
              </Box>
              <Badge
                variant="light"
                color={bill.splits.some(s => !s.paid) ? 'orange' : 'green'}
              >
                ${bill.amount.toFixed(2)}
              </Badge>
            </Group>
          </Box>
        </motion.div>
      ))}
    </Stack>
  </Card>
);

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'New Bill',
      description: 'Split a new expense',
      icon: IconPlus,
      color: '#10b981',
      action: () => navigate('/create-bill')
    },
    {
      title: 'View History',
      description: 'Check past bills',
      icon: IconCreditCard,
      color: '#f59e0b',
      action: () => navigate('/history')
    }
  ];

  return (
    <SimpleGrid cols={2} spacing="md">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            padding="lg"
            radius="xl"
            shadow="md"
            style={{
              cursor: 'pointer',
              background: `linear-gradient(135deg, ${action.color}15, ${action.color}05)`,
              border: `1px solid ${action.color}20`,
            }}
            onClick={action.action}
          >
            <Stack align="center" gap="sm">
              <Box
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: action.color,
                  color: '#ffffff'
                }}
              >
                <action.icon size="1.5rem" />
              </Box>
              <Box ta="center">
                <Text fw={600} size="sm">
                  {action.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {action.description}
                </Text>
              </Box>
            </Stack>
          </Card>
        </motion.div>
      ))}
    </SimpleGrid>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { bills, friends, calculateBalances } = useApp();
  const navigate = useNavigate();

  const { totalOwed, totalOwing, owedBy, owingTo } = calculateBalances(user?.id);

  const netBalance = totalOwed - totalOwing;

  return (
    <Container size="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box mb="xl">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Title order={1} style={{ color: '#1e293b' }}>
                Hey {user?.name?.split(' ')[0]}! 👋
              </Title>
              <Text c="dimmed" size="lg" mt="xs">
                Ready to split some bills today?
              </Text>
            </Box>
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={() => navigate('/create-bill')}
              style={{
                background: 'linear-gradient(45deg, #10b981, #059669)',
              }}
              radius="lg"
              size="md"
            >
              New Bill
            </Button>
          </Group>
        </Box>

        {/* Stats Grid */}
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="You're Owed"
              value={`$${totalOwed.toFixed(2)}`}
              icon={IconTrendingUp}
              color="#10b981"
              subtitle={`From ${Object.keys(owedBy).length} friends`}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="You Owe"
              value={`$${totalOwing.toFixed(2)}`}
              icon={IconTrendingDown}
              color="#ef4444"
              subtitle={`To ${Object.keys(owingTo).length} friends`}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Net Balance"
              value={`$${Math.abs(netBalance).toFixed(2)}`}
              icon={netBalance >= 0 ? IconTrendingUp : IconTrendingDown}
              color={netBalance >= 0 ? '#10b981' : '#ef4444'}
              subtitle={netBalance >= 0 ? "You're ahead!" : "Pay up soon!"}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Active Bills"
              value={bills.length}
              icon={IconCreditCard}
              color="#6366f1"
              subtitle={`${friends.length} friends`}
            />
          </Grid.Col>
        </Grid>

        {/* Main Content */}
        <Grid>
          {/* <Grid.Col span={{ base: 12, md: 8 }}>
            <RecentActivity bills={bills} friends={friends} />
          </Grid.Col> */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack>
              <Card padding="lg" radius="xl" shadow="md">
                <Title order={3} mb="md" style={{ color: '#1e293b' }}>
                  Quick Actions ⚡
                </Title>
                <QuickActions />
              </Card>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            {/* Balance Summary */}
            <Stack>
              {(totalOwed > 0 || totalOwing > 0) && (
                <Card padding="lg" radius="xl" shadow="md">
                  <Title order={4} mb="md" style={{ color: '#1e293b' }}>
                    Balance Summary 📊
                  </Title>
                  <Stack gap="xs">
                    {Object.entries(owedBy).map(([name, amount]) => (
                      <Group key={name} justify="space-between">
                        <Text size="sm">{name} owes you</Text>
                        <Badge color="green" variant="light">
                          +${amount.toFixed(2)}
                        </Badge>
                      </Group>
                    ))}
                    {Object.entries(owingTo).map(([name, amount]) => (
                      <Group key={name} justify="space-between">
                        <Text size="sm">You owe {name}</Text>
                        <Badge color="red" variant="light">
                          -${amount.toFixed(2)}
                        </Badge>
                      </Group>
                    ))}
                  </Stack>
                </Card>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </motion.div>
    </Container >
  );
};

export default Dashboard;
