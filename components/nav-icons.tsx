'use client';
import React from 'react';

type IconProps = {
  className?: string;
  style?: React.CSSProperties;
};

/* ─────────────── BESPOKE NAVIGATION SVG ICONS ─────────────── */

export function NavHomeIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M3 10.5L12 3l9 7.5v9a2 2 0 0 1-2 2h-4.5a1 1 0 0 1-1-1v-4.5a1.5 1.5 0 0 0-1.5-1.5h-2a1.5 1.5 0 0 0-1.5 1.5V20a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-9z" fill="currentColor" fillOpacity="0.12" />
      <circle cx="12" cy="10" r="1.5" fill="currentColor" />
      <path d="M9.5 14h5" strokeWidth="1.6" />
    </svg>
  );
}

export function NavChatIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M12 2v2.5" />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
      <rect x="4" y="5.5" width="16" height="12" rx="4" fill="currentColor" fillOpacity="0.12" />
      <circle cx="8.5" cy="11.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="11.5" r="1.5" fill="currentColor" />
      <path d="M10.5 14.5h3" strokeWidth="1.8" />
      <path d="M9 17.5l-3 4v-4H5" />
    </svg>
  );
}

export function NavAttendanceIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="3.5" y="4" width="17" height="17" rx="3.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 2.5v3M16 2.5v3M3.5 9h17" />
      <path d="M7.5 14.5l2.8 2.8 6.2-6.2" strokeWidth="2.3" />
      <circle cx="6.5" cy="6.5" r="0.75" fill="currentColor" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function NavMarksIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <polygon points="12,2 21,7.5 21,16.5 12,22 3,16.5 3,7.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M7 10l5-2.8 5 2.8-5 2.8z" fill="currentColor" fillOpacity="0.25" />
      <path d="M17 10v4.5" strokeWidth="1.8" />
      <circle cx="17" cy="15" r="1" fill="currentColor" />
      <path d="M9.5 15.5l2 2 3.5-3.5" strokeWidth="2.1" />
    </svg>
  );
}

export function NavStudentsIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="9" cy="8" r="3.5" fill="currentColor" fillOpacity="0.18" />
      <path d="M2.5 19.5a6.5 6.5 0 0 1 13 0" />
      <circle cx="17.5" cy="8.5" r="2.5" fill="currentColor" fillOpacity="0.12" />
      <path d="M15.5 15a4.5 4.5 0 0 1 6 4.5" strokeDasharray="2 1.5" />
      <path d="M9 3l3-1.5" strokeWidth="1.5" />
    </svg>
  );
}

export function NavStaffIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="4.5" y="3" width="15" height="18" rx="3.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="8.5" r="2.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M8 16c0-2.2 1.8-3.2 4-3.2s4 1 4 3.2" />
      <line x1="12" y1="2" x2="12" y2="4" strokeWidth="2.2" />
      <circle cx="12" cy="18" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function NavDashboardIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="3" y="3" width="7.5" height="9" rx="2.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="13.5" y="3" width="7.5" height="5.5" rx="2" />
      <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="2.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="3" y="15" width="7.5" height="6" rx="2" />
      <circle cx="6.75" cy="7.5" r="1.2" fill="currentColor" />
      <line x1="16" y1="16.5" x2="18.5" y2="16.5" strokeWidth="2" />
    </svg>
  );
}

export function NavDepartmentsIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M2 21.5h20" strokeWidth="2.2" />
      <polygon points="12,3 3,9 21,9" fill="currentColor" fillOpacity="0.18" />
      <path d="M4 9v11M20 9v11" />
      <path d="M8.5 9v11M12 9v11M15.5 9v11" strokeWidth="1.6" />
      <circle cx="12" cy="6.2" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function NavAnnouncementsIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M3 9.5v5a1 1 0 0 0 1 1h2.5l5.5 4.5v-16l-5.5 4.5H4a1 1 0 0 0-1 1z" fill="currentColor" fillOpacity="0.15" />
      <path d="M16 8a4.5 4.5 0 0 1 0 8" strokeWidth="2.1" />
      <path d="M19.5 5.5a8.5 8.5 0 0 1 0 13" strokeWidth="1.8" strokeDasharray="2.5 2" />
      <circle cx="7" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function NavPlacementsIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="3" y="7" width="18" height="14" rx="3.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 7V4.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V7" />
      <path d="M8 14l4-4 4 4" strokeWidth="2.3" />
      <line x1="12" y1="10" x2="12" y2="17.5" strokeWidth="2.3" />
    </svg>
  );
}

export function NavDocumentsIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M4 4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" fill="currentColor" fillOpacity="0.1" />
      <polyline points="14 2 14 8 20 8" fill="currentColor" fillOpacity="0.25" />
      <line x1="8" y1="13" x2="13.5" y2="13" strokeWidth="1.8" />
      <line x1="8" y1="17" x2="16" y2="17" strokeWidth="1.8" />
      <circle cx="8" cy="9" r="1" fill="currentColor" />
    </svg>
  );
}

export function NavNotificationsIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M6 17h12l-1.5-6.5a4.5 4.5 0 0 0-9 0L6 17z" fill="currentColor" fillOpacity="0.15" />
      <path d="M10 20a2 2 0 0 0 4 0" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
      <path d="M3.5 8a8.5 8.5 0 0 1 3-3" strokeWidth="1.7" />
      <path d="M20.5 8a8.5 8.5 0 0 0-3-3" strokeWidth="1.7" />
    </svg>
  );
}

export function NavAnalyticsIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M3 3.5v17.5h18" strokeWidth="2.1" />
      <path d="M6.5 16l4.5-5.5 3.5 3.5L19 6.5" strokeWidth="2.3" />
      <circle cx="19" cy="6.5" r="1.5" fill="currentColor" />
      <circle cx="14.5" cy="14" r="1.3" fill="currentColor" />
      <circle cx="11" cy="10.5" r="1.3" fill="currentColor" />
      <circle cx="6.5" cy="16" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function NavAuditLogsIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M12 2l8 3.5v6c0 5-3.5 9.5-8 10.5-4.5-1-8-5.5-8-10.5v-6L12 2z" fill="currentColor" fillOpacity="0.13" />
      <circle cx="12" cy="11.5" r="2.5" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 14v2.5" strokeWidth="2.1" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function NavSettingsIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" strokeWidth="2.3" />
      <circle cx="12" cy="12" r="6.2" strokeWidth="1.6" strokeDasharray="3 2" />
    </svg>
  );
}

export function NavLeavesIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="4" y="3" width="16" height="18" rx="3.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 7.5h8M8 11.5h4.5" strokeWidth="1.8" />
      <path d="M13.5 17.5l3.5-2.5-3.5-2.5" strokeWidth="2.2" />
      <path d="M8 15h8.5" strokeWidth="2.2" />
    </svg>
  );
}

export function NavTimetableIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.08" />
      <polyline points="12 7 12 12 15.5 13.8" strokeWidth="2.3" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <line x1="12" y1="3" x2="12" y2="4.5" strokeWidth="2" />
      <line x1="21" y1="12" x2="19.5" y2="12" strokeWidth="2" />
      <line x1="12" y1="21" x2="12" y2="19.5" strokeWidth="2" />
      <line x1="3" y1="12" x2="4.5" y2="12" strokeWidth="2" />
    </svg>
  );
}

export function NavMaterialsIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v16H5.5A2.5 2.5 0 0 0 3 21.5V5.5z" fill="currentColor" fillOpacity="0.12" />
      <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v16h5.5a2.5 2.5 0 0 1 2.5 2.5V5.5z" fill="currentColor" fillOpacity="0.12" />
      <path d="M12 3v16" strokeWidth="2.2" />
      <circle cx="7" cy="8" r="0.8" fill="currentColor" />
      <circle cx="17" cy="8" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function NavMenuIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M4 6h16M7 12h13M4 18h16" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

export function NavCloseIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M5 5l14 14M19 5L5 19" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function NavLogoutIcon({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
      <polyline points="15 17 20 12 15 7" strokeWidth="2.2" />
      <line x1="20" y1="12" x2="8" y2="12" strokeWidth="2.2" />
      <circle cx="5" cy="5" r="0.8" fill="currentColor" />
    </svg>
  );
}
