import { Home, FileText, Lock, Camera, User } from 'lucide-react';

export const menuItems = [
  {
    title: "Dashboard",
    icon: <Home className='text-white' />,
    path: "/dashboard",
    key: "dashboard",
    roles: ["Administrator"],
  },
  {
    title: "Transaction",
    icon: <FileText className='text-white' />,
    path: "/transaction",
    key: "transaction",
    roles: ["Administrator"],
  },
  {
    title: "Gate Settings",
    icon: <Lock className='text-white' />,
    path: "/gate",
    key: "gate",
    roles: ["Administrator"],
  },
  {
    title: "Camera Settings",
    icon: <Camera className='text-white' />,
    path: "/camera",
    key: "camera",
    roles: ["Administrator"],
  },
  {
    title: "User  Settings",
    icon: <User className='text-white'/>,
    path: "/user",
    key: "user",
    roles: ["Administrator"],
  },
];
