const cvInput = document.querySelector('#cv-file');
const cvText = document.querySelector('#cv-text');
const dropzone = document.querySelector('#dropzone');
const fileLabel = document.querySelector('#file-label');
const analyzeButton = document.querySelector('#analyze-button');
const emptyState = document.querySelector('#empty-state');
const results = document.querySelector('#results');
const resultsSubtitle = document.querySelector('#results-subtitle');
const systemJobDescription = 'We are looking for an engineering candidate with strong technical fundamentals, analytical problem-solving, project experience, teamwork, clear communication, and the ability to turn requirements into reliable solutions.';
     //هنا بنعدل ال job describtion
    
cvInput.addEventListener('change', () => loadFile(cvInput.files[0]));
dropzone.addEventListener('dragover', (event) => { event.preventDefault(); dropzone.classList.add('dragging'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));
dropzone.addEventListener('drop', (event) => { event.preventDefault(); dropzone.classList.remove('dragging'); loadFile(event.dataTransfer.files[0]); });

async function loadFile(file) {
  if (!file) return;
  fileLabel.textContent = file.name;
  cvText.value = `Reading ${file.name}...`;
  try {
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension === 'pdf' || file.type === 'application/pdf') {
      cvText.value = await extractPdfText(file);
    } else if (extension === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      cvText.value = result.value.trim();
    } else if (extension === 'doc' || file.type === 'application/msword') {
      throw new Error('Legacy .doc files are accepted, but please save them as .docx for browser text extraction.');
    } else if (/text|markdown/.test(file.type) || /\.(txt|md|text)$/i.test(file.name)) {
      cvText.value = await file.text();
    } else {
      throw new Error('Please choose a PDF, DOCX, TXT, or MD file.');
    }
    if (!cvText.value.trim()) throw new Error('No readable text was found in this file.');
  } catch (error) {
    cvText.value = '';
    fileLabel.textContent = `${file.name} · could not read`;
    cvText.placeholder = error.message;
  }
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) throw new Error('PDF reader is unavailable. Check your internet connection and try again.');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(' '));
  }
  return pages.join('\n\n').trim();
}

analyzeButton.addEventListener('click', () => {
  const cv = cvText.value.trim();
  if (!cv) {
    cvText.style.boxShadow = 'inset 0 -2px 0 var(--gold)';
    setTimeout(() => cvText.style.boxShadow = '', 1200);
    return;
  }
  analyze(cv, systemJobDescription);
});

function analyze(cv, job) {
  const lowerCv = cv.toLowerCase();
  const lowerJob = job.toLowerCase();
  const words = [...new Set(lowerJob.match(/[a-z][a-z+#.-]{2,}/g) || [])];
  const stopWords = new Set('the and for with from that this are you your our have will who to of in a an is as on be we it or at by'.split(' '));
  const keywords = words.filter((word) => !stopWords.has(word) && word.length > 3).slice(0, 80);
  const matches = keywords.filter((word) => lowerCv.includes(word));
  const score = Math.min(97, Math.max(18, Math.round((matches.length / Math.max(1, Math.min(keywords.length, 18))) * 100)));
  const name = extractName(cv);
  const email = (cv.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i) || [])[0] || 'Not found';
  const phone = (cv.match(/(?:\+?\d[\d ()-]{7,}\d)/) || [])[0] || 'Not found';
  const yearMentions = cv.match(/(?:19|20)\d{2}/g) || [];
  const experienceYears = cv.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i);
  const years = experienceYears ? Number(experienceYears[1]) : yearMentions.length;
  const skills = matches.slice(0, 8);
  const issues = findIssues(cv);

  document.querySelector('#score-number').textContent = score;
  document.querySelector('#fit-label').textContent = score >= 75 ? 'Strong potential' : score >= 50 ? 'Promising, with gaps' : 'Needs a closer rewrite';
  document.querySelector('#fit-summary').textContent = score >= 75 ? 'The CV reflects many of the role\'s visible signals.' : 'The evidence is partial; sharpen the CV around the role\'s priorities.';
  document.querySelector('#experience-value').textContent = years >= 3 ? `${years}+ date signals` : 'Early career';
  document.querySelector('#skills-value').textContent = `${matches.length} matched`;
  document.querySelector('#quality-value').textContent = issues.length <= 2 ? 'Clean' : issues.length <= 4 ? 'Needs polish' : 'Needs work';
  document.querySelector('#profile-grid').innerHTML = profileItem('NAME', name) + profileItem('EMAIL', email) + profileItem('PHONE', phone) + profileItem('LOCATION', extractLocation(cv));
  document.querySelector('#match-list').innerHTML = skills.length ? skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join('') : '<span class="tag">No direct keyword evidence found</span>';
  document.querySelector('#issue-list').innerHTML = issues.map((issue) => `<div class="issue ${issue.good ? 'good' : ''}"><span class="issue-dot"></span><div><strong>${issue.title}</strong><p>${issue.detail}</p></div></div>`).join('');
  emptyState.hidden = true;
  results.hidden = false;
  resultsSubtitle.textContent = `Completed just now · UCCD Engineering Track · ${matches.length} role signals found`;
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function profileItem(label, value) { return `<div class="profile-item"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`; }
function extractName(text) { const first = text.split(/\n/).map((line) => line.trim()).find((line) => line && line.length < 55 && !/@/.test(line) && !/cv|resume|curriculum/i.test(line)); return first || 'Not found'; }
function extractLocation(text) { const line = text.split(/\n/).find((item) => /location|based in|address/i.test(item)); return line ? line.replace(/.*(?:location|based in|address)\s*[:,-]?\s*/i, '').trim() : 'Not found'; }
function findIssues(text) {
  const issues = [];
  if (/\b(i|we)\s+(was|am|have)\b/i.test(text)) issues.push({ title: 'First-person phrasing appears', detail: 'Use consistent, achievement-led fragments in experience bullets.' });
  if (/\b(responsible for|helped with|worked on)\b/i.test(text)) issues.push({ title: 'Some bullets are passive', detail: 'Replace vague phrasing with an action, a method, and a measurable result.' });
  if (!/\d+\s*%|\$\s*\d+|\b\d+\+?\s*(users|clients|projects|people|hours)/i.test(text)) issues.push({ title: 'Few measurable outcomes', detail: 'Add scale where possible: revenue, time saved, users reached, or delivery speed.' });
  if (/ {3,}/.test(text)) issues.push({ title: 'Spacing is inconsistent', detail: 'Repeated spaces can create alignment problems when the CV is exported.' });
  if (text.split(/\s+/).length < 80) issues.push({ title: 'The CV is very light on evidence', detail: 'Expand the strongest two or three projects with context and outcomes.' });
  if (!issues.length) issues.push({ good: true, title: 'No obvious writing flags in this pass', detail: 'A human or LLM review can still catch tone, chronology, and layout details.' });
  return issues;
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
