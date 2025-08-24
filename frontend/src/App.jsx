import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
const BACKEND = 'http://localhost:4000';

export default function App() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND}/places`).then(r => r.json()).then(setPlaces);
    fetch(`${BACKEND}/banners`).then(r => r.json()).then(setBanners);
  }, []);

  useEffect(() => {
    const loader = new Loader({ apiKey: API_KEY, version: 'weekly' });
    loader.load().then(() => {
      const m = new google.maps.Map(mapRef.current, {
        center: { lat: 55.7558, lng: 37.6176 },
        zoom: 12,
        disableDefaultUI: false,
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });
      setMap(m);

      // add markers
      places.forEach(p => {
        new google.maps.Marker({
          position: { lat: p.lat, lng: p.lng },
          map: m,
          title: p.name,
        });
      });

      // geolocate button
      const locateBtn = document.createElement('button');
      locateBtn.textContent = 'Моё местоположение';
      locateBtn.className = 'locate-btn';
      m.controls[google.maps.ControlPosition.TOP_CENTER].push(locateBtn);
      locateBtn.addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition(pos => {
          const userPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          m.setCenter(userPos);
          new google.maps.Marker({ position: userPos, map: m, icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' });
        });
      });
    });
  }, [places]);

  return (
    <>
      <div ref={mapRef} style={{ height: '100vh' }} />
      {banners.map(b => (
        <a key={b.id} href={b.link} target="_blank" rel="noreferrer">
          <img
            src={`${BACKEND}${b.image}`}
            alt="banner"
            style={{
              position: 'fixed',
              bottom: 10,
              right: 10,
              width: 300,
              borderRadius: 8,
            }}
          />
        </a>
      ))}
      <a
        href="/admin"
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: '#fff',
          padding: '6px 10px',
          borderRadius: 4,
          textDecoration: 'none',
          color: '#000',
        }}
      >
        Админ
      </a>
    </>
  );
}
