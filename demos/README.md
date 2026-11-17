# Inventory demonstrations

Static-host-compatible URLs: `preview.html?inventory=robalo-r270`.

Add a record to `inventory.json` for each personalized demonstration. Use a unique, stable lowercase hyphenated `id`; do not rename shared IDs. Provide the dealership name, inventory title, exact stock/unit reference and label, factual description, sample caption, video URL and local poster path. Omit the reference or use an empty string when unavailable. Reuse the existing R2 host for videos. Store actual media here only through the existing hosting workflow.

The current three records preserve the existing website's titles, references, media and dealership names from source comments. Their dealership associations are unverified, so `dealership.verified` is false. Verify details before adding a personalized record. Setting verified true confirms the data, not a client relationship or endorsement. Never add fabricated engagement or endorsements.

These links and records are public once deployed. Do not include private prospect details, account credentials or confidential information. `noindex` discourages search indexing; it does not restrict access. Query parameters select curated IDs only and cannot supply arbitrary media or HTML.

The preview renders a scrolling simulated social feed with the selected record first and other sample records below. Homepage showcase video areas link to the corresponding record. Native video controls, per-post sharing, playback pausing, and error states are included. Social icons are decorative, with no fabricated interaction or engagement. Main website copy and contact handling remain unchanged through Stage 2.

No build step, server rewrite or dependency is required. To preview locally, serve the repository with a static HTTP server; opening the file directly will not support JSON loading. New records become available when source changes are deployed through the existing process. Adding a record does not generate a video or publish to a social account.
