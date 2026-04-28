'use client'

import { useEffect, useMemo, useState } from 'react'

type HistoryEntry = {
  id: string
  prompt: string
  style: string
  lengthSeconds: number
  audioUrl: string | null
  message: string
  createdAt: string
}

type DatasetInfo = {
  name: string
  description: string
  sourceUrl: string
}

const STORAGE_KEY = 'ngoma-prompt-history'
const PRESETS = [
  {
    label: 'Kora house groove',
    prompt: 'Generate an Afro-house loop with kora, djembe, and ambient bass',
  },
  {
    label: 'Mbira ambience',
    prompt: 'Create a peaceful mbira and kalimba texture with soft percussion',
  },
  {
    label: 'Amapiano drum line',
    prompt: 'Produce an amapiano rhythm with log drums, shakers, and sub bass',
  },
]

export default function HomePage() {
  const [prompt, setPrompt] = useState('Generate an Afro-house loop with kora, djembe, and warm bass')
  const [style, setStyle] = useState('afro-house')
  const [lengthSeconds, setLengthSeconds] = useState(20)
  const [status, setStatus] = useState('Ready')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [datasets, setDatasets] = useState<DatasetInfo[]>([])
  const [sampleInstruments, setSampleInstruments] = useState<string[]>([])
  const [sampleStyles, setSampleStyles] = useState<string[]>([])
  const [datasetStatus, setDatasetStatus] = useState('Dataset loader ready.')
  const [datasetLoading, setDatasetLoading] = useState(false)

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as HistoryEntry[]
      setHistory(parsed)
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  }, [history])

  useEffect(() => {
    async function fetchDatasets() {
      try {
        const response = await fetch(`${apiBase}/api/datasets`)
        if (!response.ok) {
          throw new Error(`Dataset fetch failed: ${response.status}`)
        }

        const data = await response.json()
        setDatasets(data.datasets)
        setSampleInstruments(data.sampleInstruments)
        setSampleStyles(data.sampleStyles)
      } catch (error) {
        console.error('Failed to load datasets:', error)
        setDatasetStatus('Unable to load datasets from backend.')
      }
    }

    fetchDatasets()
  }, [apiBase])

  const recentPrompts = useMemo(
    () => [...new Set(history.map((entry) => entry.prompt))].slice(0, 4),
    [history],
  )

  async function handleGenerate(promptOverride?: string) {
    const promptToSend = promptOverride ?? prompt
    setPrompt(promptToSend)
    setStatus('Sending generation request...')
    setAudioUrl(null)

    try {
      const response = await fetch(`${apiBase}/api/generate`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToSend, style, length_seconds: lengthSeconds }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      setStatus(result.message)

      const resolvedAudioUrl = result.audioUrl
        ? result.audioUrl.startsWith('/')
          ? `${apiBase}${result.audioUrl}`
          : result.audioUrl
        : null

      setAudioUrl(resolvedAudioUrl)

      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        prompt: promptToSend,
        style,
        lengthSeconds,
        audioUrl: resolvedAudioUrl,
        message: result.message,
        createdAt: new Date().toISOString(),
      }

      setHistory((prev) => [entry, ...prev].slice(0, 10))
    } catch (error) {
      setStatus(`Generation failed: ${error instanceof Error ? error.message : 'unknown error'}`)
      console.error(error)
    }
  }

  async function handleLoadDataset(name: string) {
    setDatasetLoading(true)
    setDatasetStatus(`Loading ${name}...`)

    try {
      const response = await fetch(`${apiBase}/api/datasets/load`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset: name }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to load dataset: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      setDatasetStatus(result.message)
    } catch (error) {
      setDatasetStatus(`Load failed: ${error instanceof Error ? error.message : 'unknown error'}`)
      console.error(error)
    } finally {
      setDatasetLoading(false)
    }
  }

  function handleSelectHistory(entry: HistoryEntry) {
    setPrompt(entry.prompt)
    setStyle(entry.style)
    setLengthSeconds(entry.lengthSeconds)
    setAudioUrl(entry.audioUrl)
    setStatus(`Loaded history item from ${new Date(entry.createdAt).toLocaleString()}`)
  }

  return (
    <main className="container">
      <section className="hero">
        <img src="/music-note.svg" alt="Ngoma House logo" className="heroLogo" />
        <h1>Ngoma House</h1>
        <p>Prompt and replay your generated house music with a modern history panel.</p>
      </section>

      <div className="workspace">
        <section className="card promptCard">
          <div className="sectionHeader">
            <div>
              <h2>Compose your prompt</h2>
              <p>Use presets, customize the length, and generate African instrument house audio quickly.</p>
            </div>
          </div>

          <label htmlFor="prompt">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={6}
          />

          <div className="controlsRow">
            <div className="fieldGroup">
              <label htmlFor="style">Style</label>
              <select id="style" value={style} onChange={(event) => setStyle(event.target.value)}>
                <option value="afro-house">Afro House</option>
                <option value="afrobeat">Afrobeat</option>
                <option value="amapiano">Amapiano</option>
              </select>
            </div>

            <div className="fieldGroup stretch">
              <label htmlFor="length">Length: {lengthSeconds}s</label>
              <input
                id="length"
                type="range"
                min="6"
                max="60"
                value={lengthSeconds}
                onChange={(event) => setLengthSeconds(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="presetsRow">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="presetButton"
                onClick={() => setPrompt(preset.prompt)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="datasetSection">
            <div className="sectionHeader">
              <div>
                <h3>Dataset sources</h3>
                <p>Load a dataset stub for future African instrument model integration.</p>
              </div>
            </div>

            <div className="datasetGrid">
              {datasets.map((dataset) => (
                <article key={dataset.name} className="datasetCard">
                  <div>
                    <strong>{dataset.name}</strong>
                    <p>{dataset.description}</p>
                    <a href={dataset.sourceUrl} target="_blank" rel="noreferrer">
                      Source
                    </a>
                  </div>
                  <button
                    className="datasetButton"
                    type="button"
                    onClick={() => handleLoadDataset(dataset.name)}
                    disabled={datasetLoading}
                  >
                    {datasetLoading ? 'Loading...' : 'Load'}
                  </button>
                </article>
              ))}
            </div>

            <div className="tagList">
              {sampleInstruments.map((instrument) => (
                <span key={instrument} className="tagItem">
                  {instrument}
                </span>
              ))}
              {sampleStyles.map((styleTag) => (
                <span key={styleTag} className="tagItem">
                  {styleTag}
                </span>
              ))}
            </div>

            <p className="hint">{datasetStatus}</p>
          </div>

          <button className="generateButton" onClick={() => handleGenerate()}>
            Generate music
          </button>

          <p className="status">Status: {status}</p>

          <div className="audioPanel">
            {audioUrl ? (
              <audio controls src={audioUrl} />
            ) : (
              <p className="hint">Generated audio will appear here once the backend returns a URL. Use African instruments only.</p>
            )}
          </div>
        </section>

        <aside className="card historyCard">
          <div className="sectionHeader">
            <div>
              <h2>History</h2>
              <p>Recent prompts and generated tracks are stored locally.</p>
            </div>
          </div>

          {history.length === 0 ? (
            <p className="hint">No history yet. Generate audio to build your session history.</p>
          ) : (
            <div className="historyList">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="historyItem"
                  onClick={() => handleSelectHistory(entry)}
                >
                  <div>
                    <strong>{entry.prompt}</strong>
                    <span>{entry.style} · {entry.lengthSeconds}s</span>
                  </div>
                  <small>{new Date(entry.createdAt).toLocaleString()}</small>
                </button>
              ))}
            </div>
          )}

          {recentPrompts.length > 0 && (
            <div>
              <h3>Recent prompts</h3>
              <div className="recentTags">
                {recentPrompts.map((text) => (
                  <button key={text} type="button" className="tagButton" onClick={() => setPrompt(text)}>
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
