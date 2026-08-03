/**
 * Mock data for story: End-of-session sound and notification
 *
 * Shape mirrors what the real timer/session logic will expose when
 * story 3 (session cycle) lands. The `onSessionEnd` callback signature
 * is the integration contract the backend must satisfy.
 */

// ── Session types ─────────────────────────────────────────────────────────────

export type SessionType = 'work' | 'short' | 'long';

/** The notification payload returned when a session ends. */
export interface SessionEndPayload {
  /** The session type that just finished. */
  finished: SessionType;
  /** The session type the cycle will advance to next. */
  next: SessionType;
  /** Human-readable labels for each session type. */
  labels: Record<SessionType, string>;
}

/** Human-readable labels used in notification bodies and status messages. */
export const SESSION_LABELS: Record<SessionType, string> = {
  work: 'Work',
  short: 'Short Break',
  long: 'Long Break',
};

// ── Notification permission states ────────────────────────────────────────────

export type NotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

/** Shape of the notification status exposed to the UI layer. */
export interface NotificationStatusState {
  permission: NotificationPermission;
  isBlocked: boolean;
  blockedMessage: string;
}

/**
 * Mock: the notification status on a fresh page load with no stored permission.
 * In the real app this is derived from `Notification.permission` at mount.
 */
export const mockInitialNotificationStatus: NotificationStatusState = {
  permission: 'default',
  isBlocked: false,
  blockedMessage: '',
};

/**
 * Mock: the notification status when the browser has denied permission
 * (e.g. from a previous visit). This drives the AC-8 case (status line
 * visible on load for a returning denied user).
 */
export const mockDeniedNotificationStatus: NotificationStatusState = {
  permission: 'denied',
  isBlocked: true,
  blockedMessage:
    'Browser notifications are blocked — you will get sound only. Allow notifications in your browser settings.',
};

/**
 * Mock: the notification status when the browser fully supports and grants
 * permission. No status line should be shown.
 */
export const mockGrantedNotificationStatus: NotificationStatusState = {
  permission: 'granted',
  isBlocked: false,
  blockedMessage: '',
};

// ── Session-end integration ────────────────────────────────────────────────────

/**
 * The callback signature the real session-end hook must satisfy.
 * Components subscribe to this to fire the chime and notification.
 */
export type OnSessionEnd = (payload: SessionEndPayload) => void;

/** Mock subscription that does nothing — the real hook wires this up. */
export const mockOnSessionEnd: OnSessionEnd = () => {
  // no-op for UI stage; replaced by the real timer hook in the BE stage
};
