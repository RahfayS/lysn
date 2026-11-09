export function parseTextGrid(text) {
  const lines = text.split(/\r?\n/);
  let duration = 70;
  const tiers = Object.create(null);
  let i = 0;

  // Find xmax at top level for duration
  for (let j = 0; j < Math.min(20, lines.length); j++) {
    const m = lines[j].match(/^xmax\s*=\s*([\d.]+)/);
    if (m) { duration = parseFloat(m[1]); break; }
  }

  // Parse tiers
  while (i < lines.length) {
    const tierMatch = lines[i].match(/^\s*item\s*\[(\d+)\]\s*:/);
    if (tierMatch) {
      i++;
      let tierName = null;
      const items = [];
      while (i < lines.length && !lines[i].match(/^\s*item\s*\[\d+\]\s*:/)) {
        const nameLine = lines[i].match(/^\s*name\s*=\s*"(.*)"/);
        if (nameLine) tierName = nameLine[1].replace(/""/g, '"');

        const intMatch = lines[i].match(/^\s*intervals\s*\[(\d+)\]\s*:/);
        if (intMatch) {
          i++;
          let xmin = 0, xmax = 0, text = '', score = null, edited = false, originalText = null;
          while (i < lines.length && !lines[i].match(/^\s*intervals\s*\[\d+\]\s*:/)) {
            const xminM = lines[i].match(/^\s*xmin\s*=\s*([\d.]+)/);
            const xmaxM = lines[i].match(/^\s*xmax\s*=\s*([\d.]+)/);
            const scoreM = lines[i].match(/^\s*score\s*=\s*([\d.]+)/);
            const editedM = lines[i].match(/^\s*edited\s*=\s*(true|1)\s*$/i);
            const originalM = lines[i].match(/^\s*original\s*=\s*"(.*)"/);
            if (xminM) xmin = parseFloat(xminM[1]);
            if (xmaxM) xmax = parseFloat(xmaxM[1]);
            if (/^\s*text\s*=\s*"/.test(lines[i])) {
              // Praat escapes quotes by doubling them and permits embedded
              // newlines. Consume the complete string before scanning attributes.
              let raw = lines[i].replace(/^\s*text\s*=\s*"/, '');
              while (!((raw.match(/"+\s*$/)?.[0].trim().length || 0) % 2) && i + 1 < lines.length) {
                raw += '\n' + lines[++i];
              }
              text = raw.replace(/"\s*$/, '').replace(/""/g, '"');
            }
            if (scoreM) score = parseFloat(scoreM[1]);
            if (editedM) edited = true;
            if (originalM) originalText = originalM[1].replace(/""/g, '"');
            i++;
            if (lines[i] && (lines[i].match(/^\s*intervals\s*\[\d+\]\s*:/) ||
                lines[i].match(/^\s*item\s*\[\d+\]\s*:/) ||
                lines[i].match(/^\s*points\s*\[/))) break;
          }
          const item = { t0: xmin, t1: xmax, text: text.trim() };
          if (score !== null) item.score = score;
          if (edited) item.edited = true;
          if (originalText !== null) item.originalText = originalText;
          if (text.trim()) items.push(item);
          continue;
        }
        i++;
      }
      if (tierName) tiers[tierName] = items;
      continue;
    }
    i++;
  }

  return { duration, tiers };
}
