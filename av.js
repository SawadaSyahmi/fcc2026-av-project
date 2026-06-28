/* global supabase */
(() => {
  const cfg = window.FCC2026_CONFIG;
  const sb = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  const el = {
    overlay: document.getElementById('avOverlay'),
    title: document.getElementById('avTitle'),
    status: document.getElementById('avStatus'),
    enableBtn: document.getElementById('enableBtn'),
    connectionState: document.getElementById('connectionState'),
    avSession: document.getElementById('avSession'),
    lastCommand: document.getElementById('lastCommand'),
    video: document.getElementById('initVideo'),
    videoSource: document.getElementById('videoSource')
  };

  el.avSession.textContent = cfg.SESSION_ID;
  el.videoSource.src = cfg.VIDEO_PATH;
  el.video.load();

  let avEnabled = false;
  let lastPlayedCommandId = null;

  function setStatus(title, text) {
    el.title.textContent = title;
    el.status.textContent = text;
  }

  function speak(text) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      // Speech synthesis is optional.
    }
  }

  async function playInitiation(commandId) {
    if (commandId && lastPlayedCommandId === commandId) return;
    lastPlayedCommandId = commandId;

    if (!avEnabled) {
      setStatus('Command Received', 'Click Enable AV Audio / Video first, then use Manual Initiate again from stage.');
      return;
    }

    el.lastCommand.textContent = 'PLAY_INIT_VIDEO';
    setStatus('Initiating FCC2026', 'AI voice accepted. Playing initiation video now.');
    speak(cfg.AV_VOICE_TEXT);

    setTimeout(async () => {
      try {
        el.overlay.classList.add('hidden-soft');
        el.video.currentTime = 0;
        el.video.muted = false;
        await el.video.play();
      } catch (err) {
        el.overlay.classList.remove('hidden-soft');
        setStatus('Playback Blocked', 'Browser blocked playback. Click Enable AV Audio / Video and try again.');
      }
    }, 1600);
  }

  function resetAv() {
    window.speechSynthesis?.cancel?.();
    el.video.pause();
    el.video.currentTime = 0;
    el.overlay.classList.remove('hidden-soft');
    el.lastCommand.textContent = 'RESET';
    setStatus('AV Receiver Standby', 'Reset received. Waiting for the next stage command.');
  }

  function handleCommand(row) {
    if (!row || row.session_id !== cfg.SESSION_ID) return;
    el.lastCommand.textContent = row.action || 'UNKNOWN';

    if (row.action === 'PLAY_INIT_VIDEO' && row.safety_status === 'ALLOWED') {
      playInitiation(row.id);
      return;
    }
    if (row.action === 'RESET') {
      resetAv();
      return;
    }
    if (row.action === 'ARM') {
      setStatus('AI Armed', 'The stage has armed the AI. Waiting for the voice command.');
      return;
    }
    if (row.action === 'LISTENING') {
      setStatus('Stage Listening', 'Stage AI is listening for the approved phrase.');
      return;
    }
    if (row.action === 'IGNORED') {
      setStatus('Command Ignored', 'Safety gate rejected a non-approved phrase. Waiting safely.');
    }
  }

  async function enableAv() {
    avEnabled = true;
    el.enableBtn.textContent = 'AV Enabled';
    el.enableBtn.disabled = true;
    setStatus('AV Receiver Standby', 'Audio/video enabled. Waiting for stage command.');

    try {
      // Prime the browser video/audio permission in a user gesture.
      el.video.muted = true;
      await el.video.play();
      el.video.pause();
      el.video.currentTime = 0;
      el.video.muted = false;
    } catch (_) {
      // Some browsers still block the priming attempt; the real play will report if blocked.
    }
  }

  async function fetchLatestState() {
    const { data, error } = await sb
      .from('fcc2026_gimmick_state')
      .select('*')
      .eq('session_id', cfg.SESSION_ID)
      .maybeSingle();
    if (error) return;
    if (!data) return;
    if (data.active_command_id && data.status === 'initiated') {
      playInitiation(data.active_command_id);
    }
  }

  function subscribe() {
    if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('YOUR-PROJECT')) {
      el.connectionState.textContent = 'Config needed';
      setStatus('Configuration Needed', 'Please update config.js with Supabase URL and anon key.');
      return;
    }

    sb.channel(`fcc2026-av-${cfg.SESSION_ID}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'fcc2026_gimmick_commands',
        filter: `session_id=eq.${cfg.SESSION_ID}`
      }, payload => handleCommand(payload.new))
      .subscribe(status => {
        el.connectionState.textContent = status;
      });

    setInterval(fetchLatestState, 3000);
  }

  el.enableBtn.addEventListener('click', enableAv);
  subscribe();
})();
