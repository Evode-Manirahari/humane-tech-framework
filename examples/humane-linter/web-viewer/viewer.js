document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const results = JSON.parse(e.target.result);
      displayResults(results);
    } catch (err) {
      document.getElementById('results').innerHTML = '<p class="error">Invalid JSON file.</p>';
    }
  };
  reader.readAsText(file);
});

function displayResults(results) {
  const container = document.getElementById('results');
  if (!results.length) {
    container.innerHTML = '<div class="success">✅ No dark patterns detected!</div>';
    return;
  }
  let html = `<div class="summary">Found <b>${results.length}</b> potential dark pattern(s):</div>`;
  html += '<ul class="pattern-list">';
  results.forEach(r => {
    html += `<li class="pattern-item">
      <div class="pattern-title">[${r.pattern}] <span class="desc">${r.description}</span></div>
      <div class="pattern-meta">File: <code>${r.file}</code> | Line: <b>${r.line}</b></div>
      <div class="pattern-match">Match: <code>${escapeHtml(r.match)}</code></div>
    </li>`;
  });
  html += '</ul>';
  container.innerHTML = html;
}

function escapeHtml(text) {
  return text.replace(/[&<>'"]/g, function(c) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'})[c];
  });
}
