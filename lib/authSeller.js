import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const authAdmin = async () => {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    get(name) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            return false;
        }

        // Check if user has admin role in user_metadata
        if (user.user_metadata?.role === 'admin') {
            return true;
        }

        // For now, we'll also check if the email is a specific admin email
        // You can modify this logic based on your admin setup
        const adminEmails = ['admin@lekzzy.com', 'seller@lekzzy.com'];
        if (adminEmails.includes(user.email)) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Auth admin error:', error);
        return false;
    }
}

export default authAdmin;