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

## Start it without VS Code

On Windows, double-click `start-uccd.bat` in the project folder. It starts the local server and opens the app in your default browser. Keep the server window open while using the app. Close that window when you are finished.

If the page stops loading later, double-click `start-uccd.bat` again, or run this from the project folder:

```powershell
py -m http.server 4173
```

## Share it with someone

For a public link, publish the `dalia` branch with GitHub Pages:

1. Push the project to GitHub with `git push -u origin dalia`.
2. Open the repository on GitHub and choose **Settings**.
3. Open **Pages** under **Code and automation**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `dalia` and folder `/ (root)`, then choose **Save**.
6. GitHub will give you a link similar to `https://YOUR_USERNAME.github.io/UCCD/`.

Send that link to anyone. They will not need VS Code or Python. The PDF/DOCX readers are loaded from a CDN, so users need an internet connection for document extraction.

## Next build step: real AI analysis

The current `app.js` keeps analysis local and deterministic. PDF and DOCX text are extracted in the browser using CDN-hosted PDF.js and Mammoth. For production, add a server endpoint that:

1. Extracts text from PDF and DOCX uploads.
2. Sends the CV and job description to a chosen LLM provider.
3. Requests structured JSON for profile fields, fit classification, evidence, recommendations, and issue severity.
4. Validates that JSON before displaying it.
5. Redacts or avoids persisting sensitive personal data unless the user explicitly opts in.

Do not make the score an automatic hiring decision. Treat it as decision support and keep human review in the loop.
