import {
  ClipboardDocumentListIcon,
  CalendarIcon,
  UsersIcon
} from "@heroicons/react/24/solid";
import { Home, ProjectForm, ProjectDetail } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import { PlusIcon } from "@heroicons/react/24/outline";
import ManageUsers from "./pages/dashboard/manageUsers";
import { element } from "prop-types";

const icon = {
  className: "w-5 h-5 text-inherit",
};

const path = ['project', 'activity']

export const routes = [
  {
    layout: "rcd",
    pages: [
      {
        icon: <ClipboardDocumentListIcon {...icon} />,
        name: "Project",
        path: "/project",
        element: <Home />,
      },
      {
        icon: <CalendarIcon {...icon} />,
        name: "Activity",
        path: "/activity",
        element: <Home />,
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "Manage User",
        path: "/manage-user",
        element: <ManageUsers />,
        allowedRoles: ["admin"],
      },
    ],

  },
  {
    layout: "auth",
    pages: [
      {
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
];

export default routes;
