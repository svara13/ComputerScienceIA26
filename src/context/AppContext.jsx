import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchGroups();
      fetchBills();
    }
  }, [user]);

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        user_id,
        friend_id,
        user_profile:profiles!friends_user_id_fkey(id, username, full_name),
        friend_profile:profiles!friends_friend_id_fkey(id, username, full_name)
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching friends:', error.message);
      return;
    }

    const enriched = data.map(f => {
      const isMeUserId = f.user_id === user.id;
      const otherProfile = isMeUserId ? f.friend_profile : f.user_profile;

      return {
        id: otherProfile.id,
        username: otherProfile.username,
        name: otherProfile.full_name,
        avatar: '👤', // or use profile image if available
      };
    });

    const uniqueFriends = Array.from(
      new Map(enriched.map(f => [f.id, f])).values()
    );

    setFriends(uniqueFriends);
  };

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        created_at,
        creator:creator_id(id, username),
        group_members(member_id, profiles:member_id(id, username, full_name))
      `);

    if (error) {
      console.error('Error fetching groups:', error.message);
      return;
    }

    // Filter on frontend: include groups where user is creator or a member
    const filtered = data.filter(g =>
      g.creator?.id === user.id ||
      g.group_members.some(m => m.member_id === user.id)
    );

    const formatted = filtered.map(g => ({
      id: g.id,
      name: g.name,
      created_at: g.created_at,
      creator: g.creator,
      members: g.group_members.map(m => ({
        id: m.profiles.id,
        username: m.profiles.username,
        name: m.profiles.full_name,
      }))
    }));

    setGroups(formatted);
  };
  const deleteGroup = async (groupId) => {
    const { error: membersError } = await supabase.from('group_members').delete().eq('group_id', groupId);
    if (membersError) throw membersError;

    const { error: groupError } = await supabase.from('groups').delete().eq('id', groupId);
    if (groupError) throw groupError;

    await fetchGroups();
  };

  const modifyGroupMembers = async (groupId, newMembers) => {
    const { error: deleteError } = await supabase.from('group_members').delete().eq('group_id', groupId);
    if (deleteError) throw deleteError;

    const insertData = newMembers.map(id => ({ group_id: groupId, member_id: id }));
    const { error: insertError } = await supabase.from('group_members').insert(insertData);
    if (insertError) throw insertError;

    await fetchGroups();
  };

  const fetchBills = async () => {
    try {
      const { data: createdBills, error: createdError } = await supabase
        .from('bills')
        .select(`
                *,
                created_by_profile:profiles!bills_created_by_fkey(id, username, full_name),
                bill_splits (
                  id,
                  user_id,
                  amount,
                  paid,
                  profile:profiles!bill_splits_user_id_fkey(id, username, full_name)
                ),
                bill_items (
                  id,
                  label,
                  cost
                )
              `)
        .eq('created_by', user.id);

      if (createdError) throw createdError;

      const { data: userSplits, error: splitsError } = await supabase
        .from('bill_splits')
        .select('bill_id')
        .eq('user_id', user.id);

      if (splitsError) throw splitsError;

      const splitBillIds = userSplits?.map(s => s.bill_id) || [];
      let participantBills = [];

      if (splitBillIds.length > 0) {
        const { data: participantData, error: participantError } = await supabase
          .from('bills')
          .select(`
                  *,
                  created_by_profile:profiles!bills_created_by_fkey(id, username, full_name),
                  bill_splits (
                    id,
                    user_id,
                    amount,
                    paid,
                    profile:profiles!bill_splits_user_id_fkey(id, username, full_name)
                  ),
                  bill_items (
                    id,
                    label,
                    cost
                  )
                  `)
          .in('id', splitBillIds);

        if (participantError) throw participantError;
        participantBills = participantData || [];
      }

      const allBills = [...(createdBills || []), ...participantBills];

      const uniqueBills = Array.from(
        new Map(allBills.map(bill => [bill.id, bill])).values()
      );

      const normalizedBills = uniqueBills.map(bill => ({
        ...bill,
        amount: bill.total_amount,
        splits: bill.bill_splits || [],
        items: bill.bill_items || [],
      }));

      setBills(normalizedBills);
    } catch (error) {
      console.error('Error fetching bills:', error.message);
    }
  };

  const addBill = async (billData) => {
    const { data: billInsert, error: billError } = await supabase
      .from('bills')
      .insert([{
        title: billData.title,
        description: billData.description,
        total_amount: billData.amount,
        created_by: billData.createdBy,
        group_id: billData.groupId || null,
      }])
      .select()
      .single();

    if (billError) {
      console.error("Failed to insert bill:", billError.message);
      throw new Error("Could not create bill");
    }

    const billId = billInsert.id;

    const splitsPayload = billData.splits.map(split => ({
      bill_id: billId,
      user_id: split.userId,
      amount: split.amount,
      paid: split.paid,
    }));

    const { error: splitsError } = await supabase
      .from('bill_splits')
      .insert(splitsPayload);

    if (splitsError) {
      console.error("Failed to insert splits:", splitsError.message);
      throw new Error("Could not add bill splits");
    }

    const itemsPayload = billData.items.map(item => ({
      bill_id: billId,
      label: item.name,
      cost: item.cost,
    }));

    const { error: itemsError } = await supabase
      .from('bill_items')
      .insert(itemsPayload);

    if (itemsError) {
      console.error("Failed to insert items:", itemsError.message);
      throw new Error("Could not add bill items");
    }

    setBills(prev => [billInsert, ...prev]);
    console.log(billInsert)
    return billInsert;
  };

  const addFriend = async (friends) => {
    if (!friends || friends === '') return;

    const friendUsername = friends.username;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .eq('username', friendUsername)
      .single();

    if (profileError) {
      return { error: "No user found with that username." };
    }

    if (profile.id === user.id) {
      return { error: "You can't add yourself as a friend." };
    }

    const { data: existingFriend } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', user.id)
      .eq('friend_id', profile.id)
      .maybeSingle();

    if (existingFriend) {
      return { error: "You're already friends with this user." };
    }

    const { error } = await supabase
      .from('friends')
      .insert([{ user_id: user.id, friend_id: profile.id }]);

    if (error) {
      throw error;
    }

    await fetchFriends();

    return {
      username: profile.username,
      full_name: profile.full_name,
      id: profile.id,
    };
  };

  const addGroup = async (groupData) => {
    const { data, error } = await supabase
      .from('groups')
      .insert([{ name: groupData.name, creator_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      await supabase.from('group_members').insert(
        groupData.members.map(memberId => ({
          group_id: data.id,
          member_id: memberId
        }))
      );
      await fetchGroups();
      return data;
    } else {
      console.error('Error adding group:', error?.message);
    }
  };

  const calculateBalances = (userId) => {
    let totalOwed = 0;
    let totalOwing = 0;
    const owedBy = {};
    const owingTo = {};

    bills.forEach((bill) => {
      const isCreator = bill.created_by === userId;

      bill.bill_splits.forEach(split => {
        const isUser = split.user_id === userId;

        if (isCreator && !isUser && !split.paid) {
          totalOwed += split.amount;
          const friend = friends.find(f => f.id === split.user_id);
          if (friend) {
            owedBy[friend.name] = (owedBy[friend.name] || 0) + split.amount;
          }
        }

        if (!isCreator && isUser && !split.paid) {
          totalOwing += split.amount;
          const friend = friends.find(f => f.id === bill.created_by);
          if (friend) {
            owingTo[friend.name] = (owingTo[friend.name] || 0) + split.amount;
          }
        }
      });
    });

    return { totalOwed, totalOwing, owedBy, owingTo };
  };

  const value = {
    bills,
    groups,
    friends,
    addBill,
    addFriend,
    addGroup,
    deleteGroup,
    modifyGroupMembers,
    calculateBalances
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
