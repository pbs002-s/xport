// Netlify Function v2 — proxy that counts GitHub contributions INCLUDING private
// repo activity. The token lives only in Netlify's environment (GITHUB_TOKEN),
// never reaches the browser.
//
// Endpoint: /.netlify/functions/github-contributions

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

const QUERY = `
query ViewerContributions {
  viewer {
    login
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            contributionLevel
            date
          }
        }
      }
    }
  }
}
`;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      // Cache 1 hour at CDN/browser so visitors don't hammer the API
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return json(
      { error: "GITHUB_TOKEN env var is not set on this Netlify site." },
      500
    );
  }

  try {
    const res = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "user-agent": "portfolio-contributions-proxy",
      },
      body: JSON.stringify({ query: QUERY }),
    });

    const payload = await res.json();

    if (!res.ok || payload.errors) {
      return json(
        { error: "GitHub GraphQL request failed", detail: payload.errors ?? res.status },
        502
      );
    }

    const { login, contributionsCollection } = payload.data.viewer;
    const days = contributionsCollection.contributionCalendar.weeks
      .flatMap((w) => w.contributionDays)
      .sort((a, b) => a.date.localeCompare(b.date));

    return json({
      login,
      isPrivateAware: true,
      stats: {
        // Both counts include PRIVATE repos because the request is authenticated
        totalCommitsLastYear: contributionsCollection.totalCommitContributions,
        totalContributionsLastYear: contributionsCollection.contributionCalendar.totalContributions,
        privateContributions: contributionsCollection.restrictedContributionsCount,
        activeDays: days.filter((d) => d.contributionCount > 0).length,
      },
      calendar: days.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: d.contributionLevel,
      })),
    });
  } catch (err) {
    return json({ error: "Proxy failure", detail: String(err) }, 502);
  }
};
