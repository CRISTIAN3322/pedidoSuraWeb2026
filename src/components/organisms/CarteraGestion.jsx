import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  compareVendedorNames,
  DIAS_VENCIDA,
  enrichCarteraGrupo,
  formatCarteraCurrency,
  getDiasStatus,
  getFacturasVencidas,
  parseValor,
  sortCarterasByVencimiento,
} from '../../utils/carteraUtils';
import styles from './CarteraGestion.module.css';

function getSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('vendedorSession');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isAdminSession(session) {
  return (session?.rol || '').toLowerCase() === 'administrador';
}

function FacturasTable({ facturas, showVendedor = false }) {
  const total = facturas.reduce((sum, f) => sum + parseValor(f.valor), 0);

  if (facturas.length === 0) {
    return (
      <div className={styles.empty}>
        No hay facturas con el filtro seleccionado.
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>NIT</th>
            <th>Cliente</th>
            {showVendedor && <th>Vendedor</th>}
            <th>Factura</th>
            <th>Fecha</th>
            <th className={styles.textRight}>Valor</th>
            <th className={styles.textCenter}>Días</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((factura, index) => {
            const dias = Number(factura.dias) || 0;
            const status = getDiasStatus(dias);
            const rowClass =
              status === 'danger'
                ? styles.rowDanger
                : status === 'warning'
                  ? styles.rowWarning
                  : status === 'info'
                    ? styles.rowInfo
                    : styles.rowSuccess;
            const diasClass =
              dias >= DIAS_VENCIDA
                ? styles.diasDanger
                : dias >= 11
                  ? styles.diasWarning
                  : '';

            return (
              <tr key={`${factura.id}-${factura.fac}-${index}`} className={rowClass}>
                <td className={styles.textCenter}>{index + 1}</td>
                <td>{factura.id}</td>
                <td>{factura.cliente}</td>
                {showVendedor && <td>{factura.vendedor}</td>}
                <td>{factura.fac}</td>
                <td>{factura.fecha}</td>
                <td className={styles.amount}>
                  {formatCarteraCurrency(parseValor(factura.valor))}
                </td>
                <td className={`${styles.textCenter} ${diasClass}`}>{dias}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={showVendedor ? 6 : 5} className={styles.textRight}>
              <strong>Total:</strong>
            </td>
            <td className={styles.amount} colSpan={2}>
              <strong>{formatCarteraCurrency(total)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function StatsCards({ totalFacturas, vencidas, porVencer, totalCartera }) {
  return (
    <div className={styles.stats}>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Total facturas</span>
        <span className={styles.statValue}>{totalFacturas}</span>
      </div>
      <div className={`${styles.statCard} ${styles.statCardDanger}`}>
        <span className={styles.statLabel}>Vencidas (≥{DIAS_VENCIDA} días)</span>
        <span className={styles.statValue}>{vencidas}</span>
      </div>
      <div className={`${styles.statCard} ${styles.statCardWarning}`}>
        <span className={styles.statLabel}>Por vencer (11-29 días)</span>
        <span className={styles.statValue}>{porVencer}</span>
      </div>
      <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
        <span className={styles.statLabel}>Total cartera</span>
        <span className={styles.statValue}>{formatCarteraCurrency(totalCartera)}</span>
      </div>
    </div>
  );
}

export default function CarteraGestion() {
  const [session, setSession] = useState(null);
  const [carteras, setCarteras] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroDias, setFiltroDias] = useState('todos');
  const [expanded, setExpanded] = useState({});

  const esAdmin = useMemo(() => isAdminSession(session), [session]);

  useEffect(() => {
    const current = getSession();
    if (!current?.nombre) {
      window.location.href = '/login';
      return;
    }
    setSession(current);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [carterasRes, contactosRes] = await Promise.all([
        fetch('/api/carteras.json'),
        fetch('/api/vendedores-contacto.json'),
      ]);

      if (!carterasRes.ok) {
        throw new Error('No se pudo cargar la cartera');
      }

      const carterasJson = await carterasRes.json();
      if (!Array.isArray(carterasJson)) {
        throw new Error('Formato de cartera inválido');
      }

      setCarteras(carterasJson.map(enrichCarteraGrupo));

      if (contactosRes.ok) {
        const contactosJson = await contactosRes.json();
        if (Array.isArray(contactosJson)) {
          setContactos(contactosJson);
        }
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  const filtrarFacturas = useCallback(
    (facturas) => {
      if (filtroDias === 'vencidas') {
        return facturas.filter((f) => (Number(f.dias) || 0) >= DIAS_VENCIDA);
      }
      if (filtroDias === 'por_vencer') {
        return facturas.filter((f) => {
          const d = Number(f.dias) || 0;
          return d >= 11 && d < DIAS_VENCIDA;
        });
      }
      return facturas;
    },
    [filtroDias]
  );

  const carterasVisibles = useMemo(() => {
    if (!session) return [];

    let lista = carteras;
    if (!esAdmin) {
      lista = carteras.filter((c) =>
        compareVendedorNames(c.vendedor, session.nombre)
      );
    }

    return sortCarterasByVencimiento(lista.map(enrichCarteraGrupo));
  }, [carteras, session, esAdmin]);

  const carteraPropia = carterasVisibles[0] || null;

  const statsGlobales = useMemo(() => {
    const facturas = carterasVisibles.flatMap((c) => c.facturas);
    return {
      totalFacturas: facturas.length,
      vencidas: facturas.filter((f) => f.dias >= DIAS_VENCIDA).length,
      porVencer: facturas.filter((f) => f.dias >= 11 && f.dias < DIAS_VENCIDA).length,
      totalCartera: facturas.reduce((s, f) => s + parseValor(f.valor), 0),
    };
  }, [carterasVisibles]);

  const getTelefonoVendedor = useCallback(
    (nombreVendedor) => {
      const contacto = contactos.find((c) =>
        compareVendedorNames(c.vendedor, nombreVendedor)
      );
      return contacto?.telefono || null;
    },
    [contactos]
  );

  const enviarWhatsApp = useCallback(
    (grupo) => {
      const vencidas = getFacturasVencidas(grupo.facturas);
      if (vencidas.length === 0) {
        alert(`No hay facturas vencidas (≥${DIAS_VENCIDA} días) para este vendedor.`);
        return;
      }

      const telefono = getTelefonoVendedor(grupo.vendedor);
      if (!telefono) {
        alert('No se encontró teléfono del vendedor en el sistema.');
        return;
      }

      const mensaje = buildWhatsAppMessage(grupo.vendedor, grupo.facturas);
      window.open(buildWhatsAppUrl(telefono, mensaje), '_blank', 'noopener,noreferrer');
    },
    [getTelefonoVendedor]
  );

  const toggleAccordion = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!session) {
    return <div className={styles.loading}>Verificando sesión...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {esAdmin ? '👑 Gestión de Cartera' : '📋 Mi Cartera'}
        </h1>
        <p className={styles.subtitle}>
          {esAdmin
            ? 'Cartera de todos los vendedores, ordenada por días vencidos'
            : `Vendedor: ${session.nombre}`}
        </p>
      </header>

      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <div className={styles.filterGroup}>
            <label htmlFor="filtroDias" className={styles.filterLabel}>
              Filtrar por estado:
            </label>
            <select
              id="filtroDias"
              className={styles.filterSelect}
              value={filtroDias}
              onChange={(e) => setFiltroDias(e.target.value)}
            >
              <option value="todos">Todas las facturas</option>
              <option value="vencidas">Solo vencidas (≥30 días)</option>
              <option value="por_vencer">Por vencer (11-29 días)</option>
            </select>
          </div>
        </div>

        {loading && <div className={styles.loading}>Cargando cartera...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
          <>
            <StatsCards {...statsGlobales} />

            {esAdmin ? (
              <div className={styles.accordion}>
                {carterasVisibles.length === 0 ? (
                  <div className={styles.empty}>No hay cartera registrada.</div>
                ) : (
                  carterasVisibles.map((grupo, index) => {
                    const id = `v-${index}`;
                    const abierto = !!expanded[id];
                    const facturasFiltradas = filtrarFacturas(grupo.facturas);
                    const tieneVencidas = grupo.facturasVencidas > 0;

                    return (
                      <div key={grupo.vendedor} className={styles.accordionItem}>
                        <div className={styles.accordionHeader}>
                          <button
                            type="button"
                            className={styles.accordionHeaderMain}
                            onClick={() => toggleAccordion(id)}
                            aria-expanded={abierto}
                          >
                            <span className={styles.accordionTitle}>{grupo.vendedor}</span>
                            <div className={styles.badges}>
                              <span className={styles.badge}>
                                {grupo.totalFacturas} facturas
                              </span>
                              <span className={`${styles.badge} ${styles.badgeDanger}`}>
                                {grupo.facturasVencidas} vencidas
                              </span>
                              <span className={`${styles.badge} ${styles.badgeTotal}`}>
                                {formatCarteraCurrency(grupo.totalCartera)}
                              </span>
                              <span className={styles.badge}>Máx. {grupo.maxDias} días</span>
                            </div>
                          </button>
                          <div className={styles.accordionActions}>
                            {tieneVencidas && (
                              <button
                                type="button"
                                className={styles.btnWhatsapp}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  enviarWhatsApp(grupo);
                                }}
                                title={`Enviar ${grupo.facturasVencidas} facturas vencidas por WhatsApp`}
                              >
                                📱 Enviar WhatsApp
                              </button>
                            )}
                            <button
                              type="button"
                              className={styles.accordionIconBtn}
                              onClick={() => toggleAccordion(id)}
                              aria-label={abierto ? 'Contraer' : 'Expandir'}
                            >
                              {abierto ? '−' : '+'}
                            </button>
                          </div>
                        </div>
                        {abierto && (
                          <div className={styles.accordionContent}>
                            <FacturasTable facturas={facturasFiltradas} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className={styles.vendorSection}>
                {!carteraPropia ? (
                  <div className={styles.empty}>
                    No tienes facturas asignadas en cartera.
                  </div>
                ) : (
                  <>
                    {getFacturasVencidas(carteraPropia.facturas).length > 0 && (
                      <div className={styles.vendorActions}>
                        <button
                          type="button"
                          className={styles.btnWhatsapp}
                          onClick={() => enviarWhatsApp(carteraPropia)}
                        >
                          📱 Ver resumen vencido en WhatsApp
                        </button>
                      </div>
                    )}
                    <FacturasTable facturas={filtrarFacturas(carteraPropia.facturas)} />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
