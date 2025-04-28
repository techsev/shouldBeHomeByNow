


export async function GET({ params }: { params: { name: string } }) {
    console.log(params.name);
    let name = params.name;

    console.log(name);

    switch (name) {
        case "kidA":
        case "kidB":
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

export function getStaticPaths() {

    return [
        {
            params: { name: "kidA" },
            props: { name: "kidA" },
        },
        {
            params: { name: "kidB" },
            props: { name: "kidB" },
        },

    ]
}

export const prerender = true;
