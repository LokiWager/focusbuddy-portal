import { Outlet } from "react-router";
import { NavItem } from "@/common/components/Navigation/NavItem";

export function AppLayout() {
  return (
    <div className="h-screen w-screen flex flex-row">
      <div className="bg-gray-100 w-50">
        <h1 className="pt-10 pb-10 pl-5 text-2xl font-bold">Focus Buddy</h1>
        <div className="flex flex-col">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/settings">Settings</NavItem>
        </div>
      </div>
      <div className="px-5 py-10">
        <Outlet />
      </div>
    </div>
  );
}
