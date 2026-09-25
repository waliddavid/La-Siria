// ============================================================
// PLATAFORMA LA SIRIA — Worker (Fase 2: login y usuarios)
// ============================================================
// Maneja: registro de arranque (primer admin), login, logout,
// sesion, y gestion de usuarios (crear/listar/desactivar).
// Los archivos estaticos (pantallas) los sirve Cloudflare Assets.
// ============================================================

// ---------- utilidades de seguridad ----------

// Hash de contraseña con PBKDF2 (WebCrypto, disponible en Workers).
async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex
    ? hexToBytes(saltHex)
    : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  const hashHex = bytesToHex(new Uint8Array(bits));
  const outSalt = bytesToHex(salt);
  return `${outSalt}:${hashHex}`;
}

async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(":");
  const check = await hashPassword(password, saltHex);
  return check === `${saltHex}:${hashHex}`;
}

function bytesToHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  return arr;
}

// Token de sesion aleatorio
function newToken() {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}

// ---------- helpers de respuesta ----------
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function parseCookies(req) {
  const h = req.headers.get("Cookie") || "";
  return Object.fromEntries(
    h.split(";").map(c => c.trim().split("=").map(decodeURIComponent)).filter(p => p[0])
  );
}

// ---------- sesion: quien es el usuario actual ----------
async function currentUser(req, env) {
  const cookies = parseCookies(req);
  const token = cookies.session;
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre AS rol, u.activo
     FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
     JOIN roles r ON r.id = u.rol_id
     WHERE s.token = ? AND s.expira > datetime('now')`
  ).bind(token).first();
  if (!row || !row.activo) return null;
  return row;
}

// crea un pendiente dirigido a un usuario (usuario_id) o a un rol (rol).
// evita duplicados: si ya hay uno abierto con el mismo origen+ref, no crea otro.
// ==========================================================
// 8B-2: CRUCE salida <-> actividad
// ==========================================================
// una salida esta respaldada si existe plan O reporte del dia para ese
// trabajador (mas labor/lote cuando la salida los trae capturados)
async function salidaTieneActividad(env, s) {
  const binds = [s.fecha, s.trabajador_id];
  let cond = "fecha=? AND trabajador_id=?";
  if (s.labor_id) { cond += " AND labor_id=?"; binds.push(s.labor_id); }
  if (s.lote_id)  { cond += " AND lote_id=?";  binds.push(s.lote_id); }
  const plan = await env.DB.prepare(`SELECT id FROM agenda_plan WHERE ${cond} LIMIT 1`).bind(...binds).first();
  if (plan) return "planeada";
  const rep = await env.DB.prepare(`SELECT id FROM reporte_labores WHERE ${cond} LIMIT 1`).bind(...binds).first();
  if (rep) return "reportada";
  return null;
}

// si aparece la actividad que respalda una salida marcada, cierra su pendiente
async function cerrarCruceSalida(env, { fecha, trabajador_id, labor_id, lote_id }) {
  const binds = [fecha, trabajador_id];
  let cond = "fecha=? AND trabajador_id=?";
  if (labor_id) { cond += " AND (labor_id=? OR labor_id IS NULL)"; binds.push(labor_id); }
  if (lote_id)  { cond += " AND (lote_id=? OR lote_id IS NULL)";  binds.push(lote_id); }
  const salidas = await env.DB.prepare(
    `SELECT id FROM salidas_almacen WHERE ${cond} AND id IN (
       SELECT ref_id FROM pendientes WHERE ref_tabla='salida_sin_actividad' AND estado!='resuelto')`
  ).bind(...binds).all();
  for (const s of salidas.results) await resolverPendientesRef(env, "salida_sin_actividad", s.id);
}

async function crearPendiente(env, { tipo, titulo, detalle, origen, ref_tabla, ref_id, usuario_id, rol, grupo }) {
  if (ref_tabla && ref_id != null) {
    const existe = await env.DB.prepare(
      "SELECT id FROM pendientes WHERE ref_tabla=? AND ref_id=? AND estado!='resuelto'"
    ).bind(ref_tabla, ref_id).first();
    if (existe) return existe.id;
  }
  const res = await env.DB.prepare(
    `INSERT INTO pendientes (tipo, titulo, detalle, origen, ref_tabla, ref_id, usuario_id, rol, grupo)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).bind(tipo || "informativa", titulo, detalle || null, origen || null,
         ref_tabla || null, ref_id != null ? ref_id : null, usuario_id || null, rol || null, grupo || null).run();
  return res.meta.last_row_id;
}

// cierra (marca resuelto) los pendientes ligados a una referencia — cuando la accion correctiva ocurrio
async function resolverPendientesRef(env, ref_tabla, ref_id) {
  await env.DB.prepare(
    "UPDATE pendientes SET estado='resuelto', resuelto_en=datetime('now') WHERE ref_tabla=? AND ref_id=? AND estado!='resuelto'"
  ).bind(ref_tabla, ref_id).run();
}

// registra un cambio de agenda. Si la semana ya esta aprobada, el cambio queda
// 'por_aprobar', pone la semana en 'cambios_por_aprobar' y avisa al admin.
// Devuelve { requiereJustificacion: true } si falta justificacion en semana aprobada.
async function registrarCambioAgenda(env, user, { anio, semana, agenda_plan_id, accion, antes, despues, explicacion }) {
  const est = await env.DB.prepare("SELECT estado FROM plan_estado WHERE anio=? AND semana=?").bind(anio, semana).first();
  const aprobada = est && (est.estado === "aprobada" || est.estado === "cambios_por_aprobar");
  // si la semana esta aprobada, exigir justificacion
  if (aprobada && (!explicacion || !explicacion.trim())) {
    return { requiereJustificacion: true };
  }
  const estadoAprob = aprobada ? "por_aprobar" : null;
  await env.DB.prepare(
    `INSERT INTO agenda_cambios (agenda_plan_id, accion, antes, despues, explicacion, usuario_id, anio, semana, estado_aprob)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).bind(agenda_plan_id || null, accion, antes ? JSON.stringify(antes) : null,
         despues ? JSON.stringify(despues) : null, explicacion || null, user.id, anio, semana, estadoAprob).run();
  if (aprobada) {
    // marcar la semana como "cambios por aprobar" y avisar al admin (agrupado)
    await env.DB.prepare("UPDATE plan_estado SET estado='cambios_por_aprobar' WHERE anio=? AND semana=?").bind(anio, semana).run();
    await crearPendiente(env, {
      tipo: "resolver", grupo: "Cambios en la planificación",
      titulo: `Cambio en semana ${semana}/${anio} (ya aprobada)`,
      detalle: `${user.nombre} hizo un cambio (${accion}) en una semana aprobada. Justificación: ${explicacion}. Revísalo y apruébalo o recházalo.`,
      origen: "planeacion", rol: "administrador",
    });
  }
  return { ok: true };
}

// registro en audit_log
async function audit(env, usuarioId, accion, entidad, registroId, antes, despues) {
  await env.DB.prepare(
    `INSERT INTO audit_log (usuario_id, accion, entidad, registro_id, valor_antes, valor_despues)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    usuarioId ?? null, accion, entidad ?? null, registroId ?? null,
    antes ? JSON.stringify(antes) : null,
    despues ? JSON.stringify(despues) : null
  ).run();
}

// reemplaza el set de habilidades de un trabajador
async function setHabilidades(env, trabajadorId, laborIds) {
  await env.DB.prepare("DELETE FROM trabajador_habilidades WHERE trabajador_id = ?").bind(trabajadorId).run();
  for (const lid of laborIds) {
    if (lid == null) continue;
    await env.DB.prepare(
      "INSERT OR IGNORE INTO trabajador_habilidades (trabajador_id, labor_id) VALUES (?, ?)"
    ).bind(trabajadorId, lid).run();
  }
}

// normaliza texto para comparar nombres de labores (sin tildes, minusculas)
function normaliza(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// reemplaza los centros de costo de un material
async function setCentros(env, materialId, centroIds) {
  await env.DB.prepare("DELETE FROM material_centro WHERE material_id = ?").bind(materialId).run();
  for (const cid of centroIds) {
    if (cid == null) continue;
    await env.DB.prepare(
      "INSERT OR IGNORE INTO material_centro (material_id, centro_costo_id) VALUES (?, ?)"
    ).bind(materialId, cid).run();
  }
}

// reemplaza los materiales tipicos de una labor
async function setMaterialesLabor(env, laborId, materialIds) {
  await env.DB.prepare("DELETE FROM labor_material WHERE labor_id = ?").bind(laborId).run();
  for (const mid of materialIds) {
    if (mid == null) continue;
    await env.DB.prepare(
      "INSERT OR IGNORE INTO labor_material (labor_id, material_id) VALUES (?, ?)"
    ).bind(laborId, mid).run();
  }
}

// horas efectivas de un dia dado inicio, almuerzo (desde/hasta) y fin
function horasDia(ini, ad, ah, fin) {
  if (!ini || !fin) return 0;
  const m = (t) => { const [h, mm] = t.split(":").map(Number); return h * 60 + mm; };
  let total = m(fin) - m(ini);
  if (ad && ah) total -= (m(ah) - m(ad));
  return total > 0 ? Math.round((total / 60) * 100) / 100 : 0;
}

// horas entre dos horas 'HH:MM' (maneja cruce simple; si fin<inicio devuelve null)
function calcularHoras(ini, fin) {
  if (!ini || !fin) return null;
  const [h1, m1] = ini.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  if ([h1, m1, h2, m2].some(x => Number.isNaN(x))) return null;
  let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (mins <= 0) return null;
  return Math.round((mins / 60) * 100) / 100;
}

// numero de semana del año (aprox ISO) desde 'AAAA-MM-DD'
function semanaDelAnio(fechaIso) {
  const d = new Date(fechaIso + "T12:00:00Z");
  const inicio = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const dias = Math.floor((d - inicio) / 86400000);
  return Math.ceil((dias + inicio.getUTCDay() + 1) / 7);
}

// devuelve los 7 dias (lun..dom) de una semana ISO como [{fecha, dia_nombre, dia_num}]
function diasSemanaISO(anio, semana) {
  // lunes de la semana 1 ISO (la que contiene el 4 de enero)
  const ref = new Date(Date.UTC(anio, 0, 4));
  const lunesSem1 = new Date(ref);
  const dow = ref.getUTCDay() || 7; // 1..7
  lunesSem1.setUTCDate(ref.getUTCDate() - (dow - 1));
  const lunes = new Date(lunesSem1);
  lunes.setUTCDate(lunesSem1.getUTCDate() + (semana - 1) * 7);
  const nombres = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
  const out = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(lunes);
    dd.setUTCDate(lunes.getUTCDate() + i);
    out.push({ fecha: dd.toISOString().slice(0, 10), dia_nombre: nombres[i], dia_num: dd.getUTCDate() });
  }
  return out;
}

// calcula los festivos de Colombia de un año (reglas oficiales, deterministico)
function festivosColombia(anio) {
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };
  const sigLunes = (d) => { const x = new Date(d); while (x.getUTCDay() !== 1) x.setUTCDate(x.getUTCDate() + 1); return x; };
  const D = (y, m, dd) => new Date(Date.UTC(y, m - 1, dd));

  // domingo de Pascua (algoritmo de Meeus)
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100;
  const d2 = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d2 - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m2 = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m2 + 114) / 31), dia = ((h + l - 7 * m2 + 114) % 31) + 1;
  const pascua = D(anio, mes, dia);

  const lista = [];
  const fijo = (mm, dd, nombre) => lista.push({ fecha: iso(D(anio, mm, dd)), nombre });
  const emil = (mm, dd, nombre) => lista.push({ fecha: iso(sigLunes(D(anio, mm, dd))), nombre });
  const relFijo = (n, nombre) => lista.push({ fecha: iso(addDays(pascua, n)), nombre });
  const relEmil = (n, nombre) => lista.push({ fecha: iso(sigLunes(addDays(pascua, n))), nombre });

  fijo(1, 1, "Año Nuevo");
  fijo(5, 1, "Día del Trabajo");
  fijo(7, 20, "Día de la Independencia");
  fijo(8, 7, "Batalla de Boyacá");
  fijo(12, 8, "Inmaculada Concepción");
  fijo(12, 25, "Navidad");
  relFijo(-3, "Jueves Santo");
  relFijo(-2, "Viernes Santo");
  emil(1, 6, "Reyes Magos");
  emil(3, 19, "San José");
  emil(6, 29, "San Pedro y San Pablo");
  emil(8, 15, "Asunción de la Virgen");
  emil(10, 12, "Día de la Raza");
  emil(11, 1, "Todos los Santos");
  emil(11, 11, "Independencia de Cartagena");
  relEmil(43, "Ascensión del Señor");
  relEmil(64, "Corpus Christi");
  relEmil(71, "Sagrado Corazón");
  lista.sort((x, y) => x.fecha.localeCompare(y.fecha));
  return lista;
}

// agrupa una lista de lotes en ~n grupos de lotes contiguos (usando adyacencia).
function agruparContiguos(lotes, ady, n) {
  if (lotes.length === 0) return [];
  const objetivo = Math.max(1, Math.min(n, lotes.length));
  const porGrupo = Math.ceil(lotes.length / objetivo);
  const restantes = new Set(lotes);
  const grupos = [];
  const orden = [...lotes].sort((a, b) => a - b);
  for (const inicio of orden) {
    if (!restantes.has(inicio)) continue;
    const grupo = [inicio];
    restantes.delete(inicio);
    let frontera = [inicio];
    while (grupo.length < porGrupo && frontera.length > 0) {
      const nuevaFrontera = [];
      for (const l of frontera) {
        const vecinos = (ady[l] || []).filter(v => restantes.has(v));
        for (const v of vecinos) {
          if (grupo.length >= porGrupo) break;
          grupo.push(v); restantes.delete(v); nuevaFrontera.push(v);
        }
      }
      frontera = nuevaFrontera;
    }
    grupos.push(grupo);
    if (restantes.size === 0) break;
  }
  // lotes sueltos restantes: al grupo mas pequeño
  for (const l of [...restantes]) {
    let min = grupos[0];
    for (const g of grupos) if (g.length < min.length) min = g;
    min.push(l); restantes.delete(l);
  }
  return grupos;
}

// ============================================================
// RUTAS DE LA API
// ============================================================
async function handleApi(req, env, path) {
  // --- estado del arranque: hay algun usuario? ---
  if (path === "/api/setup-status" && req.method === "GET") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM usuarios").first();
    return json({ needsSetup: row.n === 0 });
  }

  // --- registro de arranque: crea el primer admin (una sola vez) ---
  if (path === "/api/setup" && req.method === "POST") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM usuarios").first();
    if (row.n > 0) return json({ error: "El sistema ya tiene un administrador." }, 403);

    const { nombre, email, password } = await req.json();
    if (!nombre || !email || !password)
      return json({ error: "Faltan datos: nombre, correo y contraseña." }, 400);
    if (password.length < 8)
      return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400);

    const hash = await hashPassword(password);
    const res = await env.DB.prepare(
      `INSERT INTO usuarios (nombre, email, password_hash, rol_id, ubicacion, activo)
       VALUES (?, ?, ?, 1, 'barranquilla', 1)`
    ).bind(nombre, email.toLowerCase(), hash).run();
    const uid = res.meta.last_row_id;
    await audit(env, uid, "crear", "usuarios", uid, null, { nombre, email, rol: "administrador" });
    return json({ ok: true });
  }

  // --- login ---
  if (path === "/api/login" && req.method === "POST") {
    const { email, password } = await req.json();
    const user = await env.DB.prepare(
      `SELECT id, nombre, password_hash, rol_id, activo FROM usuarios WHERE email = ?`
    ).bind((email || "").toLowerCase()).first();
    if (!user || !user.activo || !(await verifyPassword(password, user.password_hash))) {
      return json({ error: "Correo o contraseña incorrectos." }, 401);
    }
    const token = newToken();
    await env.DB.prepare(
      `INSERT INTO sesiones (token, usuario_id, expira)
       VALUES (?, ?, datetime('now', '+7 days'))`
    ).bind(token, user.id).run();
    await audit(env, user.id, "login", "usuarios", user.id, null, null);
    return json({ ok: true }, 200, {
      "Set-Cookie": `session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`,
    });
  }

  // --- logout ---
  if (path === "/api/logout" && req.method === "POST") {
    const cookies = parseCookies(req);
    if (cookies.session) {
      await env.DB.prepare("DELETE FROM sesiones WHERE token = ?").bind(cookies.session).run();
    }
    return json({ ok: true }, 200, {
      "Set-Cookie": `session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
    });
  }

  // --- quien soy ---
  if (path === "/api/me" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    return json({ id: user.id, nombre: user.nombre, email: user.email, rol: user.rol });
  }

  // --- listar usuarios (solo admin) ---
  if (path === "/api/usuarios" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede ver los usuarios." }, 403);
    const { results } = await env.DB.prepare(
      `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.ubicacion, u.activo
       FROM usuarios u JOIN roles r ON r.id = u.rol_id ORDER BY u.nombre`
    ).all();
    return json({ usuarios: results });
  }

  // --- crear usuario (solo admin) ---
  if (path === "/api/usuarios" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede crear usuarios." }, 403);

    const { nombre, email, password, rol_id, ubicacion } = await req.json();
    if (!nombre || !email || !password || !rol_id)
      return json({ error: "Faltan datos: nombre, correo, contraseña y rol." }, 400);
    if (password.length < 8)
      return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400);

    const exists = await env.DB.prepare("SELECT id FROM usuarios WHERE email = ?")
      .bind(email.toLowerCase()).first();
    if (exists) return json({ error: "Ya existe un usuario con ese correo." }, 409);

    const hash = await hashPassword(password);
    const res = await env.DB.prepare(
      `INSERT INTO usuarios (nombre, email, password_hash, rol_id, ubicacion, activo)
       VALUES (?, ?, ?, ?, ?, 1)`
    ).bind(nombre, email.toLowerCase(), hash, rol_id, ubicacion || null).run();
    const uid = res.meta.last_row_id;
    await audit(env, user.id, "crear", "usuarios", uid, null, { nombre, email, rol_id });
    return json({ ok: true });
  }

  // --- activar/desactivar usuario (solo admin) ---
  if (path.startsWith("/api/usuarios/") && path.endsWith("/estado") && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede cambiar el estado." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    if (id === user.id) return json({ error: "No puedes desactivar tu propia cuenta." }, 400);
    const { activo } = await req.json();
    await env.DB.prepare("UPDATE usuarios SET activo = ? WHERE id = ?")
      .bind(activo ? 1 : 0, id).run();
    await audit(env, user.id, "editar", "usuarios", id, null, { activo: activo ? 1 : 0 });
    return json({ ok: true });
  }

  // --- restablecer contraseña de un usuario (solo admin) ---
  if (path.startsWith("/api/usuarios/") && path.endsWith("/password") && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede restablecer contraseñas." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const { password } = await req.json();
    if (!password || password.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400);
    const cuenta = await env.DB.prepare("SELECT id, nombre FROM usuarios WHERE id = ?").bind(id).first();
    if (!cuenta) return json({ error: "Usuario no encontrado." }, 404);
    const hash = await hashPassword(password);
    await env.DB.prepare("UPDATE usuarios SET password_hash = ? WHERE id = ?").bind(hash, id).run();
    await audit(env, user.id, "editar", "usuarios", id, null, { password_reset: true });
    return json({ ok: true });
  }

  // --- listar roles (para el formulario de crear usuario) ---
  if (path === "/api/roles" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare("SELECT id, nombre FROM roles ORDER BY id").all();
    return json({ roles: results });
  }

  // ==========================================================
  // LABORES (catalogo) — ver: cualquiera autenticado; editar: solo admin
  // ==========================================================

  // listar labores
  if (path === "/api/labores" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    // barrido: borrar de verdad las que ya cumplieron su plazo de 7 dias
    await env.DB.prepare(
      `DELETE FROM labores
       WHERE borrado_pendiente = 1 AND borrado_programado_para IS NOT NULL
         AND borrado_programado_para <= datetime('now')`
    ).run();
    const { results } = await env.DB.prepare(
      `SELECT id, codigo, nombre, rendimiento_estandar, unidad_rendimiento, precio_unidad, frecuencia_semanal, dias_asignados,
              compatible_riego, media_jornada_sabado, elemento_costo, categoria_costo, activo, es_regular,
              borrado_pendiente, borrado_programado_para
       FROM labores ORDER BY activo DESC, codigo`
    ).all();
    // materiales tipicos de cada labor
    const lm = await env.DB.prepare(
      `SELECT lm.labor_id, lm.material_id, m.codigo, m.nombre
       FROM labor_material lm JOIN materiales m ON m.id = lm.material_id`
    ).all();
    const matMap = {};
    for (const r of lm.results) (matMap[r.labor_id] = matMap[r.labor_id] || []).push({ id: r.material_id, codigo: r.codigo, nombre: r.nombre });
    for (const l of results) l.materiales = matMap[l.id] || [];
    return json({ labores: results });
  }

  // crear labor (solo admin)
  if (path === "/api/labores" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede crear labores." }, 403);
    const b = await req.json();
    if (!b.nombre || !b.nombre.trim()) return json({ error: "El nombre es obligatorio." }, 400);
    const res = await env.DB.prepare(
      `INSERT INTO labores (codigo, nombre, rendimiento_estandar, unidad_rendimiento, precio_unidad, frecuencia_semanal, dias_asignados,
                            compatible_riego, media_jornada_sabado, elemento_costo, categoria_costo, es_regular, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
    ).bind(
      b.codigo ?? null,
      b.nombre.trim(),
      b.rendimiento_estandar ?? null,
      b.unidad_rendimiento ?? null,
      b.precio_unidad ?? null,
      b.frecuencia_semanal ?? null,
      b.dias_asignados ?? null,
      b.compatible_riego ? 1 : 0,
      b.media_jornada_sabado ? 1 : 0,
      b.elemento_costo ?? null,
      b.categoria_costo ?? null,
      b.es_regular ? 1 : 0
    ).run();
    const lid = res.meta.last_row_id;
    if (Array.isArray(b.materiales)) await setMaterialesLabor(env, lid, b.materiales);
    await audit(env, user.id, "crear", "labores", lid, null, b);
    return json({ ok: true, id: lid });
  }

  // editar labor (solo admin)
  if (path.startsWith("/api/labores/") && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede editar labores." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const antes = await env.DB.prepare("SELECT * FROM labores WHERE id = ?").bind(id).first();
    if (!antes) return json({ error: "Labor no encontrada." }, 404);
    const b = await req.json();
    await env.DB.prepare(
      `UPDATE labores SET codigo=?, nombre=?, rendimiento_estandar=?, unidad_rendimiento=?, precio_unidad=?, frecuencia_semanal=?, dias_asignados=?,
              compatible_riego=?, media_jornada_sabado=?, elemento_costo=?, categoria_costo=?, es_regular=?, activo=?
       WHERE id=?`
    ).bind(
      b.codigo !== undefined ? b.codigo : antes.codigo,
      b.nombre?.trim() ?? antes.nombre,
      b.rendimiento_estandar !== undefined ? b.rendimiento_estandar : antes.rendimiento_estandar,
      b.unidad_rendimiento !== undefined ? b.unidad_rendimiento : antes.unidad_rendimiento,
      b.precio_unidad !== undefined ? b.precio_unidad : antes.precio_unidad,
      b.frecuencia_semanal ?? antes.frecuencia_semanal,
      b.dias_asignados ?? antes.dias_asignados,
      b.compatible_riego != null ? (b.compatible_riego ? 1 : 0) : antes.compatible_riego,
      b.media_jornada_sabado != null ? (b.media_jornada_sabado ? 1 : 0) : antes.media_jornada_sabado,
      b.elemento_costo ?? antes.elemento_costo,
      b.categoria_costo ?? antes.categoria_costo,
      b.es_regular != null ? (b.es_regular ? 1 : 0) : antes.es_regular,
      b.activo != null ? (b.activo ? 1 : 0) : antes.activo,
      id
    ).run();
    if (Array.isArray(b.materiales)) await setMaterialesLabor(env, id, b.materiales);
    await audit(env, user.id, "editar", "labores", id, antes, b);
    return json({ ok: true });
  }

  // solicitar borrado de labor (solo admin) — pide la clave, marca pendiente a 7 dias
  if (path.match(/^\/api\/labores\/\d+\/borrar$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede borrar labores." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const { password } = await req.json();
    if (!password) return json({ error: "Escribe tu contraseña para confirmar el borrado." }, 400);
    // verificar la clave del propio administrador
    const cuenta = await env.DB.prepare("SELECT password_hash FROM usuarios WHERE id = ?").bind(user.id).first();
    if (!cuenta || !(await verifyPassword(password, cuenta.password_hash))) {
      return json({ error: "Contraseña incorrecta. El borrado no se realizó." }, 401);
    }
    const labor = await env.DB.prepare("SELECT * FROM labores WHERE id = ?").bind(id).first();
    if (!labor) return json({ error: "Labor no encontrada." }, 404);
    await env.DB.prepare(
      `UPDATE labores SET borrado_pendiente = 1,
              borrado_programado_para = datetime('now', '+7 days'),
              borrado_por = ?
       WHERE id = ?`
    ).bind(user.id, id).run();
    await audit(env, user.id, "borrar", "labores", id, labor, { borrado_pendiente: 1, plazo: "7 dias" });
    return json({ ok: true });
  }

  // cancelar el borrado pendiente (solo admin)
  if (path.match(/^\/api\/labores\/\d+\/cancelar-borrado$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede cancelar el borrado." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    await env.DB.prepare(
      "UPDATE labores SET borrado_pendiente = 0, borrado_programado_para = NULL, borrado_por = NULL WHERE id = ?"
    ).bind(id).run();
    await audit(env, user.id, "editar", "labores", id, null, { borrado_cancelado: 1 });
    return json({ ok: true });
  }


  // listar lotes con su tamano vigente y estado
  if (path === "/api/lotes" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      `SELECT l.id, l.nombre, l.se_suspende_nino, l.activo, l.ranking_rinde, l.densidad_plantas_ha,
              l.es_zona_especial, l.coordinador_id, u.nombre AS coordinador_nombre,
              (SELECT hectareas FROM lote_versiones v
                WHERE v.lote_id = l.id AND v.vigente_hasta IS NULL
                ORDER BY v.vigente_desde DESC LIMIT 1) AS hectareas
       FROM lotes l LEFT JOIN usuarios u ON u.id = l.coordinador_id ORDER BY l.id`
    ).all();
    // total de hectareas ACTIVAS (lotes activos)
    const activos = results.filter(l => l.activo).reduce((s, l) => s + (l.hectareas || 0), 0);
    const total = results.reduce((s, l) => s + (l.hectareas || 0), 0);
    return json({
      lotes: results,
      ha_activas: Math.round(activos * 1000) / 1000,
      ha_total: Math.round(total * 1000) / 1000,
    });
  }

  // crear lote (solo admin) — crea el lote y su primera version de tamano
  if (path === "/api/lotes" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede crear lotes." }, 403);
    const b = await req.json();
    if (!b.nombre || !b.nombre.trim()) return json({ error: "El nombre es obligatorio." }, 400);
    if (b.hectareas == null || b.hectareas === "" || !(parseFloat(b.hectareas) > 0))
      return json({ error: "Las hectáreas son obligatorias y deben ser mayores a cero." }, 400);
    const res = await env.DB.prepare(
      `INSERT INTO lotes (nombre, grupo_riego_id, se_suspende_nino, ranking_rinde, densidad_plantas_ha, activo)
       VALUES (?, ?, ?, ?, ?, 1)`
    ).bind(b.nombre.trim(), b.grupo_riego_id ?? null, b.se_suspende_nino ? 1 : 0, b.ranking_rinde ?? null, b.densidad_plantas_ha ?? null).run();
    const lid = res.meta.last_row_id;
    if (b.hectareas != null && b.hectareas !== "") {
      await env.DB.prepare(
        `INSERT INTO lote_versiones (lote_id, hectareas, vigente_desde, vigente_hasta)
         VALUES (?, ?, date('now'), NULL)`
      ).bind(lid, parseFloat(b.hectareas)).run();
    }
    await audit(env, user.id, "crear", "lotes", lid, null, b);
    return json({ ok: true, id: lid });
  }

  // editar datos del lote (nombre, ranking, suspende) — solo admin
  if (path.match(/^\/api\/lotes\/\d+$/) && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede editar lotes." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const antes = await env.DB.prepare("SELECT * FROM lotes WHERE id = ?").bind(id).first();
    if (!antes) return json({ error: "Lote no encontrado." }, 404);
    const b = await req.json();
    await env.DB.prepare(
      `UPDATE lotes SET nombre=?, se_suspende_nino=?, ranking_rinde=?, densidad_plantas_ha=? WHERE id=?`
    ).bind(
      b.nombre?.trim() ?? antes.nombre,
      b.se_suspende_nino != null ? (b.se_suspende_nino ? 1 : 0) : antes.se_suspende_nino,
      b.ranking_rinde ?? antes.ranking_rinde,
      b.densidad_plantas_ha !== undefined ? b.densidad_plantas_ha : antes.densidad_plantas_ha,
      id
    ).run();
    await audit(env, user.id, "editar", "lotes", id, antes, b);
    return json({ ok: true });
  }

  // cambiar tamano del lote: NUEVA VERSION (preserva historico) — solo admin
  if (path.match(/^\/api\/lotes\/\d+\/tamano$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede cambiar el tamaño." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const { hectareas } = await req.json();
    if (hectareas == null || hectareas === "") return json({ error: "Ingresa las hectáreas." }, 400);
    // cerrar la version vigente
    await env.DB.prepare(
      `UPDATE lote_versiones SET vigente_hasta = date('now')
       WHERE lote_id = ? AND vigente_hasta IS NULL`
    ).bind(id).run();
    // abrir la nueva
    await env.DB.prepare(
      `INSERT INTO lote_versiones (lote_id, hectareas, vigente_desde, vigente_hasta)
       VALUES (?, ?, date('now'), NULL)`
    ).bind(id, parseFloat(hectareas)).run();
    await audit(env, user.id, "editar", "lote_versiones", id, null, { hectareas });
    return json({ ok: true });
  }

  // suspender / reactivar lote — solo admin
  if (path.match(/^\/api\/lotes\/\d+\/estado$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede suspender o reactivar lotes." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const { activo } = await req.json();
    await env.DB.prepare("UPDATE lotes SET activo = ? WHERE id = ?").bind(activo ? 1 : 0, id).run();
    await audit(env, user.id, "editar", "lotes", id, null, { activo: activo ? 1 : 0 });
    return json({ ok: true });
  }

  // listar coordinadores (usuarios con rol coordinador) — admin
  if (path === "/api/coordinadores" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      `SELECT u.id, u.nombre FROM usuarios u JOIN roles r ON r.id = u.rol_id
       WHERE r.nombre = 'coordinador' AND u.activo = 1 ORDER BY u.nombre`
    ).all();
    return json({ coordinadores: results });
  }

  // asignar (o quitar) coordinador a un lote — admin o RRHH (RRHH esta en finca)
  if (path.match(/^\/api\/lotes\/\d+\/coordinador$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador" && user.rol !== "rrhh") return json({ error: "Solo el administrador o recursos humanos pueden asignar coordinadores." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const { coordinador_id } = await req.json();
    // coordinador_id null = quitar asignacion
    await env.DB.prepare("UPDATE lotes SET coordinador_id = ? WHERE id = ?")
      .bind(coordinador_id || null, id).run();
    await audit(env, user.id, "editar", "lotes", id, null, { coordinador_id: coordinador_id || null });
    return json({ ok: true });
  }
  if (path === "/api/trabajadores" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      `SELECT t.*, c.nombre AS cargo_nombre
       FROM trabajadores t LEFT JOIN cargos c ON c.id = t.cargo_id
       ORDER BY t.activo DESC, t.nombre`
    ).all();
    // habilidades por trabajador
    const hab = await env.DB.prepare(
      `SELECT th.trabajador_id, th.labor_id, l.nombre AS labor
       FROM trabajador_habilidades th JOIN labores l ON l.id = th.labor_id`
    ).all();
    const mapa = {};
    for (const h of hab.results) {
      (mapa[h.trabajador_id] = mapa[h.trabajador_id] || []).push({ id: h.labor_id, nombre: h.labor });
    }
    for (const t of results) t.habilidades = mapa[t.id] || [];
    return json({ trabajadores: results });
  }

  // crear trabajador (admin o rrhh)
  if (path === "/api/trabajadores" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador" && user.rol !== "rrhh")
      return json({ error: "Solo el administrador o recursos humanos pueden crear trabajadores." }, 403);
    const b = await req.json();
    if (!b.nombre || !b.nombre.trim()) return json({ error: "El nombre es obligatorio." }, 400);
    if (b.cedula) {
      const dup = await env.DB.prepare("SELECT id FROM trabajadores WHERE cedula = ?").bind(String(b.cedula).trim()).first();
      if (dup) return json({ error: `Ya existe un trabajador con la cédula ${b.cedula}.` }, 409);
    }
    const res = await env.DB.prepare(
      `INSERT INTO trabajadores
         (nombre, cedula, telefono, email, direccion, ciudad, cargo_id, tipo_contrato,
          lugar, es_aprendiz_sena, fecha_ingreso, fecha_salida, suspendido,
          suspension_desde, suspension_hasta, salario_periodo, paga_catorcena, activo)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`
    ).bind(
      b.nombre.trim(), b.cedula ? String(b.cedula).trim() : null, b.telefono || null,
      b.email || null, b.direccion || null, b.ciudad || null, b.cargo_id ?? null,
      b.tipo_contrato || null, b.lugar || null, b.es_aprendiz_sena ? 1 : 0,
      b.fecha_ingreso || null, b.fecha_salida || null, b.suspendido ? 1 : 0,
      b.suspension_desde || null, b.suspension_hasta || null,
      b.salario_periodo ?? 0, b.paga_catorcena ? 1 : 0
    ).run();
    const tid = res.meta.last_row_id;
    if (Array.isArray(b.habilidades)) await setHabilidades(env, tid, b.habilidades);
    await audit(env, user.id, "crear", "trabajadores", tid, null, { nombre: b.nombre, cedula: b.cedula });
    return json({ ok: true, id: tid });
  }

  // editar trabajador (admin o rrhh)
  if (path.match(/^\/api\/trabajadores\/\d+$/) && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador" && user.rol !== "rrhh")
      return json({ error: "Solo el administrador o recursos humanos pueden editar trabajadores." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const antes = await env.DB.prepare("SELECT * FROM trabajadores WHERE id = ?").bind(id).first();
    if (!antes) return json({ error: "Trabajador no encontrado." }, 404);
    const b = await req.json();
    if (b.cedula) {
      const dup = await env.DB.prepare("SELECT id FROM trabajadores WHERE cedula = ? AND id != ?")
        .bind(String(b.cedula).trim(), id).first();
      if (dup) return json({ error: `Otra persona ya tiene la cédula ${b.cedula}.` }, 409);
    }
    await env.DB.prepare(
      `UPDATE trabajadores SET nombre=?, cedula=?, telefono=?, email=?, direccion=?, ciudad=?,
         cargo_id=?, tipo_contrato=?, lugar=?, es_aprendiz_sena=?, fecha_ingreso=?, fecha_salida=?,
         suspendido=?, suspension_desde=?, suspension_hasta=?, salario_periodo=?, paga_catorcena=?, activo=? WHERE id=?`
    ).bind(
      b.nombre?.trim() ?? antes.nombre,
      b.cedula != null ? (b.cedula ? String(b.cedula).trim() : null) : antes.cedula,
      b.telefono ?? antes.telefono, b.email ?? antes.email, b.direccion ?? antes.direccion,
      b.ciudad ?? antes.ciudad, b.cargo_id ?? antes.cargo_id, b.tipo_contrato ?? antes.tipo_contrato,
      b.lugar ?? antes.lugar,
      b.es_aprendiz_sena != null ? (b.es_aprendiz_sena ? 1 : 0) : antes.es_aprendiz_sena,
      b.fecha_ingreso ?? antes.fecha_ingreso, b.fecha_salida ?? antes.fecha_salida,
      b.suspendido != null ? (b.suspendido ? 1 : 0) : antes.suspendido,
      b.suspension_desde ?? antes.suspension_desde, b.suspension_hasta ?? antes.suspension_hasta,
      b.salario_periodo !== undefined ? b.salario_periodo : antes.salario_periodo,
      b.paga_catorcena != null ? (b.paga_catorcena ? 1 : 0) : antes.paga_catorcena,
      b.activo != null ? (b.activo ? 1 : 0) : antes.activo,
      id
    ).run();
    if (Array.isArray(b.habilidades)) await setHabilidades(env, id, b.habilidades);
    await audit(env, user.id, "editar", "trabajadores", id, antes, b);
    return json({ ok: true });
  }

  // carga masiva desde Excel (el navegador parsea y manda JSON) — admin o rrhh
  if (path === "/api/trabajadores/carga" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador" && user.rol !== "rrhh")
      return json({ error: "Solo el administrador o recursos humanos pueden cargar trabajadores." }, 403);
    const { filas } = await req.json();
    if (!Array.isArray(filas) || filas.length === 0) return json({ error: "No hay filas para cargar." }, 400);

    // labores por nombre (para resolver habilidades)
    const lab = await env.DB.prepare("SELECT id, nombre FROM labores").all();
    const laborPorNombre = {};
    for (const l of lab.results) laborPorNombre[normaliza(l.nombre)] = l.id;

    let creados = 0, saltados = 0;
    const errores = [];
    for (let i = 0; i < filas.length; i++) {
      const f = filas[i];
      const nombre = (f.nombre || "").trim();
      if (!nombre) { saltados++; errores.push(`Fila ${i + 2}: sin nombre, se omitió.`); continue; }
      const cedula = f.cedula ? String(f.cedula).trim() : null;
      if (cedula) {
        const dup = await env.DB.prepare("SELECT id FROM trabajadores WHERE cedula = ?").bind(cedula).first();
        if (dup) { saltados++; errores.push(`Fila ${i + 2}: cédula ${cedula} ya existe, se omitió.`); continue; }
      }
      const res = await env.DB.prepare(
        `INSERT INTO trabajadores
           (nombre, cedula, telefono, email, direccion, ciudad, tipo_contrato, lugar,
            es_aprendiz_sena, fecha_ingreso, activo)
         VALUES (?,?,?,?,?,?,?,?,?,?,1)`
      ).bind(
        nombre, cedula, f.telefono || null, f.email || null, f.direccion || null,
        f.ciudad || null, f.tipo_contrato || null, f.lugar || null,
        /^s[ií]$/i.test((f.aprendiz_sena || "").trim()) ? 1 : 0, f.fecha_ingreso || null
      ).run();
      const tid = res.meta.last_row_id;
      // habilidades: separadas por , o ;
      if (f.habilidades) {
        const nombres = String(f.habilidades).split(/[,;]/).map(s => s.trim()).filter(Boolean);
        const ids = [];
        for (const n of nombres) {
          const lid = laborPorNombre[normaliza(n)];
          if (lid) ids.push(lid);
          else errores.push(`Fila ${i + 2}: labor "${n}" no reconocida, se omitió esa habilidad.`);
        }
        if (ids.length) await setHabilidades(env, tid, ids);
      }
      creados++;
    }
    await audit(env, user.id, "crear", "trabajadores", null, null, { carga_masiva: creados });
    return json({ ok: true, creados, saltados, errores });
  }

  // ==========================================================
  // FESTIVOS — ver: autenticado; calcular/editar/aprobar: solo admin
  // ==========================================================

  // listar festivos de un año + estado de aprobación
  if (path.match(/^\/api\/festivos\/\d+$/) && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const anio = parseInt(path.split("/")[3], 10);
    const { results } = await env.DB.prepare(
      "SELECT id, fecha, nombre, origen FROM festivos WHERE anio = ? ORDER BY fecha"
    ).bind(anio).all();
    const estado = await env.DB.prepare("SELECT aprobado, aprobado_en FROM festivos_estado WHERE anio = ?").bind(anio).first();
    return json({ anio, festivos: results, aprobado: estado ? !!estado.aprobado : false, aprobado_en: estado?.aprobado_en || null });
  }

  // (re)calcular festivos de ley para un año — solo admin (no borra los manuales)
  if (path.match(/^\/api\/festivos\/\d+\/calcular$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede calcular los festivos." }, 403);
    const anio = parseInt(path.split("/")[3], 10);
    const calculados = festivosColombia(anio);
    // borrar solo los de ley de ese año (conservar los manuales)
    await env.DB.prepare("DELETE FROM festivos WHERE anio = ? AND origen = 'ley'").bind(anio).run();
    for (const f of calculados) {
      // evitar chocar con un manual que caiga el mismo dia
      const existe = await env.DB.prepare("SELECT id FROM festivos WHERE fecha = ?").bind(f.fecha).first();
      if (!existe) {
        await env.DB.prepare("INSERT INTO festivos (anio, fecha, nombre, origen) VALUES (?, ?, ?, 'ley')")
          .bind(anio, f.fecha, f.nombre).run();
      }
    }
    // recalcular invalida la aprobación previa
    await env.DB.prepare(
      "INSERT INTO festivos_estado (anio, aprobado) VALUES (?, 0) ON CONFLICT(anio) DO UPDATE SET aprobado = 0"
    ).bind(anio).run();
    await audit(env, user.id, "crear", "festivos", null, null, { anio, calculados: calculados.length });
    // recordatorio para el admin: aprobar el calendario de ese año
    await crearPendiente(env, {
      tipo: "resolver",
      titulo: `Aprobar el calendario de festivos ${anio}`,
      detalle: `Se calcularon los festivos de ${anio}. Revísalos y apruébalos. Se cierra solo cuando apruebes el calendario.`,
      origen: "festivos",
      ref_tabla: "festivos_aprobar",
      ref_id: anio,
      rol: "administrador",
    });
    return json({ ok: true });
  }

  // agregar festivo manual — solo admin
  if (path === "/api/festivos" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede agregar festivos." }, 403);
    const { fecha, nombre } = await req.json();
    if (!fecha || !nombre) return json({ error: "Fecha y nombre son obligatorios." }, 400);
    const anio = parseInt(fecha.slice(0, 4), 10);
    const dup = await env.DB.prepare("SELECT id FROM festivos WHERE fecha = ?").bind(fecha).first();
    if (dup) return json({ error: "Ya hay un festivo en esa fecha." }, 409);
    await env.DB.prepare("INSERT INTO festivos (anio, fecha, nombre, origen) VALUES (?, ?, ?, 'manual')")
      .bind(anio, fecha, nombre.trim()).run();
    await env.DB.prepare(
      "INSERT INTO festivos_estado (anio, aprobado) VALUES (?, 0) ON CONFLICT(anio) DO UPDATE SET aprobado = 0"
    ).bind(anio).run();
    await audit(env, user.id, "crear", "festivos", null, null, { fecha, nombre });
    await crearPendiente(env, {
      tipo: "resolver",
      titulo: `Aprobar el calendario de festivos ${anio}`,
      detalle: `El calendario de ${anio} cambió (se agregó un festivo) y quedó pendiente de aprobar. Se cierra solo cuando lo apruebes.`,
      origen: "festivos", ref_tabla: "festivos_aprobar", ref_id: anio, rol: "administrador",
    });
    return json({ ok: true });
  }

  // quitar un festivo — solo admin
  if (path.match(/^\/api\/festivos\/\d+$/) && req.method === "DELETE") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede quitar festivos." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const f = await env.DB.prepare("SELECT * FROM festivos WHERE id = ?").bind(id).first();
    if (!f) return json({ error: "Festivo no encontrado." }, 404);
    await env.DB.prepare("DELETE FROM festivos WHERE id = ?").bind(id).run();
    await env.DB.prepare(
      "INSERT INTO festivos_estado (anio, aprobado) VALUES (?, 0) ON CONFLICT(anio) DO UPDATE SET aprobado = 0"
    ).bind(f.anio).run();
    await audit(env, user.id, "borrar", "festivos", id, f, null);
    await crearPendiente(env, {
      tipo: "resolver",
      titulo: `Aprobar el calendario de festivos ${f.anio}`,
      detalle: `El calendario de ${f.anio} cambió (se quitó un festivo) y quedó pendiente de aprobar. Se cierra solo cuando lo apruebes.`,
      origen: "festivos", ref_tabla: "festivos_aprobar", ref_id: f.anio, rol: "administrador",
    });
    return json({ ok: true });
  }

  // aprobar el calendario del año — solo admin
  if (path.match(/^\/api\/festivos\/\d+\/aprobar$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede aprobar el calendario." }, 403);
    const anio = parseInt(path.split("/")[3], 10);
    await env.DB.prepare(
      `INSERT INTO festivos_estado (anio, aprobado, aprobado_por, aprobado_en)
       VALUES (?, 1, ?, datetime('now'))
       ON CONFLICT(anio) DO UPDATE SET aprobado = 1, aprobado_por = excluded.aprobado_por, aprobado_en = excluded.aprobado_en`
    ).bind(anio, user.id).run();
    await audit(env, user.id, "confirmar", "festivos", anio, null, { aprobado: 1 });
    // cerrar el pendiente de "aprobar calendario" de ese año
    await resolverPendientesRef(env, "festivos_aprobar", anio);
    return json({ ok: true });
  }

  // ==========================================================
  // PARAMETROS DE NOMINA — ver: autenticado; editar/aprobar: contabilidad o admin
  // ==========================================================
  function puedeNomina(u) { return u.rol === "contabilidad" || u.rol === "administrador"; }

  // listar todos los periodos de parametros
  if (path === "/api/nomina/parametros" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      "SELECT * FROM nomina_parametros ORDER BY vigente_desde DESC"
    ).all();
    return json({ parametros: results, puede_editar: puedeNomina(user) });
  }

  // editar un periodo (solo contabilidad/admin) — cualquier cambio lo deja pendiente
  if (path.match(/^\/api\/nomina\/parametros\/\d+$/) && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeNomina(user)) return json({ error: "Solo contabilidad o el administrador pueden editar los parámetros." }, 403);
    const id = parseInt(path.split("/")[4], 10);
    const antes = await env.DB.prepare("SELECT * FROM nomina_parametros WHERE id = ?").bind(id).first();
    if (!antes) return json({ error: "Parámetro no encontrado." }, 404);
    const b = await req.json();
    await env.DB.prepare(
      `UPDATE nomina_parametros SET
         jornada_semanal_horas=?, nocturno_inicio=?, nocturno_fin=?,
         rec_nocturno_pct=?, rec_dominical_pct=?, extra_diurna_pct=?, extra_nocturna_pct=?,
         extra_dom_diurna_pct=?, extra_dom_nocturna_pct=?, nota=?, fuente=?,
         aprobado=0, aprobado_por=NULL, aprobado_en=NULL
       WHERE id=?`
    ).bind(
      b.jornada_semanal_horas ?? antes.jornada_semanal_horas,
      b.nocturno_inicio ?? antes.nocturno_inicio,
      b.nocturno_fin ?? antes.nocturno_fin,
      b.rec_nocturno_pct ?? antes.rec_nocturno_pct,
      b.rec_dominical_pct ?? antes.rec_dominical_pct,
      b.extra_diurna_pct ?? antes.extra_diurna_pct,
      b.extra_nocturna_pct ?? antes.extra_nocturna_pct,
      b.extra_dom_diurna_pct ?? antes.extra_dom_diurna_pct,
      b.extra_dom_nocturna_pct ?? antes.extra_dom_nocturna_pct,
      b.nota ?? antes.nota, b.fuente ?? antes.fuente, id
    ).run();
    await audit(env, user.id, "editar", "nomina_parametros", id, antes, b);
    return json({ ok: true });
  }

  // aprobar un periodo (contabilidad/admin)
  if (path.match(/^\/api\/nomina\/parametros\/\d+\/aprobar$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeNomina(user)) return json({ error: "Solo contabilidad o el administrador pueden aprobar." }, 403);
    const id = parseInt(path.split("/")[4], 10);
    await env.DB.prepare(
      "UPDATE nomina_parametros SET aprobado=1, aprobado_por=?, aprobado_en=datetime('now') WHERE id=?"
    ).bind(user.id, id).run();
    await audit(env, user.id, "confirmar", "nomina_parametros", id, null, { aprobado: 1 });
    return json({ ok: true });
  }

  // boton de IA de contabilidad: verificar normatividad (EN PAUSA hasta configurar la llave)
  if (path === "/api/nomina/verificar-ia" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeNomina(user)) return json({ error: "Solo contabilidad o el administrador pueden usar esta verificación." }, 403);
    // La conexion con la IA (API de Anthropic) se activa cuando se configure la
    // llave como secreto de Cloudflare (ANTHROPIC_API_KEY). Por ahora, en pausa.
    if (!env.ANTHROPIC_API_KEY) {
      return json({
        pendiente: true,
        mensaje: "La verificación con IA aún no está activa. Falta configurar la conexión con la IA (llave de Anthropic). Cuando se configure, este botón buscará la normatividad vigente, la comparará con los parámetros guardados y mostrará las diferencias con su fuente para que contabilidad las apruebe."
      });
    }
    // (Cuando haya llave, aqui iria la llamada a la API de Claude con web_search
    //  para traer la normatividad vigente + fuente. Se implementa en la fase de IA.)
    return json({ pendiente: true, mensaje: "Verificación con IA pendiente de implementación final." });
  }

  // ==========================================================
  // REPORTE DE LABORES — capturan coordinadores y administrador
  // ==========================================================
  function puedeReportar(u){ return u.rol === "coordinador" || u.rol === "administrador"; }

  // datos para armar el formulario: trabajadores activos, labores activas, lotes.
  // Si es coordinador, los lotes se marcan segun cuales tiene asignados.
  if (path === "/api/reporte/datos" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeReportar(user)) return json({ error: "Solo coordinadores o el administrador capturan reportes." }, 403);

    const trab = await env.DB.prepare(
      "SELECT id, nombre, cedula FROM trabajadores WHERE activo = 1 AND (suspendido = 0 OR suspendido IS NULL) ORDER BY nombre"
    ).all();
    const lab = await env.DB.prepare(
      "SELECT id, codigo, nombre, rendimiento_estandar, unidad_rendimiento FROM labores WHERE activo = 1 AND borrado_pendiente = 0 ORDER BY codigo"
    ).all();
    const lotesQ = await env.DB.prepare(
      "SELECT id, nombre, densidad_plantas_ha, es_zona_especial, coordinador_id, activo FROM lotes WHERE activo = 1 ORDER BY id"
    ).all();
    // habilidades: mapa trabajador -> [labor_id]
    const hab = await env.DB.prepare("SELECT trabajador_id, labor_id FROM trabajador_habilidades").all();
    const habMap = {};
    for (const h of hab.results) (habMap[h.trabajador_id] = habMap[h.trabajador_id] || []).push(h.labor_id);

    // buscar mi id de usuario coordinador para marcar mis lotes
    const misLotes = user.rol === "coordinador"
      ? lotesQ.results.filter(l => l.coordinador_id === user.id).map(l => l.id)
      : lotesQ.results.map(l => l.id);

    return json({
      trabajadores: trab.results,
      labores: lab.results,
      lotes: lotesQ.results,
      habilidades: habMap,
      mis_lotes: misLotes,
      soy_coordinador: user.rol === "coordinador",
    });
  }

  // guardar la planilla del dia (varias lineas de una vez)
  if (path === "/api/reporte" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeReportar(user)) return json({ error: "Solo coordinadores o el administrador capturan reportes." }, 403);
    const { fecha, lineas } = await req.json();
    if (!fecha) return json({ error: "Falta la fecha del reporte." }, 400);
    if (!Array.isArray(lineas) || lineas.length === 0) return json({ error: "Agrega al menos una línea." }, 400);

    // cargar estandares de labores para calcular bajo_estandar
    const lab = await env.DB.prepare("SELECT id, rendimiento_estandar FROM labores").all();
    const estandar = {};
    for (const l of lab.results) estandar[l.id] = l.rendimiento_estandar;
    // semana ISO aproximada del año
    const semana = semanaDelAnio(fecha);

    let guardadas = 0;
    const errores = [];
    for (let i = 0; i < lineas.length; i++) {
      const ln = lineas[i];
      if (!ln.trabajador_id || !ln.labor_id || !ln.lote_id) {
        errores.push(`Línea ${i + 1}: faltan trabajador, labor o lote.`); continue;
      }
      const horas = calcularHoras(ln.hora_inicio, ln.hora_fin);
      const rend = (horas && ln.cantidad_ejecutada) ? (ln.cantidad_ejecutada / horas) : null;
      const est = estandar[ln.labor_id];
      const bajo = (est != null && rend != null && rend < est) ? 1 : 0;
      // si es bajo y no hay explicacion, se rechaza esa linea
      if (bajo && (!ln.explicacion || !ln.explicacion.trim())) {
        errores.push(`Línea ${i + 1}: rendimiento bajo el estándar, falta la explicación.`); continue;
      }
      const insRes = await env.DB.prepare(
        `INSERT INTO reporte_labores
           (fecha, semana, trabajador_id, labor_id, lote_id, cantidad_ejecutada,
            hora_inicio, hora_fin, horas_trabajadas, rendimiento_real, bajo_estandar,
            explicacion, sin_habilidad, creado_por)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(
        fecha, semana, ln.trabajador_id, ln.labor_id, ln.lote_id,
        ln.cantidad_ejecutada ?? null, ln.hora_inicio ?? null, ln.hora_fin ?? null,
        horas ?? null, rend ?? null, bajo, ln.explicacion ?? null,
        ln.sin_habilidad ? 1 : 0, user.id
      ).run();
      // pendiente informativo al admin por rendimiento bajo
      if (bajo) {
        const t = await env.DB.prepare("SELECT nombre FROM trabajadores WHERE id=?").bind(ln.trabajador_id).first();
        const l = await env.DB.prepare("SELECT codigo, nombre FROM labores WHERE id=?").bind(ln.labor_id).first();
        const lo = await env.DB.prepare("SELECT nombre FROM lotes WHERE id=?").bind(ln.lote_id).first();
        await crearPendiente(env, {
          tipo: "informativa",
          grupo: "Rendimientos bajos",
          titulo: `${t ? t.nombre : "Trabajador"} — ${l ? ((l.codigo ? l.codigo + " · " : "") + l.nombre) : "labor"}`,
          detalle: `${fecha} · ${lo ? lo.nombre : ""} · rindió ${rend != null ? rend.toFixed(1) : "?"} (bajo el estándar). Explicación: ${ln.explicacion || "—"}`,
          origen: "reporte",
          ref_tabla: "reporte_labores",
          ref_id: insRes.meta.last_row_id,
          rol: "administrador",
        });
      }
      // 8B-2: si este reporte respalda una salida marcada, cerrar su alerta
      await cerrarCruceSalida(env, { fecha, trabajador_id: ln.trabajador_id, labor_id: ln.labor_id || null, lote_id: ln.lote_id || null });
      guardadas++;
    }
    await audit(env, user.id, "crear", "reporte_labores", null, null, { fecha, guardadas });
    return json({ ok: true, guardadas, errores });
  }

  // listar reportes recientes (para revisar lo capturado)
  if (path === "/api/reporte" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeReportar(user) && user.rol !== "rrhh" && user.rol !== "contabilidad")
      return json({ error: "Sin acceso." }, 403);
    const url = new URL(req.url);
    const fecha = url.searchParams.get("fecha");
    let q = `SELECT r.id, r.fecha, r.cantidad_ejecutada, r.hora_inicio, r.hora_fin,
                    r.horas_trabajadas, r.rendimiento_real, r.bajo_estandar, r.explicacion, r.sin_habilidad,
                    t.nombre AS trabajador, l.codigo AS labor_codigo, l.nombre AS labor, l.unidad_rendimiento,
                    lo.nombre AS lote
             FROM reporte_labores r
             JOIN trabajadores t ON t.id = r.trabajador_id
             JOIN labores l ON l.id = r.labor_id
             JOIN lotes lo ON lo.id = r.lote_id`;
    const binds = [];
    if (fecha) { q += " WHERE r.fecha = ?"; binds.push(fecha); }
    q += " ORDER BY r.fecha DESC, r.id DESC LIMIT 200";
    const { results } = await env.DB.prepare(q).bind(...binds).all();
    return json({ reportes: results });
  }

  // ==========================================================
  // CENTROS DE COSTO — ver: autenticado; editar: admin
  // ==========================================================
  if (path === "/api/centros-costo" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      "SELECT id, nombre, activo FROM centros_costo ORDER BY activo DESC, nombre"
    ).all();
    return json({ centros: results });
  }
  if (path === "/api/centros-costo" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede crear centros de costo." }, 403);
    const { nombre } = await req.json();
    if (!nombre || !nombre.trim()) return json({ error: "El nombre es obligatorio." }, 400);
    const res = await env.DB.prepare("INSERT INTO centros_costo (nombre, activo) VALUES (?, 1)").bind(nombre.trim()).run();
    await audit(env, user.id, "crear", "centros_costo", res.meta.last_row_id, null, { nombre });
    return json({ ok: true, id: res.meta.last_row_id });
  }
  if (path.match(/^\/api\/centros-costo\/\d+$/) && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede editar centros de costo." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const b = await req.json();
    await env.DB.prepare("UPDATE centros_costo SET nombre=?, activo=? WHERE id=?")
      .bind(b.nombre?.trim(), b.activo != null ? (b.activo ? 1 : 0) : 1, id).run();
    await audit(env, user.id, "editar", "centros_costo", id, null, b);
    return json({ ok: true });
  }

  // ==========================================================
  // MATERIALES — ver: autenticado; editar: admin o almacen
  // ==========================================================
  function puedeMateriales(u){ return u.rol === "administrador" || u.rol === "almacen"; }

  if (path === "/api/materiales" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      `SELECT id, codigo, nombre, unidad, precio_unitario, unidad_compra, peso_presentacion, unidad_peso, activo, tipo
       FROM materiales ORDER BY activo DESC, codigo`
    ).all();
    // centros de cada material
    const rel = await env.DB.prepare(
      `SELECT mc.material_id, mc.centro_costo_id, c.nombre
       FROM material_centro mc JOIN centros_costo c ON c.id = mc.centro_costo_id`
    ).all();
    const mapa = {};
    for (const r of rel.results) (mapa[r.material_id] = mapa[r.material_id] || []).push({ id: r.centro_costo_id, nombre: r.nombre });
    for (const m of results) m.centros = mapa[m.id] || [];
    return json({ materiales: results });
  }

  if (path === "/api/materiales" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeMateriales(user)) return json({ error: "Solo el administrador o almacén pueden crear materiales." }, 403);
    const b = await req.json();
    if (!b.nombre || !b.nombre.trim()) return json({ error: "El nombre es obligatorio." }, 400);
    const res = await env.DB.prepare(
      `INSERT INTO materiales (codigo, nombre, unidad, precio_unitario, unidad_compra, peso_presentacion, unidad_peso, activo, tipo)
       VALUES (?,?,?,?,?,?,?,1,?)`
    ).bind(
      b.codigo ?? null, b.nombre.trim(), b.unidad ?? null, b.precio_unitario ?? null,
      b.unidad_compra ?? null, b.peso_presentacion ?? null, b.unidad_peso ?? null,
      ["material","repuesto"].includes(b.tipo) ? b.tipo : "material"
    ).run();
    const mid = res.meta.last_row_id;
    if (Array.isArray(b.centros)) await setCentros(env, mid, b.centros);
    await audit(env, user.id, "crear", "materiales", mid, null, b);
    return json({ ok: true, id: mid });
  }

  if (path.match(/^\/api\/materiales\/\d+$/) && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeMateriales(user)) return json({ error: "Solo el administrador o almacén pueden editar materiales." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const antes = await env.DB.prepare("SELECT * FROM materiales WHERE id = ?").bind(id).first();
    if (!antes) return json({ error: "Material no encontrado." }, 404);
    const b = await req.json();
    await env.DB.prepare(
      `UPDATE materiales SET codigo=?, nombre=?, unidad=?, precio_unitario=?, unidad_compra=?, peso_presentacion=?, unidad_peso=?, activo=?, tipo=?
       WHERE id=?`
    ).bind(
      b.codigo !== undefined ? b.codigo : antes.codigo,
      b.nombre?.trim() ?? antes.nombre,
      b.unidad !== undefined ? b.unidad : antes.unidad,
      b.precio_unitario !== undefined ? b.precio_unitario : antes.precio_unitario,
      b.unidad_compra !== undefined ? b.unidad_compra : antes.unidad_compra,
      b.peso_presentacion !== undefined ? b.peso_presentacion : antes.peso_presentacion,
      b.unidad_peso !== undefined ? b.unidad_peso : antes.unidad_peso,
      b.activo != null ? (b.activo ? 1 : 0) : antes.activo,
      ["material","repuesto"].includes(b.tipo) ? b.tipo : (antes.tipo || "material"),
      id
    ).run();
    if (Array.isArray(b.centros)) await setCentros(env, id, b.centros);
    await audit(env, user.id, "editar", "materiales", id, antes, b);
    return json({ ok: true });
  }

  // ==========================================================
  // ALMACEN — proveedores, entradas, inventario (6B-1)
  // ver: autenticado; registrar: almacen o admin
  // ==========================================================
  function puedeAlmacen(u){ return u.rol === "administrador" || u.rol === "almacen"; }
  function puedeVerificar(u){ return u.rol === "administrador" || u.rol === "rrhh" || u.rol === "revisora_fiscal"; }

  // --- PROVEEDORES ---
  if (path === "/api/proveedores" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      "SELECT id, codigo, nombre, nit, activo FROM proveedores ORDER BY activo DESC, nombre"
    ).all();
    return json({ proveedores: results });
  }
  if (path === "/api/proveedores" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo almacén o el administrador pueden crear proveedores." }, 403);
    const b = await req.json();
    if (!b.nombre || !b.nombre.trim()) return json({ error: "El nombre es obligatorio." }, 400);
    const res = await env.DB.prepare("INSERT INTO proveedores (codigo, nombre, nit, activo) VALUES (?,?,?,1)")
      .bind(b.codigo || null, b.nombre.trim(), b.nit || null).run();
    await audit(env, user.id, "crear", "proveedores", res.meta.last_row_id, null, b);
    return json({ ok: true, id: res.meta.last_row_id });
  }
  if (path.match(/^\/api\/proveedores\/\d+$/) && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo almacén o el administrador pueden editar proveedores." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const b = await req.json();
    await env.DB.prepare("UPDATE proveedores SET codigo=?, nombre=?, nit=?, activo=? WHERE id=?")
      .bind(b.codigo || null, b.nombre?.trim(), b.nit || null, b.activo != null ? (b.activo ? 1 : 0) : 1, id).run();
    await audit(env, user.id, "editar", "proveedores", id, null, b);
    return json({ ok: true });
  }

  // --- INVENTARIO (existencias por material, sumando capas) ---
  if (path === "/api/inventario" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      `SELECT m.id, m.codigo, m.nombre, m.unidad, m.tipo AS material_tipo, m.precio_unitario, m.stock_minimo,
              COALESCE(SUM(e.cantidad_actual), 0) AS existencia,
              COUNT(e.id) AS capas
       FROM materiales m
       LEFT JOIN entradas_almacen e ON e.material_id = m.id AND e.cantidad_actual > 0
       WHERE m.activo = 1
       GROUP BY m.id ORDER BY m.codigo`
    ).all();
    return json({ inventario: results });
  }

  // --- CAPAS de un material (para ver el detalle y confirmar existencia) ---
  if (path.match(/^\/api\/inventario\/\d+\/capas$/) && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const id = parseInt(path.split("/")[3], 10);
    const { results } = await env.DB.prepare(
      `SELECT e.id, e.fecha, e.cantidad_inicial, e.cantidad_actual, e.precio_unitario, e.factura_nro,
              p.nombre AS proveedor
       FROM entradas_almacen e LEFT JOIN proveedores p ON p.id = e.proveedor_id
       WHERE e.material_id = ? AND e.cantidad_actual > 0 ORDER BY e.fecha, e.id`
    ).bind(id).all();
    const total = results.reduce((s, c) => s + c.cantidad_actual, 0);
    return json({ capas: results, existencia: total });
  }

  // --- listado de entradas recientes (pestaña Entradas: compra vs devolucion) ---
  if (path === "/api/entradas" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      `SELECT e.id, e.fecha, e.cantidad_inicial, e.cantidad_actual, e.precio_unitario, e.factura_nro,
              m.codigo AS material_codigo, m.nombre AS material, m.unidad, m.tipo AS material_tipo, p.nombre AS proveedor
       FROM entradas_almacen e
       JOIN materiales m ON m.id = e.material_id
       LEFT JOIN proveedores p ON p.id = e.proveedor_id
       ORDER BY e.fecha DESC, e.id DESC LIMIT 200`
    ).all();
    return json({ entradas: results });
  }

  // --- ENTRADA de almacen (nueva compra) ---
  if (path === "/api/entradas" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo almacén o el administrador pueden registrar entradas." }, 403);
    const b = await req.json();
    if (!b.material_id || !b.cantidad || !b.fecha) return json({ error: "Faltan material, cantidad o fecha." }, 400);

    // mini-verificacion: si el almacenista reporto una existencia fisica y no coincide, alertar
    if (b.existencia_fisica != null && b.existencia_sistema != null &&
        Number(b.existencia_fisica) !== Number(b.existencia_sistema)) {
      await env.DB.prepare(
        `INSERT INTO alertas_inventario (material_id, cantidad_sistema, cantidad_fisica, diferencia, reportado_por)
         VALUES (?,?,?,?,?)`
      ).bind(b.material_id, b.existencia_sistema, b.existencia_fisica,
             Number(b.existencia_fisica) - Number(b.existencia_sistema), user.id).run();
    }

    // registrar la capa
    const res = await env.DB.prepare(
      `INSERT INTO entradas_almacen (material_id, proveedor_id, fecha, cantidad_inicial, cantidad_actual, precio_unitario, factura_nro, registrado_por)
       VALUES (?,?,?,?,?,?,?,?)`
    ).bind(b.material_id, b.proveedor_id || null, b.fecha, b.cantidad, b.cantidad,
           b.precio_unitario ?? null, b.factura_nro || null, user.id).run();

    // actualizar precio actual del catalogo + historial de precios
    if (b.precio_unitario != null) {
      await env.DB.prepare("UPDATE materiales SET precio_unitario = ? WHERE id = ?")
        .bind(b.precio_unitario, b.material_id).run();
      await env.DB.prepare(
        "INSERT INTO historial_precios (material_id, precio, origen, referencia) VALUES (?,?,'entrada',?)"
      ).bind(b.material_id, b.precio_unitario, b.factura_nro || null).run();
    }
    await audit(env, user.id, "crear", "entradas_almacen", res.meta.last_row_id, null, b);
    // si este material estaba en negativo y ya no lo esta, cerrar su pendiente
    const saldo = await env.DB.prepare(
      "SELECT COALESCE(SUM(cantidad_actual),0) AS s FROM entradas_almacen WHERE material_id=?"
    ).bind(b.material_id).first();
    if (saldo && saldo.s >= 0) {
      await resolverPendientesRef(env, "material_negativo", b.material_id);
      // tambien marcar resueltas las alertas de inventario de ese material
      await env.DB.prepare("UPDATE alertas_inventario SET resuelta=1 WHERE material_id=? AND resuelta=0").bind(b.material_id).run();
    }
    return json({ ok: true });
  }

  // --- HISTORIAL DE PRECIOS de un material ---
  if (path.match(/^\/api\/materiales\/\d+\/precios$/) && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const id = parseInt(path.split("/")[3], 10);
    const { results } = await env.DB.prepare(
      "SELECT precio, fecha, origen, referencia FROM historial_precios WHERE material_id = ? ORDER BY fecha DESC, id DESC"
    ).bind(id).all();
    return json({ historial: results });
  }

  // --- ALERTAS de inventario (para verificadores) ---
  if (path === "/api/alertas-inventario" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeVerificar(user)) return json({ error: "Sin acceso." }, 403);
    const { results } = await env.DB.prepare(
      `SELECT a.id, a.material_id, m.nombre AS material, a.cantidad_sistema, a.cantidad_fisica,
              a.diferencia, a.fecha, a.resuelta, u.nombre AS reportado_por
       FROM alertas_inventario a JOIN materiales m ON m.id = a.material_id
       LEFT JOIN usuarios u ON u.id = a.reportado_por
       ORDER BY a.resuelta, a.fecha DESC`
    ).all();
    return json({ alertas: results });
  }

  // ==========================================================
  // JORNADA LABORAL — ver: autenticado; editar: admin
  // ==========================================================
  if (path === "/api/jornada" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const orden = "CASE dia WHEN 'lunes' THEN 1 WHEN 'martes' THEN 2 WHEN 'miercoles' THEN 3 WHEN 'jueves' THEN 4 WHEN 'viernes' THEN 5 WHEN 'sabado' THEN 6 WHEN 'domingo' THEN 7 END";
    const { results } = await env.DB.prepare(`SELECT * FROM jornada ORDER BY ${orden}`).all();
    // calcular horas por dia y total semana
    let totalSemana = 0;
    for (const d of results) {
      d.horas = horasDia(d.hora_inicio, d.almuerzo_desde, d.almuerzo_hasta, d.hora_fin);
      if (d.activo) totalSemana += d.horas;
    }
    return json({ jornada: results, total_semana: Math.round(totalSemana * 100) / 100 });
  }

  if (path === "/api/jornada" && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede definir la jornada." }, 403);
    const { dias } = await req.json(); // [{dia, activo, hora_inicio, almuerzo_desde, almuerzo_hasta, hora_fin, media_jornada}]
    if (!Array.isArray(dias)) return json({ error: "Datos inválidos." }, 400);
    for (const d of dias) {
      await env.DB.prepare(
        `UPDATE jornada SET activo=?, hora_inicio=?, almuerzo_desde=?, almuerzo_hasta=?, hora_fin=?, media_jornada=? WHERE dia=?`
      ).bind(d.activo ? 1 : 0, d.hora_inicio || null, d.almuerzo_desde || null, d.almuerzo_hasta || null,
             d.hora_fin || null, d.media_jornada ? 1 : 0, d.dia).run();
    }
    await audit(env, user.id, "editar", "jornada", null, null, { dias: dias.length });
    return json({ ok: true });
  }

  // ==========================================================
  // DEBER SER — calculo de mano de obra necesaria por labor
  // ==========================================================
  if (path === "/api/deber-ser" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);

    // 1) horas efectivas de la semana (de la jornada)
    const jornada = await env.DB.prepare("SELECT * FROM jornada WHERE activo = 1").all();
    let horasSemana = 0, diasActivos = 0;
    for (const d of jornada.results) { horasSemana += horasDia(d.hora_inicio, d.almuerzo_desde, d.almuerzo_hasta, d.hora_fin); diasActivos++; }
    const horasDiaProm = diasActivos > 0 ? horasSemana / diasActivos : 0;

    // 2) lotes activos con su area vigente y densidad
    const lotesQ = await env.DB.prepare(
      `SELECT l.id, l.nombre, l.densidad_plantas_ha, l.es_zona_especial,
              (SELECT hectareas FROM lote_versiones v WHERE v.lote_id = l.id AND v.vigente_hasta IS NULL ORDER BY v.vigente_desde DESC LIMIT 1) AS hectareas
       FROM lotes l WHERE l.activo = 1 AND (l.es_zona_especial = 0 OR l.es_zona_especial IS NULL)`
    ).all();
    let haTotal = 0, plantasTotal = 0;
    for (const l of lotesQ.results) {
      const ha = l.hectareas || 0;
      haTotal += ha;
      plantasTotal += ha * (l.densidad_plantas_ha || 0);
    }

    // 2.5) embolse real: promedio de las ultimas 4 semanas por lote (de reportes historicos + capturados)
    //      SOLO de lotes activos (si suspendes lotes, el embolse baja con ellos).
    const embolseQ = await env.DB.prepare(
      `SELECT lote_id, AVG(cantidad_ejecutada) AS prom FROM (
         SELECT r.lote_id, r.cantidad_ejecutada,
                ROW_NUMBER() OVER (PARTITION BY r.lote_id ORDER BY r.semana DESC, r.fecha DESC) AS rn
         FROM reporte_labores r
         JOIN lotes l ON l.id = r.lote_id
         WHERE r.labor_id = (SELECT id FROM labores WHERE codigo='101' LIMIT 1)
           AND r.cantidad_ejecutada IS NOT NULL
           AND l.activo = 1
       ) WHERE rn <= 4 GROUP BY lote_id`
    ).all();
    let racimosSemana = 0;
    for (const e of embolseQ.results) racimosSemana += (e.prom || 0);
    racimosSemana = Math.round(racimosSemana);
    const hayEmbolse = embolseQ.results.length > 0;

    // 3) labores con rendimiento y frecuencia
    const labores = await env.DB.prepare(
      `SELECT id, codigo, nombre, rendimiento_estandar, unidad_rendimiento, frecuencia_semanal
       FROM labores WHERE activo = 1 AND borrado_pendiente = 0 ORDER BY codigo`
    ).all();

    // 4) trabajadores asignados por labor (habilidad como proxy de asignacion actual)
    const hab = await env.DB.prepare("SELECT labor_id, COUNT(*) AS n FROM trabajador_habilidades GROUP BY labor_id").all();
    const asignados = {};
    for (const h of hab.results) asignados[h.labor_id] = h.n;

    const filas = [];
    for (const l of labores.results) {
      const fila = { id: l.id, codigo: l.codigo, nombre: l.nombre, unidad: l.unidad_rendimiento,
                     rendimiento: l.rendimiento_estandar, frecuencia: l.frecuencia_semanal,
                     asignados: asignados[l.id] || 0 };
      if (l.rendimiento_estandar == null || l.rendimiento_estandar <= 0) {
        fila.calculable = false;
        fila.mensaje = "Falta rendimiento para calcular. Ingrésalo en el catálogo de labores.";
        filas.push(fila);
        continue;
      }
      // determinar el "trabajo total" segun el tipo de labor y su unidad
      const uni = (l.unidad_rendimiento || "").toUpperCase();
      const nom = (l.nombre || "").toLowerCase();
      // labores ligadas al RACIMO: usan el embolse real (promedio 4 sem), no todas las plantas
      const esRacimo = /embols|desmane|desflor|desvio|apertura|amarr/.test(nom);
      let trabajoTotal = null, baseUnidad = "", nota = null;
      if (uni.includes("PLANTA") && esRacimo) {
        if (!hayEmbolse) {
          fila.calculable = false;
          fila.mensaje = "Aún no hay semanas de embolse capturadas para estimar el volumen. Se calculará cuando haya reportes.";
          filas.push(fila);
          continue;
        }
        trabajoTotal = racimosSemana; baseUnidad = "racimos/semana";
        nota = "Basado en el embolse real (promedio últimas 4 semanas).";
      } else if (uni.includes("PLANTA")) {
        trabajoTotal = plantasTotal; baseUnidad = "plantas";
        nota = "Basado en todas las plantas de los lotes activos.";
      } else if (uni.includes("HECT") || uni.includes("HTA") || uni.includes("HA")) {
        trabajoTotal = haTotal; baseUnidad = "hectáreas";
      } else {
        fila.calculable = false;
        fila.mensaje = `No hay dato del terreno para la unidad "${l.unidad_rendimiento}" (ej. metros de canal). Pendiente.`;
        filas.push(fila);
        continue;
      }
      fila.nota = nota;
      // rendimiento por dia (rendimiento/hora * horas del dia) y por semana (* dias que se hace)
      const frec = l.frecuencia_semanal && l.frecuencia_semanal > 0 ? l.frecuencia_semanal : 1;
      const rendDia = l.rendimiento_estandar * horasDiaProm;       // unidades/dia por trabajador
      // trabajo por dia = trabajoTotal repartido en los dias que se hace la labor en la semana
      const trabajoPorDia = trabajoTotal / frec;
      const trabsNecesarios = rendDia > 0 ? trabajoPorDia / rendDia : null;
      fila.calculable = true;
      fila.trabajo_total = Math.round(trabajoTotal);
      fila.base_unidad = baseUnidad;
      fila.rend_dia = Math.round(rendDia * 10) / 10;
      fila.trabajadores_necesarios = trabsNecesarios != null ? Math.ceil(trabsNecesarios * 10) / 10 : null;
      fila.diferencia = (fila.asignados != null && trabsNecesarios != null)
        ? Math.round((fila.asignados - trabsNecesarios) * 10) / 10 : null;
      filas.push(fila);
    }

    return json({
      horas_semana: Math.round(horasSemana * 100) / 100,
      horas_dia_promedio: Math.round(horasDiaProm * 100) / 100,
      ha_total: Math.round(haTotal * 100) / 100,
      plantas_total: Math.round(plantasTotal),
      racimos_semana: racimosSemana,
      hay_embolse: hayEmbolse,
      labores: filas,
    });
  }

  // ==========================================================
  // PLANIFICADOR DE AGENDA — ver: autenticado; editar: coordinador/admin
  // ==========================================================
  function puedePlanear(u){ return u.rol === "coordinador" || u.rol === "administrador"; }

  // datos base para el planificador (labores, lotes, trabajadores con habilidades)
  if (path === "/api/plan/datos" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const lab = await env.DB.prepare(
      "SELECT id, codigo, nombre, frecuencia_semanal FROM labores WHERE activo=1 AND borrado_pendiente=0 ORDER BY codigo"
    ).all();
    const lotesQ = await env.DB.prepare(
      "SELECT id, nombre, es_zona_especial, coordinador_id FROM lotes WHERE activo=1 ORDER BY id"
    ).all();
    const trab = await env.DB.prepare(
      "SELECT id, nombre FROM trabajadores WHERE activo=1 AND (suspendido=0 OR suspendido IS NULL) ORDER BY nombre"
    ).all();
    const hab = await env.DB.prepare("SELECT trabajador_id, labor_id FROM trabajador_habilidades").all();
    const habMap = {};
    for (const h of hab.results) (habMap[h.trabajador_id] = habMap[h.trabajador_id] || []).push(h.labor_id);
    return json({ labores: lab.results, lotes: lotesQ.results, trabajadores: trab.results,
                  habilidades: habMap, soy_coordinador: user.rol === "coordinador", mi_id: user.id });
  }

  // obtener la agenda de una semana (anio + semana)
  if (path.match(/^\/api\/plan\/\d+\/\d+$/) && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const parts = path.split("/");
    const anio = parseInt(parts[3], 10), semana = parseInt(parts[4], 10);
    const { results } = await env.DB.prepare(
      `SELECT a.id, a.anio, a.semana, a.fecha, a.labor_id, a.lote_id, a.trabajador_id, a.estado, a.origen,
              l.codigo AS labor_codigo, l.nombre AS labor_nombre,
              lo.nombre AS lote_nombre,
              t.nombre AS trabajador_nombre
       FROM agenda_plan a
       JOIN labores l ON l.id = a.labor_id
       JOIN lotes lo ON lo.id = a.lote_id
       LEFT JOIN trabajadores t ON t.id = a.trabajador_id
       WHERE a.anio = ? AND a.semana = ? ORDER BY a.fecha, a.labor_id`
    ).bind(anio, semana).all();
    // dias de la semana ISO
    const dias = diasSemanaISO(anio, semana);
    // esta cerrada? (semana pasada) — se calcula en el front comparando con la semana actual
    return json({ anio, semana, dias, asignaciones: results });
  }

  // crear una asignacion (trabajador + labor + lote + fecha)
  if (path === "/api/plan" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedePlanear(user)) return json({ error: "Solo coordinadores o el administrador planean." }, 403);
    const b = await req.json();
    if (!b.labor_id || !b.lote_id || !b.fecha) return json({ error: "Faltan labor, lote o fecha." }, 400);
    const d = new Date(b.fecha + "T12:00:00Z");
    const anio = d.getUTCFullYear();
    const semana = semanaDelAnio(b.fecha);
    // si la semana esta aprobada, exigir justificacion ANTES de crear
    const est0 = await env.DB.prepare("SELECT estado FROM plan_estado WHERE anio=? AND semana=?").bind(anio, semana).first();
    if (est0 && (est0.estado === "aprobada" || est0.estado === "cambios_por_aprobar") && (!b.explicacion || !b.explicacion.trim())) {
      return json({ error: "Esta semana ya fue aprobada. Debes justificar el cambio.", requiere_justificacion: true }, 400);
    }
    const res = await env.DB.prepare(
      `INSERT INTO agenda_plan (anio, semana, fecha, labor_id, lote_id, trabajador_id, estado, origen, creado_por)
       VALUES (?,?,?,?,?,?, 'planeado', ?, ?)`
    ).bind(anio, semana, b.fecha, b.labor_id, b.lote_id, b.trabajador_id || null, b.origen || "manual", user.id).run();
    const aid = res.meta.last_row_id;
    await registrarCambioAgenda(env, user, { anio, semana, agenda_plan_id: aid, accion: "crear", despues: b, explicacion: b.explicacion });
    await audit(env, user.id, "crear", "agenda_plan", aid, null, b);
    // 8B-2: si este plan respalda una salida marcada, cerrar su alerta
    await cerrarCruceSalida(env, { fecha: b.fecha, trabajador_id: b.trabajador_id || null, labor_id: b.labor_id || null, lote_id: b.lote_id || null });
    return json({ ok: true, id: aid });
  }

  // quitar una asignacion (con explicacion del cambio)
  if (path.match(/^\/api\/plan\/\d+$/) && req.method === "DELETE") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedePlanear(user)) return json({ error: "Solo coordinadores o el administrador planean." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const antes = await env.DB.prepare("SELECT * FROM agenda_plan WHERE id = ?").bind(id).first();
    if (!antes) return json({ error: "Asignación no encontrada." }, 404);
    const b = await req.json().catch(() => ({}));
    await env.DB.prepare("DELETE FROM agenda_plan WHERE id = ?").bind(id).run();
    await env.DB.prepare(
      "INSERT INTO agenda_cambios (agenda_plan_id, accion, antes, explicacion, usuario_id) VALUES (?,?,?,?,?)"
    ).bind(id, "quitar", JSON.stringify(antes), b.explicacion || null, user.id).run();
    await audit(env, user.id, "borrar", "agenda_plan", id, antes, null);
    return json({ ok: true });
  }

  // asignar/cambiar el trabajador de una asignacion existente (con explicacion)
  if (path.match(/^\/api\/plan\/\d+\/trabajador$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedePlanear(user)) return json({ error: "Solo coordinadores o el administrador planean." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const antes = await env.DB.prepare("SELECT * FROM agenda_plan WHERE id = ?").bind(id).first();
    if (!antes) return json({ error: "Asignación no encontrada." }, 404);
    const b = await req.json();
    await env.DB.prepare(
      "UPDATE agenda_plan SET trabajador_id = ?, modificado_por = ?, explicacion_cambio = ?, modificado_en = datetime('now') WHERE id = ?"
    ).bind(b.trabajador_id || null, user.id, b.explicacion || null, id).run();
    await env.DB.prepare(
      "INSERT INTO agenda_cambios (agenda_plan_id, accion, antes, despues, explicacion, usuario_id) VALUES (?,?,?,?,?,?)"
    ).bind(id, "cambiar", JSON.stringify({ trabajador_id: antes.trabajador_id }),
           JSON.stringify({ trabajador_id: b.trabajador_id }), b.explicacion || null, user.id).run();
    await audit(env, user.id, "editar", "agenda_plan", id, antes, b);
    return json({ ok: true });
  }

  // proponer la semana: crea asignaciones (labor+lote+dia) segun frecuencia y reglas,
  // sin trabajador (huecos). Solo en semanas no cerradas.
  if (path.match(/^\/api\/plan\/\d+\/\d+\/proponer$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedePlanear(user)) return json({ error: "Solo coordinadores o el administrador planean." }, 403);
    const parts = path.split("/");
    const anio = parseInt(parts[3], 10), semana = parseInt(parts[4], 10);
    const dias = diasSemanaISO(anio, semana);

    // labores activas REGULARES (marcadas para la propuesta semanal) con frecuencia
    const labores = await env.DB.prepare(
      "SELECT id, codigo, nombre, frecuencia_semanal, compatible_riego, media_jornada_sabado FROM labores WHERE activo=1 AND borrado_pendiente=0 AND es_regular=1"
    ).all();
    // lotes activos de cultivo
    const lotesQ = await env.DB.prepare(
      "SELECT id, nombre FROM lotes WHERE activo=1 AND (es_zona_especial=0 OR es_zona_especial IS NULL) ORDER BY id"
    ).all();
    // ya hay algo planeado esa semana?
    const existentes = await env.DB.prepare(
      "SELECT labor_id, lote_id, fecha FROM agenda_plan WHERE anio=? AND semana=?"
    ).bind(anio, semana).all();
    const yaHay = new Set(existentes.results.map(e => `${e.labor_id}|${e.lote_id}|${e.fecha}`));

    // dias laborales (lun-sab index 0..5). Reglas simples de dia:
    // riego -> lun(0), mie(2), vie(4). fumigacion/fertilizacion -> mar(1), jue(3).
    const nombre = (l) => (l.nombre || "").toLowerCase();
    let creadas = 0;
    for (const lab of labores.results) {
      const frec = lab.frecuencia_semanal && lab.frecuencia_semanal > 0 ? lab.frecuencia_semanal : 1;
      const nm = nombre(lab);
      let diasLabor = [];
      if (/riego/.test(nm)) diasLabor = [0, 2, 4];
      else if (/fumig|fertiliz|sigatoka|herbicida/.test(nm)) diasLabor = [1, 3];
      else {
        // repartir segun frecuencia en L-V (0..4), y sabado si media jornada
        const base = [0, 1, 2, 3, 4];
        if (frec >= 5) diasLabor = base;
        else if (frec === 4) diasLabor = [0, 1, 2, 3];
        else if (frec === 3) diasLabor = [0, 2, 4];
        else if (frec === 2) diasLabor = [0, 3];
        else diasLabor = [0];
      }
      // por cada dia de la labor, proponer en cada lote activo (sin trabajador)
      for (const di of diasLabor) {
        if (di > 5) continue;
        const fecha = dias[di].fecha;
        for (const lo of lotesQ.results) {
          const clave = `${lab.id}|${lo.id}|${fecha}`;
          if (yaHay.has(clave)) continue;
          await env.DB.prepare(
            `INSERT INTO agenda_plan (anio, semana, fecha, labor_id, lote_id, trabajador_id, estado, origen, creado_por)
             VALUES (?,?,?,?,?, NULL, 'planeado', 'propuesto', ?)`
          ).bind(anio, semana, fecha, lab.id, lo.id, user.id).run();
          yaHay.add(clave);
          creadas++;
        }
      }
    }
    await audit(env, user.id, "crear", "agenda_plan", null, null, { proponer: creadas, anio, semana });
    return json({ ok: true, creadas });
  }

  // deber ser vs. planeado de una semana (panel de control)
  if (path.match(/^\/api\/plan\/\d+\/\d+\/comparacion$/) && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const parts = path.split("/");
    const anio = parseInt(parts[3], 10), semana = parseInt(parts[4], 10);

    // planeado: por labor, cuantos trabajadores DISTINTOS asignados esa semana, y cuantos huecos
    const plan = await env.DB.prepare(
      `SELECT a.labor_id, l.codigo, l.nombre,
              COUNT(DISTINCT a.trabajador_id) AS trabajadores,
              SUM(CASE WHEN a.trabajador_id IS NULL THEN 1 ELSE 0 END) AS huecos,
              COUNT(*) AS asignaciones
       FROM agenda_plan a JOIN labores l ON l.id = a.labor_id
       WHERE a.anio=? AND a.semana=? GROUP BY a.labor_id ORDER BY l.codigo`
    ).bind(anio, semana).all();

    // deber ser: reutilizar el calculo (llamada interna simplificada)
    // horas jornada
    const jornada = await env.DB.prepare("SELECT * FROM jornada WHERE activo=1").all();
    let hsem = 0, nd = 0;
    for (const d of jornada.results) { hsem += horasDia(d.hora_inicio, d.almuerzo_desde, d.almuerzo_hasta, d.hora_fin); nd++; }
    const hdia = nd > 0 ? hsem / nd : 0;
    // plantas y ha activas
    const lotesQ = await env.DB.prepare(
      `SELECT l.densidad_plantas_ha,
              (SELECT hectareas FROM lote_versiones v WHERE v.lote_id=l.id AND v.vigente_hasta IS NULL ORDER BY v.vigente_desde DESC LIMIT 1) ha
       FROM lotes l WHERE l.activo=1 AND (l.es_zona_especial=0 OR l.es_zona_especial IS NULL)`
    ).all();
    let ha = 0, pl = 0;
    for (const l of lotesQ.results) { ha += (l.ha || 0); pl += (l.ha || 0) * (l.densidad_plantas_ha || 0); }
    // embolse real
    const embQ = await env.DB.prepare(
      `SELECT SUM(prom) tot FROM (SELECT AVG(cantidad_ejecutada) prom FROM (
         SELECT r.lote_id, r.cantidad_ejecutada, ROW_NUMBER() OVER (PARTITION BY r.lote_id ORDER BY r.semana DESC) rn
         FROM reporte_labores r JOIN lotes l ON l.id=r.lote_id
         WHERE r.labor_id=(SELECT id FROM labores WHERE codigo='101') AND l.activo=1 AND r.cantidad_ejecutada IS NOT NULL
       ) WHERE rn<=4 GROUP BY lote_id)`
    ).first();
    const racimos = embQ && embQ.tot ? Math.round(embQ.tot) : 0;

    const labores = await env.DB.prepare(
      "SELECT id, codigo, nombre, rendimiento_estandar, unidad_rendimiento, frecuencia_semanal FROM labores WHERE activo=1 AND borrado_pendiente=0"
    ).all();
    const necPorLabor = {};
    for (const l of labores.results) {
      if (!l.rendimiento_estandar || l.rendimiento_estandar <= 0) continue;
      const uni = (l.unidad_rendimiento || "").toUpperCase();
      const nm = (l.nombre || "").toLowerCase();
      const esRacimo = /embols|desmane|desflor|desvio|apertura|amarr/.test(nm);
      let trabajoTotal = null;
      if (uni.includes("PLANTA") && esRacimo) trabajoTotal = racimos;
      else if (uni.includes("PLANTA")) trabajoTotal = pl;
      else if (uni.includes("HECT") || uni.includes("HTA") || uni.includes("HA")) trabajoTotal = ha;
      else continue;
      const frec = l.frecuencia_semanal && l.frecuencia_semanal > 0 ? l.frecuencia_semanal : 1;
      const rendDia = l.rendimiento_estandar * hdia;
      const nec = rendDia > 0 ? (trabajoTotal / frec) / rendDia : null;
      if (nec != null) necPorLabor[l.id] = Math.ceil(nec * 10) / 10;
    }

    // combinar
    const planMap = {};
    for (const p of plan.results) planMap[p.labor_id] = p;
    const filas = [];
    for (const l of labores.results) {
      const p = planMap[l.id];
      const nec = necPorLabor[l.id];
      if (!p && nec == null) continue; // nada que mostrar
      filas.push({
        labor_id: l.id, codigo: l.codigo, nombre: l.nombre,
        necesarios: nec != null ? nec : null,
        asignados: p ? p.trabajadores : 0,
        huecos: p ? p.huecos : 0,
        planeado: !!p,
        diferencia: (nec != null && p) ? Math.round((p.trabajadores - nec) * 10) / 10 : null,
      });
    }
    return json({ anio, semana, filas });
  }

  // asignacion automatica de trabajadores a los huecos de una semana
  // 1) si la semana anterior tiene asignaciones de esa labor, copia (mismo trabajador->mismo lote)
  // 2) si no, agrupa lotes contiguos y asigna a trabajadores con la habilidad
  if (path.match(/^\/api\/plan\/\d+\/\d+\/auto-asignar$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedePlanear(user)) return json({ error: "Solo coordinadores o el administrador planean." }, 403);
    const parts = path.split("/");
    const anio = parseInt(parts[3], 10), semana = parseInt(parts[4], 10);
    const body = await req.json().catch(() => ({}));
    const soloLabor = body.labor_id || null; // si se pide para una labor puntual

    // huecos de esta semana (asignaciones sin trabajador)
    let hqSql = "SELECT id, labor_id, lote_id, fecha FROM agenda_plan WHERE anio=? AND semana=? AND trabajador_id IS NULL";
    const hqBind = [anio, semana];
    if (soloLabor) { hqSql += " AND labor_id=?"; hqBind.push(soloLabor); }
    const huecos = await env.DB.prepare(hqSql).bind(...hqBind).all();
    if (huecos.results.length === 0) return json({ ok: true, asignados: 0, mensaje: "No hay huecos para asignar." });

    // habilidades: labor -> [trabajador_id]
    const habQ = await env.DB.prepare("SELECT trabajador_id, labor_id FROM trabajador_habilidades").all();
    const trabPorLabor = {};
    for (const h of habQ.results) (trabPorLabor[h.labor_id] = trabPorLabor[h.labor_id] || []).push(h.trabajador_id);

    // semana anterior (para copiar): trabajador que hizo cada lote+labor
    let anioPrev = anio, semPrev = semana - 1;
    if (semPrev < 1) { anioPrev = anio - 1; semPrev = 52; }
    const prevQ = await env.DB.prepare(
      "SELECT labor_id, lote_id, trabajador_id FROM agenda_plan WHERE anio=? AND semana=? AND trabajador_id IS NOT NULL"
    ).bind(anioPrev, semPrev).all();
    // mapa: labor|lote -> trabajador (de la semana pasada)
    const prevMap = {};
    for (const p of prevQ.results) prevMap[`${p.labor_id}|${p.lote_id}`] = p.trabajador_id;

    // adyacencia para agrupar contiguos
    const adyQ = await env.DB.prepare("SELECT lote_a, lote_b FROM lote_adyacencia").all();
    const ady = {};
    for (const a of adyQ.results) (ady[a.lote_a] = ady[a.lote_a] || []).push(a.lote_b);

    let asignados = 0;
    // agrupar huecos por labor
    const porLabor = {};
    for (const h of huecos.results) (porLabor[h.labor_id] = porLabor[h.labor_id] || []).push(h);

    for (const laborId in porLabor) {
      const hs = porLabor[laborId];
      const disponibles = (trabPorLabor[laborId] || []).slice(); // trabajadores con la habilidad
      // 1) intentar copiar de la semana anterior
      const sinCopiar = [];
      for (const h of hs) {
        const prev = prevMap[`${h.labor_id}|${h.lote_id}`];
        if (prev) {
          await env.DB.prepare(
            "UPDATE agenda_plan SET trabajador_id=?, modificado_por=?, modificado_en=datetime('now') WHERE id=?"
          ).bind(prev, user.id, h.id).run();
          asignados++;
        } else {
          sinCopiar.push(h);
        }
      }
      // 2) los que no se pudieron copiar: agrupar lotes contiguos y repartir entre disponibles
      if (sinCopiar.length > 0 && disponibles.length > 0) {
        // lotes unicos de los huecos restantes
        const lotesRest = [...new Set(sinCopiar.map(h => h.lote_id))];
        const grupos = agruparContiguos(lotesRest, ady, disponibles.length);
        // asignar cada grupo a un trabajador
        const loteATrab = {};
        grupos.forEach((grupo, idx) => {
          const trab = disponibles[idx % disponibles.length];
          grupo.forEach(lote => { loteATrab[lote] = trab; });
        });
        for (const h of sinCopiar) {
          const trab = loteATrab[h.lote_id];
          if (trab) {
            await env.DB.prepare(
              "UPDATE agenda_plan SET trabajador_id=?, modificado_por=?, modificado_en=datetime('now') WHERE id=?"
            ).bind(trab, user.id, h.id).run();
            asignados++;
          }
        }
      }
    }
    await audit(env, user.id, "editar", "agenda_plan", null, null, { auto_asignar: asignados, anio, semana });
    return json({ ok: true, asignados });
  }

  // ==========================================================
  // PERSONAS QUE HACEN UNA LABOR (vista inversa de habilidades)
  // ver: autenticado; editar: admin o RRHH
  // ==========================================================
  if (path.match(/^\/api\/labores\/\d+\/personas$/) && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const id = parseInt(path.split("/")[3], 10);
    const { results } = await env.DB.prepare(
      `SELECT t.id, t.nombre, t.cedula
       FROM trabajador_habilidades th JOIN trabajadores t ON t.id = th.trabajador_id
       WHERE th.labor_id = ? AND t.activo = 1 ORDER BY t.nombre`
    ).bind(id).all();
    return json({ personas: results });
  }

  // agregar una persona a la labor (admin o RRHH)
  if (path.match(/^\/api\/labores\/\d+\/personas$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador" && user.rol !== "rrhh")
      return json({ error: "Solo el administrador o recursos humanos pueden modificar esto." }, 403);
    const id = parseInt(path.split("/")[3], 10);
    const { trabajador_id } = await req.json();
    if (!trabajador_id) return json({ error: "Falta el trabajador." }, 400);
    await env.DB.prepare(
      "INSERT OR IGNORE INTO trabajador_habilidades (trabajador_id, labor_id) VALUES (?, ?)"
    ).bind(trabajador_id, id).run();
    await audit(env, user.id, "crear", "trabajador_habilidades", null, null, { labor_id: id, trabajador_id });
    return json({ ok: true });
  }

  // quitar una persona de la labor (admin o RRHH)
  if (path.match(/^\/api\/labores\/\d+\/personas\/\d+$/) && req.method === "DELETE") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador" && user.rol !== "rrhh")
      return json({ error: "Solo el administrador o recursos humanos pueden modificar esto." }, 403);
    const parts = path.split("/");
    const laborId = parseInt(parts[3], 10);
    const trabId = parseInt(parts[5], 10);
    await env.DB.prepare(
      "DELETE FROM trabajador_habilidades WHERE labor_id = ? AND trabajador_id = ?"
    ).bind(laborId, trabId).run();
    await audit(env, user.id, "borrar", "trabajador_habilidades", null, null, { labor_id: laborId, trabajador_id: trabId });
    return json({ ok: true });
  }

  // registrar una salida de almacen (entrega de material a un trabajador)
  // descuenta por capas (PEPS), calcula costo, permite negativo con alerta.
  if (path === "/api/salidas" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo almacén o el administrador pueden registrar salidas." }, 403);
    const b = await req.json();
    if (!b.material_id || !b.trabajador_id || !b.cantidad || !b.fecha)
      return json({ error: "Faltan material, trabajador, cantidad o fecha." }, 400);
    if (b.cantidad <= 0) return json({ error: "La cantidad debe ser mayor a cero." }, 400);

    // validar centro de costo segun la regla (uno solo se precarga; varios exige elegir)
    const centrosMat = await env.DB.prepare(
      "SELECT centro_costo_id FROM material_centro WHERE material_id = ?"
    ).bind(b.material_id).all();
    let centroCosto = b.centro_costo_id || null;
    if (!centroCosto) {
      if (centrosMat.results.length === 1) centroCosto = centrosMat.results[0].centro_costo_id;
      else if (centrosMat.results.length > 1) return json({ error: "Este material tiene varios centros de costo. Debes elegir uno." }, 400);
    }

    // capas disponibles (PEPS: mas antiguas primero)
    const capas = await env.DB.prepare(
      "SELECT id, cantidad_actual, precio_unitario FROM entradas_almacen WHERE material_id = ? AND cantidad_actual > 0 ORDER BY fecha, id"
    ).bind(b.material_id).all();
    const existencia = capas.results.reduce((s, c) => s + c.cantidad_actual, 0);

    let restante = b.cantidad;
    let costoTotal = 0;
    const descuentos = [];
    // descontar de las capas
    for (const capa of capas.results) {
      if (restante <= 0) break;
      const toma = Math.min(capa.cantidad_actual, restante);
      costoTotal += toma * (capa.precio_unitario || 0);
      descuentos.push({ entrada_id: capa.id, cantidad: toma, precio: capa.precio_unitario });
      restante -= toma;
    }
    // faltante: lo que no alcanzo el inventario (se permite; queda negativo)
    const faltante = restante > 0 ? restante : 0;
    if (faltante > 0) {
      // el faltante se costea al ultimo precio conocido (del material)
      const mat = await env.DB.prepare("SELECT precio_unitario FROM materiales WHERE id = ?").bind(b.material_id).first();
      costoTotal += faltante * (mat?.precio_unitario || 0);
    }

    // registrar la salida
    const res = await env.DB.prepare(
      `INSERT INTO salidas_almacen (fecha, material_id, trabajador_id, centro_costo_id, cantidad, costo_total, faltante, labor_id, lote_id, ubicacion_id, nota, registrado_por, hora)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(b.fecha, b.material_id, b.trabajador_id, centroCosto || null, b.cantidad,
           Math.round(costoTotal), faltante, b.labor_id || null, b.lote_id || null, b.ubicacion_id || null, b.nota || null, user.id, b.hora || null).run();
    const salidaId = res.meta.last_row_id;

    // aplicar los descuentos a las capas y guardar el detalle
    for (const d of descuentos) {
      await env.DB.prepare("UPDATE entradas_almacen SET cantidad_actual = cantidad_actual - ? WHERE id = ?")
        .bind(d.cantidad, d.entrada_id).run();
      await env.DB.prepare("INSERT INTO salida_capas (salida_id, entrada_id, cantidad, precio_unit) VALUES (?,?,?,?)")
        .bind(salidaId, d.entrada_id, d.cantidad, d.precio).run();
    }
    // si hubo faltante, dejar el inventario en negativo: crear una capa negativa marcadora
    if (faltante > 0) {
      await env.DB.prepare(
        `INSERT INTO entradas_almacen (material_id, proveedor_id, fecha, cantidad_inicial, cantidad_actual, precio_unitario, factura_nro, registrado_por)
         VALUES (?, NULL, ?, ?, ?, ?, 'FALTANTE', ?)`
      ).bind(b.material_id, b.fecha, -faltante, -faltante, null, user.id).run();
      // alerta de inventario para los verificadores
      const al = await env.DB.prepare(
        `INSERT INTO alertas_inventario (material_id, cantidad_sistema, cantidad_fisica, diferencia, reportado_por)
         VALUES (?,?,?,?,?)`
      ).bind(b.material_id, existencia, b.cantidad, -(faltante), user.id).run();
      // pendiente PARA RESOLVER dirigido a los roles verificadores
      const matNom = await env.DB.prepare("SELECT codigo, nombre FROM materiales WHERE id=?").bind(b.material_id).first();
      const nombreMat = matNom ? ((matNom.codigo ? matNom.codigo + " · " : "") + matNom.nombre) : ("Material " + b.material_id);
      for (const rolDest of ["administrador", "rrhh", "revisora_fiscal"]) {
        await crearPendiente(env, {
          tipo: "resolver",
          titulo: `Inventario en negativo: ${nombreMat}`,
          detalle: `Se entregó una cantidad mayor a la existencia. Faltante de ${faltante}. Verifica físicamente y dale entrada para corregir. Se cierra solo cuando el inventario deje de estar en negativo.`,
          origen: "inventario",
          ref_tabla: "material_negativo",
          ref_id: b.material_id,
          rol: rolDest,
        });
      }
    }
    await audit(env, user.id, "crear", "salidas_almacen", salidaId, null, b);

    // 8B-2: cruce con actividad. Sin plan ni reporte que la respalde -> alerta (no bloquea)
    const cruce = await salidaTieneActividad(env, { fecha: b.fecha, trabajador_id: b.trabajador_id, labor_id: b.labor_id || null, lote_id: b.lote_id || null });
    if (!cruce) {
      const tNom2 = await env.DB.prepare("SELECT nombre FROM trabajadores WHERE id=?").bind(b.trabajador_id).first();
      const mn2 = await env.DB.prepare("SELECT codigo, nombre FROM materiales WHERE id=?").bind(b.material_id).first();
      const nombreMat2 = mn2 ? ((mn2.codigo ? mn2.codigo + " · " : "") + mn2.nombre) : ("Material " + b.material_id);
      await crearPendiente(env, {
        tipo: "resolver",
        titulo: `Salida sin actividad asociada: ${nombreMat2}`,
        detalle: `Se entregó ${b.cantidad} de ${nombreMat2} a ${tNom2 ? tNom2.nombre : "trabajador " + b.trabajador_id} el ${b.fecha} sin labor planeada ni reportada que la respalde. Verifica con el coordinador; se cierra solo si aparece la actividad, o se justifica desde Almacén › Cruce.`,
        origen: "almacen",
        ref_tabla: "salida_sin_actividad",
        ref_id: salidaId,
        rol: "administrador",
      });
    }
    return json({ ok: true, id: salidaId, costo: Math.round(costoTotal), faltante, existencia_previa: existencia });
  }

  // listar salidas recientes
  if (path === "/api/salidas" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const url = new URL(req.url);
    const fecha = url.searchParams.get("fecha");
    let q = `SELECT s.id, s.fecha, s.cantidad, s.costo_total, s.faltante,
                    COALESCE((SELECT SUM(d.cantidad) FROM devoluciones_almacen d WHERE d.salida_id = s.id),0) AS devuelto,
                    s.hora, s.ubicacion_id, u.nombre AS ubicacion, m.tipo AS material_tipo,
                    m.codigo AS material_codigo, m.nombre AS material, m.unidad,
                    t.nombre AS trabajador, c.nombre AS centro_costo
             FROM salidas_almacen s
             JOIN materiales m ON m.id = s.material_id
       LEFT JOIN ubicaciones u ON u.id = s.ubicacion_id
             JOIN trabajadores t ON t.id = s.trabajador_id
             LEFT JOIN centros_costo c ON c.id = s.centro_costo_id`;
    const binds = [];
    if (fecha) { q += " WHERE s.fecha = ?"; binds.push(fecha); }
    q += " ORDER BY s.fecha DESC, s.id DESC LIMIT 200";
    const { results } = await env.DB.prepare(q).bind(...binds).all();
    return json({ salidas: results });
  }

  // ==========================================================
  // DEVOLUCIONES (8B-1): material no usado vuelve al inventario
  // ==========================================================
  // registrar una devolucion ligada a su salida original.
  // la devolucion vuelve como capa marcada 'DEVOLUCION' (nunca como compra):
  // sin proveedor y con factura_nro='DEVOLUCION', asi el log del almacen
  // siempre distingue cuanto se entrego y cuanto se devolvio por salida.
  if (path === "/api/devoluciones" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo almacén o el administrador pueden registrar devoluciones." }, 403);
    const b = await req.json();
    if (!b.salida_id || !b.cantidad || !b.fecha)
      return json({ error: "Faltan salida, cantidad o fecha." }, 400);
    if (b.cantidad <= 0) return json({ error: "La cantidad debe ser mayor a cero." }, 400);

    const salida = await env.DB.prepare(
      `SELECT s.*, m.nombre AS material FROM salidas_almacen s JOIN materiales m ON m.id = s.material_id WHERE s.id = ?`
    ).bind(b.salida_id).first();
    if (!salida) return json({ error: "La salida no existe." }, 404);

    const ya = await env.DB.prepare(
      "SELECT COALESCE(SUM(cantidad),0) AS n FROM devoluciones_almacen WHERE salida_id = ?"
    ).bind(b.salida_id).first();
    const pendiente = salida.cantidad - ya.n;
    if (b.cantidad > pendiente)
      return json({ error: `Solo quedan ${pendiente} por devolver de esta salida.` }, 400);

    // precio promedio ponderado de la salida original (costo_total / cantidad)
    const precio = salida.cantidad > 0 ? salida.costo_total / salida.cantidad : null;

    // vuelve al inventario como capa identificada como devolucion
    const resE = await env.DB.prepare(
      `INSERT INTO entradas_almacen (material_id, proveedor_id, fecha, cantidad_inicial, cantidad_actual, precio_unitario, factura_nro, registrado_por)
       VALUES (?, NULL, ?, ?, ?, ?, 'DEVOLUCION', ?)`
    ).bind(salida.material_id, b.fecha, b.cantidad, b.cantidad, precio, user.id).run();
    const entradaId = resE.meta.last_row_id;

    const resD = await env.DB.prepare(
      `INSERT INTO devoluciones_almacen (salida_id, fecha, cantidad, precio_unit, entrada_id, nota, registrado_por)
       VALUES (?,?,?,?,?,?,?)`
    ).bind(b.salida_id, b.fecha, b.cantidad, precio, entradaId, b.nota || null, user.id).run();

    await audit(env, user.id, "crear", "devoluciones_almacen", resD.meta.last_row_id, null, b);
    return json({ ok: true, id: resD.meta.last_row_id, precio });
  }

  // listar devoluciones recientes
  if (path === "/api/devoluciones" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      `SELECT d.id, d.fecha, d.cantidad, d.precio_unit, d.nota,
              m.codigo AS material_codigo, m.nombre AS material, m.unidad,
              t.nombre AS trabajador, s.id AS salida_id
       FROM devoluciones_almacen d
       JOIN salidas_almacen s ON s.id = d.salida_id
       JOIN materiales m ON m.id = s.material_id
       JOIN trabajadores t ON t.id = s.trabajador_id
       ORDER BY d.fecha DESC, d.id DESC LIMIT 200`
    ).all();
    return json({ devoluciones: results });
  }

  // ==========================================================
  // CRUCE (8B-2): salidas vs actividad + embolse vs bolsas
  // ==========================================================
  // salidas marcadas (con alerta o justificacion) para la pestana Cruce
  if (path === "/api/cruce/salidas" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      `SELECT s.id, s.fecha, s.cantidad, s.trabajador_id, s.lote_id, l.nombre AS lote,
              m.codigo AS material_codigo, m.nombre AS material, m.unidad, t.nombre AS trabajador,
              (SELECT COUNT(*) FROM cruce_justificaciones j WHERE j.salida_id = s.id) AS justificada
       FROM salidas_almacen s
       JOIN materiales m ON m.id = s.material_id
       JOIN trabajadores t ON t.id = s.trabajador_id
       LEFT JOIN lotes l ON l.id = s.lote_id
       WHERE s.id IN (SELECT ref_id FROM pendientes WHERE ref_tabla='salida_sin_actividad')
          OR s.id IN (SELECT salida_id FROM cruce_justificaciones)
       ORDER BY s.fecha DESC, s.id DESC LIMIT 100`
    ).all();
    const out = [];
    for (const s of results) {
      let estado = "sin_actividad";
      if (s.justificada > 0) estado = "justificada";
      else if (await salidaTieneActividad(env, { fecha: s.fecha, trabajador_id: s.trabajador_id, labor_id: null, lote_id: s.lote_id })) estado = "con_actividad";
      out.push({ id: s.id, fecha: s.fecha, cantidad: s.cantidad, material_codigo: s.material_codigo, material: s.material, unidad: s.unidad, trabajador: s.trabajador, lote: s.lote, estado });
    }
    return json({ salidas: out });
  }

  // justificar una salida sin actividad (admin, rrhh o revisora fiscal)
  if (path === "/api/cruce/justificar" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!["administrador", "rrhh", "revisora_fiscal"].includes(user.rol))
      return json({ error: "Solo administración, RRHH o la revisora fiscal pueden justificar." }, 403);
    const b = await req.json();
    if (!b.salida_id || !b.comentario || !String(b.comentario).trim())
      return json({ error: "Falta la salida o el comentario de justificación." }, 400);
    const salida = await env.DB.prepare("SELECT id FROM salidas_almacen WHERE id=?").bind(b.salida_id).first();
    if (!salida) return json({ error: "La salida no existe." }, 404);
    await env.DB.prepare(
      "INSERT INTO cruce_justificaciones (salida_id, comentario, usuario_id) VALUES (?,?,?)"
    ).bind(b.salida_id, String(b.comentario).trim(), user.id).run();
    await resolverPendientesRef(env, "salida_sin_actividad", b.salida_id);
    await audit(env, user.id, "justificar", "salidas_almacen", b.salida_id, null, { comentario: b.comentario });
    return json({ ok: true });
  }

  // comparacion semana en curso: bolsas entregadas vs racimos embolsados
  if (path === "/api/cruce/embolse" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const cfgs = await env.DB.prepare(
      "SELECT clave, valor FROM configuracion WHERE clave IN ('embolse_labor_id','bolsas_material_id','bolsas_por_racimo','bolsas_tolerancia_pct')"
    ).all();
    const cfg = {};
    for (const r of cfgs.results) cfg[r.clave] = r.valor;
    const laborId = parseInt(cfg.embolse_labor_id) || null;
    const matId = parseInt(cfg.bolsas_material_id) || null;
    const ratio = parseFloat(cfg.bolsas_por_racimo) || 1;
    const tol = parseFloat(cfg.bolsas_tolerancia_pct) || 10;

    // rango lunes-domingo de la semana en curso
    const hoy = new Date();
    const dow = (hoy.getDay() + 6) % 7;
    const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - dow);
    const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
    const f1 = lunes.toISOString().slice(0, 10);
    const f2 = domingo.toISOString().slice(0, 10);

    let racimos = 0, bolsas = 0;
    if (laborId) {
      const r = await env.DB.prepare(
        "SELECT COALESCE(SUM(cantidad_ejecutada),0) AS n FROM reporte_labores WHERE labor_id=? AND fecha BETWEEN ? AND ?"
      ).bind(laborId, f1, f2).first();
      racimos = r ? r.n : 0;
    }
    if (matId) {
      const b = await env.DB.prepare(
        "SELECT COALESCE(SUM(cantidad),0) AS n FROM salidas_almacen WHERE material_id=? AND fecha BETWEEN ? AND ?"
      ).bind(matId, f1, f2).first();
      bolsas = b ? b.n : 0;
    }
    const esperado = racimos * ratio;
    const limite = esperado * (1 + tol / 100);
    const configurado = !!(laborId && matId);
    let estado = "sin_configurar";
    if (configurado) estado = (bolsas > limite && bolsas > 0) ? "alerta" : "ok";
    return json({ configurado, labor_id: laborId, material_id: matId, ratio, tolerancia: tol,
                  racimos, bolsas, esperado, limite, estado,
                  semana: { inicio: f1, fin: f2 } });
  }

  // ==========================================================
  // HERRAMIENTAS: identificacion individual + prestamos
  // ==========================================================
  if (path === "/api/herramientas" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      `SELECT h.id, h.codigo, h.nombre, h.estado, h.nota, h.activo,
              p.id AS prestamo_id, p.fecha_prestamo, t.nombre AS prestatario
       FROM herramientas h
       LEFT JOIN prestamos_herramientas p ON p.herramienta_id = h.id AND p.fecha_devolucion IS NULL
       LEFT JOIN trabajadores t ON t.id = p.trabajador_id
       WHERE h.activo = 1
       ORDER BY h.codigo`
    ).all();
    return json({ herramientas: results });
  }

  if (path === "/api/herramientas" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo administración o almacén pueden crear herramientas." }, 403);
    const b = await req.json();
    if (!b.codigo || !String(b.codigo).trim() || !b.nombre || !String(b.nombre).trim())
      return json({ error: "Código y nombre son obligatorios." }, 400);
    const existe = await env.DB.prepare("SELECT id FROM herramientas WHERE codigo=?").bind(String(b.codigo).trim()).first();
    if (existe) return json({ error: `Ya existe una herramienta con el código ${b.codigo}.` }, 400);
    const res = await env.DB.prepare(
      "INSERT INTO herramientas (codigo, nombre, nota) VALUES (?,?,?)"
    ).bind(String(b.codigo).trim(), String(b.nombre).trim(), b.nota || null).run();
    await audit(env, user.id, "crear", "herramientas", res.meta.last_row_id, null, b);
    return json({ ok: true, id: res.meta.last_row_id });
  }

  if (path === "/api/herramientas" && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo administración o almacén pueden editar herramientas." }, 403);
    const b = await req.json();
    if (!b.id || !b.nombre || !String(b.nombre).trim())
      return json({ error: "Falta la herramienta o el nombre." }, 400);
    const h = await env.DB.prepare("SELECT * FROM herramientas WHERE id=?").bind(b.id).first();
    if (!h) return json({ error: "La herramienta no existe." }, 404);
    if (b.codigo && String(b.codigo).trim() !== h.codigo) {
      const existe = await env.DB.prepare("SELECT id FROM herramientas WHERE codigo=? AND id!=?").bind(String(b.codigo).trim(), b.id).first();
      if (existe) return json({ error: `Ya existe otra herramienta con el código ${b.codigo}.` }, 400);
    }
    await env.DB.prepare(
      "UPDATE herramientas SET codigo=?, nombre=?, nota=?, activo=? WHERE id=?"
    ).bind(b.codigo ? String(b.codigo).trim() : h.codigo, String(b.nombre).trim(), b.nota || null,
          b.activo === undefined ? h.activo : (b.activo ? 1 : 0), b.id).run();
    await audit(env, user.id, "editar", "herramientas", b.id, h, b);
    return json({ ok: true });
  }

  // cambio de estado: activa <-> danada -> retirada (retirada es final)
  if (path === "/api/herramientas/estado" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo administración o almacén pueden cambiar estados." }, 403);
    const b = await req.json();
    const validos = ["activa", "danada", "retirada"];
    if (!b.id || !validos.includes(b.estado)) return json({ error: "Estado no válido." }, 400);
    const h = await env.DB.prepare("SELECT * FROM herramientas WHERE id=?").bind(b.id).first();
    if (!h) return json({ error: "La herramienta no existe." }, 404);
    const permitidas = { activa: ["danada", "retirada"], danada: ["activa", "retirada"], retirada: [] };
    if (!permitidas[h.estado].includes(b.estado))
      return json({ error: `No se puede pasar de "${h.estado}" a "${b.estado}".` }, 400);
    const abierto = await env.DB.prepare(
      "SELECT id FROM prestamos_herramientas WHERE herramienta_id=? AND fecha_devolucion IS NULL"
    ).bind(b.id).first();
    if (abierto && b.estado === "retirada") return json({ error: "Tiene un préstamo abierto; devuélvela primero." }, 400);
    await env.DB.prepare("UPDATE herramientas SET estado=? WHERE id=?").bind(b.estado, b.id).run();
    await audit(env, user.id, "estado", "herramientas", b.id, { estado: h.estado }, { estado: b.estado });
    return json({ ok: true });
  }

  // prestar: la herramienta debe estar activa y sin prestamo abierto
  if (path === "/api/herramientas/prestar" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo administración o almacén pueden prestar herramientas." }, 403);
    const b = await req.json();
    if (!b.herramienta_id || !b.trabajador_id || !b.fecha)
      return json({ error: "Faltan herramienta, trabajador o fecha." }, 400);
    const h = await env.DB.prepare("SELECT * FROM herramientas WHERE id=? AND activo=1").bind(b.herramienta_id).first();
    if (!h) return json({ error: "La herramienta no existe." }, 404);
    if (h.estado !== "activa") return json({ error: `La herramienta está "${h.estado}"; no se puede prestar.` }, 400);
    const abierto = await env.DB.prepare(
      "SELECT id FROM prestamos_herramientas WHERE herramienta_id=? AND fecha_devolucion IS NULL"
    ).bind(b.herramienta_id).first();
    if (abierto) return json({ error: "La herramienta ya tiene un préstamo abierto; devuélvela primero." }, 400);
    const t = await env.DB.prepare("SELECT id FROM trabajadores WHERE id=? AND activo=1").bind(b.trabajador_id).first();
    if (!t) return json({ error: "El trabajador no existe o está inactivo." }, 400);
    const res = await env.DB.prepare(
      "INSERT INTO prestamos_herramientas (herramienta_id, trabajador_id, fecha_prestamo, nota, registrado_por, hora) VALUES (?,?,?,?,?,?)"
    ).bind(b.herramienta_id, b.trabajador_id, b.fecha, b.nota || null, user.id, b.hora || null).run();
    await audit(env, user.id, "crear", "prestamos_herramientas", res.meta.last_row_id, null, b);
    return json({ ok: true, id: res.meta.last_row_id });
  }

  // devolver: cierra el prestamo; si volvio danada, la herramienta pasa a danada
  if (path === "/api/herramientas/devolver" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo administración o almacén pueden registrar devoluciones." }, 403);
    const b = await req.json();
    if (!b.prestamo_id || !b.fecha) return json({ error: "Faltan préstamo o fecha." }, 400);
    const p = await env.DB.prepare("SELECT * FROM prestamos_herramientas WHERE id=?").bind(b.prestamo_id).first();
    if (!p) return json({ error: "El préstamo no existe." }, 404);
    if (p.fecha_devolucion) return json({ error: "Este préstamo ya fue devuelto." }, 400);
    const danada = b.volvio_danada ? 1 : 0;
    await env.DB.prepare(
      "UPDATE prestamos_herramientas SET fecha_devolucion=?, volvio_danada=?, nota=? WHERE id=?"
    ).bind(b.fecha, danada, b.nota || p.nota, b.prestamo_id).run();
    if (danada) await env.DB.prepare("UPDATE herramientas SET estado='danada' WHERE id=?").bind(p.herramienta_id).run();
    await audit(env, user.id, "devolver", "prestamos_herramientas", b.prestamo_id, p, b);
    return json({ ok: true, danada: !!danada });
  }

  // prestamos: abiertos primero, luego historial
  if (path === "/api/prestamos" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      `SELECT p.id, p.hora, p.fecha_prestamo, p.fecha_devolucion, p.volvio_danada, p.nota,
              h.codigo, h.nombre AS herramienta, t.nombre AS trabajador
       FROM prestamos_herramientas p
       JOIN herramientas h ON h.id = p.herramienta_id
       JOIN trabajadores t ON t.id = p.trabajador_id
       ORDER BY (p.fecha_devolucion IS NULL) DESC, p.fecha_prestamo DESC, p.id DESC
       LIMIT 300`
    ).all();
    return json({ prestamos: results });
  }

  // ==========================================================
  // UBICACIONES (lugares de la finca que no son lotes)
  // ==========================================================
  if (path === "/api/ubicaciones" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      "SELECT id, nombre, activo FROM ubicaciones ORDER BY nombre"
    ).all();
    return json({ ubicaciones: results });
  }

  if (path === "/api/ubicaciones" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede crear ubicaciones." }, 403);
    const b = await req.json();
    if (!b.nombre || !String(b.nombre).trim()) return json({ error: "El nombre es obligatorio." }, 400);
    const nom = String(b.nombre).trim();
    const existe = await env.DB.prepare("SELECT id FROM ubicaciones WHERE UPPER(nombre)=UPPER(?)").bind(nom).first();
    if (existe) return json({ error: `Ya existe la ubicación "${nom}".` }, 400);
    const res = await env.DB.prepare(
      "INSERT INTO ubicaciones (nombre, activo) VALUES (?, 1)"
    ).bind(nom).run();
    await audit(env, user.id, "crear", "ubicaciones", res.meta.last_row_id, null, b);
    return json({ ok: true, id: res.meta.last_row_id });
  }

  if (path === "/api/ubicaciones" && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede editar ubicaciones." }, 403);
    const b = await req.json();
    if (!b.id || !b.nombre || !String(b.nombre).trim()) return json({ error: "Falta la ubicación o el nombre." }, 400);
    const nom = String(b.nombre).trim();
    const existe = await env.DB.prepare("SELECT id FROM ubicaciones WHERE UPPER(nombre)=UPPER(?) AND id!=?").bind(nom, b.id).first();
    if (existe) return json({ error: `Ya existe la ubicación "${nom}".` }, 400);
    await env.DB.prepare(
      "UPDATE ubicaciones SET nombre=?, activo=? WHERE id=?"
    ).bind(nom, b.activo ? 1 : 0, b.id).run();
    await audit(env, user.id, "editar", "ubicaciones", b.id, null, b);
    return json({ ok: true });
  }

  // ==========================================================
  // ENTREGA UNIFICADA (8E): materiales/repuestos + herramientas en una ventana
  // ==========================================================
  // el dia acumulado de un trabajador: salidas + prestamos con hora
  if (path === "/api/entregas/dia" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const sp2 = new URL(req.url).searchParams;
    const trabajador_id = parseInt(sp2.get("trabajador_id")) || null;
    const fecha = sp2.get("fecha");
    if (!trabajador_id || !fecha) return json({ error: "Faltan trabajador o fecha." }, 400);
    const sal = await env.DB.prepare(
      `SELECT s.id, s.fecha, s.hora, s.cantidad, s.costo_total, s.faltante,
              COALESCE((SELECT SUM(d.cantidad) FROM devoluciones_almacen d WHERE d.salida_id = s.id),0) AS devuelto,
              m.codigo AS material_codigo, m.nombre AS material, m.unidad, m.tipo AS material_tipo,
              l.nombre AS lote, u.nombre AS ubicacion, lb.nombre AS labor
       FROM salidas_almacen s
       JOIN materiales m ON m.id = s.material_id
       LEFT JOIN lotes l ON l.id = s.lote_id
       LEFT JOIN ubicaciones u ON u.id = s.ubicacion_id
       LEFT JOIN labores lb ON lb.id = s.labor_id
       WHERE s.trabajador_id = ? AND s.fecha = ?
       ORDER BY s.hora DESC, s.id DESC LIMIT 200`
    ).bind(trabajador_id, fecha).all();
    const pre = await env.DB.prepare(
      `SELECT p.id, p.fecha_prestamo, p.hora, p.fecha_devolucion, p.volvio_danada, p.nota,
              h.codigo, h.nombre AS herramienta
       FROM prestamos_herramientas p
       JOIN herramientas h ON h.id = p.herramienta_id
       WHERE p.trabajador_id = ? AND p.fecha_prestamo = ?
       ORDER BY p.hora DESC, p.id DESC LIMIT 100`
    ).bind(trabajador_id, fecha).all();
    return json({ salidas: sal.results, prestamos: pre.results });
  }

  // plan del dia del trabajador (para precargar destino en la entrega)
  if (path === "/api/plan/hoy" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const sp2 = new URL(req.url).searchParams;
    const trabajador_id = parseInt(sp2.get("trabajador_id")) || null;
    const fecha = sp2.get("fecha");
    if (!trabajador_id || !fecha) return json({ error: "Faltan trabajador o fecha." }, 400);
    const { results } = await env.DB.prepare(
      `SELECT ap.id, ap.labor_id, ap.lote_id, lb.nombre AS labor, l.nombre AS lote
       FROM agenda_plan ap
       LEFT JOIN labores lb ON lb.id = ap.labor_id
       LEFT JOIN lotes l ON l.id = ap.lote_id
       WHERE ap.trabajador_id = ? AND ap.fecha = ?
       ORDER BY ap.id LIMIT 50`
    ).bind(trabajador_id, fecha).all();
    return json({ plan: results });
  }

  // guardar la entrega completa: una salida por linea de material/repuesto + prestamos
  if (path === "/api/entrega" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo almacén o administración pueden registrar entregas." }, 403);
    const b = await req.json();
    if (!b.trabajador_id || !b.fecha) return json({ error: "Faltan trabajador o fecha." }, 400);
    if (!Array.isArray(b.lineas) || b.lineas.length === 0) return json({ error: "La entrega no tiene líneas." }, 400);
    const t = await env.DB.prepare("SELECT id FROM trabajadores WHERE id=? AND activo=1").bind(b.trabajador_id).first();
    if (!t) return json({ error: "El trabajador no existe o está inactivo." }, 400);
    const hora = b.hora || new Date().toTimeString().slice(0, 5);

    let nSal = 0, nPres = 0, alertas = 0;
    for (const ln of b.lineas) {
      if (ln.tipo_linea === "herramienta") {
        if (!ln.herramienta_id) return json({ error: "Hay una línea de herramienta sin herramienta elegida." }, 400);
        const h = await env.DB.prepare("SELECT * FROM herramientas WHERE id=? AND activo=1").bind(ln.herramienta_id).first();
        if (!h) return json({ error: "Hay una línea con una herramienta que no existe." }, 400);
        if (h.estado !== "activa") return json({ error: `La herramienta "${h.nombre}" está "${h.estado}"; no se puede prestar.` }, 400);
        const abierto = await env.DB.prepare(
          "SELECT id FROM prestamos_herramientas WHERE herramienta_id=? AND fecha_devolucion IS NULL"
        ).bind(ln.herramienta_id).first();
        if (abierto) return json({ error: `La herramienta "${h.nombre}" ya tiene un préstamo abierto.` }, 400);
        await env.DB.prepare(
          "INSERT INTO prestamos_herramientas (herramienta_id, trabajador_id, fecha_prestamo, nota, registrado_por, hora) VALUES (?,?,?,?,?,?)"
        ).bind(ln.herramienta_id, b.trabajador_id, b.fecha, ln.nota || null, user.id, hora).run();
        nPres++;
        continue;
      }
      // linea de material o repuesto: mismo PEPS que una salida normal
      if (!ln.material_id || !ln.cantidad || !(parseFloat(ln.cantidad) > 0))
        return json({ error: "Cada línea de material/repuesto necesita material y cantidad mayor a cero." }, 400);
      const mat = await env.DB.prepare("SELECT * FROM materiales WHERE id=? AND activo=1").bind(ln.material_id).first();
      if (!mat) return json({ error: "Hay una línea con un material que no existe." }, 400);

      let queda = parseFloat(ln.cantidad);
      let costoTotal = 0;
      const usadas = [];
      if (ln.centro_costo_id) {
        const cc = await env.DB.prepare("SELECT id FROM centros_costo WHERE id=?").bind(ln.centro_costo_id).first();
        if (!cc) return json({ error: `Centro de costo inválido en línea de ${mat.nombre}.` }, 400);
      }
      const capas = await env.DB.prepare(
        "SELECT * FROM entradas_almacen WHERE material_id=? AND cantidad_actual>0 ORDER BY fecha, id"
      ).bind(ln.material_id).all();
      for (const capa of capas.results) {
        if (queda <= 0) break;
        const tomar = Math.min(queda, capa.cantidad_actual);
        usadas.push({ entrada_id: capa.id, cantidad: tomar, precio: capa.precio_unitario });
        if (capa.precio_unitario != null) costoTotal += tomar * capa.precio_unitario;
        queda -= tomar;
      }
      const faltante = queda > 0.0001 ? queda : 0;
      const resS = await env.DB.prepare(
        `INSERT INTO salidas_almacen (fecha, material_id, trabajador_id, centro_costo_id, cantidad, costo_total, faltante, labor_id, lote_id, ubicacion_id, mantenimiento_id, nota, registrado_por, hora)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(b.fecha, mat.id, b.trabajador_id, ln.centro_costo_id || null, ln.cantidad,
             Math.round(costoTotal) || null, faltante, ln.labor_id || null, ln.lote_id || null,
             ln.ubicacion_id || null, ln.mantenimiento_id || null, ln.nota || null, user.id, hora).run();
      const salidaId = resS.meta.last_row_id;
      for (const u of usadas) {
        await env.DB.prepare("UPDATE entradas_almacen SET cantidad_actual = cantidad_actual - ? WHERE id=?").bind(u.cantidad, u.entrada_id).run();
        await env.DB.prepare("INSERT INTO salida_capas (salida_id, entrada_id, cantidad, precio_unit) VALUES (?,?,?,?)").bind(salidaId, u.entrada_id, u.cantidad, u.precio).run();
      }
      if (faltante > 0) {
        await crearPendiente(env, {
          tipo: "resolver",
          titulo: `Salida con faltante: ${mat.nombre}`,
          detalle: `Se entregaron ${ln.cantidad} pero faltaron ${faltante} en inventario. Entrega #${salidaId} del ${b.fecha} ${hora}.`,
          origen: "almacen",
          ref_tabla: "salida_faltante",
          ref_id: salidaId,
          rol: "administrador",
        });
      }
      await audit(env, user.id, "crear", "salidas_almacen", salidaId, null, { entrega_unificada: true, linea: ln });
      // 8E: si la entrega no coincide con el plan, alertar al coordinador
      const cruce = await salidaTieneActividad(env, { fecha: b.fecha, trabajador_id: b.trabajador_id, labor_id: ln.labor_id || null, lote_id: ln.lote_id || null });
      if (!cruce) {
        alertas++;
        await crearPendiente(env, {
          tipo: "resolver",
          titulo: `Entrega fuera de plan: ${mat.nombre}`,
          detalle: `Se entregó ${ln.cantidad} de ${mat.nombre} el ${b.fecha} ${hora} con destino/actividad que no coincide con lo planeado para este trabajador. Ajusta el Planificador o resuelve esta alerta.`,
          origen: "almacen",
          ref_tabla: "entrega_fuera_de_plan",
          ref_id: salidaId,
          rol: "coordinador",
        });
      }
      nSal++;
    }
    return json({ ok: true, salidas: nSal, prestamos: nPres, alertas });
  }

  // ==========================================================
  // EQUIPOS Y MANTENIMIENTOS (8F)
  // ==========================================================
  // listado con proximo preventivo (dias u horas, el que venza primero),
  // costo acumulado y alerta automatica si un preventivo ya vencio
  if (path === "/api/equipos" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { results } = await env.DB.prepare(
      `SELECT e.id, e.codigo, e.nombre, e.ubicacion_id, u.nombre AS ubicacion,
              e.estado, e.frec_dias, e.frec_horas, e.nota,
              (SELECT fecha FROM mantenimientos WHERE equipo_id=e.id ORDER BY fecha DESC, id DESC LIMIT 1) AS ult_mant_fecha,
              (SELECT horometro FROM mantenimientos WHERE equipo_id=e.id AND horometro IS NOT NULL ORDER BY fecha DESC, id DESC LIMIT 1) AS base_horometro,
              (SELECT lectura FROM equipo_horometro WHERE equipo_id=e.id ORDER BY fecha DESC, id DESC LIMIT 1) AS ult_lectura,
              (SELECT fecha FROM equipo_horometro WHERE equipo_id=e.id ORDER BY fecha DESC, id DESC LIMIT 1) AS ult_lectura_fecha,
              (SELECT COALESCE(SUM(s.costo_total),0) FROM salidas_almacen s WHERE s.mantenimiento_id IN (SELECT id FROM mantenimientos WHERE equipo_id=e.id))
                + (SELECT COALESCE(SUM(costo_mano_obra),0) FROM mantenimientos WHERE equipo_id=e.id) AS costo_acumulado
       FROM equipos e
       LEFT JOIN ubicaciones u ON u.id = e.ubicacion_id
       WHERE e.activo = 1
       ORDER BY e.codigo`
    ).all();
    const hoy = new Date().toISOString().slice(0, 10);
    const dsPorDia = 86400000;
    const out = [];
    for (const e of results) {
      let vencido = false, faltan_dias = null, faltan_horas = null, proximo_txt = null;
      // por dias: base = ultimo mantenimiento
      if (e.frec_dias && e.ult_mant_fecha) {
        const base = new Date(e.ult_mant_fecha + "T00:00:00").getTime();
        const vence = base + e.frec_dias * dsPorDia;
        faltan_dias = Math.ceil((vence - new Date(hoy + "T00:00:00").getTime()) / dsPorDia);
        if (faltan_dias <= 0) vencido = true;
      }
      // por horas: base = horometro del ultimo mantenimiento (o 0), ultima lectura conocida
      if (e.frec_horas && e.ult_lectura != null) {
        const baseH = e.base_horometro != null ? e.base_horometro : 0;
        faltan_horas = Math.round((e.frec_horas - (e.ult_lectura - baseH)) * 10) / 10;
        if (faltan_horas <= 0) vencido = true;
      }
      if (e.frec_dias || e.frec_horas) {
        const partes = [];
        if (faltan_dias != null) partes.push(faltan_dias <= 0 ? "DÍAS VENCIDOS" : `faltan ${faltan_dias} día(s)`);
        if (faltan_horas != null) partes.push(faltan_horas <= 0 ? "HORAS VENCIDAS" : `faltan ${faltan_horas} h`);
        proximo_txt = partes.join(" · ") || "sin base aún";
      }
      if (vencido) {
        await crearPendiente(env, {
          tipo: "resolver",
          titulo: `Preventivo vencido: ${e.nombre}`,
          detalle: `El equipo ${e.codigo} · ${e.nombre} tiene un mantenimiento preventivo vencido (${proximo_txt}). Programa el mantenimiento; esta alerta se cierra sola al registrarlo.`,
          origen: "equipos",
          ref_tabla: "preventivo_vencido",
          ref_id: e.id,
          rol: "administrador",
        });
      }
      out.push({ ...e, vencido, proximo_txt });
    }
    return json({ equipos: out });
  }

  if (path === "/api/equipos" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo administración o almacén pueden crear equipos." }, 403);
    const b = await req.json();
    if (!b.codigo || !String(b.codigo).trim() || !b.nombre || !String(b.nombre).trim())
      return json({ error: "Código y nombre son obligatorios." }, 400);
    const existe = await env.DB.prepare("SELECT id FROM equipos WHERE codigo=?").bind(String(b.codigo).trim()).first();
    if (existe) return json({ error: `Ya existe un equipo con el código ${b.codigo}.` }, 400);
    const res = await env.DB.prepare(
      "INSERT INTO equipos (codigo, nombre, ubicacion_id, frec_dias, frec_horas, nota) VALUES (?,?,?,?,?,?)"
    ).bind(String(b.codigo).trim(), String(b.nombre).trim(), b.ubicacion_id || null,
           b.frec_dias ? parseInt(b.frec_dias) : null, b.frec_horas ? parseFloat(b.frec_horas) : null, b.nota || null).run();
    await audit(env, user.id, "crear", "equipos", res.meta.last_row_id, null, b);
    return json({ ok: true, id: res.meta.last_row_id });
  }

  if (path === "/api/equipos" && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo administración o almacén pueden editar equipos." }, 403);
    const b = await req.json();
    if (!b.id || !b.nombre || !String(b.nombre).trim()) return json({ error: "Falta el equipo o el nombre." }, 400);
    const estados = ["operativo", "en_mantenimiento", "fuera_servicio", "baja"];
    if (b.estado && !estados.includes(b.estado)) return json({ error: "Estado no válido." }, 400);
    const e0 = await env.DB.prepare("SELECT * FROM equipos WHERE id=?").bind(b.id).first();
    if (!e0) return json({ error: "El equipo no existe." }, 404);
    await env.DB.prepare(
      "UPDATE equipos SET codigo=?, nombre=?, ubicacion_id=?, frec_dias=?, frec_horas=?, nota=?, estado=?, activo=? WHERE id=?"
    ).bind(b.codigo ? String(b.codigo).trim() : e0.codigo, String(b.nombre).trim(), b.ubicacion_id !== undefined ? b.ubicacion_id : e0.ubicacion_id,
           b.frec_dias !== undefined ? (b.frec_dias ? parseInt(b.frec_dias) : null) : e0.frec_dias,
           b.frec_horas !== undefined ? (b.frec_horas ? parseFloat(b.frec_horas) : null) : e0.frec_horas,
           b.nota !== undefined ? b.nota : e0.nota,
           b.estado || e0.estado,
           b.activo === undefined ? e0.activo : (b.activo ? 1 : 0), b.id).run();
    await audit(env, user.id, "editar", "equipos", b.id, e0, b);
    return json({ ok: true });
  }

  // lectura de horometro
  if (path === "/api/equipos/horometro" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo administración o almacén pueden registrar el horómetro." }, 403);
    const b = await req.json();
    if (!b.equipo_id || !b.fecha || !(parseFloat(b.lectura) >= 0))
      return json({ error: "Faltan equipo, fecha o lectura de horómetro." }, 400);
    const e0 = await env.DB.prepare("SELECT id FROM equipos WHERE id=? AND activo=1").bind(b.equipo_id).first();
    if (!e0) return json({ error: "El equipo no existe." }, 404);
    await env.DB.prepare(
      "INSERT INTO equipo_horometro (equipo_id, fecha, lectura, nota, registrado_por) VALUES (?,?,?,?,?)"
    ).bind(b.equipo_id, b.fecha, parseFloat(b.lectura), b.nota || null, user.id).run();
    await audit(env, user.id, "crear", "equipo_horometro", null, null, b);
    return json({ ok: true });
  }

  // mantenimientos: historial con repuestos entregados reales
  if (path === "/api/mantenimientos" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const sp3 = new URL(req.url).searchParams;
    const equipoId = parseInt(sp3.get("equipo_id")) || null;
    let q = `SELECT m.*, eq.codigo, eq.nombre AS equipo,
               (SELECT COALESCE(SUM(s.costo_total),0) FROM salidas_almacen s WHERE s.mantenimiento_id = m.id) AS costo_repuestos,
               (SELECT GROUP_CONCAT(mm.nombre || ' x' || s.cantidad, '; ') FROM salidas_almacen s JOIN materiales mm ON mm.id = s.material_id WHERE s.mantenimiento_id = m.id) AS repuestos_entregados
             FROM mantenimientos m JOIN equipos eq ON eq.id = m.equipo_id`;
    const binds = [];
    if (equipoId) { q += " WHERE m.equipo_id = ?"; binds.push(equipoId); }
    q += " ORDER BY m.fecha DESC, m.id DESC LIMIT 200";
    const { results } = await env.DB.prepare(q).bind(...binds).all();
    return json({ mantenimientos: results });
  }

  // registrar mantenimiento: el correctivo deja el equipo en mantenimiento;
  // el horometro anotado tambien reinicia el contador de horas
  if (path === "/api/mantenimientos" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo administración o almacén pueden registrar mantenimientos." }, 403);
    const b = await req.json();
    if (!b.equipo_id || !b.fecha || !["preventivo", "correctivo"].includes(b.tipo))
      return json({ error: "Faltan equipo, fecha o tipo de mantenimiento." }, 400);
    const e0 = await env.DB.prepare("SELECT * FROM equipos WHERE id=? AND activo=1").bind(b.equipo_id).first();
    if (!e0) return json({ error: "El equipo no existe." }, 404);
    const res = await env.DB.prepare(
      `INSERT INTO mantenimientos (equipo_id, tipo, fecha, descripcion, repuestos_estimados, costo_mano_obra, horometro, registrado_por)
       VALUES (?,?,?,?,?,?,?,?)`
    ).bind(b.equipo_id, b.tipo, b.fecha, b.descripcion || null, b.repuestos_estimados || null,
           b.costo_mano_obra ? parseFloat(b.costo_mano_obra) : null,
           b.horometro != null && b.horometro !== "" ? parseFloat(b.horometro) : null, user.id).run();
    if (b.tipo === "correctivo") {
      await env.DB.prepare("UPDATE equipos SET estado='en_mantenimiento' WHERE id=?").bind(b.equipo_id).run();
    }
    if (b.horometro != null && b.horometro !== "") {
      await env.DB.prepare(
        "INSERT INTO equipo_horometro (equipo_id, fecha, lectura, nota, registrado_por) VALUES (?,?,?,?,?)"
      ).bind(b.equipo_id, b.fecha, parseFloat(b.horometro), "Lectura en mantenimiento " + res.meta.last_row_id, user.id).run();
    }
    await resolverPendientesRef(env, "preventivo_vencido", b.equipo_id);
    await audit(env, user.id, "crear", "mantenimientos", res.meta.last_row_id, null, b);
    return json({ ok: true, id: res.meta.last_row_id });
  }

  // cerrar mantenimiento: el equipo vuelve a operativo
  if (path === "/api/mantenimientos/cerrar" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedeAlmacen(user)) return json({ error: "Solo administración o almacén pueden cerrar mantenimientos." }, 403);
    const b = await req.json();
    if (!b.id) return json({ error: "Falta el mantenimiento." }, 400);
    const m0 = await env.DB.prepare("SELECT * FROM mantenimientos WHERE id=?").bind(b.id).first();
    if (!m0) return json({ error: "El mantenimiento no existe." }, 404);
    if (!m0.cerrado_en) {
      await env.DB.prepare("UPDATE mantenimientos SET cerrado_en=datetime('now') WHERE id=?").bind(b.id).run();
      await env.DB.prepare("UPDATE equipos SET estado='operativo' WHERE id=?").bind(m0.equipo_id).run();
      await audit(env, user.id, "cerrar", "mantenimientos", b.id, m0, b);
    }
    return json({ ok: true });
  }

  // ==========================================================
  // CENTRO DE PENDIENTES (notificaciones)
  // ==========================================================
  // contadores para la campanita (por resolver = rojo, por leer = azul)
  if (path === "/api/pendientes/contadores" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    // pendientes dirigidos a mi (por usuario o por mi rol)
    const cond = "(usuario_id = ? OR rol = ?)";
    const porResolver = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM pendientes WHERE ${cond} AND tipo='resolver' AND estado='abierto'`
    ).bind(user.id, user.rol).first();
    const porLeer = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM pendientes WHERE ${cond} AND tipo='informativa' AND estado='abierto'`
    ).bind(user.id, user.rol).first();
    return json({ por_resolver: porResolver?.n || 0, por_leer: porLeer?.n || 0 });
  }

  // lista de pendientes (los mios; el admin puede pedir todos con ?todos=1)
  if (path === "/api/pendientes" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const url = new URL(req.url);
    const todos = url.searchParams.get("todos") === "1" && user.rol === "administrador";
    let q = `SELECT p.id, p.tipo, p.titulo, p.detalle, p.origen, p.grupo, p.estado, p.creado_en, p.usuario_id, p.rol,
                    u.nombre AS usuario_nombre
             FROM pendientes p LEFT JOIN usuarios u ON u.id = p.usuario_id`;
    const binds = [];
    if (!todos) { q += " WHERE (p.usuario_id = ? OR p.rol = ?)"; binds.push(user.id, user.rol); }
    q += " ORDER BY (p.estado='abierto') DESC, p.creado_en ASC LIMIT 300";
    const { results } = await env.DB.prepare(q).bind(...binds).all();
    return json({ pendientes: results, es_admin: user.rol === "administrador" });
  }

  // marcar una informativa como leida (solo informativas; las de resolver las cierra el sistema)
  if (path.match(/^\/api\/pendientes\/\d+\/leido$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const id = parseInt(path.split("/")[3], 10);
    const p = await env.DB.prepare("SELECT * FROM pendientes WHERE id=?").bind(id).first();
    if (!p) return json({ error: "Pendiente no encontrado." }, 404);
    if (p.tipo !== "informativa") return json({ error: "Los pendientes por resolver los cierra el sistema cuando se hace la corrección." }, 400);
    // solo el destinatario (o admin) puede marcarla
    if (p.usuario_id && p.usuario_id !== user.id && user.rol !== "administrador")
      return json({ error: "No es tu pendiente." }, 403);
    await env.DB.prepare("UPDATE pendientes SET estado='leido', leido_en=datetime('now') WHERE id=?").bind(id).run();
    return json({ ok: true });
  }

  // borrar un pendiente (la X) — solo si ya esta leido o resuelto (no borrar sin ver)
  if (path.match(/^\/api\/pendientes\/\d+$/) && req.method === "DELETE") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const id = parseInt(path.split("/")[2], 10);
    const p = await env.DB.prepare("SELECT * FROM pendientes WHERE id=?").bind(id).first();
    if (!p) return json({ error: "No encontrado." }, 404);
    if (p.usuario_id && p.usuario_id !== user.id && user.rol !== "administrador")
      return json({ error: "No es tu pendiente." }, 403);
    if (p.estado === "abierto" && p.tipo === "resolver")
      return json({ error: "No puedes borrar un pendiente por resolver que sigue abierto." }, 400);
    await env.DB.prepare("DELETE FROM pendientes WHERE id=?").bind(id).run();
    return json({ ok: true });
  }

  // borrar todos los LEIDOS de un grupo (deja los no leidos)
  if (path === "/api/pendientes/borrar-leidos" && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const { grupo } = await req.json();
    // borra los leidos/resueltos del usuario (o de su rol) del grupo indicado
    if (grupo) {
      await env.DB.prepare(
        `DELETE FROM pendientes WHERE grupo=? AND estado IN ('leido','resuelto') AND (usuario_id=? OR rol=?)`
      ).bind(grupo, user.id, user.rol).run();
    } else {
      await env.DB.prepare(
        `DELETE FROM pendientes WHERE (grupo IS NULL) AND estado IN ('leido','resuelto') AND (usuario_id=? OR rol=?)`
      ).bind(user.id, user.rol).run();
    }
    return json({ ok: true });
  }

  // ==========================================================
  // FLUJO DE APROBACION DE LA PLANEACION (9B-2)
  // ==========================================================
  // estado de una semana
  if (path.match(/^\/api\/plan\/\d+\/\d+\/estado$/) && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const parts = path.split("/");
    const anio = parseInt(parts[3], 10), semana = parseInt(parts[4], 10);
    const est = await env.DB.prepare("SELECT * FROM plan_estado WHERE anio=? AND semana=?").bind(anio, semana).first();
    // cambios por aprobar de esa semana (para la vista granular)
    const cambios = await env.DB.prepare(
      `SELECT c.id, c.accion, c.antes, c.despues, c.explicacion, c.estado_aprob, c.comentario_admin, c.fecha_hora,
              u.nombre AS usuario
       FROM agenda_cambios c LEFT JOIN usuarios u ON u.id = c.usuario_id
       WHERE c.anio=? AND c.semana=? AND c.estado_aprob IS NOT NULL ORDER BY c.fecha_hora`
    ).bind(anio, semana).all();
    return json({
      estado: est ? est.estado : "edicion",
      comentario: est?.comentario || null,
      cambios: cambios.results,
      es_admin: user.rol === "administrador",
      soy_coordinador: user.rol === "coordinador",
    });
  }

  // solicitar aprobacion (coordinador o admin)
  if (path.match(/^\/api\/plan\/\d+\/\d+\/solicitar$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (!puedePlanear(user)) return json({ error: "Solo coordinadores o el administrador." }, 403);
    const parts = path.split("/");
    const anio = parseInt(parts[3], 10), semana = parseInt(parts[4], 10);
    await env.DB.prepare(
      `INSERT INTO plan_estado (anio, semana, estado, solicitada_por, solicitada_en)
       VALUES (?, ?, 'solicitada', ?, datetime('now'))
       ON CONFLICT(anio,semana) DO UPDATE SET estado='solicitada', solicitada_por=excluded.solicitada_por, solicitada_en=excluded.solicitada_en, comentario=NULL`
    ).bind(anio, semana, user.id).run();
    // alerta al admin
    await crearPendiente(env, {
      tipo: "resolver", grupo: "Aprobaciones de planeación",
      titulo: `Semana ${semana}/${anio}: solicitud de aprobación`,
      detalle: `${user.nombre} solicitó aprobar la planeación de la semana ${semana} de ${anio}.`,
      origen: "planeacion", ref_tabla: "plan_solicitud", ref_id: anio * 100 + semana, rol: "administrador",
    });
    return json({ ok: true });
  }

  // aprobar o rechazar la semana completa (admin)
  if (path.match(/^\/api\/plan\/\d+\/\d+\/revisar$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador aprueba o rechaza." }, 403);
    const parts = path.split("/");
    const anio = parseInt(parts[3], 10), semana = parseInt(parts[4], 10);
    const { decision, comentario } = await req.json(); // 'aprobar' / 'rechazar'
    const nuevo = decision === "aprobar" ? "aprobada" : "rechazada";
    await env.DB.prepare(
      `INSERT INTO plan_estado (anio, semana, estado, revisada_por, revisada_en, comentario)
       VALUES (?, ?, ?, ?, datetime('now'), ?)
       ON CONFLICT(anio,semana) DO UPDATE SET estado=excluded.estado, revisada_por=excluded.revisada_por, revisada_en=excluded.revisada_en, comentario=excluded.comentario`
    ).bind(anio, semana, nuevo, user.id, comentario || null).run();
    // cerrar la solicitud pendiente
    await resolverPendientesRef(env, "plan_solicitud", anio * 100 + semana);
    // avisar al coordinador que solicito
    const est = await env.DB.prepare("SELECT solicitada_por FROM plan_estado WHERE anio=? AND semana=?").bind(anio, semana).first();
    if (est?.solicitada_por) {
      await crearPendiente(env, {
        tipo: "informativa", grupo: "Estado de mis planeaciones",
        titulo: `Semana ${semana}/${anio}: ${decision === "aprobar" ? "APROBADA" : "RECHAZADA"}`,
        detalle: decision === "aprobar" ? "Tu planeación fue aprobada." : `Tu planeación fue rechazada. Comentario: ${comentario || "(sin comentario)"}`,
        origen: "planeacion", usuario_id: est.solicitada_por,
      });
    }
    await audit(env, user.id, "confirmar", "plan_estado", anio * 100 + semana, null, { decision });
    return json({ ok: true });
  }

  // revisar un CAMBIO individual (aprobar/rechazar) — admin, granular
  if (path.match(/^\/api\/plan\/cambio\/\d+\/revisar$/) && req.method === "POST") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador revisa cambios." }, 403);
    const id = parseInt(path.split("/")[4], 10);
    const { decision, comentario } = await req.json();
    const nuevo = decision === "aprobar" ? "aprobado" : "rechazado";
    const c = await env.DB.prepare("SELECT * FROM agenda_cambios WHERE id=?").bind(id).first();
    if (!c) return json({ error: "Cambio no encontrado." }, 404);
    await env.DB.prepare(
      "UPDATE agenda_cambios SET estado_aprob=?, comentario_admin=?, revisado_por=?, revisado_en=datetime('now') WHERE id=?"
    ).bind(nuevo, comentario || null, user.id, id).run();
    // si ya no quedan cambios 'por_aprobar' en la semana, la semana vuelve a 'aprobada'
    const pend = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM agenda_cambios WHERE anio=? AND semana=? AND estado_aprob='por_aprobar'"
    ).bind(c.anio, c.semana).first();
    if (pend && pend.n === 0) {
      await env.DB.prepare("UPDATE plan_estado SET estado='aprobada' WHERE anio=? AND semana=?").bind(c.anio, c.semana).run();
    }
    // avisar al que hizo el cambio
    if (c.usuario_id) {
      await crearPendiente(env, {
        tipo: "informativa", grupo: "Estado de mis planeaciones",
        titulo: `Cambio en semana ${c.semana}/${c.anio}: ${decision === "aprobar" ? "aprobado" : "rechazado"}`,
        detalle: decision === "aprobar" ? "Tu cambio fue aprobado." : `Tu cambio fue rechazado. ${comentario || ""} — quedó marcado en rojo para que lo corrijas.`,
        origen: "planeacion", usuario_id: c.usuario_id,
      });
    }
    await audit(env, user.id, "confirmar", "agenda_cambios", id, null, { decision });
    return json({ ok: true });
  }

  // ==========================================================
  // CONFIGURACION — ver: autenticado; editar: solo admin
  // ==========================================================
  if (path === "/api/configuracion" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede ver la configuración." }, 403);
    const { results } = await env.DB.prepare(
      "SELECT clave, valor, descripcion, tipo FROM configuracion ORDER BY clave"
    ).all();
    return json({ configuracion: results, puede_editar: user.rol === "administrador" });
  }

  if (path.match(/^\/api\/configuracion\/[a-z_]+$/) && req.method === "PUT") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    if (user.rol !== "administrador") return json({ error: "Solo el administrador puede cambiar la configuración." }, 403);
    const clave = path.split("/")[3];
    const { valor } = await req.json();
    const existe = await env.DB.prepare("SELECT clave FROM configuracion WHERE clave = ?").bind(clave).first();
    if (!existe) return json({ error: "Parámetro no encontrado." }, 404);
    await env.DB.prepare(
      "UPDATE configuracion SET valor = ?, actualizado_por = ?, actualizado_en = datetime('now') WHERE clave = ?"
    ).bind(String(valor), user.id, clave).run();
    await audit(env, user.id, "editar", "configuracion", null, { clave }, { valor });
    return json({ ok: true });
  }

  // ==========================================================
  // DASHBOARD — datos del mapa e indicadores (todos los usuarios)
  // ==========================================================
  if (path === "/api/dashboard" && req.method === "GET") {
    const user = await currentUser(req, env);
    if (!user) return json({ error: "No autenticado." }, 401);
    const cfg = await env.DB.prepare("SELECT valor FROM configuracion WHERE clave='max_racimos_ha_semana'").first();
    const maxRacimos = cfg ? parseFloat(cfg.valor) : 45;
    const lotesQ = await env.DB.prepare(
      `SELECT l.id, l.nombre, l.activo, l.es_zona_especial,
              (SELECT hectareas FROM lote_versiones v WHERE v.lote_id=l.id AND v.vigente_hasta IS NULL ORDER BY v.vigente_desde DESC LIMIT 1) AS hectareas
       FROM lotes l WHERE (l.es_zona_especial=0 OR l.es_zona_especial IS NULL)`
    ).all();
    const embQ = await env.DB.prepare(
      `SELECT lote_id, AVG(cantidad_ejecutada) AS prom FROM (
         SELECT r.lote_id, r.cantidad_ejecutada,
                ROW_NUMBER() OVER (PARTITION BY r.lote_id ORDER BY r.semana DESC, r.fecha DESC) AS rn
         FROM reporte_labores r
         WHERE r.labor_id = (SELECT id FROM labores WHERE codigo='101' LIMIT 1)
           AND r.cantidad_ejecutada IS NOT NULL
       ) WHERE rn <= 2 GROUP BY lote_id`
    ).all();
    const embMap = {};
    for (const e of embQ.results) embMap[e.lote_id] = e.prom || 0;
    const lotes = [];
    let racimosTotal = 0, haActivas = 0;
    for (const l of lotesQ.results) {
      const emb = embMap[l.id] || 0;
      const ha = l.hectareas || 0;
      const racimosHa = ha > 0 ? emb / ha : 0;
      const pct = maxRacimos > 0 ? (racimosHa / maxRacimos) * 100 : 0;
      let color = "gris";
      if (!l.activo) color = "suspendido";
      else if (emb > 0) { color = pct >= 90 ? "verde" : (pct >= 80 ? "amarillo" : "rojo"); }
      lotes.push({ id: l.id, nombre: l.nombre, activo: l.activo, hectareas: ha,
        embolse_sem: Math.round(emb), racimos_ha: Math.round(racimosHa * 10) / 10, pct: Math.round(pct), color });
      if (l.activo) { racimosTotal += emb; haActivas += ha; }
    }
    const racimosHaFinca = haActivas > 0 ? racimosTotal / haActivas : 0;
    return json({
      max_racimos: maxRacimos, lotes,
      indicadores: {
        ha_activas: Math.round(haActivas * 100) / 100,
        racimos_semana: Math.round(racimosTotal),
        racimos_ha_finca: Math.round(racimosHaFinca * 10) / 10,
        pct_finca: maxRacimos > 0 ? Math.round((racimosHaFinca / maxRacimos) * 100) : 0,
        lotes_activos: lotesQ.results.filter(l => l.activo).length,
      },
    });
  }

  return json({ error: "Ruta no encontrada." }, 404);
}

// ============================================================
// ENTRADA PRINCIPAL
// ============================================================
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.startsWith("/api/")) {
      try {
        return await handleApi(req, env, path);
      } catch (e) {
        return json({ error: "Error del servidor: " + e.message }, 500);
      }
    }

    // Cualquier otra ruta: la sirve Cloudflare Assets (las pantallas).
    // El binding de assets responde automaticamente; si llega aqui, 404.
    return env.ASSETS.fetch(req);
  },
};
