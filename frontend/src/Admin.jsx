import React, { useState } from 'react';

const BACKEND = 'http://localhost:4000';
const TOKEN = prompt('Введи ADMIN_TOKEN:');

export default function Admin() {
  const [form, setForm] = useState({ name: '', lat: '', lng: '', type: '', address: '', description: '' });
  const [banner, setBanner] = useState({ link: '' });

  const submitPlace = async e => {
    e.preventDefault();
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    await fetch(`${BACKEND}/places`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      body,
    });
    alert('Добавлено!');
  };

  const submitBanner = async e => {
    e.preventDefault();
    const body = new FormData();
    body.append('link', banner.link);
    body.append('image', banner.image);
    await fetch(`${BACKEND}/banners`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      body,
    });
    alert('Баннер добавлен!');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Добавить место</h2>
      <form onSubmit={submitPlace}>
        <input placeholder="Название" onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Широта" onChange={e => setForm({ ...form, lat: e.target.value })} required />
        <input placeholder="Долгота" onChange={e => setForm({ ...form, lng: e.target.value })} required />
        <input placeholder="Тип спорта" onChange={e => setForm({ ...form, type: e.target.value })} required />
        <input placeholder="Адрес" onChange={e => setForm({ ...form, address: e.target.value })} required />
        <textarea placeholder="Описание" onChange={e => setForm({ ...form, description: e.target.value })} required />
        <input type="file" name="image" />
        <button type="submit">Сохранить</button>
      </form>

      <h2>Добавить баннер</h2>
      <form onSubmit={submitBanner}>
        <input placeholder="Ссылка" onChange={e => setBanner({ ...banner, link: e.target.value })} required />
        <input type="file" onChange={e => setBanner({ ...banner, image: e.target.files[0] })} required />
        <button type="submit">Загрузить</button>
      </form>
    </div>
  );
}
