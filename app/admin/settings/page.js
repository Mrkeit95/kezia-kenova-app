import { createClient } from "@/lib/supabase-server";
import AdminNav from "../AdminNav";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: settings } = await supabase.from("settings").select("*").single();

  return (
    <>
      <AdminNav />
      <main className="admin-page">
        <div className="grain"></div>
        <div className="admin-main">
          <div className="admin-header">
            <h1 className="admin-title">Settings</h1>
            <p className="admin-subtitle">Update your bio, social links, and hero image</p>
          </div>
          <SettingsForm initialSettings={settings || {}} />
        </div>
      </main>
    </>
  );
}
