import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, Banknote, Check, ChevronRight, Globe2, Search } from "lucide-react";
import "./styles.css";

const DATA = [
  {
    continent: "Asien",
    countries: [
      {
        name: "Pakistan",
        flag: "🇵🇰",
        currency: "Pakistanische Rupie",
        series: [
          { name: "Alte Serie", notes: ["1", "2", "5", "10", "50", "100", "500", "1.000"] },
          { name: "Aktuelle Serie", notes: ["10", "20", "50", "100", "500", "1.000", "5.000"] }
        ]
      },
      {
        name: "Indien",
        flag: "🇮🇳",
        currency: "Indische Rupie",
        series: [
          { name: "Lion Capital Series", notes: ["1", "2", "5", "10", "20", "50", "100", "500"] },
          { name: "Mahatma Gandhi Series", notes: ["5", "10", "20", "50", "100", "500", "1.000"] }
        ]
      },
      {
        name: "Nepal",
        flag: "🇳🇵",
        currency: "Nepalesische Rupie",
        series: [
          { name: "King Birendra Series", notes: ["1", "2", "5", "10", "20", "50", "100", "500", "1.000"] },
          { name: "Everest / aktuelle Serie", notes: ["5", "10", "20", "50", "100", "500", "1.000"] }
        ]
      },
      {
        name: "Thailand",
        flag: "🇹🇭",
        currency: "Baht",
        series: [
          { name: "Serie 1985–1996", notes: ["10", "20", "50", "100", "500", "1.000"] },
          { name: "Serie 2003–2018", notes: ["20", "50", "100", "500", "1.000"] }
        ]
      }
    ]
  },
  {
    continent: "Europa",
    countries: [
      {
        name: "Albanien",
        flag: "🇦🇱",
        currency: "Lek",
        series: [
          { name: "Sozialistische Serie", notes: ["1", "3", "5", "10", "25", "50", "100"] },
          { name: "Aktuelle Serie", notes: ["200", "500", "1.000", "2.000", "5.000", "10.000"] }
        ]
      },
      {
        name: "Malta",
        flag: "🇲🇹",
        currency: "Maltesische Lira",
        series: [
          { name: "Serie 1967", notes: ["10 Shillings", "1 Pound", "5 Pounds"] },
          { name: "Serie 1973", notes: ["1 Lira", "5 Lira", "10 Lira"] },
          { name: "Serie 1989/1994", notes: ["2 Lira", "5 Lira", "10 Lira", "20 Lira"] }
        ]
      }
    ]
  },
  {
    continent: "Afrika",
    countries: [
      {
        name: "Mauritius",
        flag: "🇲🇺",
        currency: "Mauritius-Rupie",
        series: [
          { name: "Serie 1985", notes: ["25", "50", "100", "200", "500", "1.000"] },
          { name: "Serie 1999 / aktuell", notes: ["25", "50", "100", "200", "500", "1.000", "2.000"] }
        ]
      }
    ]
  }
];

function keyFor(country, series, value) {
  return `${country}__${series}__${value}`;
}

function loadOwned() {
  try {
    return JSON.parse(localStorage.getItem("banknote-owned") || "{}");
  } catch {
    return {};
  }
}

function App() {
  const [owned, setOwned] = useState(loadOwned);
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [query, setQuery] = useState("");

  const allCountries = DATA.flatMap((c) => c.countries);
  const totalNotes = allCountries.reduce(
    (sum, country) => sum + country.series.reduce((s, series) => s + series.notes.length, 0),
    0
  );
  const ownedCount = Object.values(owned).filter(Boolean).length;

  function toggleNote(country, series, value) {
    const key = keyFor(country, series, value);
    const next = { ...owned, [key]: !owned[key] };
    setOwned(next);
    localStorage.setItem("banknote-owned", JSON.stringify(next));
  }

  function countryProgress(country) {
    const keys = country.series.flatMap((series) =>
      series.notes.map((value) => keyFor(country.name, series.name, value))
    );
    const count = keys.filter((key) => owned[key]).length;
    return { count, total: keys.length, percent: keys.length ? Math.round((count / keys.length) * 100) : 0 };
  }

  const filteredCountries = useMemo(() => {
    const source = selectedContinent
      ? DATA.find((item) => item.continent === selectedContinent)?.countries || []
      : allCountries;
    const normalized = query.trim().toLowerCase();
    if (!normalized) return source;
    return source.filter((country) => country.name.toLowerCase().includes(normalized));
  }, [selectedContinent, query]);

  if (selectedCountry) {
    const country = allCountries.find((item) => item.name === selectedCountry);
    const progress = countryProgress(country);
    return (
      <main className="app-shell">
        <header className="topbar">
          <button className="icon-button" onClick={() => setSelectedCountry(null)} aria-label="Zurück">
            <ArrowLeft size={21} />
          </button>
          <div>
            <div className="eyebrow">{country.currency}</div>
            <h1>{country.flag} {country.name}</h1>
          </div>
        </header>

        <section className="hero compact">
          <div>
            <span className="hero-label">Sammlungsfortschritt</span>
            <strong>{progress.count} / {progress.total}</strong>
          </div>
          <div className="ring" style={{ "--progress": `${progress.percent * 3.6}deg` }}>
            <span>{progress.percent}%</span>
          </div>
        </section>

        <section className="series-list">
          {country.series.map((series) => (
            <article className="series-card" key={series.name}>
              <div className="series-heading">
                <div>
                  <span className="eyebrow">Serie</span>
                  <h2>{series.name}</h2>
                </div>
                <span className="series-count">
                  {series.notes.filter((value) => owned[keyFor(country.name, series.name, value)]).length}/{series.notes.length}
                </span>
              </div>
              <div className="note-grid">
                {series.notes.map((value) => {
                  const active = !!owned[keyFor(country.name, series.name, value)];
                  return (
                    <button
                      className={`note-button ${active ? "active" : ""}`}
                      key={value}
                      onClick={() => toggleNote(country.name, series.name, value)}
                    >
                      <span className="check-box">{active && <Check size={15} strokeWidth={3} />}</span>
                      <span>{value}</span>
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="brand-row">
        <div className="brand-mark"><Banknote size={25} /></div>
        <div>
          <div className="eyebrow">Meine Sammlung</div>
          <h1>World Banknote Collection</h1>
        </div>
      </header>

      <section className="hero">
        <div>
          <span className="hero-label">Gesammelt</span>
          <strong>{ownedCount}</strong>
          <span>von {totalNotes} Banknoten</span>
        </div>
        <div className="ring large" style={{ "--progress": `${totalNotes ? (ownedCount / totalNotes) * 360 : 0}deg` }}>
          <span>{totalNotes ? Math.round((ownedCount / totalNotes) * 100) : 0}%</span>
        </div>
      </section>

      <div className="search">
        <Search size={19} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Land suchen" />
      </div>

      <nav className="continent-tabs">
        <button className={!selectedContinent ? "active" : ""} onClick={() => setSelectedContinent(null)}>Alle</button>
        {DATA.map((item) => (
          <button
            className={selectedContinent === item.continent ? "active" : ""}
            key={item.continent}
            onClick={() => setSelectedContinent(item.continent)}
          >
            {item.continent}
          </button>
        ))}
      </nav>

      <section className="country-list">
        {filteredCountries.map((country) => {
          const progress = countryProgress(country);
          return (
            <button className="country-card" key={country.name} onClick={() => setSelectedCountry(country.name)}>
              <span className="flag">{country.flag}</span>
              <span className="country-main">
                <strong>{country.name}</strong>
                <span>{progress.count} von {progress.total} gesammelt</span>
                <span className="progress-track"><span style={{ width: `${progress.percent}%` }} /></span>
              </span>
              <span className="percent">{progress.percent}%</span>
              <ChevronRight size={19} />
            </button>
          );
        })}
      </section>

      <footer>
        <Globe2 size={17} />
        Erste funktionsfähige Version · Daten werden in diesem Browser gespeichert
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
