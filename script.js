document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const links = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.seccion');

    // Abrir y cerrar menú en dispositivos móviles
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Cerrar menú móvil al hacer clic en un enlace
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Resaltar el enlace activo según la sección visible al hacer scroll
    const actualizarEnlaceActivo = () => {
        if (document.body.classList.contains('vista-contacto')) {
            let current = 'contacto';
            const ubicacion = document.getElementById('ubicacion');

            if (ubicacion && window.scrollY >= ubicacion.offsetTop - 120) {
                current = 'ubicacion';
            }

            links.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
            });
            return;
        }

        let current = '';
        sections.forEach(section => {
            if (section.offsetParent === null) return;
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    };

    window.addEventListener('scroll', actualizarEnlaceActivo);
    actualizarEnlaceActivo();

    // Modo oscuro
    const themeToggle = document.getElementById('theme-toggle');

    const aplicarModoOscuro = (activado) => {
        document.body.classList.toggle('dark-mode', activado);
        themeToggle.textContent = activado ? '☀️' : '🌙';
        localStorage.setItem('modoOscuro', activado ? 'activado' : 'desactivado');
    };

    const guardado = localStorage.getItem('modoOscuro');
    if (guardado === 'activado') {
        aplicarModoOscuro(true);
    }

    themeToggle.addEventListener('click', () => {
        const esOscuro = document.body.classList.contains('dark-mode');
        aplicarModoOscuro(!esOscuro);
    });

    // Alternar entre vista principal (Inicio, Catálogo, Ubicación) y vista Contacto (Contacto, Ubicación)
    const navYLogo = document.querySelectorAll('.nav-links a, .logo-container a');

    navYLogo.forEach(link => {
        link.addEventListener('click', (e) => {
            const destino = link.getAttribute('href');

            if (destino === '#contacto') {
                e.preventDefault();
                document.body.classList.add('vista-contacto');
                actualizarEnlaceActivo();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (document.body.classList.contains('vista-contacto')) {
                document.body.classList.remove('vista-contacto');
                actualizarEnlaceActivo();
                if (destino === '#ubicacion') {
                    e.preventDefault();
                    setTimeout(() => {
                        document.getElementById('ubicacion').scrollIntoView({ behavior: 'smooth' });
                        actualizarEnlaceActivo();
                    }, 50);
                }
            }
        });
    });

    // Cargar, filtrar y paginar catálogo desde Supabase
    const SUPABASE_URL = 'https://mjvqjbfqcyajppsttdrg.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_GX-biMYHvxoyVCmzJrdBIw_Mx45BB6W';
    const PRODUCTOS_POR_PAGINA = 10;

    const tbodyCatalogo = document.getElementById('catalogo-tbody');
    const cardsCatalogoMovil = document.getElementById('catalogo-cards-movil');
    const buscadorCatalogo = document.getElementById('buscador-catalogo');
    const filtroCategoria = document.getElementById('filtro-categoria');
    const paginacionCatalogo = document.getElementById('paginacion-catalogo');
    const modalProductoPublico = document.getElementById('modal-producto-publico');
    const modalProductoCuerpo = document.getElementById('modal-producto-cuerpo');
    const btnCerrarModalProd = document.getElementById('btn-cerrar-modal-prod');
    const TELEFONO_LUBRIMEC = '5493795168999';

    let productosCatalogo = [];
    let paginaActual = 1;

    const escaparHTML = (texto = '') => String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const normalizarTexto = (texto = '') => String(texto)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[.,/]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const construirUrlWhatsApp = (prod) => {
        const mensajeProd = `Hola Lubrimec, quisiera consultar por el producto: ${prod.nombre_variante || ''} (Marca: ${prod.marca || 'N/A'}, Código: ${prod.codigo || 'N/A'}).`;
        return `https://wa.me/${TELEFONO_LUBRIMEC}?text=${encodeURIComponent(mensajeProd)}`;
    };

    const abrirModalProductoPublico = (prod) => {
        if (!prod || !modalProductoPublico || !modalProductoCuerpo) return;

        const stockNum = Number(prod.cantidad ?? 0);
        const sinStock = stockNum <= 0;
        const urlWa = construirUrlWhatsApp(prod);
        const srcImg = prod.imagen ? escaparHTML(prod.imagen) : 'Lubrimec-Logo-Fondo-Transparente.png';

        modalProductoCuerpo.innerHTML = `
            <div class="modal-prod-foto-wrap">
                <div class="modal-prod-foto">
                    <img src="${srcImg}" alt="${escaparHTML(prod.nombre_variante || 'Producto Lubrimec')}">
                </div>
                <span class="modal-prod-codigo">${escaparHTML(prod.codigo || '-')}</span>
            </div>

            <div class="modal-prod-nombre">${escaparHTML(prod.nombre_variante || 'Sin nombre')}</div>

            <div class="modal-prod-detalles">
                <div><strong>Categoría:</strong> ${escaparHTML(prod.categoria || '-')}</div>
                <div><strong>Descripción:</strong> ${escaparHTML(prod.descripcion || 'Sin descripción')}</div>
            </div>

            <div class="modal-prod-pie">
                <span class="catalogo-stock ${sinStock ? 'sin-stock' : ''}">
                    ${sinStock ? 'Sin stock' : `${stockNum} disp.`}
                </span>
                <a href="${urlWa}" target="_blank" rel="noopener noreferrer" class="btn-consultar-prod">
                    Consultar
                </a>
            </div>
        `;

        modalProductoPublico.style.display = 'flex';
    };

    const cerrarModalProductoPublico = () => {
        if (!modalProductoPublico) return;
        modalProductoPublico.style.display = 'none';
    };

    btnCerrarModalProd?.addEventListener('click', cerrarModalProductoPublico);
    modalProductoPublico?.addEventListener('click', (e) => {
        if (e.target === modalProductoPublico) {
            cerrarModalProductoPublico();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalProductoPublico && modalProductoPublico.style.display !== 'none') {
            cerrarModalProductoPublico();
        }
    });

    const poblarCategorias = (items) => {
        if (!filtroCategoria) return;
        const categorias = [...new Set(items.map(p => (p.categoria || '').trim()).filter(Boolean))];
        filtroCategoria.innerHTML = '<option value="todas">Todas las categorías</option>';
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filtroCategoria.appendChild(option);
        });
    };

    const obtenerProductosFiltradosUnicos = () => {
        const palabrasBusqueda = normalizarTexto(buscadorCatalogo?.value || '')
            .split(' ')
            .filter(Boolean);
        const categoriaElegida = filtroCategoria?.value || 'todas';

        const vistos = new Set();

        return productosCatalogo.filter(prod => {
            const claveUnica = prod.id != null
                ? `id:${String(prod.id)}`
                : prod.codigo
                    ? `cod:${normalizarTexto(prod.codigo)}`
                    : null;

            if (claveUnica) {
                if (vistos.has(claveUnica)) return false;
                vistos.add(claveUnica);
            }

            const coincideCategoria = categoriaElegida === 'todas' || (prod.categoria || '').trim() === categoriaElegida;
            const textoProducto = normalizarTexto(
                `${prod.codigo || ''} ${prod.marca || ''} ${prod.nombre_variante || ''} ${prod.descripcion || ''} ${prod.vehiculo || ''} ${prod.categoria || ''}`
            );
            const coincideTexto = palabrasBusqueda.every(palabra => textoProducto.includes(palabra));
            return coincideCategoria && coincideTexto;
        });
    };

    const renderizarPaginacion = (totalPaginas) => {
        if (!paginacionCatalogo) return;

        if (totalPaginas <= 1) {
            paginacionCatalogo.innerHTML = '';
            return;
        }

        const rango = [];
        const ventana = 2;

        for (let i = 1; i <= totalPaginas; i++) {
            if (
                i === 1 ||
                i === totalPaginas ||
                (i >= paginaActual - ventana && i <= paginaActual + ventana)
            ) {
                rango.push(i);
            } else if (rango[rango.length - 1] !== '...') {
                rango.push('...');
            }
        }

        const botonesHtml = rango.map(item => {
            if (item === '...') {
                return '<span class="paginacion-puntos">...</span>';
            }
            const esActiva = item === paginaActual;
            return `
                <button
                    type="button"
                    class="paginacion-btn ${esActiva ? 'activa' : ''}"
                    data-pagina="${item}"
                    aria-label="Ir a la página ${item}"
                    ${esActiva ? 'aria-current="page"' : ''}
                >
                    ${item}
                </button>
            `;
        }).join('');

        const haySiguiente = paginaActual < totalPaginas;

        paginacionCatalogo.innerHTML = `
            ${botonesHtml}
            <button
                type="button"
                class="paginacion-btn paginacion-siguiente"
                data-pagina="${paginaActual + 1}"
                ${haySiguiente ? '' : 'disabled'}
            >
                Siguiente
            </button>
        `;
    };

    const renderizarCatalogo = () => {
        if (!tbodyCatalogo) return;

        const filtrados = obtenerProductosFiltradosUnicos();

        if (filtrados.length === 0) {
            tbodyCatalogo.innerHTML = '<tr><td colspan="8" class="catalogo-estado">No se encontraron productos con ese filtro.</td></tr>';
            if (cardsCatalogoMovil) {
                cardsCatalogoMovil.innerHTML = '<div class="catalogo-estado-card">No se encontraron productos con ese filtro.</div>';
            }
            if (paginacionCatalogo) paginacionCatalogo.innerHTML = '';
            return;
        }

        const totalPaginas = Math.ceil(filtrados.length / PRODUCTOS_POR_PAGINA);
        if (paginaActual > totalPaginas) {
            paginaActual = totalPaginas;
        }
        if (paginaActual < 1) {
            paginaActual = 1;
        }

        const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
        const paginaItems = filtrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);

        // Renderizado de tabla (Escritorio)
        tbodyCatalogo.innerHTML = paginaItems.map(prod => {
            const stockNum = Number(prod.cantidad ?? 0);
            const sinStock = stockNum <= 0;
            const urlWa = construirUrlWhatsApp(prod);
            const srcImg = prod.imagen ? escaparHTML(prod.imagen) : 'Lubrimec-Logo-Fondo-Transparente.png';

            return `
                <tr>
                    <td>
                        <div class="catalogo-img-caja">
                            <img src="${srcImg}" alt="${escaparHTML(prod.nombre_variante || 'Producto Lubrimec')}" loading="lazy">
                        </div>
                    </td>
                    <td class="catalogo-codigo">${escaparHTML(prod.codigo || '-')}</td>
                    <td class="catalogo-marca">${escaparHTML(prod.marca || '-')}</td>
                    <td>
                        <span class="catalogo-nombre">${escaparHTML(prod.nombre_variante || 'Sin nombre')}</span>
                    </td>
                    <td class="catalogo-col-desc">${escaparHTML(prod.descripcion || '-')}</td>
                    <td>${escaparHTML(prod.categoria || '-')}</td>
                    <td class="catalogo-stock ${sinStock ? 'sin-stock' : ''}">${sinStock ? 'Sin stock' : `${stockNum} disp.`}</td>
                    <td>
                        <a href="${urlWa}" target="_blank" rel="noopener noreferrer" class="btn-consultar-prod">
                            Consultar
                        </a>
                    </td>
                </tr>
            `;
        }).join('');

        // Renderizado de tarjetas (Celulares)
        if (cardsCatalogoMovil) {
            cardsCatalogoMovil.innerHTML = paginaItems.map((prod, idx) => {
                const stockNum = Number(prod.cantidad ?? 0);
                const sinStock = stockNum <= 0;
                const urlWa = construirUrlWhatsApp(prod);
                const srcImg = prod.imagen ? escaparHTML(prod.imagen) : 'Lubrimec-Logo-Fondo-Transparente.png';

                return `
                    <article class="card-catalogo-movil" data-idx="${idx}">
                        <div class="card-cat-superior">
                            <div class="card-cat-foto">
                                <img src="${srcImg}" alt="${escaparHTML(prod.nombre_variante || 'Producto Lubrimec')}" loading="lazy">
                            </div>
                            <span class="card-cat-codigo">${escaparHTML(prod.codigo || '-')}</span>
                        </div>
                        <div class="card-cat-producto">${escaparHTML(prod.nombre_variante || 'Sin nombre')}</div>
                        <div class="card-cat-inferior">
                            <span class="catalogo-stock ${sinStock ? 'sin-stock' : ''}">
                                ${sinStock ? 'Sin stock' : `${stockNum} disp.`}
                            </span>
                            <a href="${urlWa}" target="_blank" rel="noopener noreferrer" class="btn-consultar-prod">
                                Consultar
                            </a>
                        </div>
                    </article>
                `;
            }).join('');

            cardsCatalogoMovil.querySelectorAll('.card-catalogo-movil').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.btn-consultar-prod')) return;
                    const idx = Number(card.dataset.idx);
                    if (paginaItems[idx]) {
                        abrirModalProductoPublico(paginaItems[idx]);
                    }
                });
            });
        }

        renderizarPaginacion(totalPaginas);
    };

    paginacionCatalogo?.addEventListener('click', (e) => {
        const btn = e.target.closest('.paginacion-btn[data-pagina]');
        if (!btn || btn.disabled) return;
        const destino = Number(btn.dataset.pagina);
        if (!Number.isFinite(destino) || destino === paginaActual) return;

        paginaActual = destino;
        renderizarCatalogo();

        const seccionCatalogo = document.getElementById('catalogo');
        if (seccionCatalogo) {
            const top = seccionCatalogo.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
    });

    const cargarProductosSupabase = async () => {
        if (!tbodyCatalogo) return;
        try {
            const endpoint = `${SUPABASE_URL}/rest/v1/productos?activo=eq.true&order=codigo.asc`;
            const resp = await fetch(endpoint, {
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
                }
            });

            if (!resp.ok) {
                throw new Error(`Error HTTP ${resp.status}`);
            }

            productosCatalogo = await resp.json();
            paginaActual = 1;
            poblarCategorias(productosCatalogo);
            renderizarCatalogo();
        } catch (err) {
            console.error('Error al cargar catálogo:', err);
            tbodyCatalogo.innerHTML = '<tr><td colspan="8" class="catalogo-estado">No se pudo cargar el catálogo en este momento.</td></tr>';
            if (cardsCatalogoMovil) {
                cardsCatalogoMovil.innerHTML = '<div class="catalogo-estado-card">No se pudo cargar el catálogo en este momento.</div>';
            }
            if (paginacionCatalogo) paginacionCatalogo.innerHTML = '';
        }
    };

    const cargarContenidoSitio = async () => {
        try {
            const endpoint = `${SUPABASE_URL}/rest/v1/contenido_sitio?select=*`;
            const resp = await fetch(endpoint, {
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
                }
            });

            if (!resp.ok) return;
            const secciones = await resp.json();

            secciones.forEach(sec => {
                document.querySelectorAll(`[data-seccion="${sec.clave}"]`).forEach(el => {
                    const campo = el.getAttribute('data-campo');
                    if (campo && sec[campo] !== undefined && sec[campo] !== '') {
                        el.textContent = sec[campo];
                    }
                });
            });
        } catch (err) {
            console.error('Error al cargar contenido del sitio:', err);
        }
    };

    buscadorCatalogo?.addEventListener('input', () => {
        paginaActual = 1;
        renderizarCatalogo();
    });

    filtroCategoria?.addEventListener('change', () => {
        paginaActual = 1;
        renderizarCatalogo();
    });

    cargarProductosSupabase();
    cargarContenidoSitio();

    // Enviar consulta del formulario directamente a WhatsApp
    const formContacto = document.getElementById('form-contacto');

    if (formContacto) {
        formContacto.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();
            const telefono = '5493795168999';

            const texto = `Hola Lubrimec, soy ${nombre}.\nMi consulta es: ${mensaje}`;
            const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;

            window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
        });
    }
});