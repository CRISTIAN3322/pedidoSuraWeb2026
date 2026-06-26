import React, { useState, useCallback, useMemo } from 'react';
import { useClienteData, useClientesFiltrados } from '../../hooks/useClienteData';
import { APP_CONFIG } from '../../config/app.config';
import styles from './ClienteSelectorReact.module.css';

const { blockDays } = APP_CONFIG.portfolio;

// Función auxiliar para obtener el nombre del vendedor de la sesión
function getVendedorNombre() {
    if (typeof window === 'undefined') return null;
    try {
        const session = sessionStorage.getItem('vendedorSession');
        if (!session) return null;
        const sessionData = JSON.parse(session);
        return sessionData.nombre || null;
    } catch {
        return null;
    }
}

// Función auxiliar para comparar nombres de vendedores (case-insensitive)
function compareVendedorNames(name1, name2) {
    if (!name1 || !name2) return false;
    return name1.trim().toUpperCase() === name2.trim().toUpperCase();
}

// Función auxiliar para verificar si el usuario es administrador
function isAdministrador() {
    if (typeof window === 'undefined') return false;
    try {
        const session = sessionStorage.getItem('vendedorSession');
        if (!session) return false;
        const sessionData = JSON.parse(session);
        return sessionData.rol === 'administrador' || sessionData.nombre?.toUpperCase() === 'ADMINISTRADOR';
    } catch {
        return false;
    }
}

// Componente para mostrar información del cupo
const CupoCliente = React.memo(({ cupoDisponible, totalCartera, sinCupo, error }) => {
    const cupoInfoClass = useMemo(() => {
        if (error) return styles['cliente-selector__cupo-info'];
        if (sinCupo) return `${styles['cliente-selector__cupo-info']} ${styles['cliente-selector__cupo-info--danger']}`;
        if (totalCartera > cupoDisponible * 0.8) return `${styles['cliente-selector__cupo-info']} ${styles['cliente-selector__cupo-info--warning']}`;
        return `${styles['cliente-selector__cupo-info']} ${styles['cliente-selector__cupo-info--success']}`;
    }, [sinCupo, totalCartera, cupoDisponible, error]);

    if (error) {
        return (
            <div className={cupoInfoClass} role="alert" aria-live="polite">
                ⚠️Error: {error}
            </div>
        );
    }

    return (
        <div className={cupoInfoClass} role="status" aria-live="polite">
            {sinCupo ? '⚠️' : '✅'} {sinCupo ? 'SIN CUPO' : 'Con Cupo'} - Cupo: ${cupoDisponible.toLocaleString('es-CO')} | Cartera: ${totalCartera.toLocaleString('es-CO')}
        </div>
    );
});

// Componente para mostrar la tabla de cartera
const CarteraCliente = React.memo(({ cartera, totalCartera, isLoading }) => {
    const getDiasClass = useCallback((dias) => {
        const diasNum = Number(dias) || 0;
        if (diasNum >= 30) return styles['cliente-selector__days-badge--critical'];
        if (diasNum >= 11) return styles['cliente-selector__days-badge--danger'];
        if (diasNum >= 1) return styles['cliente-selector__days-badge--warning'];
        return styles['cliente-selector__days-badge--normal'];
    }, []);

    const formatCurrency = useCallback((valor) => {
        try {
            const valorNumerico = Number(String(valor).replace(/\./g, '').replace(',', '.'));
            return isNaN(valorNumerico) ? 0 : valorNumerico;
        } catch {
            return 0;
        }
    }, []);

    if (isLoading) {
        return (
            <div className={styles['cliente-selector__cartera-section']}>
                <h4 className={styles['cliente-selector__cartera-title']}>Cartera del Cliente</h4>
                <div className={styles['cliente-selector__loading']}>Cargando cartera...</div>
            </div>
        );
    }

    return (
        <div className={styles['cliente-selector__cartera-section']}>
            <h4 className={styles['cliente-selector__cartera-title']}>Cartera del Cliente</h4>
            <div style={{ overflowX: 'auto' }}>
                <table className={styles['cliente-selector__cartera-table']}>
                    <thead>
                        <tr>
                            <th>Factura</th>
                            <th>Fecha</th>
                            <th>Valor</th>
                            <th>Días</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartera.length > 0 ? (
                            cartera.map((factura, idx) => (
                                <tr key={factura.fac || idx}>
                                    <td>{factura.fac || 'N/A'}</td>
                                    <td>{factura.fecha || 'N/A'}</td>
                                    <td>${formatCurrency(factura.valor).toLocaleString('es-CO')}</td>
                                    <td>
                                        <span className={`${styles['cliente-selector__days-badge']} ${getDiasClass(factura.dias)}`}>
                                            {factura.dias || 0}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-neutral)' }}>
                                    Sin facturas pendientes
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {totalCartera > 0 && (
                        <tfoot>
                            <tr>
                                <td colSpan="2"><strong>Total Cartera:</strong></td>
                                <td colSpan="2"><strong>${totalCartera.toLocaleString('es-CO')}</strong></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
});

// Componente principal refactorizado
function ClienteSelectorReact() {
    const [busqueda, setBusqueda] = useState('');
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Usar hooks personalizados para lógica de negocio
    const resultados = useClientesFiltrados(busqueda);
    const {
        cupoDisponible,
        totalCartera,
        sinCupo,
        carteraCliente,
        formaPago,
        error: dataError
    } = useClienteData(clienteSeleccionado);

    // Filtrar sucursales por vendedor logueado (o mostrar todas si es administrador)
    const sucursalesFiltradas = useMemo(() => {
        if (!clienteSeleccionado || !clienteSeleccionado.sucursales) {
            return [];
        }

        const esAdministrador = isAdministrador();

        // Si es administrador, mostrar todas las sucursales
        if (esAdministrador) {
            return clienteSeleccionado.sucursales;
        }

        const vendedorNombre = getVendedorNombre();

        // Si no hay vendedor logueado, no mostrar sucursales
        if (!vendedorNombre) {
            return [];
        }

        // Filtrar sucursales que pertenecen al vendedor logueado
        return clienteSeleccionado.sucursales.filter((sucursal) =>
            compareVendedorNames(sucursal.vendedor, vendedorNombre)
        );
    }, [clienteSeleccionado]);

    // Manejadores de eventos optimizados
    const handleClienteSelect = useCallback((cliente) => {
        setClienteSeleccionado(cliente);
        setSucursalSeleccionada(null);
    }, []);

    const handleSucursalSelect = useCallback((sucursal) => {
        setSucursalSeleccionada(sucursal);
    }, []);

    const handleContinue = useCallback(() => {
        if (!clienteSeleccionado || !sucursalSeleccionada) return;

        setIsLoading(true);

        try {
            const datosCliente = {
                clienteId: clienteSeleccionado.id,
                clienteNombre: clienteSeleccionado.nombre,
                sucursalDireccion: sucursalSeleccionada.direccion,
                sucursalVendedor: sucursalSeleccionada.vendedor,
                totalCartera,
                cupoDisponible,
                sinCupo,
                formaPago,
                cartera: carteraCliente, // Incluir la cartera completa
            };

            localStorage.setItem('datosCliente', JSON.stringify(datosCliente));
            window.location.href = '/producto';
        } catch (error) {
            console.error('Error al guardar datos del cliente:', error);
            alert('Error al procesar la información. Por favor, inténtelo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, [clienteSeleccionado, sucursalSeleccionada, totalCartera, cupoDisponible, sinCupo, formaPago, carteraCliente]);

    const handleSearchChange = useCallback((e) => {
        setBusqueda(e.target.value);
    }, []);

    const tieneFacturasVencidas = useMemo(() => {
        if (!carteraCliente || carteraCliente.length === 0) return false;

        return carteraCliente.some(factura => {
            const dias = Number(factura.dias) || 0;
            return dias > blockDays;
        });
    }, [carteraCliente]);

    // Datos seleccionados para mostrar
    const datosSeleccionados = useMemo(() => {
        if (!clienteSeleccionado || !sucursalSeleccionada) return null;

        return {
            cliente: clienteSeleccionado.nombre,
            direccion: sucursalSeleccionada.direccion,
            vendedor: sucursalSeleccionada.vendedor,
        };
    }, [clienteSeleccionado, sucursalSeleccionada]);

    return (
        <div className={styles['cliente-selector__container']}>
            {/* Sección de búsqueda */}
            <div className={styles['cliente-selector__search-section']}>
                <label 
                    htmlFor="cliente-search" 
                    style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-text-primary)' }}
                >
                    Buscar Cliente
                </label>
                <input 
                    id="cliente-search" 
                    type="text" 
                    placeholder="Buscar por nombre o ID del cliente..." 
                    value={busqueda} 
                    onChange={handleSearchChange} 
                    className={styles['cliente-selector__search-input']} 
                    aria-describedby="search-help"
                />
                <div 
                    id="search-help" 
                    style={{ fontSize: '0.9rem', color: 'var(--color-neutral)', marginTop: '0.25rem' }}
                >
                    Busque por nombre del cliente o número de identificación
                </div>

                {/* Resultados de búsqueda */}
                {resultados.length > 0 && (
                    <ul className={styles['cliente-selector__results-list']} role="listbox" aria-label="Resultados de búsqueda">
                        {resultados.map((cliente) => (
                            <li 
                                key={cliente.id} 
                                className={styles['cliente-selector__client-item']} 
                                onClick={() => handleClienteSelect(cliente)} 
                                role="option" 
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleClienteSelect(cliente);
                                    }
                                }}
                                aria-selected={clienteSeleccionado?.id === cliente.id}
                            >
                                <strong>{cliente.nombre}</strong>
                                {cliente.id && <span style={{ color: 'var(--color-neutral)', marginLeft: '0.5rem' }}>ID: {cliente.id}</span>}
                            </li>
                        ))}
                    </ul>
                )}

                {busqueda.length >= 1 && resultados.length === 0 && (
                    <div className={styles['cliente-selector__no-results']}>
                        No se encontraron clientes que coincidan con "{busqueda}"
                    </div>
                )}
            </div>

            {/* Información del cliente seleccionado */}
            {clienteSeleccionado && (
                <div className={styles['cliente-selector__branches-section']}>
                    <h3 className={styles['cliente-selector__branches-title']}>
                        Sucursales de {clienteSeleccionado.nombre}
                    </h3>

                    {/* Error display */}
                    {dataError && (
                        <div className={styles['cliente-selector__error-message']} role="alert">
                            {dataError}
                        </div>
                    )}

                    {/* Información del cupo */}
                    <CupoCliente 
                        cupoDisponible={cupoDisponible} 
                        totalCartera={totalCartera} 
                        sinCupo={sinCupo} 
                        error={dataError}
                    />

                    {/* Información de forma de pago */}
                    <div className={styles['cliente-selector__payment-info']}>
                        <strong>Forma de pago:</strong> {formaPago || 'No registrada'}
                    </div>

                    {/* Lista de sucursales */}
                    {sucursalesFiltradas && sucursalesFiltradas.length > 0 ? (
                        <div>
                            <h4 style={{ margin: '1.5rem 0 1rem 0', color: 'var(--color-text-primary)' }}>
                                Seleccione una sucursal:
                            </h4>
                            <ul className={styles['cliente-selector__branches-list']} role="radiogroup" aria-labelledby="branches-label">
                                <div id="branches-label" style={{ display: 'none' }}>
                                    Opciones de sucursales
                                </div>
                                {sucursalesFiltradas.map((sucursal, idx) => (
                                    <li 
                                        key={idx} 
                                        className={`${styles['cliente-selector__branch-item']} ${sucursalSeleccionada === sucursal ? styles['cliente-selector__branch-item--active'] : ''}`} 
                                        onClick={() => handleSucursalSelect(sucursal)} 
                                        role="radio" 
                                        tabIndex={0} 
                                        aria-checked={sucursalSeleccionada === sucursal}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleSucursalSelect(sucursal);
                                            }
                                        }}
                                    >
                                        <strong>Dirección:</strong> {sucursal.direccion}<br />
                                        <strong>Vendedor:</strong> {sucursal.vendedor}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                    <div className={styles['cliente-selector__no-results']}>
                            {clienteSeleccionado.sucursales && clienteSeleccionado.sucursales.length > 0
                                ? 'No hay sucursales asignadas a tu usuario para este cliente'
                                : 'No hay sucursales registradas para este cliente'
                            }
                        </div>
                    )}

                    {/* Tabla de cartera */}
                    <CarteraCliente 
                        cartera={carteraCliente} 
                        totalCartera={totalCartera} 
                        isLoading={isLoading}
                    />

                    {/* Botón continuar */}
                    <button 
                        className={`${styles['cliente-selector__continue-btn']} ${tieneFacturasVencidas ? styles['cliente-selector__continue-btn--blocked'] : ''}`} 
                        disabled={!sucursalSeleccionada || isLoading || tieneFacturasVencidas} 
                        onClick={tieneFacturasVencidas ? undefined : handleContinue} 
                        aria-describedby="continue-help"
                    >
                        {isLoading ? 'Procesando...' : tieneFacturasVencidas ? 'Cliente bloqueado por factura' : 'Continuar al Producto'}
                    </button>
                    <div 
                        id="continue-help" 
                        style={{ fontSize: '0.9rem', color: 'var(--color-neutral)', marginTop: '0.5rem' }}
                    >
                        {tieneFacturasVencidas
                            ? `El cliente tiene facturas vencidas mayores a ${blockDays} días. Contacte al área de cartera para resolver.`
                            : 'Seleccione una sucursal para continuar'
                        }
                    </div>
                </div>
            )}

            {/* Datos seleccionados */}
            {datosSeleccionados && (
                <div className={styles['cliente-selector__selected-data']}>
                    <h4 className={styles['cliente-selector__selected-title']}>Datos Seleccionados:</h4>
                    <div className={styles['cliente-selector__selected-info']}>
                        <p><strong>Cliente:</strong> {datosSeleccionados.cliente}</p>
                        <p><strong>Dirección:</strong> {datosSeleccionados.direccion}</p>
                        <p><strong>Vendedor:</strong> {datosSeleccionados.vendedor}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClienteSelectorReact;
