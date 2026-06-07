import { create } from 'zustand';
import type { Activity } from '@/types';
import { activities as initialActivities } from '@/data/activities';
import { generateId } from '@/utils/format';

interface ActivityState {
  activities: Activity[];
  addActivity: (activity: Partial<Activity>) => void;
  updateActivity: (id: string, activity: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  updateStatus: (id: string, status: Activity['status']) => void;
  getActiveActivities: () => Activity[];
  getScheduledActivities: () => Activity[];
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: initialActivities,

  addActivity: (activity) => {
    const newActivity: Activity = {
      id: generateId('act'),
      name: activity.name || '新活动',
      type: activity.type || 'discount',
      discount: activity.discount ?? 10,
      startTime: activity.startTime || new Date().toISOString(),
      endTime: activity.endTime || new Date().toISOString(),
      dishIds: activity.dishIds || [],
      storeIds: activity.storeIds || [],
      status: activity.status || 'draft',
      description: activity.description || '',
    };
    set((state) => ({ activities: [newActivity, ...state.activities] }));
  },

  updateActivity: (id, activity) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...activity } : a
      ),
    })),

  deleteActivity: (id) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    })),

  updateStatus: (id, status) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    })),

  getActiveActivities: () => get().activities.filter((a) => a.status === 'active'),
  getScheduledActivities: () =>
    get().activities.filter((a) => a.status === 'scheduled'),
}));
