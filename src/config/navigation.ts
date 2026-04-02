import { paths } from "@/utils/paths";
import {
  ArrowLeft,
  type LucideIcon,
  Settings2,
  UserPlus,
  Users,
} from "lucide-react";

export interface NavMainItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  elementLinkId: string;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface NavSecondaryItem {
  title: string;
  url: string;
  icon: LucideIcon;
  elementLinkId: string;
}

export const getMainNavigation = (): NavMainItem[] => {
  const baseNavigation: NavMainItem[] = [
    {
      title: "Pending Users",
      url: paths.admin.pendingUsers,
      icon: UserPlus,
      isActive: true,
      elementLinkId: "pending-users-link",
    },
    {
      title: "Users",
      url: paths.admin.usersWithRole,
      icon: Users,
      elementLinkId: "users-with-role-link",
    },
  ];

  return baseNavigation;
};

export const getSettingsNavigation = (): NavSecondaryItem[] => {
  const baseNavigation: NavSecondaryItem[] = [
    {
      title: "Settings",
      url: paths.settings.index,
      icon: Settings2,
      elementLinkId: "settings-link",
    },
  ];

  return baseNavigation;
};

export const secondaryNavigation: NavSecondaryItem[] = [
  {
    title: "Settings",
    url: paths.settings.index,
    icon: Settings2,
    elementLinkId: "settings-link",
  },
];

export const settingsSecondaryNavigation: NavSecondaryItem[] = [
  {
    title: "Back to main",
    url: paths.admin.pendingUsers,
    icon: ArrowLeft,
    elementLinkId: "back-to-main-link",
  },
];
  