const fs = require('fs');

async function scrapeRepo(name) {
  const url = `https://github.com/pbs002-s/${name}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) return { commits: 0 };
    const html = await res.text();
    
    // Look for commits count
    // Often: <span class="fgColor-default">20</span> commits
    // Or: <strong>20</strong> commits
    // Or: "commitCount":"20"
    let commits = 0;
    const m1 = html.match(/"commitCount":\s*"(\d+)"/);
    const m2 = html.match(/"commitCount":\s*(\d+)/);
    const m3 = html.match(/<strong>([0-9,]+)<\/strong>\s*commits/i);
    const m4 = html.match(/class="[^"]*fgColor-default[^"]*">([0-9,]+)<\/span>\s*commits/i);
    const m5 = html.match(/([0-9,]+)\s+Commits/i);

    if (m1) commits = parseInt(m1[1].replace(/,/g, ''), 10);
    else if (m2) commits = parseInt(m2[1], 10);
    else if (m3) commits = parseInt(m3[1].replace(/,/g, ''), 10);
    else if (m4) commits = parseInt(m4[1].replace(/,/g, ''), 10);
    else if (m5) commits = parseInt(m5[1].replace(/,/g, ''), 10);

    return { commits };
  } catch (e) {
    return { commits: 0 };
  }
}

async function main() {
  const current = JSON.parse(fs.readFileSync('repos_data.json', 'utf8'));
  for (const r of current.repos) {
    if (r.commits === 0 || !r.commits) {
      const scraped = await scrapeRepo(r.name);
      r.commits = scraped.commits;
      console.log(`Scraped ${r.name}: ${r.commits} commits`);
    } else {
      console.log(`Existing ${r.name}: ${r.commits} commits`);
    }
  }
  fs.writeFileSync('repos_data.json', JSON.stringify(current, null, 2));
}

main().catch(console.error);
