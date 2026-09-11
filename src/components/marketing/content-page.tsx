import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import type { ContentPageData } from "@/lib/legal-data";

export function ContentPage({ data }: { data: ContentPageData }) {
  return (
    <div style={{ background: "hsl(var(--canvas))" }}>
      <Header />
      <div
        style={{
          padding: "56px clamp(20px, 8vw, 120px) 96px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 40,
            maxWidth: 720,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              className="eyebrow"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {data.eyebrow}
            </div>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(30px, 4vw, 40px)",
                lineHeight: 1.15,
                letterSpacing: "-0.018em",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {data.title}
            </h1>
            <span
              className="numeric"
              style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}
            >
              {data.updated}
            </span>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 16,
                lineHeight: 1.65,
                color: "hsl(var(--muted-foreground))",
              }}
            >
              {data.intro}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {data.sections.map((section) => (
              <div
                key={section.heading}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <h2
                  className="font-display"
                  style={{
                    fontSize: 21,
                    lineHeight: 1.3,
                    letterSpacing: "-0.010em",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {section.heading}
                </h2>
                {section.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    style={{ margin: 0, fontSize: 16, lineHeight: 1.65 }}
                  >
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul
                    style={{
                      margin: 0,
                      padding: "0 0 0 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {section.list.map((item, i) => (
                      <li key={i} style={{ fontSize: 15, lineHeight: 1.6 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
