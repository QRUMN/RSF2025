import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperAdmin(email: string, password: string) {
  try {
    // First check if user already exists
    const { data: existingUser } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('Admin user already exists:', email);
      return;
    }

    // Create the user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user was created');
    }

    // Add user to admins table
    const { error: adminError } = await supabase
      .from('admins')
      .insert({
        id: authData.user.id,
        email: email,
        role: 'super_admin',
        status: 'active'
      });

    if (adminError) {
      throw adminError;
    }

    console.log('Super admin created successfully:', email);
  } catch (error) {
    console.error('Error creating super admin:', error);
  }
}

// Create a super admin with these credentials
createSuperAdmin('readysetfitrx@gmail.com', '@GetFit2025');