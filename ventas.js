const SUPABASE_URL = window.LUBRIMEC_SUPABASE?.url || 'https://mjvqjbfqcyajppsttdrg.supabase.co';
const SUPABASE_ANON_KEY = window.LUBRIMEC_SUPABASE?.anonKey || 'sb_publishable_GX-biMYHvxoyVCmzJrdBIw_Mx45BB6W';

const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =======================================================
// REFERENCIAS DEL DOM
// =======================================================
const cuerpoVentas = document.getElementById('cuerpo-ventas');
const contenedorVentas = document.getElementById('contenedor-ventas');
const encabezadoVentas = document.getElementById('encabezado-ventas');
const tituloVentas = document.getElementById('titulo-ventas');
const controlesEncabezadoVentas = document.getElementById('controles-encabezado-ventas');
const btnVolverAdmin = document.getElementById('btn-volver-admin');
const btnTemaVentas = document.getElementById('btn-tema-ventas');
const btnLogoutVentas = document.getElementById('btn-logout-ventas');

const vistaLoginVentas = document.getElementById('vista-login-ventas');
const formLoginVentas = document.getElementById('form-login-ventas');
const vistaPanelVentas = document.getElementById('vista-panel-ventas');
const barraSesionVentas = document.getElementById('barra-sesion-ventas');
const usuarioCorreoVentas = document.getElementById('usuario-correo-ventas');

const bloqueCargarVenta = document.getElementById('bloque-cargar-venta');
const formVenta = document.getElementById('form-venta');
const buscadorProductosVenta = document.getElementById('buscador-productos-venta');
const listaProductosVenta = document.getElementById('lista-productos-venta');
const metodoPago = document.getElementById('metodo-pago');
const totalVentaTexto = document.getElementById('total-venta-texto');
const btnRegistrarVenta = document.getElementById('btn-registrar-venta');

const estadoMensajeVentas = document.getElementById('estado-mensaje-ventas');
const estadoMensajeTextoVentas = document.getElementById('estado-mensaje-texto-ventas');
const btnCerrarMensajeVentas = document.getElementById('btn-cerrar-mensaje-ventas');

const CLAVE_TEMA_ADMIN = 'lubrimec_admin_tema';
let modoOscuroActivo = localStorage.getItem(CLAVE_TEMA_ADMIN) === 'oscuro';
let haySesionActiva = false;
let correoSesionActiva = '';
let productosCatalogo = [];
let seleccionVenta = new Map();

// =======================================================
// ESTILOS Y TEMA
// =======================================================
const aplicarEstilos = () => {
    document.body.classList.toggle('dark-mode', modoOscuroActivo);
    if (btnTemaVentas) btnTemaVentas.textContent = modoOscuroActivo ? '☀️' : '🌙';
    if (btnLogoutVentas) btnLogoutVentas.style.display = haySesionActiva ? 'inline-block' : 'none';
};

modoOscuroActivo = localStorage.getItem('modoOscuro') === 'activado';
aplicarEstilos();

btnTemaVentas?.addEventListener('click', () => {
    modoOscuroActivo = !modoOscuroActivo;
    localStorage.setItem('modoOscuro', modoOscuroActivo ? 'activado' : 'desactivado');
    aplicarEstilos();
});

// =======================================================
// UTILIDADES
// =======================================================
const mostrarEstado = (texto) => {
    if (!estadoMensajeVentas || !estadoMensajeTextoVentas) return;
    estadoMensajeTextoVentas.textContent = texto;
    estadoMensajeVentas.style.display = 'flex';
    aplicarEstilos();
};

const ocultarEstado = () => {
    if (!estadoMensajeVentas || !estadoMensajeTextoVentas) return;
    estadoMensajeTextoVentas.textContent = '';
    estadoMensajeVentas.style.display = 'none';
};

btnCerrarMensajeVentas?.addEventListener('click', ocultarEstado);

const escaparHTML = (texto = '') => String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatearPrecio = (valor) => {
    const numero = Number(valor) || 0;
    return numero.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    });
};

const normalizarTexto = (texto = '') => String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const obtenerFechaHoraActual = () => {
    const ahora = new Date();
    const yyyy = ahora.getFullYear();
    const mm = String(ahora.getMonth() + 1).padStart(2, '0');
    const dd = String(ahora.getDate()).padStart(2, '0');
    const hh = String(ahora.getHours()).padStart(2, '0');
    const min = String(ahora.getMinutes()).padStart(2, '0');
    const ss = String(ahora.getSeconds()).padStart(2, '0');
    return {
        fecha: `${yyyy}-${mm}-${dd}`,
        hora: `${hh}:${min}:${ss}`,
        timestamp: ahora.toISOString()
    };
};

// =======================================================
// PRODUCTOS Y SELECCIÓN DE VENTA
// =======================================================
const actualizarTotalVenta = () => {
    if (!totalVentaTexto) return;
    let total = 0;
    seleccionVenta.forEach((entry, idProd) => {
        if (!entry.seleccionado) return;
        const prod = productosCatalogo.find(p => String(p.id) === String(idProd));
        if (!prod) return;
        const cant = Math.max(1, Math.round(Number(entry.cantidad) || 1));
        const precio = Math.max(0, Number(entry.precio ?? prod.precio_venta ?? 0));
        total += cant * precio;
    });
    totalVentaTexto.textContent = `Total: ${formatearPrecio(total)}`;
};

const sincronizarEstadoVisualFila = (idProd, seleccionado) => {
    const fila = listaProductosVenta?.querySelector(`.fila-producto-venta[data-id="${CSS.escape(String(idProd))}"]`);
    if (!fila) return;
    fila.classList.toggle('seleccionada', Boolean(seleccionado));

    const checkbox = fila.querySelector('.check-venta-prod');
    if (checkbox) checkbox.checked = Boolean(seleccionado);

    const btnSelec = fila.querySelector('.btn-selec-venta');
    if (btnSelec) {
        btnSelec.classList.toggle('activo', Boolean(seleccionado));
        btnSelec.textContent = seleccionado ? '✓ Selec.' : 'Selec.';
        btnSelec.setAttribute('aria-pressed', String(Boolean(seleccionado)));
    }
};

const renderizarProductosVenta = () => {
    if (!listaProductosVenta) return;
    const palabras = normalizarTexto(buscadorProductosVenta?.value || '')
        .split(' ')
        .filter(Boolean);

    const filtrados = productosCatalogo.filter(prod => {
        if (palabras.length === 0) return true;
        const texto = normalizarTexto(
            `${prod.codigo || ''} ${prod.marca || ''} ${prod.nombre_variante || ''} ${prod.categoria || ''} ${prod.vehiculo || ''}`
        );
        return palabras.every(p => texto.includes(p));
    });

    if (filtrados.length === 0) {
        listaProductosVenta.innerHTML = '<div>No hay productos para mostrar.</div>';
        aplicarEstilos();
        return;
    }

    listaProductosVenta.innerHTML = filtrados.map(prod => {
        const key = String(prod.id);
        const actual = seleccionVenta.get(key) || {
            seleccionado: false,
            cantidad: 1,
            precio: Number(prod.precio_venta ?? 0)
        };
        const srcImg = prod.imagen ? escaparHTML(prod.imagen) : 'Lubrimec-Logo-Fondo-Transparente.png';

        return `
            <div class="fila-producto-venta ${actual.seleccionado ? 'seleccionada' : ''}" data-id="${escaparHTML(key)}">
                <!-- Vista Escritorio -->
                <label class="label-prod-escritorio">
                    <input type="checkbox" class="check-venta-prod" data-id="${escaparHTML(key)}" ${actual.seleccionado ? 'checked' : ''}>
                    <span>
                        <strong>${escaparHTML(prod.codigo || '-')}</strong> —
                        ${escaparHTML(prod.nombre_variante || 'Sin nombre')}
                        <small>(Stock: ${Number(prod.cantidad ?? 0)})</small>
                    </span>
                </label>
                <div class="controles-item-venta">
                    <label class="label-control-venta">
                        Cant:
                        <input type="number" class="input-venta-num input-venta-cant" data-id="${escaparHTML(key)}" min="1" step="1" value="${actual.cantidad}">
                    </label>
                    <label class="label-control-venta">
                        Precio $:
                        <input type="number" class="input-venta-num input-venta-precio" data-id="${escaparHTML(key)}" min="0" step="0.01" value="${actual.precio}">
                    </label>
                </div>

                <!-- Vista Tarjeta (Celulares) -->
                <div class="venta-card-superior">
                    <div class="venta-card-foto">
                        <img src="${srcImg}" alt="${escaparHTML(prod.nombre_variante || 'Producto')}" loading="lazy">
                    </div>
                    <span class="venta-card-codigo">${escaparHTML(prod.codigo || '-')}</span>
                </div>

                <div class="venta-card-producto">
                    ${escaparHTML(prod.nombre_variante || 'Sin nombre')}
                    <small>Stock disponible: ${Number(prod.cantidad ?? 0)}</small>
                </div>

                <div class="venta-card-cantidad-fila">
                    <label for="cant-movil-${escaparHTML(key)}">Cantidad:</label>
                    <input
                        id="cant-movil-${escaparHTML(key)}"
                        type="number"
                        class="input-venta-num input-venta-cant"
                        data-id="${escaparHTML(key)}"
                        min="1"
                        step="1"
                        value="${actual.cantidad}"
                    >
                </div>

                <div class="venta-card-inferior">
                    <div class="venta-card-precio-wrap">
                        <span>$</span>
                        <input
                            type="number"
                            class="input-venta-num input-venta-precio"
                            data-id="${escaparHTML(key)}"
                            min="0"
                            step="0.01"
                            value="${actual.precio}"
                            aria-label="Precio editable"
                        >
                    </div>
                    <button
                        type="button"
                        class="btn-selec-venta ${actual.seleccionado ? 'activo' : ''}"
                        data-id="${escaparHTML(key)}"
                        aria-pressed="${actual.seleccionado ? 'true' : 'false'}"
                    >
                        ${actual.seleccionado ? '✓ Selec.' : 'Selec.'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    actualizarTotalVenta();
    aplicarEstilos();
};

const cargarProductos = async () => {
    if (!listaProductosVenta) return;
    listaProductosVenta.innerHTML = '<div>Cargando productos...</div>';
    aplicarEstilos();

    const { data, error } = await clienteSupabase
        .from('productos')
        .select('id, codigo, marca, nombre_variante, categoria, vehiculo, cantidad, precio_venta, imagen')
        .order('codigo', { ascending: true });

    if (error) {
        listaProductosVenta.innerHTML = `<div>Error al cargar productos: ${escaparHTML(error.message)}</div>`;
        aplicarEstilos();
        return;
    }

    productosCatalogo = data || [];
    seleccionVenta = new Map();
    productosCatalogo.forEach(prod => {
        seleccionVenta.set(String(prod.id), {
            seleccionado: false,
            cantidad: 1,
            precio: Number(prod.precio_venta ?? 0)
        });
    });

    renderizarProductosVenta();
};

listaProductosVenta?.addEventListener('click', (e) => {
    const btnSelec = e.target.closest('.btn-selec-venta');
    if (!btnSelec) return;
    const idProd = btnSelec.dataset?.id;
    if (!idProd) return;

    const prev = seleccionVenta.get(String(idProd)) || { seleccionado: false, cantidad: 1, precio: 0 };
    prev.seleccionado = !prev.seleccionado;
    seleccionVenta.set(String(idProd), prev);

    sincronizarEstadoVisualFila(idProd, prev.seleccionado);
    actualizarTotalVenta();
});

listaProductosVenta?.addEventListener('change', (e) => {
    const idProd = e.target.dataset?.id;
    if (!idProd) return;
    const prev = seleccionVenta.get(String(idProd)) || { seleccionado: false, cantidad: 1, precio: 0 };

    if (e.target.classList.contains('check-venta-prod')) {
        prev.seleccionado = e.target.checked;
        sincronizarEstadoVisualFila(idProd, prev.seleccionado);
    } else if (e.target.classList.contains('input-venta-cant')) {
        prev.cantidad = Math.max(1, Math.round(Number(e.target.value) || 1));
        listaProductosVenta.querySelectorAll(`.input-venta-cant[data-id="${CSS.escape(String(idProd))}"]`).forEach(inp => {
            inp.value = prev.cantidad;
        });
    } else if (e.target.classList.contains('input-venta-precio')) {
        prev.precio = Math.max(0, Number(e.target.value) || 0);
        listaProductosVenta.querySelectorAll(`.input-venta-precio[data-id="${CSS.escape(String(idProd))}"]`).forEach(inp => {
            inp.value = prev.precio;
        });
    }

    seleccionVenta.set(String(idProd), prev);
    actualizarTotalVenta();
});

listaProductosVenta?.addEventListener('input', (e) => {
    const idProd = e.target.dataset?.id;
    if (!idProd) return;
    const prev = seleccionVenta.get(String(idProd));
    if (!prev) return;

    if (e.target.classList.contains('input-venta-cant')) {
        prev.cantidad = Math.max(1, Math.round(Number(e.target.value) || 1));
        listaProductosVenta.querySelectorAll(`.input-venta-cant[data-id="${CSS.escape(String(idProd))}"]`).forEach(inp => {
            if (inp !== e.target) inp.value = prev.cantidad;
        });
    } else if (e.target.classList.contains('input-venta-precio')) {
        prev.precio = Math.max(0, Number(e.target.value) || 0);
        listaProductosVenta.querySelectorAll(`.input-venta-precio[data-id="${CSS.escape(String(idProd))}"]`).forEach(inp => {
            if (inp !== e.target) inp.value = prev.precio;
        });
    }
    actualizarTotalVenta();
});

buscadorProductosVenta?.addEventListener('input', renderizarProductosVenta);

formVenta?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!haySesionActiva) {
        mostrarEstado('Iniciá sesión para registrar ventas.');
        return;
    }

    const marcados = [];
    seleccionVenta.forEach((entry, idProd) => {
        if (!entry.seleccionado) return;
        const prod = productosCatalogo.find(p => String(p.id) === String(idProd));
        if (!prod) return;
        const cantidad = Math.max(1, Math.round(Number(entry.cantidad) || 1));
        const precio = Math.max(0, Number(entry.precio ?? prod.precio_venta ?? 0));
        marcados.push({
            producto: prod,
            cantidad,
            precio,
            subtotal: Number((cantidad * precio).toFixed(2))
        });
    });

    if (marcados.length === 0) {
        mostrarEstado('Marcá al menos un producto para registrar la venta.');
        return;
    }

    const metodo = metodoPago?.value || 'Efectivo';
    const { fecha, hora, timestamp } = obtenerFechaHoraActual();
    const adminEmail = correoSesionActiva || usuarioCorreoVentas?.textContent || 'admin';
    const totalVenta = Number(marcados.reduce((acc, m) => acc + m.subtotal, 0).toFixed(2));

    const itemsPayload = marcados.map(m => ({
        producto_id: m.producto.id,
        codigo: m.producto.codigo || '',
        producto_nombre: m.producto.nombre_variante || 'Sin nombre',
        marca: m.producto.marca || null,
        cantidad: m.cantidad,
        precio: m.precio,
        subtotal: m.subtotal
    }));

    if (btnRegistrarVenta) btnRegistrarVenta.disabled = true;
    aplicarEstilos();
    mostrarEstado('Guardando venta en Supabase...');

    try {
        const { data: ventaInsertada, error: errorVenta } = await clienteSupabase
            .from('ventas')
            .insert({
                fecha,
                hora,
                creado_en: timestamp,
                admin_email: adminEmail,
                metodo_pago: metodo,
                total: totalVenta,
                items: itemsPayload
            })
            .select('id')
            .single();

        if (errorVenta) throw errorVenta;

        if (ventaInsertada?.id) {
            const filasDetalle = marcados.map(m => ({
                venta_id: ventaInsertada.id,
                fecha,
                hora,
                admin_email: adminEmail,
                producto_id: m.producto.id,
                codigo: m.producto.codigo || '',
                producto_nombre: m.producto.nombre_variante || 'Sin nombre',
                cantidad: m.cantidad,
                precio_unitario: m.precio,
                subtotal: m.subtotal,
                metodo_pago: metodo
            }));

            const { error: errorDetalle } = await clienteSupabase
                .from('venta_items')
                .insert(filasDetalle);

            if (errorDetalle) throw errorDetalle;
        }

        for (const m of marcados) {
            const stockActual = Number(m.producto.cantidad ?? 0);
            const nuevoStock = Math.max(0, stockActual - m.cantidad);
            const { error: errorStock } = await clienteSupabase
                .from('productos')
                .update({ cantidad: nuevoStock, actualizado_en: timestamp })
                .eq('id', m.producto.id);

            if (errorStock) throw errorStock;
        }

        await cargarProductos();
        mostrarEstado(`Venta guardada (${fecha} ${hora}) por ${formatearPrecio(totalVenta)} (${metodo}).`);
    } catch (error) {
        mostrarEstado(`Error al guardar la venta: ${error.message || error}`);
    } finally {
        if (btnRegistrarVenta) btnRegistrarVenta.disabled = false;
        aplicarEstilos();
    }
});

// =======================================================
// SESIÓN
// =======================================================
const actualizarVistaSesion = (sesion) => {
    haySesionActiva = Boolean(sesion?.user);
    correoSesionActiva = sesion?.user?.email || '';

    if (haySesionActiva) {
        if (vistaLoginVentas) vistaLoginVentas.style.display = 'none';
        if (vistaPanelVentas) vistaPanelVentas.style.display = 'block';
        if (usuarioCorreoVentas) usuarioCorreoVentas.textContent = correoSesionActiva;
        aplicarEstilos();
        cargarProductos();
    } else {
        if (vistaPanelVentas) vistaPanelVentas.style.display = 'none';
        if (vistaLoginVentas) vistaLoginVentas.style.display = 'block';
        if (usuarioCorreoVentas) usuarioCorreoVentas.textContent = '';
        productosCatalogo = [];
        seleccionVenta = new Map();
        if (listaProductosVenta) listaProductosVenta.innerHTML = '';
        aplicarEstilos();
    }
};

formLoginVentas?.addEventListener('submit', async (e) => {
    e.preventDefault();
    mostrarEstado('Iniciando sesión...');
    const email = document.getElementById('email-ventas')?.value.trim() || '';
    const password = document.getElementById('password-ventas')?.value || '';

    const { data, error } = await clienteSupabase.auth.signInWithPassword({ email, password });
    if (error) {
        mostrarEstado(`Error al iniciar sesión: ${error.message}`);
        return;
    }
    actualizarVistaSesion(data.session);
    mostrarEstado('Sesión iniciada correctamente.');
});

btnLogoutVentas?.addEventListener('click', async () => {
    await clienteSupabase.auth.signOut();
    actualizarVistaSesion(null);
    mostrarEstado('Sesión cerrada.');
});

clienteSupabase.auth.getSession().then(({ data }) => actualizarVistaSesion(data.session));
clienteSupabase.auth.onAuthStateChange((_event, session) => actualizarVistaSesion(session));