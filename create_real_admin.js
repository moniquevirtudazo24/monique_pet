const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dzpltothrrsokhqpuqpt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6cGx0b3RocnJzb2tocXB1cXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODYyNzIsImV4cCI6MjA4OTA2MjI3Mn0.jUfIc1XoC-lIQ27c7fLtUD_DwHCmw2MnfnxuqZ19a1M');

async function createAdmin() {
    const email = 'real_admin@pawcare.com';
    const password = 'password123';
    
    console.log("Signing up admin user...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password
    });

    if (authError && !authError.message.includes('already registered')) {
        console.error("Sign up error:", authError);
        return;
    }

    console.log("Logging in...");
    const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
    
    if (loginData.user) {
        console.log("Logged in. Ensuring profile is admin...");
        // First try to insert if not exists
        await supabase.from('profiles').insert({
            id: loginData.user.id,
            full_name: 'Real Admin',
            email: email,
            phone: '0000',
            role: 'admin'
        });
        
        // Then force update to admin
        const { error: updateErr } = await supabase.from('profiles').update({
            role: 'admin'
        }).eq('id', loginData.user.id);
        
        console.log("Update to admin error:", updateErr);
        
        const { data: check } = await supabase.from('profiles').select('*').eq('id', loginData.user.id);
        console.log("Check profile:", check);
    }
}
createAdmin();
