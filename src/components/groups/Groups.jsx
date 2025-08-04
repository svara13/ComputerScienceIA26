import React, { useState, useEffect } from 'react';
import {
    Container, Title, Card, Group, Text, Button, Modal, Stack,
    Avatar, Divider, ActionIcon, SimpleGrid, MultiSelect, TextInput
} from '@mantine/core';
import { IconUsers, IconPlus, IconEye } from '@tabler/icons-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../utils/supabase';
import { motion } from 'framer-motion';

const GroupCard = ({ group, onViewDetails }) => (
    <Card shadow="md" padding="lg" radius="xl" withBorder>
        <Group justify="space-between">
            <Stack gap="xs">
                <Text fw={600} size="lg">{group.name}</Text>
                <Text size="sm" c="dimmed">
                    Created by {group.creator?.username || 'You'} on {new Date(group.created_at).toLocaleDateString()}
                </Text>
            </Stack>
            <ActionIcon onClick={() => onViewDetails(group)} variant="light" color="blue" radius="xl">
                <IconEye size="1rem" />
            </ActionIcon>
        </Group>
    </Card>
);

const GroupDetailsModal = ({ group, opened, onClose, user, fetchGroups, friends }) => {
    const [modifyOpen, setModifyOpen] = useState(false);

    const handleDeleteGroup = async () => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            const { error: memberDeleteError } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', group.id);

            if (memberDeleteError) return console.error('Error removing members:', memberDeleteError);

            const { error: groupDeleteError } = await supabase
                .from('groups')
                .delete()
                .eq('id', group.id);

            if (groupDeleteError) return console.error('Error deleting group:', groupDeleteError);

            await fetchGroups();
            onClose();
        }
    };

    return (
        <>
            <Modal opened={opened} onClose={onClose} title={`Group: ${group.name}`} radius="lg" size="md">
                <Stack>
                    <Text c="dimmed" size="sm">Created by {group.creator?.username || 'You'}</Text>
                    <Text c="dimmed" size="sm">Created on {new Date(group.created_at).toLocaleDateString()}</Text>
                    <Divider />
                    <Text fw={600}>Members</Text>
                    <Stack>
                        {group.members.map(member => (
                            <Group key={member.id}>
                                <Avatar radius="xl">{member.name?.[0]}</Avatar>
                                <Text>{member.name} ({member.username})</Text>
                            </Group>
                        ))}
                    </Stack>

                    {user.id === group.creator?.id && (
                        <Stack>
                            <Button
                                color="red"
                                variant="light"
                                radius="lg"
                                onClick={handleDeleteGroup}
                            >
                                Delete Group
                            </Button>

                            <Button
                                variant="gradient"
                                gradient={{ from: 'teal', to: 'green', deg: 60 }}
                                radius="lg"
                                onClick={() => setModifyOpen(true)}
                            >
                                Add Members
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </Modal>

            {user.id === group.creator?.id && (
                <ModifyGroupModal
                    group={group}
                    opened={modifyOpen}
                    onClose={() => setModifyOpen(false)}
                    friends={friends}
                    fetchGroups={fetchGroups}
                />
            )}
        </>
    );
};

const ModifyGroupModal = ({ group, opened, onClose, friends, fetchGroups }) => {
    const [selectedFriendIds, setSelectedFriendIds] = useState([]);

    const handleAddMembers = async () => {
        const existingIds = group.members.map(m => m.id);
        const newMembers = selectedFriendIds.filter(id => !existingIds.includes(id));

        if (newMembers.length === 0) return;

        const insertPayload = newMembers.map(id => ({
            group_id: group.id,
            member_id: id,
        }));

        const { error } = await supabase.from('group_members').insert(insertPayload);
        if (error) return console.error('Failed to add members:', error);

        await fetchGroups();
        onClose();
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Add Members" radius="lg" size="md">
            <Stack>
                <MultiSelect
                    label="Select new members"
                    data={friends.map(f => ({ value: f.id, label: `${f.name} (${f.username})` }))}
                    value={selectedFriendIds}
                    onChange={setSelectedFriendIds}
                    placeholder="Choose friends"
                />
                <Button fullWidth onClick={handleAddMembers}>Add to Group</Button>
            </Stack>
        </Modal>
    );
};

const CreateGroupModal = ({ opened, onClose, friends, fetchGroups }) => {
    const { user } = useAuth();
    const [groupName, setGroupName] = useState('');
    const [selectedFriendIds, setSelectedFriendIds] = useState([]);

    const handleCreateGroup = async () => {
        const { data: group, error } = await supabase
            .from('groups')
            .insert({ name: groupName, creator_id: user.id })
            .select()
            .single();

        if (error) return console.error('Error creating group:', error);

        const members = [...selectedFriendIds, user.id];
        const memberData = members.map(id => ({ group_id: group.id, member_id: id }));

        const { error: memberErr } = await supabase.from('group_members').insert(memberData);
        if (memberErr) return console.error('Error adding members:', memberErr);

        fetchGroups();
        onClose();
        setGroupName('');
        setSelectedFriendIds([]);
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Create New Group" radius="lg" size="md">
            <Stack>
                <TextInput
                    label="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.currentTarget.value)}
                />
                <MultiSelect
                    label="Select Members"
                    data={friends.map(f => ({ value: f.id, label: `${f.name} (${f.username})` }))}
                    value={selectedFriendIds}
                    onChange={setSelectedFriendIds}
                    placeholder="Choose friends"
                />
                <Button fullWidth onClick={handleCreateGroup} leftSection={<IconPlus size="1rem" />}>
                    Create Group
                </Button>
            </Stack>
        </Modal>
    );
};

const Groups = () => {
    const { user } = useAuth();
    const { friends } = useApp();
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const fetchGroups = async () => {
        // 1. Groups the user created
        const { data: createdGroups, error: creatorError } = await supabase
            .from('groups')
            .select(`
      id, name, created_at, creator_id,
      creator:creator_id(id, username),
      group_members(member_id, profiles:member_id(id, username, full_name))
    `)
            .eq('creator_id', user.id);

        if (creatorError) {
            console.error('Error fetching created groups:', creatorError.message);
            return;
        }

        // 2. Groups where user is a member
        const { data: memberGroups, error: memberError } = await supabase
            .from('groups')
            .select(`
      id, name, created_at, creator_id,
      creator:creator_id(id, username),
      group_members(member_id, profiles:member_id(id, username, full_name))
    `)
            .contains('group_members', [{ member_id: user.id }]); // 👈 note this won't work unless group_members is a JSON array column

        // So instead use a subquery on `group_members` directly to get group IDs:
        const { data: memberLinks, error: linkError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('member_id', user.id);

        if (linkError) {
            console.error('Error fetching group memberships:', linkError.message);
            return;
        }

        const groupIds = memberLinks.map(g => g.group_id);

        const { data: groupsByMembership, error: memberGroupsError } = await supabase
            .from('groups')
            .select(`
      id, name, created_at, creator_id,
      creator:creator_id(id, username),
      group_members(member_id, profiles:member_id(id, username, full_name))
    `)
            .in('id', groupIds);

        if (memberGroupsError) {
            console.error('Error fetching member groups:', memberGroupsError.message);
            return;
        }

        // Combine & Deduplicate groups
        const combined = [...(createdGroups || []), ...(groupsByMembership || [])];
        const unique = Array.from(new Map(combined.map(g => [g.id, g])).values());

        const enriched = unique.map(g => ({
            id: g.id,
            name: g.name,
            created_at: g.created_at,
            creator: g.creator,
            members: g.group_members.map(m => ({
                id: m.profiles.id,
                username: m.profiles.username,
                name: m.profiles.full_name
            }))
        }));

        setGroups(enriched);
    };


    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <Container size="xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Group justify="space-between" mb="xl">
                    <div>
                        <Title order={1}>Manage Groups 👥</Title>
                        <Text c="dimmed">Create and manage your friend groups</Text>
                    </div>
                    <Button
                        leftSection={<IconPlus size="1rem" />}
                        style={{ background: 'linear-gradient(45deg, #10b981, #059669)' }}
                        radius="lg"
                        size="md"
                        onClick={() => setCreateOpen(true)}
                    >
                        New Group
                    </Button>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                    {groups.map(group => (
                        <GroupCard
                            key={group.id}
                            group={group}
                            onViewDetails={(g) => {
                                setSelectedGroup(g);
                                setDetailsOpen(true);
                            }}
                        />
                    ))}
                </SimpleGrid>

                {/* Modals */}
                {selectedGroup && (
                    <GroupDetailsModal
                        group={selectedGroup}
                        opened={detailsOpen}
                        onClose={() => setDetailsOpen(false)}
                        user={user}
                        fetchGroups={fetchGroups}
                        friends={friends}
                    />
                )}

                <CreateGroupModal
                    opened={createOpen}
                    onClose={() => setCreateOpen(false)}
                    friends={friends}
                    fetchGroups={fetchGroups}
                />
            </motion.div>
        </Container>
    );
};

export default Groups;
