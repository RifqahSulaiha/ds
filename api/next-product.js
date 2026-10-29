const { access } = require("node:fs/promises");
const path = require("node:path");

function sendJson(res, status, body) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendJson(res, 405, { error: "Method not allowed. Use GET." });
    }

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!redisUrl || !redisToken) {
        return sendJson(res, 500, {
            error: "The shared product counter is not configured. Set the Upstash Redis environment variables."
        });
    }

    let counterResponse;
    let counterData;
    try {
        const baseUrl = redisUrl.replace(/\/+$/, "");
        counterResponse = await fetch(baseUrl + "/incr/ds-product-download-counter", {
            method: "POST",
            headers: { Authorization: "Bearer " + redisToken }
        });
        if (!counterResponse.ok) {
            console.error("Upstash counter request failed with HTTP", counterResponse.status);
            return sendJson(res, 502, { error: "The shared product counter is unavailable." });
        }
        counterData = await counterResponse.json();
    } catch (error) {
        console.error("Could not access the Upstash product counter:", error);
        return sendJson(res, 502, { error: "The shared product counter is unavailable." });
    }

    const count = counterData && counterData.result;
    if (!Number.isSafeInteger(count) || count < 1) {
        console.error("Upstash returned an invalid product counter value.");
        return sendJson(res, 502, { error: "The shared product counter returned an invalid value." });
    }

    if (count > 21) {
        return sendJson(res, 409, {
            error: "All 21 product images have been assigned. Add more product images before downloading again."
        });
    }

    const filename = count === 1 ? "product.jfif" : "product(" + (count - 1) + ").jfif";
    const imagePath = path.join(process.cwd(), "Products", filename);
    try {
        await access(imagePath);
    } catch (error) {
        if (error.code === "ENOENT") {
            return sendJson(res, 404, { error: "Missing image: Products/" + filename });
        }
        console.error("Could not verify product image:", error);
        return sendJson(res, 500, { error: "Could not verify the product image." });
    }

    return sendJson(res, 200, { filename });
};
