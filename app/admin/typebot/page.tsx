"use client";
import { useState } from 'react';
import { FaBroom } from 'react-icons/fa';

const TABS = ['Sessions', 'Default Settings', '+Typebot'] as const;

type Tab = typeof TABS[number];

export default function TypebotPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('Sessions');

  // Sessions tab state
  const [search, setSearch] = useState('');
  // Default Settings tab state
  const [fallback, setFallback] = useState('');
  const [expire, setExpire] = useState(0);
  const [keywordFinish, setKeywordFinish] = useState('');
  const [defaultDelay, setDefaultDelay] = useState(0);
  const [unknownMsg, setUnknownMsg] = useState('');
  const [listening, setListening] = useState(false);
  const [stopBot, setStopBot] = useState(false);
  // +Typebot tab state
  const [enabled, setEnabled] = useState(false);
  const [description, setDescription] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [publicName, setPublicName] = useState('');
  const [triggerType, setTriggerType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [triggerOperator, setTriggerOperator] = useState('Contains');
  const [trigger, setTrigger] = useState('');
  const [typebotExpire, setTypebotExpire] = useState(0);
  const [typebotKeywordFinish, setTypebotKeywordFinish] = useState('');
  const [typebotDelay, setTypebotDelay] = useState(0);
  const [typebotUnknownMsg, setTypebotUnknownMsg] = useState('');
  const [typebotListening, setTypebotListening] = useState(false);
  const [typebotStopBot, setTypebotStopBot] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [debounceTime, setDebounceTime] = useState(0);

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6">Typebots</h2>
      <div className="flex gap-4 mb-8">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded font-bold border ${activeTab === tab ? 'bg-primary text-white' : 'bg-muted text-primary border-primary'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 'Sessions' && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Sessions</h3>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full mb-4"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for remoteJid..."
          />
          <div className="mb-2 font-semibold">RemoteJid | Push Name | Session ID | Status</div>
          <div className="text-muted-foreground">Nothing to show</div>
        </div>
      )}
      {activeTab === 'Default Settings' && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Default Settings</h3>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Typebot Fallback</label>
            <input type="text" className="border rounded px-3 py-2 w-full" value={fallback} onChange={e => setFallback(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Expire in minutes</label>
            <input type="number" className="border rounded px-3 py-2 w-full" value={expire} onChange={e => setExpire(Number(e.target.value))} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Keyword Finish</label>
            <input type="text" className="border rounded px-3 py-2 w-full" value={keywordFinish} onChange={e => setKeywordFinish(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Default Delay Message</label>
            <input type="number" className="border rounded px-3 py-2 w-full" value={defaultDelay} onChange={e => setDefaultDelay(Number(e.target.value))} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Unknown Message</label>
            <textarea className="border rounded px-3 py-2 w-full" value={unknownMsg} onChange={e => setUnknownMsg(e.target.value)} />
          </div>
          <div className="mb-4 flex gap-4">
            <button className={`px-4 py-2 rounded font-bold border ${listening ? 'bg-primary text-white' : 'bg-muted text-primary border-primary'}`} onClick={() => setListening(!listening)}>Listening from me</button>
            <button className={`px-4 py-2 rounded font-bold border ${stopBot ? 'bg-primary text-white' : 'bg-muted text-primary border-primary'}`} onClick={() => setStopBot(!stopBot)}>Stop bot from me</button>
          </div>
        </div>
      )}
      {activeTab === '+Typebot' && (
        <div>
          <h3 className="text-xl font-semibold mb-2">New Typebot</h3>
          <div className="mb-4 flex items-center gap-4">
            <label className="font-semibold">Enabled</label>
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Description*</label>
            <input type="text" className="border rounded px-3 py-2 w-full" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Typebot API URL*</label>
            <input type="text" className="border rounded px-3 py-2 w-full" value={apiUrl} onChange={e => setApiUrl(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Typebot Public Name</label>
            <input type="text" className="border rounded px-3 py-2 w-full" value={publicName} onChange={e => setPublicName(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Trigger Settings</label>
            <div className="flex gap-2 mb-2">
              <select className="border rounded px-3 py-2" value={triggerType} onChange={e => setTriggerType(e.target.value)}>
                <option value="">Select Trigger Type</option>
                <option value="all">All</option>
                <option value="keyword">Keyword</option>
                <option value="operator">Operator</option>
              </select>
              {triggerType !== 'all' && (
                <>
                  <input type="text" className="border rounded px-3 py-2" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Keyword" />
                  <select className="border rounded px-3 py-2" value={triggerOperator} onChange={e => setTriggerOperator(e.target.value)}>
                    <option value="Contains">Contains</option>
                    <option value="Equals">Equals</option>
                  </select>
                  <input type="text" className="border rounded px-3 py-2" value={trigger} onChange={e => setTrigger(e.target.value)} placeholder="Trigger" />
                </>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">General Settings</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs">Expire in minutes</label>
                <input type="number" className="border rounded px-3 py-2 w-full" value={typebotExpire} onChange={e => setTypebotExpire(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs">Keyword Finish</label>
                <input type="text" className="border rounded px-3 py-2 w-full" value={typebotKeywordFinish} onChange={e => setTypebotKeywordFinish(e.target.value)} />
              </div>
              <div>
                <label className="text-xs">Default Delay Message</label>
                <input type="number" className="border rounded px-3 py-2 w-full" value={typebotDelay} onChange={e => setTypebotDelay(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs">Unknown Message</label>
                <input type="text" className="border rounded px-3 py-2 w-full" value={typebotUnknownMsg} onChange={e => setTypebotUnknownMsg(e.target.value)} />
              </div>
              <div>
                <label className="text-xs">Debounce Time</label>
                <input type="number" className="border rounded px-3 py-2 w-full" value={debounceTime} onChange={e => setDebounceTime(Number(e.target.value))} />
              </div>
            </div>
            <div className="mb-2 flex gap-2">
              <button className={`px-4 py-2 rounded font-bold border ${typebotListening ? 'bg-primary text-white' : 'bg-muted text-primary border-primary'}`} onClick={() => setTypebotListening(!typebotListening)}>Listening from me</button>
              <button className={`px-4 py-2 rounded font-bold border ${typebotStopBot ? 'bg-primary text-white' : 'bg-muted text-primary border-primary'}`} onClick={() => setTypebotStopBot(!typebotStopBot)}>Stop bot from me</button>
              <button className={`px-4 py-2 rounded font-bold border ${keepOpen ? 'bg-primary text-white' : 'bg-muted text-primary border-primary'}`} onClick={() => setKeepOpen(!keepOpen)}>Keep open</button>
            </div>
          </div>
          <button className="bg-primary text-white px-6 py-2 rounded font-bold w-full mt-4">Save</button>
        </div>
      )}
      {activeTab !== 'Sessions' && activeTab !== 'Default Settings' && activeTab !== '+Typebot' && (
        <div className="text-muted-foreground">Nothing to show</div>
      )}
    </div>
  );
}
