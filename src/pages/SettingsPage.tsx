import { User, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SettingsPage = () => {
  return (
    <div className="max-w-3xl space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and account settings.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground">Display Name</p>
              <p className="text-sm text-muted-foreground">User</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">user@example.com</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <Label htmlFor="email-notif" className="font-medium text-foreground">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch id="email-notif" />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <Label htmlFor="process-notif" className="font-medium text-foreground">Processing Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when processing completes</p>
            </div>
            <Switch id="process-notif" defaultChecked />
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-foreground">Theme</p>
            <p className="text-sm text-muted-foreground">System default</p>
          </div>
          <Button variant="outline" size="sm">Change</Button>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-foreground">Password</p>
            <p className="text-sm text-muted-foreground">Last changed: Never</p>
          </div>
          <Button variant="outline" size="sm">Update</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
