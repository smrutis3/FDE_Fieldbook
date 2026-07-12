'use strict'

function createTrustApi(deps) {
  const {
    fs, path, readClean, readEng, parseMdTable, sectionBody, SIGNAL_LEDGER, memoryDirtyManual,
  } = deps

  // phase / trust / top risk / freshness - identical heuristic for status + dashboard.
  // Trust resolution: structured [signal:red|amber|green] tokens in stakeholders.md
  // (written by `fde log contact --signal` and `fde debrief`) win - the latest dated
  // one. Older than 21 days → stale: shown with a "?" marker + age so a forgotten
  // signal never silently drives triage. The keyword grep survives only as the
  // zero-effort floor when NO token exists anywhere - prose like "escalated to CTO,
  // resolved amicably" must not flip a client amber forever.
  function stakeholdersMemoryHealth(eng) {
    // Hostile handoff: binary / unparseable stakeholders must not read as healthy green.
    let buf
    try { buf = fs.readFileSync(path.join(eng, 'stakeholders.md')) } catch (_) {
      return { ok: true, warn: '' }
    }
    if (buf.includes(0)) {
      return { ok: false, warn: 'memory unreadable - verify (binary data in stakeholders.md)' }
    }
    const md = buf.toString('utf8')
    const ledger = readEng(eng, SIGNAL_LEDGER)
    if (/\[signal:(red|amber|green)\]/i.test(md + '\n' + ledger)) {
      return { ok: true, warn: '' }
    }
    const trustLine = md.match(/\*\*Trust:\*\*\s*([A-Za-z?]+)/i)
    if (trustLine && !/^(red|amber|green)$/i.test(trustLine[1])) {
      return { ok: false, warn: 'memory unreadable - verify (invalid trust value)' }
    }
    const table = parseMdTable(md)
    const meaningful = md.split('\n').filter(l => {
      const t = l.trim()
      return t && !t.startsWith('#') && !t.startsWith('<!--') && !/^\|?\s*:?-{3,}/.test(t)
    }).length
    // Content present but no table and no structured signal → do not invent "green"
    if (meaningful >= 3 && !table) {
      return { ok: false, warn: 'memory unreadable - verify (stakeholders.md unparseable)' }
    }
    return { ok: true, warn: '' }
  }

  // Subject key for a signal-history line - first real name word (same spirit as
  // extractStakeholders). A green about Randy must not clear an amber about Denise.
  // Strip author tags [@email-local] so attribution never becomes the subject key.
  function signalSubjectKey(text) {
    const cleaned = String(text).replace(/\[@[^\]]+\]/g, '').replace(/\([^)]*\)/g, '')
    const words = cleaned.split(/\s+/).filter(w => w && !/^(dr|mr|mrs|ms)\.?$/i.test(w))
    const frag = (words[0] || '').replace(/[^a-z0-9]/gi, '').toLowerCase()
    return frag.length >= 3 ? frag : ('anon:' + cleaned.slice(0, 48).toLowerCase())
  }

  function parsePhase(ctx) {
    // Template ships "**Phase:** land | discover | ..." - that is UNSET, not land.
    const m = ctx.match(/\*\*Phase:\*\*\s*(.+)/i) || ctx.match(/^phase[:\s*]+(.+)$/im)
    if (!m) return '?'
    const raw = m[1].replace(/\*/g, '').trim()
    if (!raw || /\|/.test(raw) || /^unset$/i.test(raw) || /^[\[(]/.test(raw)) return '?'
    const one = raw.toLowerCase().match(/^(land|discover|plan|build|ship|close)\b/)
    return one ? one[1] : '?'
  }

  function countOpenRisks(eng) {
    const md = readClean(eng, 'risks.md')
    const body = md.split(/^#{1,6}\s+Retired\b/im)[0] || md
    let n = 0
    for (const raw of body.split('\n')) {
      const t = raw.trim()
      if (!t || t.startsWith('<!--') || /^#{1,6}\s/.test(t)) continue
      if (/risk\s*\|\s*status|mitigation/i.test(t) || /^\|?[\s|:-]+$/.test(t)) continue
      // Bullet risk with substance (skip empty "- " stubs).
      if (/^[-*]/.test(t)) {
        if (t.replace(/^[-*]\s+/, '').trim()) n++
        continue
      }
      // Table row: first cell must have risk text (day-1 "| | open | |" placeholders don't count).
      if (/^\|/.test(t) && t.length > 12) {
        const riskCell = t.split('|').map(c => c.trim())[1] || ''
        if (riskCell) n++
      }
    }
    return n
  }

  function nextActionLine(ctx) {
    // lastNonEmpty: template ships an empty ## Next action; agents often append a
    // second heading with the real bullet — first-match would report "(none set)".
    const body = sectionBody(ctx, 'Next action', { lastNonEmpty: true })
    for (const raw of body.split('\n')) {
      const t = raw.trim().replace(/^[-*]\s+/, '')
      if (t) return t.slice(0, 120)
    }
    return ''
  }

  // Hours in "2.5h" / "2 hours" / a bare number (budget only). Never invent.
  function parseHours(text) {
    const s = String(text || '').trim()
    const m = s.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?\b/i) || s.match(/^(\d+(?:\.\d+)?)$/)
    if (!m) return null
    const n = parseFloat(m[1])
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  function formatHours(n) {
    if (n == null || !Number.isFinite(n)) return '0h'
    const rounded = Math.round(n * 10) / 10
    return (Number.isInteger(rounded) ? String(rounded) : String(rounded)) + 'h'
  }

  function startOfIsoWeek(d) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const day = x.getDay() || 7
    x.setDate(x.getDate() - day + 1)
    x.setHours(0, 0, 0, 0)
    return x
  }

  function daysBetween(dateStr, now) {
    const t = Date.parse(String(dateStr) + 'T00:00:00')
    if (Number.isNaN(t)) return null
    const n = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return Math.max(0, Math.floor((n.getTime() - t) / 86400000))
  }

  function inIsoWeek(dateStr, now) {
    const start = startOfIsoWeek(now)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    const t = Date.parse(String(dateStr) + 'T00:00:00')
    return !Number.isNaN(t) && t >= start.getTime() && t < end.getTime()
  }

  function isoWeekday(now) {
    return now.getDay() || 7
  }

  function parseTimeLedger(md, now) {
    const when = now || new Date()
    const budgetHours = parseHours((String(md || '').match(/\*\*Week budget:\*\*\s*([^\n]*)/i) || [])[1] || '')
    const entries = []
    for (const raw of String(md || '').split('\n')) {
      const m = raw.trim().match(/^-\s*\[(\d{4}-\d{2}-\d{2})\]\s*(.*)$/)
      if (!m) continue
      const hours = parseHours(m[2])
      if (hours == null) continue
      entries.push({ date: m[1], hours, text: m[2].trim() })
    }
    const spentHours = entries.filter(e => inIsoWeek(e.date, when)).reduce((n, e) => n + e.hours, 0)
    const budget = budgetHours == null ? 0 : budgetHours
    return {
      budgetHours: budget,
      hasBudget: budgetHours != null && budgetHours > 0,
      spentHours,
      remainingHours: Math.max(0, budget - spentHours),
      weekStart: startOfIsoWeek(when).toISOString().slice(0, 10),
      entries,
    }
  }

  // Latest dated customer touch: Signal history / dated contact bullets, plus
  // the CLI signal ledger. Table prose dates are not a touch.
  function lastCustomerTouch(stakeMd, ledgerMd) {
    let latest = null
    const chunks = [sectionBody(stakeMd, 'Signal history'), ledgerMd, stakeMd]
    for (const chunk of chunks) {
      for (const raw of String(chunk || '').split('\n')) {
        const t = raw.trim()
        const dm = t.match(/^-\s*\[(\d{4}-\d{2}-\d{2})\]\s*(.*)$/)
        if (!dm) continue
        const date = dm[1]
        const text = dm[2]
          .replace(/\[signal:(red|amber|green)\]/i, '')
          .replace(/\[@[^\]]+\]/g, '')
          .trim()
        if (!latest || date >= latest.date) latest = { date, text }
      }
    }
    return latest
  }

  function computePulse(eng, opts) {
    const now = (opts && opts.now) || new Date()
    const ageDays = opts && opts.ageDays != null ? opts.ageDays : Infinity
    const stake = readClean(eng, 'stakeholders.md')
    const time = parseTimeLedger(readClean(eng, 'time.md'), now)
    const touch = lastCustomerTouch(stake, readClean(eng, SIGNAL_LEDGER))
    const touchAge = touch ? daysBetween(touch.date, now) : null
    const weekUnderway = isoWeekday(now) >= 2
    const noHours = time.spentHours === 0
    const starved = time.hasBudget && noHours && (weekUnderway || ageDays >= 3)
    const noShow = ageDays >= 3 && noHours

    let pulse = 'amber'
    let pulseReason = 'no customer touch logged'
    if (touchAge != null && touchAge > 7) {
      pulse = 'red'
      pulseReason = `last touch ${touchAge}d${touch.text ? ` (${touch.text.slice(0, 60)})` : ''}`
    } else if (noShow) {
      pulse = 'red'
      pulseReason = time.hasBudget
        ? `0h of ${formatHours(time.budgetHours)} this week`
        : '0h this week and last session ≥3d'
    } else if (touchAge != null && touchAge >= 4) {
      pulse = 'amber'
      pulseReason = `last touch ${touchAge}d${touch.text ? ` (${touch.text.slice(0, 60)})` : ''}`
    } else if (touchAge != null && touchAge <= 3 && time.hasBudget && noHours && weekUnderway) {
      pulse = 'amber'
      pulseReason = `0h of ${formatHours(time.budgetHours)} this week`
    } else if (touchAge != null && touchAge <= 3) {
      pulse = 'green'
      pulseReason = touchAge === 0 ? 'last touch today' : `last touch ${touchAge}d`
    } else if (starved) {
      pulse = 'red'
      pulseReason = `0h of ${formatHours(time.budgetHours)} this week`
    }

    return {
      pulse,
      pulseReason,
      touchAge,
      touchText: touch ? touch.text : '',
      starved,
      ...time,
    }
  }

  function computeSignals(eng) {
    // readClean, not readEng: status/dashboard echo topRisk and stakeholder lines
    // to the terminal and the rendered HTML - a <private> risk must never surface.
    const ctx = readClean(eng, 'context.md'); const stake = readClean(eng, 'stakeholders.md'); const risks = readClean(eng, 'risks.md')
    // Prefer structured tokens from stakeholders + CLI ledger (ledger survives wipes)
    const signalText = stake + '\n' + readClean(eng, SIGNAL_LEDGER)
    const phase = parsePhase(ctx)
    // Latest signal PER stakeholder, then worst-of those actives.
    // Global "latest wins" let a green from person B hide a sponsor crisis on A.
    const byPerson = new Map()
    for (const l of signalText.split('\n')) {
      const sm = l.match(/\[signal:(red|amber|green)\]/i)
      if (!sm) continue
      const date = (l.match(/\[(\d{4}-\d{2}-\d{2})\]/) || [])[1] || ''
      const text = l.replace(/^\s*-\s*/, '')
        .replace(/\[signal:(red|amber|green)\]/i, '')
        .replace(/\[\d{4}-\d{2}-\d{2}\]/, '')
        .replace(/\[@[^\]]+\]/g, '')
        .trim()
      const key = signalSubjectKey(text)
      const prev = byPerson.get(key)
      if (!prev || date >= prev.date) byPerson.set(key, { date, sig: sm[1].toLowerCase(), text })
    }
    const RANK = { red: 0, amber: 1, green: 2 }
    let worst = null
    for (const s of byPerson.values()) {
      if (!worst || RANK[s.sig] < RANK[worst.sig] || (RANK[s.sig] === RANK[worst.sig] && s.date >= worst.date)) {
        worst = s
      }
    }
    const mem = stakeholdersMemoryHealth(eng)
    let trust, signalAge = null, stale = false, trustReason = ''
    if (!mem.ok && !worst) {
      trust = 'amber'
      trustReason = mem.warn
    } else if (worst) {
      trust = worst.sig === 'red' ? 'RED' : worst.sig
      trustReason = (worst.text || '').slice(0, 80)
      if (worst.date) {
        signalAge = Math.max(0, Math.floor((Date.now() - Date.parse(worst.date)) / 86400000))
        stale = signalAge > 21
      }
    } else {
      const sLines = stake.split('\n').filter(l => !(/green/i.test(l) && /red|amber/i.test(l)))
      trust = sLines.some(l => /\bred\b/i.test(l)) ? 'RED'
        : sLines.some(l => /amber|gone quiet|routing around|escalat/i.test(l)) ? 'amber' : 'green'
    }
    const topRisk = (risks.split('\n').find(l => {
      const t = l.trim()
      return /^[-|]/.test(t) && t.length > 20 && !/^\|?[-\s|]+$/.test(t) &&
        !/risk\s*\|\s*status|mitigation/i.test(t) && !t.startsWith('<!--')
    }) || '').replace(/\|/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
    // Prefer trust trigger / memory warn over a random risk line; always keep mem.warn available
    const reason = (trustReason || mem.warn) ? (trustReason || mem.warn) : topRisk
    const openRisks = countOpenRisks(eng)
    const nextAction = nextActionLine(ctx)
    let updated = 'never', ageDays = Infinity
    try {
      ageDays = Math.floor((Date.now() - fs.statSync(path.join(eng, 'context.md')).mtimeMs) / 86400000)
      updated = ageDays === 0 ? 'today' : `${ageDays}d ago`
    } catch (_) {}
    const dirty = memoryDirtyManual(eng)
    const pulseInfo = computePulse(eng, { ageDays, now: new Date() })
    return {
      phase, trust, signalAge, stale, topRisk, reason, memoryWarn: mem.warn,
      dirtyFiles: dirty, openRisks, nextAction, updated, ageDays,
      ...pulseInfo,
    }
  }

  function resumeTriage(eng) {
    const s = computeSignals(eng)
    const label = s.trust + (s.stale ? '?' : '')
    const phase = s.phase === '?' ? 'unset' : s.phase
    const hours = `${formatHours(s.spentHours)}/${s.hasBudget ? formatHours(s.budgetHours) : '?h'}`
    const lines = [
      `TRIAGE  [${label.padEnd(6)}]  phase:${phase}  pulse:${s.pulse}  ${hours}  updated:${s.updated}  open risks:${s.openRisks}`,
    ]
    if (s.reason) {
      const age = s.signalAge != null ? ` (${s.signalAge}d old${s.stale ? ', STALE - reconfirm' : ''})` : ''
      lines.push(`  trust: ${s.reason}${age}`)
    }
    if (s.pulse === 'red' || s.starved) {
      lines.push(`  pulse: ${s.pulseReason}`)
    }
    // Always surface corruption / unreadable memory - even when trust still reads green
    if (s.memoryWarn) lines.push(`  memory: ${s.memoryWarn}`)
    if (s.dirtyFiles && s.dirtyFiles.length) {
      lines.push(`  ⚠ memory dirty (uncommitted manual edits): ${s.dirtyFiles.slice(0, 5).join(', ')}${s.dirtyFiles.length > 5 ? '…' : ''}`)
      lines.push('    review before relying on the ledger - fde writes will not auto-commit these')
    }
    if (s.nextAction) lines.push(`  next: ${s.nextAction}`)
    else lines.push('  next: (none set - add under ## Next action in context.md)')
    return lines.join('\n')
  }

  return {
    stakeholdersMemoryHealth,
    signalSubjectKey,
    parsePhase,
    countOpenRisks,
    nextActionLine,
    parseHours,
    formatHours,
    parseTimeLedger,
    lastCustomerTouch,
    computePulse,
    computeSignals,
    resumeTriage,
  }
}

module.exports = { createTrustApi }
