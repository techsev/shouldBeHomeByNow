import isLoggedIn from './auth/check';
import { supabase } from '../../lib/supabase-secret';

export async function GET({ request }: { request: Request }) {
    return new Response(JSON.stringify({
        status: "ok",
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function POST({ request }: { request: Request }, cookies: any) {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const name = formData.get("name")?.toString();

    if (!email || !password) {
        return new Response("Email and password are required", { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    const { access_token, refresh_token } = data.session;
    // cookies.set("sb-access-token", access_token, {
    //     path: "/",
    // });
    // cookies.set("sb-refresh-token", refresh_token, {
    //     path: "/",
    // });



    switch (name) {
        case "kidA":
        case "kidB":

            const response = await supabase.from("HomeTimes").insert({
                name: name,
                created_at: new Date().toISOString(),
            });
            console.log(response);
            if (response.error) {
                return new Response(JSON.stringify({
                    status: "error",
                }), {
                    status: 500,
                });
            }

            return new Response(JSON.stringify({
                name: name,
                status: "ok",
            }), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        default:
            return new Response(null, {
                status: 404,
                statusText: "Not found",
            });
    }
}

