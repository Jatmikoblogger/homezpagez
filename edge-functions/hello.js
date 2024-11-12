export default (request) => {
    return new Response("Hello from the Edge!", {
        headers: {
            "content-type": "text/plain",
            "cache-control": "public, max-age=300", // Cache selama 5 menit
        },
    });
};
