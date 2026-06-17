import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 20c6.5 0 12-5.5 12-12V4h-4C7.5 4 2 9.5 2 16v4h4Z" />
      <path d="M7 17c2-3 5-6 9-8" />
    </BaseIcon>
  );
}

export function CloudIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 18h10a4 4 0 0 0 .3-8A5.5 5.5 0 0 0 6.7 8.7 4 4 0 0 0 7 18Z" />
      <path d="M9 19v1" />
      <path d="M13 19v1" />
      <path d="M17 19v1" />
    </BaseIcon>
  );
}

export function ScanIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 8V5a1 1 0 0 1 1-1h3" />
      <path d="M16 4h3a1 1 0 0 1 1 1v3" />
      <path d="M20 16v3a1 1 0 0 1-1 1h-3" />
      <path d="M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M7 12h10" />
    </BaseIcon>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </BaseIcon>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8 6 4-6 4V8Z" />
    </BaseIcon>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 19h16" />
      <path d="M7 15v-4" />
      <path d="M12 15V8" />
      <path d="M17 15v-7" />
    </BaseIcon>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.8 6.8-3.6" />
      <path d="m8.6 13.2 6.8 3.6" />
    </BaseIcon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </BaseIcon>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </BaseIcon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14.5 18.5c-5.2-2.6-8.4-5.8-11-11l2.6-2.6a1 1 0 0 1 1.1-.2l3.1 1.2a1 1 0 0 1 .6 1l-.2 2.8a1 1 0 0 1-.8.9l-1.4.3a14.6 14.6 0 0 0 4.7 4.7l.3-1.4a1 1 0 0 1 .9-.8l2.8-.2a1 1 0 0 1 1 .6l1.2 3.1a1 1 0 0 1-.2 1.1l-2.7 2.5Z" />
    </BaseIcon>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.7 12.9c0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.5-1.7-3-1.7-1.3-.1-2.5.8-3.2.8-.6 0-1.6-.8-2.6-.8-1.3 0-2.6.8-3.3 1.9-1.4 2.4-.4 5.9 1 7.7.7.9 1.5 1.9 2.7 1.9 1 0 1.4-.7 2.7-.7 1.3 0 1.6.7 2.7.7 1.1 0 1.9-.9 2.5-1.8.8-1 1.1-1.9 1.1-2-.1 0-2.4-.9-2.4-3.5Zm-2-6.1c.5-.6.9-1.4.8-2.2-.8 0-1.7.5-2.2 1.1-.5.5-.9 1.4-.8 2.1.9.1 1.7-.4 2.2-1Z" />
    </svg>
  );
}

export function PlayStoreIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4.4 3.7c-.3.3-.4.7-.4 1.2v14.2c0 .5.1.9.4 1.2l8.1-8.3-8.1-8.3Z" fill="#34A853" />
      <path d="M15.3 14.8 7 20.1c.5.2 1 .2 1.5-.1l9.7-5.8-2.9-1.4Z" fill="#FBBC04" />
      <path d="M18.2 9.8 8.5 4c-.5-.3-1-.3-1.5-.1l8.3 8.2 2.9-2.3Z" fill="#EA4335" />
      <path d="m15.3 9.8-2.8 2.2 2.8 2.8 2.9-1.7c.9-.5.9-1.8 0-2.3l-2.9-1Z" fill="#4285F4" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </BaseIcon>
  );
}

export function LoginIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H4" />
    </BaseIcon>
  );
}
