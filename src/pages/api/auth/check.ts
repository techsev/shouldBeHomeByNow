import { supabase } from '../../../lib/supabase'

const isLoggedIn = async (cookies: any): Promise<{ email: string | null, status: string }> => {
    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");

    if (!accessToken || !refreshToken) {
        return {
            email: null,
            status: "error"
        }
    }
    let session
    try {
        session = await supabase.auth.setSession({
            refresh_token: refreshToken.value,
            access_token: accessToken.value
        })
        if (session.error) {
            cookies.delete('sb-access-token', {
                path: '/'
            })
            cookies.delete('sb-refresh-token', {
                path: '/'
            })
            return {
                email: null,
                status: "error"
            }
        }
    } catch (error) {
        cookies.delete('sb-access-token', {
            path: '/'
        })
        cookies.delete('sb-refresh-token', {
            path: '/'
        })
        return {
            email: null,
            status: "error"
        }
    }

    const email = session.data.user?.email
    return {
        email: email,
        status: "ok"
    }
}

export default isLoggedIn;
