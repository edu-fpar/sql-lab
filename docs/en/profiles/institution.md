# 🏫 Institution, IT department

## Deploy in the LMS
- **SCORM 1.2 package**, one per exercise, compatible with Moodle, Chamilo and other SCORM LMSs.
- The package contains the whole app **with no external calls** (no CDN) and is locked on the
  exercise.
- It reports score, status (incomplete, completed, passed) and resume data.
- It records one interaction per solved question.

## Host it in-house
It is a **static** website, with no application server and no server-side database. Copy the
repository to any web server (Apache, Nginx, IIS, GitHub Pages, intranet). The only point to
watch: serve `.wasm` files with the `application/wasm` MIME type.

## Check data protection (GDPR)
- No personal data is collected or sent: no account, no analytics, no tracker, no third-party
  font or script.
- Queries run in the browser. Progress stays in the device's local storage, or in the LMS with
  SCORM.
- Questions shared by link sit after the `#` of the address: they are never sent to the server.
