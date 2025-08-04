
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  Card,
  Title,
  Text,
  Group,
  Stack,
  Button,
  Select,
  TextInput,
  Box,
  Avatar,
  Badge,
  Divider,
  Grid,
  ActionIcon,
  Modal,
  SimpleGrid
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconEdit,
  IconCheck,
  IconUser,
  IconMail,
  IconWorld,
  IconSparkles,
  IconPlus,
  IconTrash
} from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const currencies = [
  { value: 'USD', label: '🇺🇸 US Dollar (USD)' },
  { value: 'INR', label: '🇮🇳 Indian Rupee (INR)' },
  { value: 'EUR', label: '🇪🇺 Euro (EUR)' },
  { value: 'GBP', label: '🇬🇧 British Pound (GBP)' },
  { value: 'CAD', label: '🇨🇦 Canadian Dollar (CAD)' },
  { value: 'AUD', label: '🇦🇺 Australian Dollar (AUD)' },
  { value: 'JPY', label: '🇯🇵 Japanese Yen (JPY)' },
];

const AddFriendModal = ({ opened, onClose, onAddFriend }) => {
  const form = useForm({
    initialValues: {
      username: '',
    },
    validate: {
      username: (value) => !value ? 'Username is required' : null,
    }
  });

  const avatarOptions = ['🦄', '🚀', '🌈', '⚡', '🎨', '🌟', '🎭', '🎪', '🎯', '🎲'];

  const handleSubmit = async (values) => {
    const result = await onAddFriend(values);
    console.log(result)
    if (result?.error) {
      // Show different error messages based on type
      let title = 'Oops!';
      let notifyMessage = result.error;

      if (notifyMessage.includes("No user")) {
        title = 'User Not Found ❌';
      } else if (notifyMessage.includes("yourself")) {
        title = 'Nice Try! 😅';
      } else if (notifyMessage.includes("already friends")) {
        title = 'Already Added 👯‍♂️';
      }

      notifications.show({
        title,
        message: notifyMessage,
        color: 'red',
      });

      return; // Stop further execution
    }

    form.reset();
    onClose();

    notifications.show({
      title: 'Friend Added! 🎉',
      message: `${result.username} has been added to your friends list!`,
      color: 'green',
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add New Friend 👫" radius="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Username"
            placeholder="@username"
            {...form.getInputProps('username')}
            radius="lg"
          />
          <Button type="submit" radius="lg" style={{ background: 'linear-gradient(45deg, #10b981, #059669)' }}>
            Add Friend
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [addFriendOpened, setAddFriendOpened] = useState(false);
  const { user, updateProfile } = useAuth();
  const { friends, addFriend, calculateBalances } = useApp();

  const form = useForm({
    initialValues: {
      name: user?.user_metadata?.full_name || '',
      username: user?.user_metadata?.username || '',
      email: user?.user_metadata.email || '',
      currency: user?.currency || 'USD',
    }
  });

  const { totalOwed, totalOwing } = calculateBalances(user?.id);
  console.log('user', user)
  console.log('friends', friends)
  const handleSave = (values) => {
    updateProfile(values);
    setEditMode(false);
    notifications.show({
      title: 'Profile Updated! ✨',
      message: 'Your profile has been successfully updated!',
      color: 'green',
      icon: <IconCheck size="1rem" />,
    });
  };

  const handleAddFriend = (friendData) => {
    addFriend(friendData);
  };

  return (
    <Container size="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box mb="xl">
          <Title order={1} style={{ color: '#1e293b' }}>
            Profile Settings ⚙️
          </Title>
          <Text c="dimmed" size="lg" mt="xs">
            Manage your account and preferences
          </Text>
        </Box>

        <Grid>
          {/* Profile Info */}
          <Grid.Col span={{ base: 12, md: 12 }}>
            <Card padding="lg" radius="xl" shadow="md">
              <Group justify="space-between" mb="lg">
                <Group>
                  <Avatar
                    size="xl"
                    radius="xl"
                    style={{
                      background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                      color: '#ffffff'
                    }}
                  >
                    <Text size="xl" fw={700}>
                      {user?.user_metadata?.full_name.charAt(0).toUpperCase()}
                    </Text>
                  </Avatar>
                  <Box>
                    <Title order={2} style={{ color: '#1e293b' }}>
                      {user?.user_metadata?.full_name}
                    </Title>
                    <Text c="dimmed">@{user?.user_metadata?.username}</Text>
                  </Box>
                </Group>
                {/* <ActionIcon
                  size="lg"
                  variant="light"
                  color="blue"
                  onClick={() => setEditMode(!editMode)}
                  radius="lg"
                >
                  <IconEdit size="1.2rem" />
                </ActionIcon> */}
              </Group>

              <form onSubmit={form.onSubmit(handleSave)}>
                <Stack>
                  <Group grow>
                    <TextInput
                      label="Full Name"
                      leftSection={<IconUser size="1rem" />}
                      // disabled={!editMode}
                      readOnly
                      radius="lg"
                      {...form.getInputProps('name')}
                    />
                    <TextInput
                      label="Username"
                      leftSection="@"
                      // disabled={!editMode}
                      radius="lg"
                      readOnly
                      {...form.getInputProps('username')}
                    />
                  </Group>

                  <TextInput
                    label="Email"
                    leftSection={<IconMail size="1rem" />}
                    // disabled={!editMode}
                    readOnly
                    radius="lg"
                    {...form.getInputProps('email')}
                  />



                  {editMode && (
                    <Group>
                      <Button
                        type="submit"
                        leftSection={<IconCheck size="1rem" />}
                        radius="lg"
                        style={{ background: 'linear-gradient(45deg, #10b981, #059669)' }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="light"
                        onClick={() => setEditMode(false)}
                        radius="lg"
                      >
                        Cancel
                      </Button>
                    </Group>
                  )}
                </Stack>
              </form>
            </Card>
          </Grid.Col>

          {/* Balance Summary */}
          {/* <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack>
              <Card padding="lg" radius="xl" shadow="md" style={{ background: 'linear-gradient(135deg, #10b98120, #10b98110)' }}>
                <Box ta="center">
                  <Text size="sm" c="dimmed" fw={500}>You're Owed</Text>
                  <Title order={1} style={{ color: '#10b981' }}>
                    ${totalOwed.toFixed(2)}
                  </Title>
                  <Badge color="green" variant="light" mt="xs">
                    💰 Money coming in!
                  </Badge>
                </Box>
              </Card>

              <Card padding="lg" radius="xl" shadow="md" style={{ background: 'linear-gradient(135deg, #ef444420, #ef444410)' }}>
                <Box ta="center">
                  <Text size="sm" c="dimmed" fw={500}>You Owe</Text>
                  <Title order={1} style={{ color: '#ef4444' }}>
                    ${totalOwing.toFixed(2)}
                  </Title>
                  <Badge color="red" variant="light" mt="xs">
                    💸 Time to pay up!
                  </Badge>
                </Box>
              </Card>
            </Stack>
          </Grid.Col> */}
        </Grid>

        {/* Friends List */}
        <Card padding="lg" radius="xl" shadow="md" mt="xl">
          <Group justify="space-between" mb="lg">
            <Title order={3} style={{ color: '#1e293b' }}>
              Your Squad 👥
            </Title>
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={() => setAddFriendOpened(true)}
              variant="light"
              radius="lg"
            >
              Add Friend
            </Button>
          </Group>

          {friends.length > 0 ? (
            <Card style={{ maxHeight: '280px', overflowY: 'auto', boxShadow: '0' }}>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {friends
                  .filter(friend => friend.id !== user?.id)
                  .map((friend, index) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
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
                        <Group>
                          <Avatar size="md" radius="xl">
                            {friend.avatar}
                          </Avatar>
                          <Box style={{ flex: 1 }}>
                            <Text fw={500}>{friend.name}</Text>
                            <Text size="sm" c="dimmed">@{friend.username}</Text>
                          </Box>
                        </Group>
                      </Box>
                    </motion.div>
                  ))}
              </SimpleGrid>
            </Card>
          ) : (
            <Box ta="center" py="xl">
              <Text size="3rem" mb="md">👫</Text>
              <Text c="dimmed">No friends added yet!</Text>
              <Text size="sm" c="dimmed">Add some friends to start splitting bills</Text>
            </Box>
          )}
        </Card>

        {/* Add Friend Modal */}
        <AddFriendModal
          opened={addFriendOpened}
          onClose={() => setAddFriendOpened(false)}
          onAddFriend={handleAddFriend}
        />
      </motion.div>
    </Container>
  );
};

export default Profile;
