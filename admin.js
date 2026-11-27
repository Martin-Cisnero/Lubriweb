const SUPABASE_URL = window.LUBRIMEC_SUPABASE?.url || 'https://mjvqjbfqcyajppsttdrg.supabase.co';
const SUPABASE_ANON_KEY = window.LUBRIMEC_SUPABASE?.anonKey || 'sb_publishable_GX-biMYHvxoyVCmzJrdBIw_Mx45BB6W';

const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =======================================================
// REFERENCIAS DEL DOM
// =======================================================
const cuerpoAdmin = document.getElementById('cuerpo-admin');
const contenedorAdmin = document.getElementById('contenedor-admin');
const vistaLogin = document.getElementById('vista-login');
const vistaPanel = document.getElementById('vista-panel');
const formLogin = document.getElementById('form-login');
const usuarioCorreo = document.getElementById('usuario-correo');
const btnVolverInicio = document.getElementById('btn-volver-inicio');
const btnAccesoVentas = document.getElementById('btn-acceso-ventas');
const btnLogout = document.getElementById('btn-logout');
const contenedorMenuAdmin = document.getElementById('contenedor-menu-admin');
const btnMenuAdmin = document.getElementById('btn-menu-admin');
const menuSeccionesAdmin = document.getElementById('menu-secciones-admin');
const estadoMensaje = document.getElementById('estado-mensaje');
const estadoMensajeTexto = document.getElementById('estado-mensaje-texto');
const btnCerrarMensaje = document.getElementById('btn-cerrar-mensaje');
const btnTemaAdmin = document.getElementById('btn-tema-admin');

// Sección 1: Ventas (Historial + Popup)
const seccionVentas = document.getElementById('seccion-ventas');
const buscadorVentas = document.getElementById('buscador-ventas');
const btnRefrescarVentas = document.getElementById('btn-refrescar-ventas');
const adminVentasTbody = document.getElementById('admin-ventas-tbody');
const adminVentasCardsMovil = document.getElementById('admin-ventas-cards-movil');
const modalDetalleVenta = document.getElementById('modal-detalle-venta');
const contenidoModalVenta = document.getElementById('contenido-modal-venta');
const btnCerrarModalVenta = document.getElementById('btn-cerrar-modal-venta');
const metaDetalleVenta = document.getElementById('meta-detalle-venta');
const detalleVentaTbody = document.getElementById('detalle-venta-tbody');
const totalModalVenta = document.getElementById('total-modal-venta');

// Sección 2: Catálogo (Carga Excel + Productos)
const seccionCatalogoAdmin = document.getElementById('seccion-catalogo-admin');
const divisorCatalogo = document.getElementById('divisor-catalogo');
const inputArchivo = document.getElementById('archivo-xlsx');
const btnSincronizar = document.getElementById('btn-sincronizar');
const desactivarFaltantes = document.getElementById('desactivar-faltantes');
const resumenLectura = document.getElementById('resumen-lectura');
const buscadorAdmin = document.getElementById('buscador-admin');
const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
const btnRefrescar = document.getElementById('btn-refrescar');
const adminTbody = document.getElementById('admin-productos-tbody');
const adminCardsMovil = document.getElementById('admin-productos-cards-movil');

// Pop-up detalle de producto Admin (Móvil)
const modalProductoAdmin = document.getElementById('modal-producto-admin');
const btnCerrarModalProdAdmin = document.getElementById('btn-cerrar-modal-prod-admin');
const cuerpoModalProdAdmin = document.getElementById('cuerpo-modal-prod-admin');

const formEditarProducto = document.getElementById('form-editar-producto');
const tituloFormProducto = formEditarProducto?.querySelector('h3');
const editCodigoLabel = document.getElementById('edit-codigo-label');
const editId = document.getElementById('edit-id');
const editCodigo = document.getElementById('edit-codigo');
const editCodigoInput = document.getElementById('edit-codigo-input');
const editMarca = document.getElementById('edit-marca');
const editNombre = document.getElementById('edit-nombre');
const editDescripcion = document.getElementById('edit-descripcion');
const editCategoria = document.getElementById('edit-categoria');
const editVehiculo = document.getElementById('edit-vehiculo');
const editCantidad = document.getElementById('edit-cantidad');
const editPrecioVenta = document.getElementById('edit-precio-venta');
const editPrecioCosto = document.getElementById('edit-precio-costo');
const editImagen = document.getElementById('edit-imagen');
const editActivo = document.getElementById('edit-activo');
const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');

// Sección 3: Editor de secciones del sitio
const seccionEdicionSitio = document.getElementById('seccion-edicion-sitio');
const selectorSeccion = document.getElementById('selector-seccion');
const formSeccion = document.getElementById('form-seccion');
const secTitulo = document.getElementById('sec-titulo');
const secDescripcion = document.getElementById('sec-descripcion');
const secTelefono = document.getElementById('sec-telefono');
const secEmail = document.getElementById('sec-email');
const secDireccion = document.getElementById('sec-direccion');
const secHorarios = document.getElementById('sec-horarios');

let filasPreparadas = [];
let listaProductosAdmin = [];
let listaVentasAdmin = [];
let modoOscuroActivo = false;
let haySesionActiva = false;
let menuSeccionesAbierto = false;

// =======================================================
// ESTÉTICA Y TEMA
// =======================================================
const aplicarEstilosBasicos = () => {
    document.body.classList.toggle('dark-mode', modoOscuroActivo);
    if (btnTemaAdmin) btnTemaAdmin.textContent = modoOscuroActivo ? '☀️' : '🌙';
    if (btnLogout) btnLogout.style.display = haySesionActiva ? 'inline-block' : 'none';
    if (contenedorMenuAdmin) contenedorMenuAdmin.style.display = haySesionActiva ? 'inline-block' : 'none';
    if (menuSeccionesAdmin) menuSeccionesAdmin.style.display = (haySesionActiva && menuSeccionesAbierto) ? 'flex' : 'none';
};

modoOscuroActivo = localStorage.getItem('modoOscuro') === 'activado';
aplicarEstilosBasicos();

btnTemaAdmin?.addEventListener('click', () => {
    modoOscuroActivo = !modoOscuroActivo;
    localStorage.setItem('modoOscuro', modoOscuroActivo ? 'activado' : 'desactivado');
    aplicarEstilosBasicos();
});

// =======================================================
// MENÚ HAMBURGUESA DE SECCIONES
// =======================================================
const setMenuSeccionesAbierto = (abierto) => {
    menuSeccionesAbierto = Boolean(abierto && haySesionActiva);
    btnMenuAdmin?.setAttribute('aria-expanded', String(menuSeccionesAbierto));
    aplicarEstilosBasicos();
};

btnMenuAdmin?.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenuSeccionesAbierto(!menuSeccionesAbierto);
});

document.querySelectorAll('.item-menu-seccion').forEach(item => {
    item.addEventListener('click', () => {
        const idDestino = item.dataset.destino;
        const seccionDestino = idDestino ? document.getElementById(idDestino) : null;
        setMenuSeccionesAbierto(false);
        seccionDestino?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

document.addEventListener('click', (e) => {
    if (menuSeccionesAbierto && !contenedorMenuAdmin?.contains(e.target)) {
        setMenuSeccionesAbierto(false);
    }
});

// =======================================================
// UTILIDADES GENERALES
// =======================================================
const mostrarEstado = (texto) => {
    if (!estadoMensaje || !estadoMensajeTexto) return;
    estadoMensajeTexto.textContent = texto;
    estadoMensaje.style.display = 'flex';
    estadoMensaje.style.justifyContent = 'space-between';
    estadoMensaje.style.alignItems = 'center';
    estadoMensaje.style.gap = '12px';
};

const ocultarEstado = () => {
    if (!estadoMensaje || !estadoMensajeTexto) return;
    estadoMensajeTexto.textContent = '';
    estadoMensaje.style.display = 'none';
};

btnCerrarMensaje?.addEventListener('click', ocultarEstado);

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

const limpiarNumero = (valor) => {
    if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0;
    if (!valor) return 0;
    const limpio = String(valor)
        .replace(/\$/g, '')
        .replace(/\s+/g, '')
        .replace(/\.(?=\d{3}(\D|$))/g, '')
        .replace(',', '.');
    const num = Number(limpio);
    return Number.isFinite(num) ? num : 0;
};

const normalizarClave = (clave = '') => String(clave)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const normalizarTexto = (texto = '') => String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// =======================================================
// HISTORIAL DE VENTAS, DEVOLUCIONES Y POPUP DETALLE
// =======================================================
const modalDevolucionVenta = document.getElementById('modal-devolucion-venta');
const btnCerrarModalDevolucion = document.getElementById('btn-cerrar-modal-devolucion');
const btnCancelarDevolucionModal = document.getElementById('btn-cancelar-devolucion-modal');
const metaDevolucionVenta = document.getElementById('meta-devolucion-venta');
const devolucionVentaTbody = document.getElementById('devolucion-venta-tbody');
const montoDevueltoTexto = document.getElementById('monto-devuelto-texto');
const nuevoTotalVentaTexto = document.getElementById('nuevo-total-venta-texto');
const btnDevolverTodoModal = document.getElementById('btn-devolver-todo-modal');
const btnLimpiarDevolucionModal = document.getElementById('btn-limpiar-devolucion-modal');
const btnConfirmarDevolucionModal = document.getElementById('btn-confirmar-devolucion-modal');

let ventaEnDevolucion = null;
let itemsVentaEnDevolucion = [];

const extraerFechaHoraVenta = (venta) => {
    if (venta.fecha || venta.hora) {
        return {
            fecha: venta.fecha || '-',
            hora: venta.hora ? String(venta.hora).slice(0, 8) : '-'
        };
    }
    if (venta.creado_en) {
        const d = new Date(venta.creado_en);
        if (!Number.isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            const ss = String(d.getSeconds()).padStart(2, '0');
            return {
                fecha: `${yyyy}-${mm}-${dd}`,
                hora: `${hh}:${min}:${ss}`
            };
        }
    }
    return { fecha: '-', hora: '-' };
};

const obtenerItemsDeVenta = async (venta) => {
    let items = Array.isArray(venta.items) ? venta.items.map(i => ({ ...i })) : [];
    if (items.length === 0 && venta.id != null) {
        const { data: detalleRows, error } = await clienteSupabase
            .from('venta_items')
            .select('id, producto_id, codigo, producto_nombre, cantidad, precio_unitario, subtotal')
            .eq('venta_id', venta.id);

        if (!error && Array.isArray(detalleRows) && detalleRows.length > 0) {
            items = detalleRows.map(r => ({
                detalle_id: r.id,
                producto_id: r.producto_id,
                codigo: r.codigo,
                producto_nombre: r.producto_nombre,
                cantidad: r.cantidad,
                precio: r.precio_unitario,
                subtotal: r.subtotal
            }));
        }
    }
    return items.filter(i => (Number(i.cantidad) || 0) > 0);
};

const tieneDevolucionesParciales = (venta) =>
    Array.isArray(venta.devoluciones) && venta.devoluciones.length > 0;

const renderizarListaVentasAdmin = () => {
    if (!adminVentasTbody) return;
    const palabras = normalizarTexto(buscadorVentas?.value || '')
        .split(' ')
        .filter(Boolean);

    const filtradas = listaVentasAdmin.filter(venta => {
        if (palabras.length === 0) return true;
        const { fecha, hora } = extraerFechaHoraVenta(venta);
        const usuario = venta.admin_email || venta.usuario_email || venta.email || '';
        const metodo = venta.metodo_pago || '';
        const esDevuelta = Boolean(venta.devuelta);
        const esParcial = !esDevuelta && tieneDevolucionesParciales(venta);
        const estadoTxt = esDevuelta
            ? 'devuelta devolucion'
            : esParcial
                ? 'devolucion parcial parcial activa'
                : 'completada activa';
        const totalTxt = String(venta.total ?? '');
        const texto = normalizarTexto(`${fecha} ${hora} ${usuario} ${metodo} ${estadoTxt} ${totalTxt}`);
        return palabras.every(p => texto.includes(p));
    });

    if (filtradas.length === 0) {
        adminVentasTbody.innerHTML = '<tr><td colspan="6">No hay ventas para mostrar.</td></tr>';
        if (adminVentasCardsMovil) {
            adminVentasCardsMovil.innerHTML = '<div class="estado-cards-admin">No hay ventas para mostrar.</div>';
        }
        aplicarEstilosBasicos();
        return;
    }

    // Tabla para escritorio
    adminVentasTbody.innerHTML = filtradas.map(venta => {
        const { fecha, hora } = extraerFechaHoraVenta(venta);
        const usuario = venta.admin_email || venta.usuario_email || venta.email || '-';
        const esDevuelta = Boolean(venta.devuelta);
        const esParcial = !esDevuelta && tieneDevolucionesParciales(venta);

        let badgeClass = 'badge-venta-ok';
        let badgeTexto = 'Completada';
        if (esDevuelta) {
            badgeClass = 'badge-venta-devuelta';
            badgeTexto = 'Devuelta';
        } else if (esParcial) {
            badgeClass = 'badge-venta-parcial';
            badgeTexto = 'Dev. parcial';
        }

        return `
            <tr class="fila-venta-clickable ${esDevuelta ? 'fila-venta-devuelta' : ''}" data-id="${escaparHTML(venta.id)}">
                <td>${escaparHTML(fecha)}</td>
                <td>${escaparHTML(hora)}</td>
                <td><strong>${formatearPrecio(venta.total)}</strong></td>
                <td>${escaparHTML(usuario)}</td>
                <td>
                    <span class="badge-venta ${badgeClass}">${badgeTexto}</span>
                </td>
                <td>
                    ${esDevuelta
                        ? '<button type="button" disabled>Devuelta</button>'
                        : `<button type="button" class="peligro btn-devolver-venta" data-id="${escaparHTML(venta.id)}">Devolver</button>`
                    }
                </td>
            </tr>
        `;
    }).join('');

    // Tarjetas para celulares (misma estructura que tarjetas de catálogo admin)
    if (adminVentasCardsMovil) {
        adminVentasCardsMovil.innerHTML = filtradas.map(venta => {
            const { fecha, hora } = extraerFechaHoraVenta(venta);
            const usuario = venta.admin_email || venta.usuario_email || venta.email || '-';
            const metodo = venta.metodo_pago || '-';
            const esDevuelta = Boolean(venta.devuelta);
            const esParcial = !esDevuelta && tieneDevolucionesParciales(venta);

            let badgeClass = 'badge-venta-ok';
            let badgeTexto = 'Completada';
            if (esDevuelta) {
                badgeClass = 'badge-venta-devuelta';
                badgeTexto = 'Devuelta';
            } else if (esParcial) {
                badgeClass = 'badge-venta-parcial';
                badgeTexto = 'Dev. parcial';
            }

            return `
                <article class="card-admin-venta fila-venta-clickable ${esDevuelta ? 'fila-venta-devuelta' : ''}" data-id="${escaparHTML(venta.id)}">
                    <div class="card-venta-superior">
                        <div class="card-venta-fecha-hora">
                            <div><strong>Fecha:</strong> ${escaparHTML(fecha)}</div>
                            <div><strong>Hora:</strong> ${escaparHTML(hora)}</div>
                        </div>
                        <div class="card-venta-monto-box">
                            <span class="card-venta-monto-label">Monto</span>
                            <span class="card-venta-monto-valor">${formatearPrecio(venta.total)}</span>
                        </div>
                    </div>

                    <div class="card-admin-producto">
                        <strong>Usuario:</strong> ${escaparHTML(usuario)}
                    </div>

                    <div class="card-admin-estado-precio">
                        <div><strong>Estado:</strong> <span class="badge-venta ${badgeClass}">${badgeTexto}</span></div>
                        <div><strong>Pago:</strong> ${escaparHTML(metodo)}</div>
                    </div>

                    <div class="card-venta-acciones">
                        ${esDevuelta
                            ? '<button type="button" disabled>Devuelta</button>'
                            : `<button type="button" class="peligro btn-devolver-venta" data-id="${escaparHTML(venta.id)}">Devolver</button>`
                        }
                    </div>
                </article>
            `;
        }).join('');
    }

    aplicarEstilosBasicos();
};

const cargarVentasAdmin = async () => {
    if (!adminVentasTbody) return;
    adminVentasTbody.innerHTML = '<tr><td colspan="6">Cargando ventas...</td></tr>';
    if (adminVentasCardsMovil) {
        adminVentasCardsMovil.innerHTML = '<div class="estado-cards-admin">Cargando ventas...</div>';
    }
    aplicarEstilosBasicos();

    const { data, error } = await clienteSupabase
        .from('ventas')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        adminVentasTbody.innerHTML = `<tr><td colspan="6">Error al cargar ventas: ${escaparHTML(error.message)}</td></tr>`;
        if (adminVentasCardsMovil) {
            adminVentasCardsMovil.innerHTML = `<div class="estado-cards-admin">Error al cargar ventas: ${escaparHTML(error.message)}</div>`;
        }
        aplicarEstilosBasicos();
        return;
    }

    listaVentasAdmin = data || [];
    renderizarListaVentasAdmin();
};

const recalcularTotalesModalDevolucion = () => {
    if (!devolucionVentaTbody || !ventaEnDevolucion) return 0;

    let montoDevuelto = 0;
    let totalRestante = 0;

    itemsVentaEnDevolucion.forEach((item, idx) => {
        const cantVendida = Math.max(0, Math.round(Number(item.cantidad) || 0));
        const precio = Math.max(0, Number(item.precio ?? item.precio_unitario ?? 0));
        const input = devolucionVentaTbody.querySelector(`.input-cant-devolver[data-idx="${idx}"]`);

        let cantDev = input ? Math.round(Number(input.value) || 0) : 0;
        if (cantDev < 0) cantDev = 0;
        if (cantDev > cantVendida) cantDev = cantVendida;
        if (input && Number(input.value) !== cantDev) {
            input.value = cantDev;
        }

        const cantQueda = cantVendida - cantDev;
        montoDevuelto += cantDev * precio;
        totalRestante += cantQueda * precio;
    });

    if (montoDevueltoTexto) {
        montoDevueltoTexto.textContent = `Monto a devolver: ${formatearPrecio(montoDevuelto)}`;
    }
    if (nuevoTotalVentaTexto) {
        nuevoTotalVentaTexto.textContent = `Nuevo total de la venta: ${formatearPrecio(totalRestante)}`;
    }
    if (btnConfirmarDevolucionModal) {
        btnConfirmarDevolucionModal.disabled = montoDevuelto <= 0 && !itemsVentaEnDevolucion.some((_, idx) => {
            const inp = devolucionVentaTbody.querySelector(`.input-cant-devolver[data-idx="${idx}"]`);
            return (Number(inp?.value) || 0) > 0;
        });
    }

    return montoDevuelto;
};

const cerrarModalDevolucion = () => {
    if (!modalDevolucionVenta) return;
    modalDevolucionVenta.style.display = 'none';
    ventaEnDevolucion = null;
    itemsVentaEnDevolucion = [];
};

btnCerrarModalDevolucion?.addEventListener('click', cerrarModalDevolucion);
btnCancelarDevolucionModal?.addEventListener('click', cerrarModalDevolucion);

modalDevolucionVenta?.addEventListener('click', (e) => {
    if (e.target === modalDevolucionVenta) {
        cerrarModalDevolucion();
    }
});

btnDevolverTodoModal?.addEventListener('click', () => {
    devolucionVentaTbody?.querySelectorAll('.input-cant-devolver').forEach((inp, idx) => {
        const max = Number(itemsVentaEnDevolucion[idx]?.cantidad ?? 0);
        inp.value = max;
    });
    recalcularTotalesModalDevolucion();
});

btnLimpiarDevolucionModal?.addEventListener('click', () => {
    devolucionVentaTbody?.querySelectorAll('.input-cant-devolver').forEach(inp => {
        inp.value = 0;
    });
    recalcularTotalesModalDevolucion();
});

devolucionVentaTbody?.addEventListener('input', recalcularTotalesModalDevolucion);
devolucionVentaTbody?.addEventListener('change', recalcularTotalesModalDevolucion);

const abrirModalDevolucionVenta = async (venta) => {
    if (!venta || venta.devuelta || !modalDevolucionVenta) return;

    const { data: ventaActualDb, error } = await clienteSupabase
        .from('ventas')
        .select('*')
        .eq('id', venta.id)
        .single();

    if (error) {
        mostrarEstado(`Error al consultar la venta: ${error.message}`);
        return;
    }

    Object.assign(venta, ventaActualDb);
    if (venta.devuelta) {
        renderizarListaVentasAdmin();
        mostrarEstado('Esta venta ya fue devuelta en su totalidad.');
        return;
    }

    const items = await obtenerItemsDeVenta(venta);
    if (items.length === 0) {
        mostrarEstado('La venta no tiene productos disponibles para devolver.');
        return;
    }

    ventaEnDevolucion = venta;
    itemsVentaEnDevolucion = items;

    const { fecha, hora } = extraerFechaHoraVenta(venta);
    const usuario = venta.admin_email || venta.usuario_email || venta.email || '-';

    if (metaDevolucionVenta) {
        metaDevolucionVenta.innerHTML = `
            <div><strong>Venta #${escaparHTML(venta.id)}</strong></div>
            <div><strong>Fecha/Hora:</strong> ${escaparHTML(fecha)} ${escaparHTML(hora)}</div>
            <div><strong>Usuario:</strong> ${escaparHTML(usuario)}</div>
            <div><strong>Total actual:</strong> ${formatearPrecio(venta.total)}</div>
        `;
    }

    if (devolucionVentaTbody) {
        devolucionVentaTbody.innerHTML = items.map((item, idx) => {
            const cantVendida = Math.max(1, Math.round(Number(item.cantidad) || 1));
            const precio = Math.max(0, Number(item.precio ?? item.precio_unitario ?? 0));
            const nombreProd = item.producto_nombre || item.nombre_variante || item.nombre || 'Producto';

            return `
                <tr>
                    <td><strong>${escaparHTML(item.codigo || '-')}</strong></td>
                    <td>${escaparHTML(nombreProd)}</td>
                    <td>${cantVendida}</td>
                    <td>${formatearPrecio(precio)}</td>
                    <td>
                        <input
                            type="number"
                            class="input-cant-devolver"
                            data-idx="${idx}"
                            min="0"
                            max="${cantVendida}"
                            step="1"
                            value="0"
                        >
                    </td>
                </tr>
            `;
        }).join('');
    }

    if (btnConfirmarDevolucionModal) btnConfirmarDevolucionModal.disabled = false;
    modalDevolucionVenta.style.display = 'flex';
    recalcularTotalesModalDevolucion();
    aplicarEstilosBasicos();
};

btnConfirmarDevolucionModal?.addEventListener('click', async () => {
    if (!ventaEnDevolucion || !devolucionVentaTbody) return;

    const venta = ventaEnDevolucion;
    const devueltos = [];
    const itemsRestantes = [];
    let montoDevuelto = 0;
    let nuevoTotalVenta = 0;

    itemsVentaEnDevolucion.forEach((item, idx) => {
        const cantVendida = Math.max(0, Math.round(Number(item.cantidad) || 0));
        const precio = Math.max(0, Number(item.precio ?? item.precio_unitario ?? 0));
        const input = devolucionVentaTbody.querySelector(`.input-cant-devolver[data-idx="${idx}"]`);
        let cantDev = Math.max(0, Math.min(cantVendida, Math.round(Number(input?.value) || 0)));

        if (cantDev > 0) {
            const subDev = Number((cantDev * precio).toFixed(2));
            montoDevuelto += subDev;
            devueltos.push({
                producto_id: item.producto_id ?? null,
                codigo: item.codigo || '',
                producto_nombre: item.producto_nombre || item.nombre_variante || item.nombre || 'Producto',
                cantidad_devuelta: cantDev,
                precio_unitario: precio,
                subtotal_devuelto: subDev
            });
        }

        const cantQueda = cantVendida - cantDev;
        if (cantQueda > 0) {
            const subQueda = Number((cantQueda * precio).toFixed(2));
            nuevoTotalVenta += subQueda;
            itemsRestantes.push({
                ...item,
                cantidad: cantQueda,
                precio,
                subtotal: subQueda
            });
        }
    });

    montoDevuelto = Number(montoDevuelto.toFixed(2));
    nuevoTotalVenta = Number(nuevoTotalVenta.toFixed(2));

    if (devueltos.length === 0) {
        mostrarEstado('Seleccioná al menos 1 unidad en algún producto para confirmar la devolución.');
        return;
    }

    if (btnConfirmarDevolucionModal) btnConfirmarDevolucionModal.disabled = true;
    mostrarEstado('Registrando devolución y actualizando stock y venta...');

    try {
        const ahoraIso = new Date().toISOString();
        const devolucionCompleta = itemsRestantes.length === 0;
        const historialPrevio = Array.isArray(venta.devoluciones) ? venta.devoluciones : [];
        const nuevoHistorialDev = [
            ...historialPrevio,
            {
                fecha_hora: ahoraIso,
                monto_devuelto: montoDevuelto,
                items: devueltos
            }
        ];

        for (const dev of devueltos) {
            let productoDb = null;

            if (dev.producto_id != null) {
                const { data } = await clienteSupabase
                    .from('productos')
                    .select('id, cantidad')
                    .eq('id', dev.producto_id)
                    .maybeSingle();
                productoDb = data;
            }

            if (!productoDb && dev.codigo) {
                const { data } = await clienteSupabase
                    .from('productos')
                    .select('id, cantidad')
                    .eq('codigo', String(dev.codigo).trim())
                    .maybeSingle();
                productoDb = data;
            }

            if (productoDb) {
                const stockActual = Number(productoDb.cantidad ?? 0);
                const nuevoStock = stockActual + dev.cantidad_devuelta;

                const { error: errorStock } = await clienteSupabase
                    .from('productos')
                    .update({ cantidad: nuevoStock, actualizado_en: ahoraIso })
                    .eq('id', productoDb.id);

                if (errorStock) throw errorStock;
            }
        }

        const { data: ventaActualizada, error: errorVenta } = await clienteSupabase
            .from('ventas')
            .update({
                items: itemsRestantes,
                total: nuevoTotalVenta,
                devuelta: devolucionCompleta,
                devuelta_en: devolucionCompleta ? ahoraIso : (venta.devuelta_en || null),
                devoluciones: nuevoHistorialDev
            })
            .eq('id', venta.id)
            .select('*')
            .single();

        if (errorVenta) throw errorVenta;

        const { data: filasDetalle } = await clienteSupabase
            .from('venta_items')
            .select('id, producto_id, codigo, cantidad, precio_unitario')
            .eq('venta_id', venta.id);

        if (Array.isArray(filasDetalle) && filasDetalle.length > 0) {
            for (const filaDet of filasDetalle) {
                const matchDev = devueltos.find(d =>
                    (filaDet.producto_id != null && String(d.producto_id) === String(filaDet.producto_id)) ||
                    (filaDet.codigo && String(d.codigo).trim() === String(filaDet.codigo).trim())
                );
                if (!matchDev) continue;

                const cantActualDet = Math.max(0, Math.round(Number(filaDet.cantidad) || 0));
                const cantRestanteDet = cantActualDet - matchDev.cantidad_devuelta;

                if (cantRestanteDet <= 0) {
                    await clienteSupabase.from('venta_items').delete().eq('id', filaDet.id);
                } else {
                    const precioUnit = Number(filaDet.precio_unitario ?? matchDev.precio_unitario ?? 0);
                    await clienteSupabase
                        .from('venta_items')
                        .update({
                            cantidad: cantRestanteDet,
                            subtotal: Number((cantRestanteDet * precioUnit).toFixed(2))
                        })
                        .eq('id', filaDet.id);
                }
            }
        }

        Object.assign(venta, ventaActualizada || {
            items: itemsRestantes,
            total: nuevoTotalVenta,
            devuelta: devolucionCompleta,
            devoluciones: nuevoHistorialDev
        });

        cerrarModalDevolucion();
        renderizarListaVentasAdmin();
        await cargarProductosAdmin();

        mostrarEstado(
            devolucionCompleta
                ? `Devolución total registrada (${formatearPrecio(montoDevuelto)}). Stock repuesto y venta marcada como Devuelta.`
                : `Devolución parcial registrada (${formatearPrecio(montoDevuelto)}). La venta quedó con total ${formatearPrecio(nuevoTotalVenta)}.`
        );
    } catch (error) {
        mostrarEstado(`Error al procesar la devolución: ${error.message || error}`);
        if (btnConfirmarDevolucionModal) btnConfirmarDevolucionModal.disabled = false;
    }
});

const cerrarPopupVenta = () => {
    if (!modalDetalleVenta) return;
    modalDetalleVenta.style.display = 'none';
};

btnCerrarModalVenta?.addEventListener('click', cerrarPopupVenta);

modalDetalleVenta?.addEventListener('click', (e) => {
    if (e.target === modalDetalleVenta) {
        cerrarPopupVenta();
    }
});

const abrirPopupVenta = async (venta) => {
    if (!venta || !modalDetalleVenta) return;

    const { fecha, hora } = extraerFechaHoraVenta(venta);
    const usuario = venta.admin_email || venta.usuario_email || venta.email || '-';
    const metodo = venta.metodo_pago || '-';
    const estadoTxt = venta.devuelta
        ? 'Devuelta'
        : tieneDevolucionesParciales(venta)
            ? 'Con devolución parcial'
            : 'Completada';

    if (metaDetalleVenta) {
        metaDetalleVenta.innerHTML = `
            <div><strong>Fecha:</strong> ${escaparHTML(fecha)}</div>
            <div><strong>Hora:</strong> ${escaparHTML(hora)}</div>
            <div><strong>Usuario:</strong> ${escaparHTML(usuario)}</div>
            <div><strong>Método de pago:</strong> ${escaparHTML(metodo)}</div>
            <div><strong>Estado:</strong> ${escaparHTML(estadoTxt)}</div>
        `;
    }

    const items = await obtenerItemsDeVenta(venta);

    if (detalleVentaTbody) {
        if (items.length === 0) {
            detalleVentaTbody.innerHTML = '<tr><td colspan="5">Sin productos activos en esta venta.</td></tr>';
        } else {
            detalleVentaTbody.innerHTML = items.map(item => {
                const cant = Number(item.cantidad ?? 0);
                const precio = Number(item.precio ?? item.precio_unitario ?? 0);
                const subtotal = Number(item.subtotal ?? (cant * precio));
                const nombreProd = item.producto_nombre || item.nombre_variante || item.nombre || 'Producto';
                return `
                    <tr>
                        <td><strong>${escaparHTML(item.codigo || '-')}</strong></td>
                        <td>${escaparHTML(nombreProd)}</td>
                        <td>${cant}</td>
                        <td>${formatearPrecio(precio)}</td>
                        <td><strong>${formatearPrecio(subtotal)}</strong></td>
                    </tr>
                `;
            }).join('');
        }
    }

    if (totalModalVenta) {
        totalModalVenta.textContent = `Total actual de la venta: ${formatearPrecio(venta.total)}`;
    }

    modalDetalleVenta.style.display = 'flex';
    aplicarEstilosBasicos();
};

const manejarClickVentasAdmin = async (e) => {
    const btnDevolver = e.target.closest('.btn-devolver-venta');
    if (btnDevolver) {
        e.stopPropagation();
        const ventaEncontrada = listaVentasAdmin.find(v => String(v.id) === String(btnDevolver.dataset.id));
        if (ventaEncontrada) {
            await abrirModalDevolucionVenta(ventaEncontrada);
        }
        return;
    }

    const fila = e.target.closest('.fila-venta-clickable');
    if (!fila) return;
    const ventaEncontrada = listaVentasAdmin.find(v => String(v.id) === String(fila.dataset.id));
    if (ventaEncontrada) {
        await abrirPopupVenta(ventaEncontrada);
    }
};

adminVentasTbody?.addEventListener('click', manejarClickVentasAdmin);
adminVentasCardsMovil?.addEventListener('click', manejarClickVentasAdmin);

buscadorVentas?.addEventListener('input', renderizarListaVentasAdmin);
btnRefrescarVentas?.addEventListener('click', cargarVentasAdmin);

// =======================================================
// POPUP DETALLE DE PRODUCTO EN ADMIN (MÓVIL)
// =======================================================
const cerrarModalProductoAdmin = () => {
    if (!modalProductoAdmin) return;
    modalProductoAdmin.style.display = 'none';
};

btnCerrarModalProdAdmin?.addEventListener('click', cerrarModalProductoAdmin);
modalProductoAdmin?.addEventListener('click', (e) => {
    if (e.target === modalProductoAdmin) {
        cerrarModalProductoAdmin();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modalProductoAdmin && modalProductoAdmin.style.display !== 'none') {
            cerrarModalProductoAdmin();
        } else if (modalDevolucionVenta && modalDevolucionVenta.style.display !== 'none') {
            cerrarModalDevolucion();
        } else if (modalDetalleVenta && modalDetalleVenta.style.display !== 'none') {
            cerrarPopupVenta();
        }
    }
});

const eliminarProductoPorId = async (idProducto, codigoProducto, botonTrigger = null) => {
    const confirmado = confirm(`¿Seguro que querés eliminar el producto con código "${codigoProducto}"?`);
    if (!confirmado) return;

    if (botonTrigger) {
        botonTrigger.disabled = true;
    }
    aplicarEstilosBasicos();
    mostrarEstado(`Eliminando producto "${codigoProducto}"...`);

    try {
        const { error } = await clienteSupabase
            .from('productos')
            .delete()
            .eq('id', idProducto);

        if (error) throw error;

        listaProductosAdmin = listaProductosAdmin.filter(p => String(p.id) !== String(idProducto));
        renderizarListaAdmin();
        if (String(editId?.value) === String(idProducto)) {
            cerrarEditorProducto();
        }
        cerrarModalProductoAdmin();
        mostrarEstado(`Producto "${codigoProducto}" eliminado correctamente.`);
    } catch (error) {
        mostrarEstado(`Error al eliminar "${codigoProducto}": ${error.message || error}`);
        if (botonTrigger) {
            botonTrigger.disabled = false;
        }
        aplicarEstilosBasicos();
    }
};

const abrirModalProductoAdmin = (prod) => {
    if (!prod || !modalProductoAdmin || !cuerpoModalProdAdmin) return;

    const srcImg = prod.imagen ? escaparHTML(prod.imagen) : 'Lubrimec-Logo-Fondo-Transparente.png';
    const estadoTxt = prod.activo ? 'Activo' : 'Inactivo';

    cuerpoModalProdAdmin.innerHTML = `
        <div class="modal-admin-top">
            <div class="modal-admin-img">
                <img src="${srcImg}" alt="${escaparHTML(prod.nombre_variante || 'Producto')}">
            </div>
            <div class="modal-admin-top-info">
                <div><strong>Código:</strong> ${escaparHTML(prod.codigo || '-')}</div>
                <div><strong>Stock:</strong> ${Number(prod.cantidad ?? 0)}</div>
            </div>
        </div>

        <div class="modal-admin-dato">
            <strong>Producto:</strong> ${escaparHTML(prod.nombre_variante || 'Sin nombre')}
        </div>

        <div class="modal-admin-extra">
            <div><strong>Marca:</strong> ${escaparHTML(prod.marca || '-')}</div>
            <div><strong>Descripción:</strong> ${escaparHTML(prod.descripcion || 'Sin descripción')}</div>
        </div>

        <div class="modal-admin-estado-precio">
            <div><strong>Estado:</strong> ${estadoTxt}</div>
            <div><strong>Precio:</strong> ${formatearPrecio(prod.precio_venta)}</div>
        </div>

        <div class="modal-admin-acciones">
            <button type="button" id="btn-modal-admin-editar">Editar</button>
            <button type="button" class="peligro" id="btn-modal-admin-eliminar">Eliminar</button>
        </div>
    `;

    const btnModalEditar = document.getElementById('btn-modal-admin-editar');
    const btnModalEliminar = document.getElementById('btn-modal-admin-eliminar');

    btnModalEditar?.addEventListener('click', () => {
        cerrarModalProductoAdmin();
        abrirEditorProducto(prod);
    });

    btnModalEliminar?.addEventListener('click', () => {
        eliminarProductoPorId(prod.id, prod.codigo || prod.id, btnModalEliminar);
    });

    modalProductoAdmin.style.display = 'flex';
    aplicarEstilosBasicos();
};

// =======================================================
// MAPEO DE FILA EXCEL -> COLUMNA SUPABASE
// =======================================================
const mapearFila = (filaRaw) => {
    const fila = {};
    Object.entries(filaRaw).forEach(([k, v]) => {
        fila[normalizarClave(k)] = v;
    });

    const codigo = String(fila.codigo ?? '').trim();
    const nombreVariante = String(fila.nombre_de_la_variante ?? fila.nombre_variante ?? '').trim();
    const categoria = String(fila.categoria ?? '').trim();

    if (!codigo && !nombreVariante && !categoria) return null;
    if (!codigo) return null;

    return {
        codigo,
        marca: String(fila.marca ?? '').trim() || null,
        nombre_variante: nombreVariante || 'Sin nombre',
        descripcion: String(fila.descripcion ?? '').trim() || null,
        categoria: categoria || 'General',
        vehiculo: String(fila.veiculo ?? fila.vehiculo ?? '').trim() || null,
        cantidad: Math.max(0, Math.round(limpiarNumero(fila.cantidad ?? fila.stock ?? 0))),
        precio_venta: limpiarNumero(fila.precio_de_venta ?? fila.precio_venta ?? 0),
        precio_costo: limpiarNumero(fila.precio_de_costo ?? fila.precio_costo ?? 0),
        imagen: String(fila.imagen ?? '').trim() || null,
        activo: true,
        actualizado_en: new Date().toISOString()
    };
};

// =======================================================
// LISTADO Y CARGA DE PRODUCTOS EN ADMIN
// =======================================================
const renderizarListaAdmin = () => {
    if (!adminTbody) return;
    const palabras = normalizarTexto(buscadorAdmin?.value || '')
        .split(' ')
        .filter(Boolean);

    const filtrados = listaProductosAdmin.filter(prod => {
        if (palabras.length === 0) return true;
        const texto = normalizarTexto(
            `${prod.codigo || ''} ${prod.marca || ''} ${prod.nombre_variante || ''} ${prod.descripcion || ''} ${prod.categoria || ''} ${prod.vehiculo || ''}`
        );
        return palabras.every(p => texto.includes(p));
    });

    if (filtrados.length === 0) {
        adminTbody.innerHTML = '<tr><td colspan="9">No hay productos para mostrar.</td></tr>';
        if (adminCardsMovil) {
            adminCardsMovil.innerHTML = '<div class="estado-cards-admin">No hay productos para mostrar.</div>';
        }
        aplicarEstilosBasicos();
        return;
    }

    // Tabla para escritorio
    adminTbody.innerHTML = filtrados.map(prod => `
        <tr>
            <td><strong>${escaparHTML(prod.codigo || '-')}</strong></td>
            <td>${escaparHTML(prod.marca || '-')}</td>
            <td>${escaparHTML(prod.nombre_variante || 'Sin nombre')}</td>
            <td>${escaparHTML(prod.categoria || '-')}</td>
            <td>${escaparHTML(prod.vehiculo || '-')}</td>
            <td>${Number(prod.cantidad ?? 0)}</td>
            <td>${formatearPrecio(prod.precio_venta)}</td>
            <td>${prod.activo ? 'Activo' : 'Inactivo'}</td>
            <td>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button type="button" class="btn-editar-prod" data-id="${prod.id}">
                        Editar
                    </button>
                    <button type="button" class="peligro btn-eliminar-prod" data-id="${prod.id}" data-codigo="${escaparHTML(prod.codigo || '')}">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Tarjetas para celulares
    if (adminCardsMovil) {
        adminCardsMovil.innerHTML = filtrados.map(prod => {
            const srcImg = prod.imagen ? escaparHTML(prod.imagen) : 'Lubrimec-Logo-Fondo-Transparente.png';
            const estadoTxt = prod.activo ? 'Activo' : 'Inactivo';
            return `
                <article class="card-admin-prod" data-id="${prod.id}">
                    <div class="card-admin-superior">
                        <div class="card-admin-img">
                            <img src="${srcImg}" alt="${escaparHTML(prod.nombre_variante || 'Producto')}" loading="lazy">
                        </div>
                        <div class="card-admin-top-datos">
                            <div><strong>Código:</strong> ${escaparHTML(prod.codigo || '-')}</div>
                            <div><strong>Stock:</strong> ${Number(prod.cantidad ?? 0)}</div>
                        </div>
                    </div>

                    <div class="card-admin-producto">
                        <strong>Producto:</strong> ${escaparHTML(prod.nombre_variante || 'Sin nombre')}
                    </div>

                    <div class="card-admin-estado-precio">
                        <div><strong>Estado:</strong> ${estadoTxt}</div>
                        <div><strong>Precio:</strong> ${formatearPrecio(prod.precio_venta)}</div>
                    </div>

                    <div class="card-admin-acciones">
                        <button type="button" class="btn-editar-prod" data-id="${prod.id}">
                            Editar
                        </button>
                        <button type="button" class="peligro btn-eliminar-prod" data-id="${prod.id}" data-codigo="${escaparHTML(prod.codigo || '')}">
                            Eliminar
                        </button>
                    </div>
                </article>
            `;
        }).join('');
    }

    aplicarEstilosBasicos();
};

const cargarProductosAdmin = async () => {
    if (!adminTbody) return;
    adminTbody.innerHTML = '<tr><td colspan="9">Cargando productos...</td></tr>';
    if (adminCardsMovil) {
        adminCardsMovil.innerHTML = '<div class="estado-cards-admin">Cargando productos...</div>';
    }
    aplicarEstilosBasicos();

    const { data, error } = await clienteSupabase
        .from('productos')
        .select('id, codigo, marca, nombre_variante, descripcion, categoria, vehiculo, cantidad, precio_venta, precio_costo, imagen, activo')
        .order('codigo', { ascending: true });

    if (error) {
        adminTbody.innerHTML = `<tr><td colspan="9">Error al cargar productos: ${escaparHTML(error.message)}</td></tr>`;
        if (adminCardsMovil) {
            adminCardsMovil.innerHTML = `<div class="estado-cards-admin">Error al cargar productos: ${escaparHTML(error.message)}</div>`;
        }
        aplicarEstilosBasicos();
        return;
    }

    listaProductosAdmin = data || [];
    renderizarListaAdmin();
};

// =======================================================
// ALTA Y EDICIÓN INDIVIDUAL DE PRODUCTO
// =======================================================
const abrirFormularioNuevoProducto = () => {
    if (!formEditarProducto) return;
    formEditarProducto.reset();
    if (editId) editId.value = '';
    if (editCodigo) editCodigo.value = '';
    if (editCodigoLabel) editCodigoLabel.textContent = 'Nuevo';
    if (tituloFormProducto) {
        tituloFormProducto.textContent = 'Agregar nuevo producto al catálogo';
    }
    if (editCodigoInput) {
        editCodigoInput.value = '';
        editCodigoInput.disabled = false;
    }
    if (editMarca) editMarca.value = '';
    editCantidad.value = 0;
    editPrecioVenta.value = 0;
    editPrecioCosto.value = 0;
    editActivo.checked = true;

    formEditarProducto.style.display = 'block';
    aplicarEstilosBasicos();
    formEditarProducto.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    editCodigoInput?.focus();
};

const abrirEditorProducto = (prod) => {
    if (!prod || !formEditarProducto) return;
    if (editId) editId.value = prod.id;
    if (editCodigo) editCodigo.value = prod.codigo || '';
    if (editCodigoLabel) editCodigoLabel.textContent = prod.codigo || prod.id;
    if (tituloFormProducto) {
        tituloFormProducto.innerHTML = `Editando producto: <span id="edit-codigo-label">${escaparHTML(prod.codigo || prod.id)}</span>`;
    }
    if (editCodigoInput) {
        editCodigoInput.value = prod.codigo || '';
        editCodigoInput.disabled = true;
    }
    if (editMarca) editMarca.value = prod.marca || '';
    editNombre.value = prod.nombre_variante || '';
    editDescripcion.value = prod.descripcion || '';
    editCategoria.value = prod.categoria || '';
    editVehiculo.value = prod.vehiculo || '';
    editCantidad.value = Number(prod.cantidad ?? 0);
    editPrecioVenta.value = Number(prod.precio_venta ?? 0);
    editPrecioCosto.value = Number(prod.precio_costo ?? 0);
    editImagen.value = prod.imagen || '';
    editActivo.checked = Boolean(prod.activo);

    formEditarProducto.style.display = 'block';
    aplicarEstilosBasicos();
    formEditarProducto.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

const cerrarEditorProducto = () => {
    if (formEditarProducto) {
        formEditarProducto.style.display = 'none';
        formEditarProducto.reset();
    }
    if (editId) editId.value = '';
    if (editCodigo) editCodigo.value = '';
    if (editCodigoInput) editCodigoInput.disabled = false;
};

btnNuevoProducto?.addEventListener('click', abrirFormularioNuevoProducto);
btnCancelarEdicion?.addEventListener('click', cerrarEditorProducto);

formEditarProducto?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idProd = editId?.value || '';
    const codProd = (editCodigoInput ? editCodigoInput.value : editCodigo?.value || '').trim();

    if (!codProd) {
        mostrarEstado('El código del producto es obligatorio.');
        return;
    }

    const cambios = {
        codigo: codProd,
        marca: (editMarca?.value || '').trim() || null,
        nombre_variante: editNombre.value.trim() || 'Sin nombre',
        descripcion: editDescripcion.value.trim() || null,
        categoria: editCategoria.value.trim() || 'General',
        vehiculo: editVehiculo.value.trim() || null,
        cantidad: Math.max(0, Math.round(Number(editCantidad.value) || 0)),
        precio_venta: Math.max(0, Number(editPrecioVenta.value) || 0),
        precio_costo: Math.max(0, Number(editPrecioCosto.value) || 0),
        imagen: editImagen.value.trim() || null,
        activo: editActivo.checked,
        actualizado_en: new Date().toISOString()
    };

    if (!idProd) {
        const codigoDuplicado = listaProductosAdmin.some(
            p => String(p.codigo || '').trim().toLowerCase() === codProd.toLowerCase()
        );
        if (codigoDuplicado) {
            mostrarEstado(`Ya existe un producto con el código "${codProd}". Usá otro código o editalo desde la lista.`);
            return;
        }

        mostrarEstado(`Agregando producto "${codProd}"...`);

        const { data, error } = await clienteSupabase
            .from('productos')
            .insert(cambios)
            .select('id, codigo, marca, nombre_variante, descripcion, categoria, vehiculo, cantidad, precio_venta, precio_costo, imagen, activo')
            .single();

        if (error) {
            mostrarEstado(`Error al agregar "${codProd}": ${error.message}`);
            return;
        }

        listaProductosAdmin.push(data);
        listaProductosAdmin.sort((a, b) => String(a.codigo || '').localeCompare(String(b.codigo || '')));
        renderizarListaAdmin();
        cerrarEditorProducto();
        mostrarEstado(`¡Producto "${codProd}" agregado correctamente!`);
        return;
    }

    mostrarEstado(`Guardando cambios en "${codProd}"...`);

    const { error } = await clienteSupabase
        .from('productos')
        .update(cambios)
        .eq('id', idProd);

    if (error) {
        mostrarEstado(`Error al guardar cambios en "${codProd}": ${error.message}`);
        return;
    }

    listaProductosAdmin = listaProductosAdmin.map(item =>
        String(item.id) === String(idProd) ? { ...item, ...cambios } : item
    );

    renderizarListaAdmin();
    cerrarEditorProducto();
    mostrarEstado(`¡Producto "${codProd}" actualizado correctamente!`);
});

// =======================================================
// CARGA Y GUARDADO DE SECCIONES DEL SITIO
// =======================================================
const cargarDatosSeccionAdmin = async (clave) => {
    if (!selectorSeccion) return;

    const { data, error } = await clienteSupabase
        .from('contenido_sitio')
        .select('*')
        .eq('clave', clave)
        .maybeSingle();

    if (error) {
        mostrarEstado(`Error al cargar la sección "${clave}": ${error.message}`);
        return;
    }

    secTitulo.value = data?.titulo || '';
    secDescripcion.value = data?.descripcion || '';
    secTelefono.value = data?.telefono || '';
    secEmail.value = data?.email || '';
    secDireccion.value = data?.direccion || '';
    secHorarios.value = data?.horarios || '';
};

// =======================================================
// CONTROL DE SESIÓN (LOGIN / LOGOUT)
// =======================================================
const actualizarVistaSesion = (sesion) => {
    haySesionActiva = Boolean(sesion?.user);
    if (!haySesionActiva) {
        menuSeccionesAbierto = false;
        cerrarPopupVenta();
        cerrarModalProductoAdmin();
    }

    if (haySesionActiva) {
        vistaLogin.style.display = 'none';
        vistaPanel.style.display = 'block';
        usuarioCorreo.textContent = sesion.user.email;
        aplicarEstilosBasicos();
        cargarVentasAdmin();
        cargarProductosAdmin();
        if (selectorSeccion) {
            cargarDatosSeccionAdmin(selectorSeccion.value);
        }
    } else {
        vistaPanel.style.display = 'none';
        vistaLogin.style.display = 'block';
        usuarioCorreo.textContent = '';
        listaProductosAdmin = [];
        listaVentasAdmin = [];
        cerrarEditorProducto();
        aplicarEstilosBasicos();
    }
};

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    mostrarEstado('Iniciando sesión...');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const { data, error } = await clienteSupabase.auth.signInWithPassword({ email, password });
    if (error) {
        mostrarEstado(`Error al iniciar sesión: ${error.message}`);
        return;
    }
    actualizarVistaSesion(data.session);
    mostrarEstado('Sesión iniciada correctamente.');
});

btnLogout.addEventListener('click', async () => {
    await clienteSupabase.auth.signOut();
    filasPreparadas = [];
    btnSincronizar.disabled = true;
    resumenLectura.textContent = '';
    actualizarVistaSesion(null);
    aplicarEstilosBasicos();
    mostrarEstado('Sesión cerrada.');
});

// =======================================================
// LECTURA Y SINCRONIZACIÓN DEL EXCEL (.XLSX)
// =======================================================
inputArchivo.addEventListener('change', async (e) => {
    const archivo = e.target.files?.[0];
    filasPreparadas = [];
    btnSincronizar.disabled = true;
    resumenLectura.textContent = '';

    if (!archivo) {
        aplicarEstilosBasicos();
        return;
    }

    try {
        const buffer = await archivo.arrayBuffer();
        const libro = XLSX.read(buffer, { type: 'array' });
        const primeraHoja = libro.SheetNames[0];
        const hoja = libro.Sheets[primeraHoja];
        const filasJson = XLSX.utils.sheet_to_json(hoja, { defval: '' });

        filasPreparadas = filasJson.map(mapearFila).filter(Boolean);

        if (filasPreparadas.length === 0) {
            resumenLectura.textContent = 'No se encontraron filas válidas con "Código" en la primera hoja.';
            aplicarEstilosBasicos();
            return;
        }

        resumenLectura.textContent = `Hoja "${primeraHoja}": ${filasPreparadas.length} fila(s) válida(s) lista(s) para sincronizar.`;
        btnSincronizar.disabled = false;
        aplicarEstilosBasicos();
    } catch (error) {
        filasPreparadas = [];
        btnSincronizar.disabled = true;
        resumenLectura.textContent = `Error al leer el archivo: ${error.message || error}`;
        aplicarEstilosBasicos();
    }
});

btnSincronizar.addEventListener('click', async () => {
    if (!haySesionActiva) {
        mostrarEstado('Iniciá sesión para sincronizar el catálogo.');
        return;
    }

    if (filasPreparadas.length === 0) {
        mostrarEstado('No hay filas válidas para sincronizar.');
        return;
    }

    btnSincronizar.disabled = true;
    mostrarEstado(`Sincronizando ${filasPreparadas.length} producto(s)...`);

    try {
        const mapaPorCodigo = new Map();
        filasPreparadas.forEach(item => {
            mapaPorCodigo.set(item.codigo, item);
        });
        const filasUnicas = Array.from(mapaPorCodigo.values());

        const { error } = await clienteSupabase
            .from('productos')
            .upsert(filasUnicas, { onConflict: 'codigo' });

        if (error) throw error;

        if (desactivarFaltantes?.checked) {
            const codigosExcel = new Set(
                filasUnicas.map(fila => String(fila.codigo).trim().toLowerCase())
            );

            const { data: productosExistentes, error: errorCarga } = await clienteSupabase
                .from('productos')
                .select('codigo')
                .eq('activo', true);

            if (errorCarga) throw errorCarga;

            const codigosFaltantes = (productosExistentes || [])
                .map(prod => String(prod.codigo || '').trim())
                .filter(codigo => codigo && !codigosExcel.has(codigo.toLowerCase()));

            if (codigosFaltantes.length > 0) {
                const { error: errorDesactivar } = await clienteSupabase
                    .from('productos')
                    .update({ activo: false, actualizado_en: new Date().toISOString() })
                    .in('codigo', codigosFaltantes);

                if (errorDesactivar) throw errorDesactivar;
            }
        }

        await cargarProductosAdmin();
        resumenLectura.textContent = `Sincronización completada: ${filasUnicas.length} producto(s) procesado(s).`;
        mostrarEstado('Catálogo sincronizado correctamente.');
        filasPreparadas = [];
        aplicarEstilosBasicos();
    } catch (error) {
        mostrarEstado(`Error al sincronizar: ${error.message || error}`);
        btnSincronizar.disabled = false;
        aplicarEstilosBasicos();
    }
});

// =======================================================
// ACCIONES DE EDICIÓN, ELIMINACIÓN Y POPUP EN TABLA Y TARJETAS
// =======================================================
const manejarClickProductosAdmin = async (e) => {
    const btnEditar = e.target.closest('.btn-editar-prod');
    if (btnEditar) {
        e.stopPropagation();
        const productoEncontrado = listaProductosAdmin.find(p => String(p.id) === String(btnEditar.dataset.id));
        abrirEditorProducto(productoEncontrado);
        return;
    }

    const botonEliminar = e.target.closest('.btn-eliminar-prod');
    if (botonEliminar) {
        e.stopPropagation();
        const idProducto = botonEliminar.dataset.id;
        const codigoProducto = botonEliminar.dataset.codigo || idProducto;
        await eliminarProductoPorId(idProducto, codigoProducto, botonEliminar);
        return;
    }

    const card = e.target.closest('.card-admin-prod');
    if (card) {
        const productoEncontrado = listaProductosAdmin.find(p => String(p.id) === String(card.dataset.id));
        if (productoEncontrado) {
            abrirModalProductoAdmin(productoEncontrado);
        }
    }
};

adminTbody?.addEventListener('click', manejarClickProductosAdmin);
adminCardsMovil?.addEventListener('click', manejarClickProductosAdmin);

buscadorAdmin?.addEventListener('input', renderizarListaAdmin);
btnRefrescar?.addEventListener('click', cargarProductosAdmin);

// =======================================================
// EVENTOS DEL EDITOR DE SECCIONES
// =======================================================
selectorSeccion?.addEventListener('change', (e) => {
    cargarDatosSeccionAdmin(e.target.value);
});

formSeccion?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const clave = selectorSeccion.value;
    mostrarEstado(`Guardando cambios en "${clave}"...`);

    const payload = {
        clave,
        titulo: secTitulo.value.trim(),
        descripcion: secDescripcion.value.trim(),
        telefono: secTelefono.value.trim(),
        email: secEmail.value.trim(),
        direccion: secDireccion.value.trim(),
        horarios: secHorarios.value.trim(),
        actualizado_en: new Date().toISOString()
    };

    const { error } = await clienteSupabase
        .from('contenido_sitio')
        .upsert(payload, { onConflict: 'clave' });

    if (error) {
        mostrarEstado(`Error al guardar la sección: ${error.message}`);
        return;
    }

    mostrarEstado(`¡Sección "${clave}" actualizada correctamente!`);
});

// =======================================================
// INICIALIZACIÓN DE SESIÓN
// =======================================================
clienteSupabase.auth.getSession().then(({ data }) => actualizarVistaSesion(data.session));
clienteSupabase.auth.onAuthStateChange((_event, session) => actualizarVistaSesion(session));