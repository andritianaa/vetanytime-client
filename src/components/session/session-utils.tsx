import { Globe, Laptop, Monitor, Smartphone } from 'lucide-react';

export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getRelativeTime = (date: Date | string) => {
  const now = new Date();
  const pastDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  // If less than 1 minute, show "active"
  if (diffInSeconds < 60) {
    return "active";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
};

export const getDeviceIcon = (deviceType: string) => {
  const type = deviceType.toLowerCase();
  if (type.includes("mobile") || type.includes("phone")) {
    return <Smartphone className="h-5 w-5" />;
  } else if (type.includes("tablet")) {
    return <Monitor className="h-5 w-5" />;
  } else {
    return <Laptop className="h-5 w-5" />;
  }
};

export const getBrowserIcon = (browser: string) => {
  // In a real app, you might want to return different icons based on the browser
  // For simplicity, we'll just return a Globe icon for all browsers
  return <Globe className="h-4 w-4" />;
};

export const isCurrentSession = (
  sessionId: string,
  currentSessionId?: string
) => {
  return currentSessionId === sessionId;
};

// Animation variants for framer-motion
export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};
