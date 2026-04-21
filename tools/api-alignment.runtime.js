(function bootstrapApiAlignment() {
  const config = window.API_ALIGNMENT_CONFIG;
  if (!config || !config.data || !Array.isArray(config.data.parts)) {
    throw new Error('API alignment config is missing `data.parts`.');
  }

  const DATA = config.data;
  const STORAGE_KEY = config.storageKey || 'apiAlignmentDecisions.v1';
  const state = {
    activePartId: DATA.parts[0]?.id,
    decisions: loadDecisions(),
    notes: loadNotes(),
  };

  document.getElementById('pageTitle').textContent = config.title || 'API Alignment';
  document.title = config.title || 'API Alignment';
  document.getElementById('pageSubtitle').textContent = config.subtitle || 'takeoff-ui is the source of truth. Review each row, decide per layer, export markdown.';

  function loadDecisions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed.decisions || {};
    } catch {
      return {};
    }
  }

  function loadNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed.notes || {};
    } catch {
      return {};
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions: state.decisions, notes: state.notes }));
    } catch {
      // ignore
    }
  }

  function getDecision(partId, propId, layer) {
    return state.decisions[`${partId}.${propId}.${layer}`];
  }

  function setDecision(partId, propId, layer, patch) {
    const key = `${partId}.${propId}.${layer}`;
    const current = state.decisions[key] || {};
    state.decisions[key] = { ...current, ...patch };
    persist();
  }

  function getNote(partId, propId) {
    return state.notes[`${partId}.${propId}`] || '';
  }

  function setNote(partId, propId, value) {
    const key = `${partId}.${propId}`;
    if (value) {
      state.notes[key] = value;
    } else {
      delete state.notes[key];
    }
    persist();
  }

  function effectiveStatus(partId, prop, layer) {
    const decision = getDecision(partId, prop.id, layer);
    if (decision?.status) return decision.status;
    return prop[layer] ? 'keep' : 'skip';
  }

  function effectiveRename(partId, prop, layer) {
    const decision = getDecision(partId, prop.id, layer);
    return decision?.newName || '';
  }

  function render() {
    renderTabs();
    renderMain();
  }

  function renderTabs() {
    const tabs = document.getElementById('tabs');
    tabs.innerHTML = '';
    DATA.parts.forEach(part => {
      const btn = document.createElement('button');
      btn.textContent = part.label;
      if (part.id === state.activePartId) btn.classList.add('active');
      btn.addEventListener('click', () => {
        state.activePartId = part.id;
        render();
      });
      tabs.appendChild(btn);
    });
  }

  function renderMain() {
    const main = document.getElementById('main');
    main.innerHTML = '';

    DATA.parts.forEach(part => {
      const section = document.createElement('section');
      section.className = 'part-view';
      if (part.id === state.activePartId) section.classList.add('active');
      section.innerHTML = `
        <h2>${escapeHtml(part.label)}</h2>
        <p class="part-desc">${escapeHtml(part.description || '')}</p>
      `;
      section.appendChild(renderTable(part));
      main.appendChild(section);
    });
  }

  function renderTable(part) {
    const table = document.createElement('table');
    table.className = 'api-grid';
    table.innerHTML = `
      <thead>
        <tr>
          <th class="concept-col">Concept</th>
          <th class="layer-col">takeoff-ui</th>
          <th class="layer-col">spar</th>
          <th class="layer-col">react-spar</th>
          <th class="notes-col">Notes</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    part.props.forEach(prop => {
      tbody.appendChild(renderRow(part, prop));
    });

    return table;
  }

  function renderRow(part, prop) {
    const tr = document.createElement('tr');
    const sparStatus = effectiveStatus(part.id, prop, 'spar');
    const reactSparStatus = effectiveStatus(part.id, prop, 'reactSpar');

    if (sparStatus === 'drop' || reactSparStatus === 'drop') {
      tr.classList.add('status-drop');
    }

    tr.innerHTML = `
      <td>
        <div class="concept-name">${escapeHtml(prop.concept)}</div>
        ${prop.note ? `<div class="concept-note">${escapeHtml(prop.note)}</div>` : ''}
      </td>
    `;

    tr.appendChild(renderLayerCell('takeoff', part, prop));
    tr.appendChild(renderLayerCell('spar', part, prop));
    tr.appendChild(renderLayerCell('reactSpar', part, prop));

    const notesTd = document.createElement('td');
    const notesInput = document.createElement('textarea');
    notesInput.className = 'notes-input';
    notesInput.rows = 1;
    notesInput.value = getNote(part.id, prop.id);
    notesInput.addEventListener('input', event => {
      setNote(part.id, prop.id, event.target.value);
    });
    notesTd.appendChild(notesInput);
    tr.appendChild(notesTd);

    return tr;
  }

  function renderLayerCell(layer, part, prop) {
    const td = document.createElement('td');
    const current = prop[layer === 'takeoff' ? 'takeoffUi' : layer];
    const isReference = layer === 'takeoff';
    const wrapper = document.createElement('div');
    wrapper.className = 'layer-cell';

    if (isReference) {
      wrapper.classList.add('takeoff-ref');
    }

    if (current) {
      wrapper.innerHTML = `
        <div class="current-name">${escapeHtml(current.name)}</div>
        <div class="current-type">${escapeHtml(current.type)}</div>
        ${current.default ? `<div class="current-default">default: ${escapeHtml(current.default)}</div>` : ''}
        ${current.note ? `<div class="concept-note">${escapeHtml(current.note)}</div>` : ''}
      `;
    } else {
      wrapper.innerHTML = '<div class="current-absent">—</div>';
    }

    td.appendChild(wrapper);
    if (isReference) return td;

    td.appendChild(renderLayerControls(layer, part, prop, wrapper));
    return td;
  }

  function renderLayerControls(layer, part, prop, currentDisplay) {
    const wrap = document.createElement('div');
    wrap.className = 'layer-controls';
    const hasCurrent = !!prop[layer];
    const statuses = hasCurrent ? ['keep', 'rename', 'drop'] : ['skip', 'add'];
    const currentStatus = effectiveStatus(part.id, prop, layer);

    const pills = document.createElement('div');
    pills.className = 'status-pills';

    statuses.forEach(status => {
      const btn = document.createElement('button');
      btn.textContent = status;
      btn.classList.add(status);
      if (status === currentStatus) btn.classList.add('active');
      btn.addEventListener('click', () => {
        setDecision(part.id, prop.id, layer, { status });
        if (status !== 'rename' && status !== 'add') {
          setDecision(part.id, prop.id, layer, { newName: '' });
        }
        render();
      });
      pills.appendChild(btn);
    });

    wrap.appendChild(pills);

    if (currentStatus === 'rename' || currentStatus === 'add') {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'rename-input';
      input.placeholder = currentStatus === 'rename' ? `new name for ${layer}` : `proposed name for ${layer}`;
      input.value = effectiveRename(part.id, prop, layer);
      input.addEventListener('input', event => {
        setDecision(part.id, prop.id, layer, { newName: event.target.value });
      });
      wrap.appendChild(input);
    }

    if (currentStatus === 'drop') {
      currentDisplay.classList.add('current-strike');
    }

    return wrap;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  }

  function escapePipe(str) {
    return String(str || '').replaceAll('|', '\\|');
  }

  function formatRef(entry) {
    if (!entry) return '—';
    const parts = [`\`${entry.name}\``];
    if (entry.type) parts.push(`<br>\`${escapePipe(entry.type)}\``);
    if (entry.default) parts.push(`<br>default \`${escapePipe(entry.default)}\``);
    return parts.join('');
  }

  function formatDecision(partId, prop, layer) {
    const status = effectiveStatus(partId, prop, layer);
    const rename = effectiveRename(partId, prop, layer);
    const current = prop[layer];

    switch (status) {
      case 'keep':
        return `**keep** \`${current?.name ?? '?'}\``;
      case 'rename':
        return `**rename** \`${current?.name ?? '?'}\` -> \`${rename || '(pending)'}\``;
      case 'drop':
        return `**drop** ~~\`${current?.name ?? '?'}\`~~`;
      case 'add':
        return `**add** \`${rename || '(pending)'}\``;
      case 'skip':
      default:
        return current ? `keep \`${current.name}\`` : '—';
    }
  }

  function buildMarkdown() {
    const lines = [];
    lines.push(config.exportTitle || '# API alignment worksheet');
    lines.push('');
    lines.push(config.exportNote || 'Generated by tools/api-alignment.template.html and tools/api-alignment.runtime.js.');
    lines.push('');

    DATA.parts.forEach(part => {
      lines.push(`## ${part.label}`);
      lines.push('');
      lines.push(`> ${part.description}`);
      lines.push('');
      lines.push('| Concept | takeoff-ui | spar (decision) | react-spar (decision) | Notes |');
      lines.push('|---|---|---|---|---|');

      part.props.forEach(prop => {
        const takeoff = formatRef(prop.takeoffUi);
        const spar = formatDecision(part.id, prop, 'spar');
        const reactSpar = formatDecision(part.id, prop, 'reactSpar');
        const notes = (getNote(part.id, prop.id) || prop.note || '').replaceAll('\n', ' ').replaceAll('|', '\\|');
        lines.push(`| ${escapePipe(prop.concept)} | ${takeoff} | ${spar} | ${reactSpar} | ${notes} |`);
      });

      lines.push('');
    });

    lines.push('---');
    lines.push('');
    lines.push('## Decision legend');
    lines.push('');
    lines.push('- **keep** — layer keeps the listed name as-is.');
    lines.push('- **rename -> NEW** — rename to `NEW` in this layer.');
    lines.push('- **drop** — remove from this layer.');
    lines.push('- **add -> NEW** — add to this layer (absent today).');
    lines.push('- **skip** — no decision / not applicable.');
    return lines.join('\n');
  }

  document.getElementById('btnExport').addEventListener('click', () => {
    document.getElementById('exportText').value = buildMarkdown();
    document.getElementById('exportPanel').classList.add('open');
  });

  document.getElementById('btnClose').addEventListener('click', () => {
    document.getElementById('exportPanel').classList.remove('open');
  });

  document.getElementById('btnCopy').addEventListener('click', async () => {
    const text = document.getElementById('exportText');
    try {
      await navigator.clipboard.writeText(text.value);
      showToast('Copied');
    } catch {
      text.select();
      document.execCommand('copy');
      showToast('Copied (fallback)');
    }
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    if (!confirm('Reset all decisions and notes? This cannot be undone.')) return;
    state.decisions = {};
    state.notes = {};
    persist();
    render();
  });

  document.getElementById('exportPanel').addEventListener('click', event => {
    if (event.target === event.currentTarget) {
      event.currentTarget.classList.remove('open');
    }
  });

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1400);
  }

  render();
})();
