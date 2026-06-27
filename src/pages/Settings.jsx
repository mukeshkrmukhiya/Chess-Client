import React, { useEffect, useState } from 'react';
import { Bell, Moon, Volume2 } from 'lucide-react';
import Card from '../components/ui/Card';
import PageShell from '../components/ui/PageShell';

const defaultSettings = {
  sound: true,
  reducedMotion: false,
  boardCoordinates: true
};

// Persists user-facing interface preferences in local storage.
const Settings = () => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const stored = localStorage.getItem('mukhiyaChessSettings');
    if (stored) setSettings({ ...defaultSettings, ...JSON.parse(stored) });
  }, []);

  const updateSetting = (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    localStorage.setItem('mukhiyaChessSettings', JSON.stringify(next));
  };

  const rows = [
    ['sound', 'Sound effects', 'Move sounds and game feedback.', Volume2],
    ['reducedMotion', 'Reduced motion', 'Tone down interface animation.', Moon],
    ['boardCoordinates', 'Board coordinates', 'Show rank and file context where supported.', Bell]
  ];

  return (
    <PageShell>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Settings</p>
        <h1 className="mt-3 text-4xl font-extrabold">Control your arena</h1>
      </div>
      <Card className="divide-y divide-[rgba(212,175,55,0.18)]">
        {rows.map(([key, title, description, Icon]) => (
          <div key={key} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <Icon className="h-6 w-6 text-[#D4AF37]" />
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm text-[#9CA3AF]">{description}</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting(key)}
              className={`h-8 w-14 rounded-full p-1 ${settings[key] ? 'bg-[#D4AF37]' : 'bg-white/10'}`}
              aria-pressed={settings[key]}
              aria-label={`Toggle ${title}`}
            >
              <span className={`block h-6 w-6 rounded-full bg-white shadow ${settings[key] ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        ))}
      </Card>
    </PageShell>
  );
};

export default Settings;
