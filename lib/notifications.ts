import { query } from './db';

interface NotificationOptions {
  userId: string;
  type: 'shift_assigned' | 'shift_confirmed' | 'shift_cancelled' | 'schedule_updated';
  title: string;
  message?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(options: NotificationOptions) {
  try {
    await query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, $2, $3, $4)`,
      [options.userId, options.type, options.title, options.message || null]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Notify employee of shift assignment
 */
export async function notifyShiftAssigned(
  userId: string,
  shiftName: string,
  date: string
) {
  await createNotification({
    userId,
    type: 'shift_assigned',
    title: 'New Shift Assigned',
    message: `You have been assigned to ${shiftName} on ${date}`,
  });
}

/**
 * Notify employee of shift confirmation
 */
export async function notifyShiftConfirmed(
  userId: string,
  shiftName: string,
  date: string
) {
  await createNotification({
    userId,
    type: 'shift_confirmed',
    title: 'Shift Confirmed',
    message: `Your ${shiftName} shift on ${date} has been confirmed`,
  });
}

/**
 * Notify employee of shift cancellation
 */
export async function notifyShiftCancelled(
  userId: string,
  shiftName: string,
  date: string
) {
  await createNotification({
    userId,
    type: 'shift_cancelled',
    title: 'Shift Cancelled',
    message: `Your ${shiftName} shift on ${date} has been cancelled`,
  });
}

/**
 * Notify managers of schedule updates
 */
export async function notifyScheduleUpdate(adminId: string, message: string) {
  await createNotification({
    userId: adminId,
    type: 'schedule_updated',
    title: 'Schedule Updated',
    message,
  });
}
