export default async function handler(req, res) {
    try {
        const {
            url
        } = req.query;

        if (!url) {
            return res.status(400).send(
                "Missing stream URL"
            );
        }

        let target;

        try {
            target =
                new URL(url);
        } catch {
            return res.status(400).send(
                "Invalid stream URL"
            );
        }

        /*
         * IMPORTANT:
         *
         * Only allow your authorized stream
         * provider here.
         *
         * Change this hostname to the actual
         * hostname that serves your authorized
         * HLS stream.
         */
        const allowedHosts = [
            "slast430did.com"
        ];

        if (
            !allowedHosts.includes(
                target.hostname
            )
        ) {
            return res.status(403).send(
                "Stream host is not allowed"
            );
        }

        const response =
            await fetch(
                target.href,
                {
                    headers: {
                        Referer:
                            "https://slast430did.com/",
                        Origin:
                            "https://slast430did.com",
                        "User-Agent":
                            "Mozilla/5.0"
                    }
                }
            );

        if (!response.ok) {
            return res.status(
                response.status
            ).send(
                "Unable to fetch stream"
            );
        }

        const contentType =
            response.headers.get(
                "content-type"
            ) ||
            "application/vnd.apple.mpegurl";

        const text =
            await response.text();

        /*
         * HLS playlist
         */
        if (
            contentType.includes(
                "mpegurl"
            ) ||
            target.pathname.endsWith(
                ".m3u8"
            )
        ) {
            const baseUrl =
                target.href;

            const lines =
                text.split("\n");

            const rewritten =
                lines.map(
                    (line) => {
                        const value =
                            line.trim();

                        /*
                         * Comments and
                         * empty lines.
                         */
                        if (
                            !value ||
                            value.startsWith(
                                "#"
                            )
                        ) {
                            return line;
                        }

                        try {
                            const absolute =
                                new URL(
                                    value,
                                    baseUrl
                                ).href;

                            return (
                                `/api/hls?url=${encodeURIComponent(
                                    absolute
                                )}`
                            );

                        } catch {
                            return line;
                        }
                    }
                );

            res.setHeader(
                "Content-Type",
                "application/vnd.apple.mpegurl"
            );

            res.setHeader(
                "Cache-Control",
                "no-store"
            );

            return res.send(
                rewritten.join("\n")
            );
        }

        /*
         * Binary response.
         */
        const buffer =
            Buffer.from(
                await response.arrayBuffer()
            );

        res.setHeader(
            "Content-Type",
            contentType
        );

        res.setHeader(
            "Cache-Control",
            "no-store"
        );

        return res.send(buffer);

    } catch (error) {
        console.error(
            "HLS proxy error:",
            error
        );

        return res.status(500).send(
            "HLS proxy error"
        );
    }
}
