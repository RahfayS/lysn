export function serializeTextGrid(
  duration, wordItems, phoneItems, customTiers = [], praatCompat = false,
  wordsTierName = 'words', phonesTierName = 'phones',
) {
  const tierData = [
    { name: wordsTierName, items: wordItems },
    { name: phonesTierName, items: phoneItems },
    ...customTiers.map(t => ({ name: t.name, items: t.items })),
  ];

  const lines = [
    'File type = "ooTextFile"',
    'Object class = "TextGrid"',
    '',
    'xmin = 0',
    `xmax = ${duration.toFixed(6)}`,
    'tiers? <exists>',
    `size = ${tierData.length}`,
    'item []:',
  ];

  tierData.forEach(({ name, items }, ti) => {
    const sorted = [...items].sort((a, b) => a.t0 - b.t0);
    const intervals = [];
    let cursor = 0;
    for (const it of sorted) {
      if (it.t0 > cursor + 1e-9) intervals.push({ t0: cursor, t1: it.t0, text: '' });
      const iv = { t0: it.t0, t1: it.t1, text: it.text };
      if (it.score != null) iv.score = it.score;
      if (it.edited) iv.edited = true;
      if (it.edited && it.originalText) iv.originalText = it.originalText;
      intervals.push(iv);
      cursor = it.t1;
    }
    if (cursor < duration - 1e-9) intervals.push({ t0: cursor, t1: duration, text: '' });

    lines.push(`    item [${ti + 1}]:`);
    lines.push('        class = "IntervalTier"');
    lines.push(`        name = "${name.replace(/"/g, '""')}"`);
    lines.push('        xmin = 0');
    lines.push(`        xmax = ${duration.toFixed(6)}`);
    lines.push(`        intervals: size = ${intervals.length}`);
    intervals.forEach((iv, i) => {
      lines.push(`        intervals [${i + 1}]:`);
      lines.push(`            xmin = ${iv.t0.toFixed(6)}`);
      lines.push(`            xmax = ${iv.t1.toFixed(6)}`);
      lines.push(`            text = "${iv.text.replace(/"/g, '""')}"`);
      if (iv.score != null && !praatCompat) lines.push(`            score = ${iv.score}`);
      if (iv.edited && !praatCompat) lines.push(`            edited = true`);
      if (iv.originalText && !praatCompat) lines.push(`            original = "${iv.originalText.replace(/"/g, '""')}"`);
    });
  });

  return lines.join('\n');
}

