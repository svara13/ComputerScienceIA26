import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Card,
  Title,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group,
  Stack,
  Select,
  MultiSelect,
  Switch,
  Box,
  Text,
  Divider,
  Badge,
  ActionIcon
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconTrash,
  IconUsers,
  IconCalculator,
  IconSparkles,
  IconCheck
} from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const CreateBill = () => {
  const [splitType, setSplitType] = useState('even');
  const [items, setItems] = useState([{ name: '', cost: 0 }]);
  const { friends, groups, addBill } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      amount: 0,
      date: new Date(),
      groupId: '',
      selectedFriends: [],
      splits: {}
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      amount: (value) => (value <= 0 ? 'Amount must be greater than 0' : null),
      selectedFriends: (value) =>
        value.length === 0 ? 'Select at least one friend' : null
    }
  });

  const friendOptions = friends.map((friend) => ({
    value: friend.id.toString(),
    label: `${friend.name} (${friend.username})`
  }));

  const groupOptions = groups.map((group) => ({
    value: group.id,
    label: group.name
  }));

  const addItem = () => {
    setItems([...items, { name: '', cost: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);

    const total = newItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    form.setFieldValue('amount', total);
  };

  const calculateSplits = () => {
    const selectedFriendIds = form.values.selectedFriends;
    const totalParticipants = selectedFriendIds.length + 1;
    const amount = form.values.amount;

    if (splitType === 'even') {
      const splitAmount = amount / totalParticipants;
      const splits = {};

      selectedFriendIds.forEach((friendId) => {
        splits[friendId] = splitAmount;
      });

      return splits;
    }

    return form.values.splits;
  };

  const handleGroupSelect = (groupId) => {
    form.setFieldValue('groupId', groupId);

    if (groupId) {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        const ids = group.members
          .filter((m) => m.id !== user.id) // 🧠 Exclude current user
          .map((m) => m.id.toString());

        form.setFieldValue('selectedFriends', ids);

        const initialSplits = {};
        ids.forEach((id) => {
          initialSplits[id] = 0;
        });
        form.setFieldValue('splits', initialSplits);
      }
    } else {
      form.setFieldValue('selectedFriends', []);
      form.setFieldValue('splits', {});
    }
  };

  useEffect(() => {
    if (splitType === 'custom') {
      const updatedSplits = {};
      form.values.selectedFriends.forEach((id) => {
        updatedSplits[id] = form.values.splits[id] || 0;
      });
      form.setFieldValue('splits', updatedSplits);
    }
  }, [form.values.selectedFriends, splitType]);

  const handleSubmit = async (values) => {
    const splits = calculateSplits();

    const billData = {
      title: values.title,
      description: values.description,
      amount: values.amount,
      date: values.date,
      createdBy: user.id,
      groupId: values.groupId || null,
      splits: values.selectedFriends.map((friendId) => ({
        userId: friendId,
        amount: splits[friendId] || 0,
        paid: false
      })),
      items: items.filter((item) => item.name && item.cost > 0)
    };

    try {
      await addBill(billData); // ✅ wait for the full API call

      notifications.show({
        title: 'Bill Created! 🎉',
        message: 'Your bill has been successfully created and shared!',
        color: 'green',
        icon: <IconCheck size="1rem" />
      });

      // ✅ only navigate once everything is done
      navigate(0); // forces a reload of the current page
      navigate('/'); // then go to home
    } catch (error) {
      console.error('Failed to create bill:', error);
      notifications.show({
        title: 'Error!',
        message: 'Something went wrong while creating the bill.',
        color: 'red'
      });
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.cost || 0), 0);

  return (
    <Container size="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box mb="xl">
          <Title order={1} style={{ color: '#1e293b' }}>
            Create New Bill 💸
          </Title>
          <Text c="dimmed" size="lg" mt="xs">
            Split expenses with your squad!{' '}
            <IconSparkles size="1rem" style={{ verticalAlign: 'middle' }} />
          </Text>
        </Box>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xl">
            {/* Bill Details */}
            <Card padding="lg" radius="xl" shadow="md">
              <Title order={3} mb="md" style={{ color: '#1e293b' }}>
                Bill Details 📝
              </Title>
              <Stack>
                <TextInput
                  label="Bill Title"
                  placeholder="Pizza night, Movie tickets, etc."
                  size="md"
                  radius="lg"
                  {...form.getInputProps('title')}
                />
                <Textarea
                  label="Description (Optional)"
                  placeholder="Add some details about this expense..."
                  size="md"
                  radius="lg"
                  minRows={3}
                  {...form.getInputProps('description')}
                />
                <DateInput
                  label="Date"
                  size="md"
                  radius="lg"
                  {...form.getInputProps('date')}
                />
              </Stack>
            </Card>

            {/* Items */}
            <Card padding="lg" radius="xl" shadow="md">
              <Group justify="space-between" mb="md">
                <Title order={3} style={{ color: '#1e293b' }}>
                  Items 🛍️
                </Title>
                <Button
                  leftSection={<IconPlus size="1rem" />}
                  onClick={addItem}
                  variant="light"
                  size="sm"
                  radius="lg"
                >
                  Add Item
                </Button>
              </Group>

              <Stack>
                {items.map((item, index) => (
                  <Group key={index}>
                    <TextInput
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(index, 'name', e.target.value)
                      }
                      style={{ flex: 1 }}
                      radius="lg"
                    />
                    <NumberInput
                      placeholder="Cost"
                      value={item.cost}
                      onChange={(value) =>
                        updateItem(index, 'cost', value || 0)
                      }
                      min={0}
                      step={0.01}
                      precision={2}
                      w={120}
                      radius="lg"
                      leftSection="$"
                    />
                    {items.length > 1 && (
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => removeItem(index)}
                        radius="lg"
                      >
                        <IconTrash size="1rem" />
                      </ActionIcon>
                    )}
                  </Group>
                ))}
                <Divider />
                <Group justify="space-between">
                  <Text fw={600} size="lg">
                    Total Amount:
                  </Text>
                  <Badge size="lg" color="green" variant="light">
                    ${totalAmount.toFixed(2)}
                  </Badge>
                </Group>
              </Stack>
            </Card>

            {/* People Selection */}
            <Card padding="lg" radius="xl" shadow="md">
              <Title order={3} mb="md" style={{ color: '#1e293b' }}>
                Who's Involved? 👥
              </Title>
              <Stack>
                <Select
                  label="Quick Select Group (Optional)"
                  placeholder="Choose a group"
                  data={groupOptions}
                  clearable
                  radius="lg"
                  onChange={handleGroupSelect}
                  leftSection={<IconUsers size="1rem" />}
                />
                <MultiSelect
                  label="Select Friends"
                  placeholder="Choose friends to split with"
                  data={friendOptions}
                  radius="lg"
                  disabled={!!form.values.groupId}
                  {...form.getInputProps('selectedFriends')}
                />
              </Stack>
            </Card>

            {/* Split */}
            <Card padding="lg" radius="xl" shadow="md">
              <Title order={3} mb="md" style={{ color: '#1e293b' }}>
                Split Type 💰
              </Title>
              <Stack>
                <Group>
                  <Switch
                    checked={splitType === 'even'}
                    onChange={(event) =>
                      setSplitType(
                        event.currentTarget.checked ? 'even' : 'custom'
                      )
                    }
                    label="Split Evenly"
                    size="md"
                  />
                  {splitType === 'even' && form.values.selectedFriends.length > 0 && (
                    <Badge color="green" variant="light">
                      Each person pays: $
                      {(
                        totalAmount /
                        (form.values.selectedFriends.length + 1)
                      ).toFixed(2)}
                    </Badge>
                  )}
                </Group>

                {splitType === 'custom' && form.values.selectedFriends.length > 0 && (
                  <Stack mt="md">
                    <Text fw={500} c="dimmed">
                      Custom Split Amounts:
                    </Text>
                    {form.values.selectedFriends.map(friendId => {
                      const friend =
                        friends.find(f => f.id === friendId) ||
                        groups.flatMap(g => g.members).find(m => m.id === friendId);

                      return (
                        <Group key={friendId}>
                          <Text style={{ flex: 1 }}>
                            {friend?.name || 'Unknown'} ({friend?.username || 'N/A'})
                          </Text>
                          <NumberInput
                            w={120}
                            min={0}
                            step={0.01}
                            precision={2}
                            radius="lg"
                            leftSection="$"
                            value={form.values.splits[friendId] || 0}
                            onChange={(value) =>
                              form.setFieldValue(`splits.${friendId}`, value || 0)
                            }
                          />
                        </Group>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Card>

            <Group justify="center">
              <Button
                type="submit"
                size="lg"
                radius="xl"
                leftSection={<IconCalculator size="1.2rem" />}
                style={{
                  background: 'linear-gradient(45deg, #10b981, #059669)',
                  minWidth: '200px'
                }}
              >
                Create Bill 🎉
              </Button>
            </Group>
          </Stack>
        </form>
      </motion.div>
    </Container>
  );
};

export default CreateBill;
