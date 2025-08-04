import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  Card,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Button,
  Select,
  TextInput,
  Box,
  Grid,
  Divider,
  Avatar,
  ActionIcon,
  Modal,
  SimpleGrid
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconEye,
  IconCheck,
  IconX,
  IconCalendar,
  IconUsers
} from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../utils/supabase';

const BillCard = ({ bill, friends, onViewDetails }) => {
  const totalPaid = bill.splits.filter(s => s.paid).length;
  const totalSplits = bill.splits.length;
  const isFullyPaid = totalPaid === totalSplits;

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card
        padding="lg"
        radius="xl"
        shadow="md"
        style={{
          border: isFullyPaid ? '2px solid #10b981' : '1px solid #e2e8f0',
          background: isFullyPaid ? '#f0fdf4' : '#ffffff'
        }}
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Box>
              <Text fw={600} size="lg" style={{ color: '#1e293b' }}>
                {bill.title}
              </Text>
              <Text size="sm" c="dimmed">
                {new Date(bill.created_at).toLocaleDateString()} • Created by {bill?.created_by_profile?.username || 'You'}
              </Text>
            </Box>
            <Badge size="lg" color={isFullyPaid ? 'green' : 'orange'} variant="light">
              ${bill.amount.toFixed(2)}
            </Badge>
          </Group>

          {bill.description && (
            <Text size="sm" c="dimmed">
              {bill.description}
            </Text>
          )}

          <Divider />

          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconUsers size="1rem" style={{ color: '#6b7280' }} />
              <Text size="sm" c="dimmed">
                {totalPaid}/{totalSplits} paid
              </Text>
              <Box
                style={{
                  width: '60px',
                  height: '4px',
                  background: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}
              >
                <Box
                  style={{
                    width: `${(totalPaid / totalSplits) * 100}%`,
                    height: '100%',
                    background: '#10b981',
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Group>

            <Group gap="xs">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => onViewDetails(bill)}
                radius="lg"
              >
                <IconEye size="1rem" />
              </ActionIcon>
              {isFullyPaid && (
                <ActionIcon variant="light" color="green" radius="lg">
                  <IconCheck size="1rem" />
                </ActionIcon>
              )}
            </Group>
          </Group>
        </Stack>
      </Card>
    </motion.div>
  );
};

const BillDetailsModal = ({ bill, opened, onClose, friends, user, onMarkAsPaid }) => {
  const [localBill, setLocalBill] = useState(bill);

  React.useEffect(() => {
    setLocalBill(bill);
  }, [bill]);

  if (!localBill) return null;

  const handleMarkAsPaid = async (split) => {
    console.log('localbill', localBill, 'friend', friends, 'user', user)
    console.log('friend', friends)
    console.log('user', user)
    console.log('split', split)
    const { error } = await supabase
      .from('bill_splits')
      .update({ paid: true })
      .match({ bill_id: localBill.id, user_id: split.user_id });

    if (error) {
      console.error('Failed to update payment status:', error.message);
      return;
    }
    window.location.reload()
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Text fw={700} size="lg">{localBill.title}</Text>
          <Badge color="blue" variant="light">
            ${localBill.amount.toFixed(2)}
          </Badge>
        </Group>
      }
      size="md"
      radius="lg"
    >
      <Stack gap="md">
        <Box
          p="md"
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}
        >
          <Group gap="sm" mb="sm">
            <IconCalendar size="1rem" style={{ color: '#6b7280' }} />
            <Text size="sm" c="dimmed">
              {new Date(localBill.created_at).toLocaleDateString()}
            </Text>
          </Group>
          {localBill.description && (
            <Text size="sm">{localBill.description}</Text>
          )}
          <Text size="xs" c="dimmed" mt="sm">
            Created by {localBill?.created_by_profile?.username || 'You'}
          </Text>
        </Box>

        {localBill.items?.length > 0 && (
          <Box>
            <Text fw={600} mb="sm">Items:</Text>
            <Stack gap="xs">
              {localBill.items.map((item, index) => (
                <Group key={index} justify="space-between">
                  <Text size="sm">{item.label}</Text>
                  <Text size="sm" fw={500}>${item.cost.toFixed(2)}</Text>
                </Group>
              ))}
            </Stack>
          </Box>
        )}

        <Box>
          <Text fw={600} mb="sm">Split Details:</Text>
          <Stack gap="xs">
            {localBill.splits.map((split, index) => {
              const friend = friends.find(f => f.id === split.userId);
              const isSelf = split.userId === user.id;
              const isCreator = localBill.created_by_profile?.id === user.id;

              return (
                <Group key={index} justify="space-between">
                  <Group gap="sm">
                    <Avatar size="sm" radius="xl">
                      {friend?.avatar || friend?.name?.charAt(0)}
                    </Avatar>
                    <Text size="sm">{split?.profile?.username}</Text>
                  </Group>
                  <Group gap="sm">
                    <Text size="sm" fw={500}>${split.amount.toFixed(2)}</Text>
                    {split.paid ? (
                      <IconCheck size="1rem" style={{ color: '#10b981' }} />
                    ) : (
                      <>
                        <IconX size="1rem" style={{ color: '#ef4444' }} />
                        {(isSelf || isCreator) && (
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => handleMarkAsPaid(split)}
                          >
                            Mark as Paid
                          </Button>
                        )}
                      </>
                    )}
                  </Group>
                </Group>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Modal>
  );
};

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBill, setSelectedBill] = useState(null);
  const [detailsOpened, setDetailsOpened] = useState(false);
  const { bills, friends, setBills } = useApp();
  const { user } = useAuth();

  const filteredBills = bills.filter(bill => {
    const matchesSearch =
      bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.description?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'paid' && bill.splits.every(s => s.paid)) ||
      (filterStatus === 'pending' && bill.splits.some(s => !s.paid));

    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
    setDetailsOpened(true);
  };

  const handleMarkAsPaid = (billId, updatedSplits) => {
    const updatedBills = bills.map(b =>
      b.id === billId ? { ...b, splits: updatedSplits } : b
    );
    setBills(updatedBills);
  };

  const stats = {
    total: bills.length,
    paid: bills.filter(b => b.splits.every(s => s.paid)).length,
    pending: bills.filter(b => b.splits.some(s => !s.paid)).length,
    totalAmount: bills.reduce((sum, b) => sum + (b.amount || 0), 0)
  };

  return (
    <Container size="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box mb="xl">
          <Title order={1} style={{ color: '#1e293b' }}>
            Bill History 📚
          </Title>
          <Text c="dimmed" size="lg" mt="xs">
            Track all your past expenses and payments
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 2, sm: 4 }} mb="xl">
          <Card padding="lg" radius="xl" shadow="md" style={{ background: 'linear-gradient(135deg, #6366f120, #6366f110)' }}>
            <Text size="sm" c="dimmed" fw={500}>Total Bills</Text>
            <Title order={2} style={{ color: '#6366f1' }}>{stats.total}</Title>
          </Card>
          <Card padding="lg" radius="xl" shadow="md" style={{ background: 'linear-gradient(135deg, #10b98120, #10b98110)' }}>
            <Text size="sm" c="dimmed" fw={500}>Paid</Text>
            <Title order={2} style={{ color: '#10b981' }}>{stats.paid}</Title>
          </Card>
          <Card padding="lg" radius="xl" shadow="md" style={{ background: 'linear-gradient(135deg, #f59e0b20, #f59e0b10)' }}>
            <Text size="sm" c="dimmed" fw={500}>Pending</Text>
            <Title order={2} style={{ color: '#f59e0b' }}>{stats.pending}</Title>
          </Card>
          <Card padding="lg" radius="xl" shadow="md" style={{ background: 'linear-gradient(135deg, #8b5cf620, #8b5cf610)' }}>
            <Text size="sm" c="dimmed" fw={500}>Total Amount</Text>
            <Title order={2} style={{ color: '#8b5cf6' }}>${stats.totalAmount.toFixed(2)}</Title>
          </Card>
        </SimpleGrid>

        <Card padding="lg" radius="xl" shadow="md" mb="xl">
          <Group>
            <TextInput
              placeholder="Search bills..."
              leftSection={<IconSearch size="1rem" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              radius="lg"
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by status"
              leftSection={<IconFilter size="1rem" />}
              data={[
                { value: 'all', label: 'All Bills' },
                { value: 'paid', label: 'Fully Paid' },
                { value: 'pending', label: 'Pending Payment' },
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
              radius="lg"
              w={200}
            />
          </Group>
        </Card>

        {filteredBills.length > 0 ? (
          <Grid>
            {filteredBills.map((bill, index) => (
              <Grid.Col key={bill.id} span={{ base: 12, md: 6 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BillCard bill={bill} friends={friends} onViewDetails={handleViewDetails} />
                </motion.div>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Card padding="xl" radius="xl" shadow="md" style={{ textAlign: 'center' }}>
            <Text size="4rem" mb="md">📝</Text>
            <Title order={3} style={{ color: '#6b7280' }} mb="sm">
              No bills found
            </Title>
            <Text c="dimmed">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first bill!'}
            </Text>
          </Card>
        )}

        <BillDetailsModal
          bill={selectedBill}
          opened={detailsOpened}
          onClose={() => setDetailsOpened(false)}
          friends={friends}
          user={user}
          onMarkAsPaid={handleMarkAsPaid}
        />
      </motion.div>
    </Container>
  );
};

export default History;
