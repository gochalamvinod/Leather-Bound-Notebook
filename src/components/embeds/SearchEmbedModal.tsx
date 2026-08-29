import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api/client';
import { SearchResultItem } from '../../types/api';

export interface SearchEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmbedLive?: (url: string) => void;
  onEmbedCard?: (url: string) => void;
  onInsertLiveEmbed?: (url: string) => void;
  onInsertLinkCard?: (url: string) => void;
}

interface QuickChip {
  label: string;
  url: string;
}

const QUICK_CHIPS: QuickChip[] = [
  { label: 'YouTube', url: 'https://youtube.com' },
  { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Random' },
  { label: 'TradingView', url: 'https://www.tradingview.com/chart/' },
  { label: 'Hacker News', url: 'https://news.ycombinator.com' },
  { label: 'Google', url: 'https://google.com' },
];

export const SearchEmbedModal: React.FC<SearchEmbedModalProps> = ({
  isOpen,
  onClose,
  onEmbedLive,
  onEmbedCard,
  onInsertLiveEmbed,
  onInsertLinkCard,
}) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResultItem[] | null>(null);
  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerEmbedLive = (url: string) => {
    (onEmbedLive || onInsertLiveEmbed)?.(url);
    onClose();
  };

  const triggerEmbedCard = (url: string) => {
    (onEmbedCard || onInsertLinkCard)?.(url);
    onClose();
  };

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(null);
      setSearchedQuery('');
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChipClick = (url: string) => {
    triggerEmbedLive(url);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // Direct URL entry -> immediately embed live website
    if (/^https?:\/\//i.test(trimmed)) {
      triggerEmbedLive(trimmed);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchedQuery(trimmed);

    try {
      const res = await api.searchWeb(trimmed);
      if (res && res.ok && Array.isArray(res.results)) {
        setResults(res.results);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Search request failed. Please check network.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmbedDirectSearch = () => {
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(searchedQuery)}`;
    triggerEmbedLive(searchUrl);
  };

  return (
    <div id="searchModal" className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="searchModalTitle">
      <div id="searchBackdrop" className="modal-backdrop" onClick={onClose} />

      <div className="modal-card search-modal-card search-card" style={{ maxWidth: '640px', width: '92vw' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 id="searchModalTitle" className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔍</span> Web Search & Live Embed
          </h2>
          <button
            type="button"
            id="closeSearchModalBtn"
            className="modal-close-btn"
            onClick={onClose}
            title="Close modal"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Quick Embed Chips */}
        <div className="quick-chips-row search-quick-links" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px', fontSize: '0.82rem' }}>
          <span className="quick-label" style={{ color: 'var(--brass)', fontWeight: 500 }}>Quick Embed:</span>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              className="quick-chip"
              data-url={chip.url}
              onClick={() => handleChipClick(chip.url)}
              title={`Embed ${chip.label}`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search Query Form */}
        <form id="searchForm" className="search-form" onSubmit={handleSearchSubmit} style={{ marginTop: '16px' }}>
          <div className="search-input-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              ref={inputRef}
              id="searchQueryInput"
              type="text"
              className="brass-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search DuckDuckGo or paste URL..."
              style={{ flex: 1, height: '36px', fontSize: '0.9rem' }}
            />
            <button type="submit" className="brass-btn" style={{ height: '36px', padding: '0 16px' }}>
              Search
            </button>
            <button
              type="button"
              id="cancelSearchModalBtn"
              className="brass-btn ghost cancel-btn"
              onClick={onClose}
              style={{ height: '36px', padding: '0 14px' }}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Search Results Area */}
        {(loading || results !== null || error) && (
          <div id="searchResultsWrapper" className="search-results-wrapper" style={{ marginTop: '18px', borderTop: '1px solid rgba(184, 147, 90, 0.2)', paddingTop: '14px' }}>
            <div className="search-results-header" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brass-bright)', marginBottom: '10px' }}>
              Search Results
            </div>

            {loading && (
              <div style={{ color: 'var(--brass)', padding: '10px' }}>
                Searching web...
              </div>
            )}

            {error && (
              <div style={{ color: 'var(--danger-bright)', padding: '10px' }}>
                {error}
              </div>
            )}

            {!loading && !error && results && results.length > 0 && (
              <div id="searchResultsList" className="search-results-list">
                {results.map((item, index) => (
                  <div key={`${item.url}-${index}`} className="search-result-item">
                    <div className="search-result-title">{item.title}</div>
                    <div className="search-result-snippet">{item.snippet || item.url}</div>
                    <div className="search-result-actions">
                      <button
                        type="button"
                        className="search-action-btn btn-embed-live"
                        data-url={item.url}
                        onClick={() => triggerEmbedLive(item.url)}
                      >
                        🌐 Embed Live Web
                      </button>
                      <button
                        type="button"
                        className="search-action-btn btn-embed-preview"
                        data-url={item.url}
                        onClick={() => triggerEmbedCard(item.url)}
                      >
                        📰 Embed Preview
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="search-action-btn"
                      >
                        ↗ Open
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && results && results.length === 0 && (
              <div style={{ padding: '12px', color: 'var(--paper)' }}>
                No direct instant answers found.
                <button
                  type="button"
                  id="embedDirectSearchBtn"
                  className="brass-btn"
                  style={{ marginTop: '8px', display: 'block' }}
                  onClick={handleEmbedDirectSearch}
                >
                  Embed Search for "{searchedQuery}"
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchEmbedModal;
