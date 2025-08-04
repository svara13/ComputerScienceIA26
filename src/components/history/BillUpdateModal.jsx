import { Modal, Button, Text, Group, Divider } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import supabase from '../../utils/supabase';

export default function BillDetailsModal({ bill, opened, onClose, user }) {
    const [selectedBill, setSelectedBill] = useState(bill);

    useEffect(() => {
        setSelectedBill(bill);
    }, [bill]);

    const handleMarkAsPaid = async (userId) => {
        const { error } = await supabase
            .from('bill_splits')
            .update({ paid: true })
            .match({ bill_id: selectedBill.id, user_id: userId });

        if (error) {
            console.error('Failed to update paid status:', error.message);
            return;
        }

        const updatedSplits = selectedBill.splits.map(split =>
            split.userId === userId ? { ...split, paid: true } : split
        );

        setSelectedBill({ ...selectedBill, splits: updatedSplits });
    };

    if (!selectedBill) return null;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Bill: ${selectedBill.title}`}
            size="lg"
            centered
        >
            <Text size="sm" color="dimmed">
                Created by: {selectedBill.creatorName}
            </Text>
            <Text size="md" weight={500} mt="md">
                Total Amount: ₹{selectedBill.amount}
            </Text>

            <Divider my="md" />

            <Text weight={500}>Split Details:</Text>
            {selectedBill.splits.map((split) => (
                <Group key={split.userId} position="apart" mt="sm">
                    <Text>{split.username}</Text>
                    <Text>₹{split.amount}</Text>
                    <Group spacing="xs">
                        {split.paid ? (
                            <IconCheck size="1rem" style={{ color: '#10b981' }} />
                        ) : (
                            <>
                                <IconX size="1rem" style={{ color: '#ef4444' }} />
                                {(split.userId === user.id || selectedBill.createdBy === user.id) && (
                                    <Button
                                        size="xs"
                                        variant="light"
                                        color="green"
                                        onClick={() => handleMarkAsPaid(split.userId)}
                                    >
                                        Mark as Paid
                                    </Button>
                                )}
                            </>
                        )}
                    </Group>
                </Group>
            ))}
        </Modal>
    );
}
