'use client';

import { useState, useEffect } from 'react';
import { fetchCatalogItems } from '../lib/api';
import './catalog.css';

export default function Catalog() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadItems = async () => {
      setIsLoading(true);
      const data = await fetchCatalogItems({ searchTerm: search, category });
      if (isMounted) {
        setItems(data);
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(loadItems, 300);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [search, category]);

  return (
    <div className="catalog-container">
      <header className="catalog-header">
        <input 
          type="text" 
          placeholder="Search items..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="category-filter"
        >
          <option value="All">All Categories</option>
          <option value="Fashion">Fashion</option>
          <option value="Interior">Interior</option>
        </select>
      </header>

      {isLoading ? (
        <div className="loading">Loading items...</div>
      ) : (
        <div className="catalog-grid">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div className={`rarity-badge rarity-${item.rarity}`}>
                {item.rarity}
              </div>
              <img src={item.image_url} alt={item.name} className="item-image" loading="lazy" />
              <h3 className="item-name">{item.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
