import { Home, Wrench, Settings, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarGroupAction,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Tools", url: "/tools", icon: Wrench },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [activationKey, setActivationKey] = useState("");
  const { toast } = useToast();
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">X</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground">XTools</h1>
            <p className="text-xs text-muted-foreground">XML Processing Suite</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
            Tools
          </SidebarGroupLabel>
          <Dialog>
            <DialogTrigger asChild>
              <SidebarGroupAction className="text-xs">Activate New Tool</SidebarGroupAction>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter Activation Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Input
                  placeholder="Paste activation key"
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    toast({ title: "Activation", description: "Activation flow will be integrated." });
                  }}
                >
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <SidebarGroupContent>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Owned Tools</div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive tooltip="XML Renumbering Tool">
                  <NavLink
                    to="/tools"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    activeClassName="bg-primary/10 text-primary font-medium"
                  >
                    <Wrench className="h-5 w-5" />
                    <span>XML Renumbering Tool</span>
                  </NavLink>
                </SidebarMenuButton>
                <SidebarMenuBadge className="bg-primary/10">Unlocked</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground mt-3">Available Tools</div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="XML Formatter">
                  <NavLink
                    to="/tools"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    activeClassName="bg-primary/10 text-primary font-medium"
                  >
                    <Wrench className="h-5 w-5" />
                    <span>XML Formatter</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground mt-3">Not Owned Tools</div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-50 cursor-not-allowed">
                      <span className="text-lg">🔒</span>
                      <span>XML Merge</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Access requires an activation key. Please contact your administrator to unlock this tool.
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User</p>
            <p className="text-xs text-muted-foreground truncate">user@example.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
