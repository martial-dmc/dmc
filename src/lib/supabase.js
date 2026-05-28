import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lztddvxinfkvytlpdbuo.supabase.co";
const SUPABASE_KEY = "sb_publishable_HRUZ526NmUT3o6Iq0hNOLw_AhxlUQDp";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
