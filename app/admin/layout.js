import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AdminNav from "./AdminNav";
import "../globals.css";
import "./admin.css";

export default async function AdminLayout({ children }) {
  return <>{children}</>;
}
