interface ImportMetaEnv {
    readonly SUPABASE_URL: string
    readonly PUBLIC_SUPABASE_URL: string
    readonly PUBLIC_SUPABASE_ANON_KEY: string
    readonly SUPABASE_ANON_KEY: string
    readonly SUPABASE_SECRET: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}