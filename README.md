# ResumeLens

UCCD is a browser-first prototype for CV intelligence. It accepts PDF, DOCX, TXT, or MD CV files and automatically compares them with the built-in UCCD Product Designer role benchmark, then returns:

- Candidate details such as name, email, phone, and location
- An explainable keyword-based role-fit score
- Matched job signals
- First-pass grammar, logic, and formatting recommendations

## Run it

No Node.js or packages are required for the current prototype. From this folder, run:

```powershell
py -m http.server 4173
```

Open http://localhost:4173 in a browser.

## Next build step: real AI analysis

The current `app.js` keeps analysis local and deterministic. PDF and DOCX text are extracted in the browser using CDN-hosted PDF.js and Mammoth. For production, add a server endpoint that:

1. Extracts text from PDF and DOCX uploads.
2. Sends the CV and job description to a chosen LLM provider.
3. Requests structured JSON for profile fields, fit classification, evidence, recommendations, and issue severity.
4. Validates that JSON before displaying it.
5. Redacts or avoids persisting sensitive personal data unless the user explicitly opts in.

Do not make the score an automatic hiring decision. Treat it as decision support and keep human review in the loop.
