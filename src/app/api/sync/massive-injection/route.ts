import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getSenadores } from '@/lib/api/opendata-client';

/**
 * MASSIVE DATA INJECTION ENDPOINT
 * Populates database with extensive real and realistic data
 * POST /api/sync/massive-injection
 */
export async function POST(request: NextRequest) {
    try {
        console.log('🚀 Starting massive data injection...');

        const results = {
            senators: { success: 0, failed: 0, errors: [] as string[] },
            deputies: { success: 0, failed: 0, errors: [] as string[] },
            bills: { success: 0, failed: 0, errors: [] as string[] },
        };

        // ========================================
        // 1. INJECT ALL 50 REAL SENATORS
        // ========================================
        console.log('📊 Phase 1: Injecting real senators...');
        try {
            const senadores = await getSenadores();
            console.log(`Found ${senadores.length} senators from API`);

            for (const senador of senadores) {
                try {
                    // Check if exists first
                    const { data: existing } = await supabase
                        .from('parliamentarians')
                        .select('id')
                        .eq('external_id', senador.id)
                        .eq('camara', 'senado')
                        .maybeSingle();

                    const parliamentarianData = {
                        external_id: senador.id,
                        nombre: senador.nombre,
                        apellido_paterno: senador.apellidoPaterno,
                        apellido_materno: senador.apellidoMaterno,
                        nombre_completo: `${senador.nombre} ${senador.apellidoPaterno} ${senador.apellidoMaterno}`.trim(),
                        camara: 'senado',
                        partido: senador.partido,
                        ideologia: mapPartidoToIdeologia(senador.partido),
                        region: senador.region,
                        circunscripcion: senador.circunscripcion,
                        email: senador.email,
                        telefono: senador.telefono,
                        vigente: true,
                    };

                    let error;
                    if (existing) {
                        ({ error } = await supabase
                            .from('parliamentarians')
                            .update(parliamentarianData)
                            .eq('id', existing.id));
                    } else {
                        ({ error } = await supabase
                            .from('parliamentarians')
                            .insert(parliamentarianData));
                    }

                    if (error) {
                        results.senators.failed++;
                        results.senators.errors.push(`${senador.id}: ${error.message}`);
                    } else {
                        results.senators.success++;
                    }
                } catch (err: any) {
                    results.senators.failed++;
                    results.senators.errors.push(`${senador.id}: ${err.message}`);
                }
            }
        } catch (err: any) {
            results.senators.errors.push(`API failed: ${err.message}`);
        }

        // ========================================
        // 2. INJECT 155 REALISTIC DEPUTIES
        // ========================================
        console.log('📊 Phase 2: Injecting realistic deputies...');
        const deputies = generateRealisticDeputies(155);

        for (const deputy of deputies) {
            try {
                const { data: existing } = await supabase
                    .from('parliamentarians')
                    .select('id')
                    .eq('external_id', deputy.external_id)
                    .eq('camara', 'camara')
                    .maybeSingle();

                let error;
                if (existing) {
                    ({ error } = await supabase
                        .from('parliamentarians')
                        .update(deputy)
                        .eq('id', existing.id));
                } else {
                    ({ error } = await supabase
                        .from('parliamentarians')
                        .insert(deputy));
                }

                if (error) {
                    results.deputies.failed++;
                    results.deputies.errors.push(`${deputy.external_id}: ${error.message}`);
                } else {
                    results.deputies.success++;
                }
            } catch (err: any) {
                results.deputies.failed++;
                results.deputies.errors.push(`${deputy.external_id}: ${err.message}`);
            }
        }

        // ========================================
        // 3. INJECT 500 REALISTIC BILLS
        // ========================================
        console.log('📊 Phase 3: Injecting realistic bills...');
        const bills = generateRealisticBills(500);

        for (const bill of bills) {
            try {
                const { data: existing } = await supabase
                    .from('bills')
                    .select('id')
                    .eq('boletin', bill.boletin)
                    .maybeSingle();

                let error;
                if (existing) {
                    ({ error } = await supabase
                        .from('bills')
                        .update(bill)
                        .eq('id', existing.id));
                } else {
                    ({ error } = await supabase
                        .from('bills')
                        .insert(bill));
                }

                if (error) {
                    results.bills.failed++;
                    results.bills.errors.push(`${bill.boletin}: ${error.message}`);
                } else {
                    results.bills.success++;
                }
            } catch (err: any) {
                results.bills.failed++;
                results.bills.errors.push(`${bill.boletin}: ${err.message}`);
            }
        }

        console.log('✅ Massive injection completed!');

        return NextResponse.json({
            success: true,
            message: 'Massive data injection completed successfully',
            results,
            summary: {
                total_senators: results.senators.success,
                total_deputies: results.deputies.success,
                total_bills: results.bills.success,
                total_parliamentarians: results.senators.success + results.deputies.success,
                grand_total: results.senators.success + results.deputies.success + results.bills.success
            }
        });

    } catch (error: any) {
        console.error('❌ Massive injection error:', error);
        return NextResponse.json(
            { error: 'Massive injection failed', details: error.message },
            { status: 500 }
        );
    }
}

// ========================================
// REALISTIC DATA GENERATORS
// ========================================

function mapPartidoToIdeologia(partido: string): string {
    const p = partido.toLowerCase();
    if (p.includes('comunista') || p === 'pc') return 'left';
    if (p.includes('socialista') || p === 'ps' || p.includes('comunes') || p.includes('frente amplio') || p === 'fa' || p.includes('convergencia')) return 'centerLeft';
    if (p.includes('democracia cristiana') || p === 'dc' || p.includes('radical') || p === 'pr' || p.includes('liberal') || p === 'pl' || p === 'ppd') return 'center';
    if (p.includes('evópoli') || p === 'evopoli') return 'centerRight';
    if (p.includes('renovación nacional') || p === 'rn' || p.includes('udi') || p.includes('republicano')) return 'right';
    return 'independent';
}

function generateRealisticDeputies(count: number) {
    const partidos = [
        'PS', 'PPD', 'DC', 'RN', 'UDI', 'Evópoli', 'PC', 'FA', 'IND',
        'PR', 'PL', 'PDG', 'FREVS', 'Comunes', 'Humanista', 'Ecologista'
    ];

    const regiones = [
        'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
        'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble', 'Biobío',
        'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
    ];

    const nombresHombres = [
        'Carlos', 'Luis', 'Pedro', 'Francisco', 'Miguel', 'Juan', 'Diego', 'Andrés',
        'Jorge', 'Ricardo', 'Fernando', 'Gonzalo', 'Rodrigo', 'Mauricio', 'Sergio',
        'Pablo', 'Cristián', 'Alejandro', 'Marcelo', 'Gabriel', 'Raúl', 'Jaime'
    ];

    const nombresMujeres = [
        'María', 'Ana', 'Carmen', 'Isabel', 'Teresa', 'Patricia', 'Rosa', 'Claudia',
        'Carolina', 'Mónica', 'Andrea', 'Lorena', 'Paulina', 'Francisca', 'Daniela',
        'Alejandra', 'Camila', 'Javiera', 'Macarena', 'Constanza', 'Soledad'
    ];

    const apellidos = [
        'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva',
        'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández',
        'Torres', 'Flores', 'Espinoza', 'Araya', 'Reyes', 'Gutiérrez', 'Ramírez',
        'Castro', 'Vargas', 'Álvarez', 'Jiménez', 'Núñez', 'Vega', 'Riquelme', 'Bravo'
    ];

    const deputies = [];
    for (let i = 1; i <= count; i++) {
        const esMujer = Math.random() > 0.5;
        const nombre = esMujer
            ? nombresMujeres[Math.floor(Math.random() * nombresMujeres.length)]
            : nombresHombres[Math.floor(Math.random() * nombresHombres.length)];
        const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
        const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
        const partido = partidos[Math.floor(Math.random() * partidos.length)];
        const region = regiones[Math.floor(Math.random() * regiones.length)];
        const distrito = Math.floor(Math.random() * 28) + 1;

        deputies.push({
            external_id: `DIP-${String(i).padStart(3, '0')}`,
            nombre: nombre,
            apellido_paterno: apellido1,
            apellido_materno: apellido2,
            nombre_completo: `${nombre} ${apellido1} ${apellido2}`,
            camara: 'camara',
            partido,
            ideologia: mapPartidoToIdeologia(partido),
            region,
            circunscripcion: `Distrito ${distrito}`,
            email: `${nombre.toLowerCase()}.${apellido1.toLowerCase()}@camara.cl`,
            telefono: `+56 2 ${Math.floor(Math.random() * 9000000) + 1000000}`,
            vigente: true,
        });
    }

    return deputies;
}

function generateRealisticBills(count: number) {
    const estados = ['ingreso', 'comision', 'segundo_tramite', 'comision_mixta', 'aprobado', 'promulgado'];
    const urgencias = ['sin', 'simple', 'suma', 'inmediata'];
    const camaras = ['senado', 'camara'];
    const iniciativas = ['ejecutivo', 'parlamentaria'];

    const temas = [
        // Económicos
        'reforma al sistema de pensiones',
        'reforma tributaria',
        'salario mínimo',
        'protección al consumidor',
        'fomento a las PYMES',
        'inversión extranjera',
        'mercado de capitales',

        // Sociales
        'educación pública gratuita',
        'modernización del sistema de salud',
        'vivienda social',
        'protección de la infancia',
        'igualdad de género',
        'derechos de las personas mayores',
        'inclusión de personas con discapacidad',

        // Laborales
        'derechos de los trabajadores',
        'jornada laboral',
        'negociación colectiva',
        'seguridad y salud en el trabajo',
        'teletrabajo',

        // Ambientales
        'protección del medio ambiente',
        'energías renovables',
        'cambio climático',
        'protección de glaciares',
        'reciclaje y economía circular',
        'áreas protegidas',

        // Tecnología
        'protección de datos personales',
        'ciberseguridad',
        'delitos informáticos',
        'inteligencia artificial',
        'transformación digital del Estado',

        // Infraestructura
        'transporte público',
        'infraestructura vial',
        'conectividad digital',
        'agua potable rural',

        // Justicia y Seguridad
        'seguridad ciudadana',
        'reforma procesal penal',
        'violencia intrafamiliar',
        'narcotráfico',
        'migración',

        // Institucional
        'reforma constitucional',
        'descentralización',
        'desarrollo regional',
        'pueblos originarios',
        'participación ciudadana',
        'transparencia y probidad'
    ];

    const bills = [];
    const currentYear = new Date().getFullYear();

    for (let i = 1; i <= count; i++) {
        const tema = temas[Math.floor(Math.random() * temas.length)];
        const numeroBase = Math.floor(Math.random() * 20000) + 10000;
        const año = currentYear - Math.floor(Math.random() * 3); // Últimos 3 años
        const boletin = `${numeroBase}-${(año % 100).toString().padStart(2, '0')}`;
        const estado = estados[Math.floor(Math.random() * estados.length)];
        const urgencia = urgencias[Math.floor(Math.random() * urgencias.length)];
        const camara = camaras[Math.floor(Math.random() * camaras.length)];
        const iniciativa = iniciativas[Math.floor(Math.random() * iniciativas.length)];

        const fechaIngreso = new Date(
            año,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
        );

        const diasDesdeIngreso = Math.floor(Math.random() * 365);
        const fechaModificacion = new Date(
            fechaIngreso.getTime() + diasDesdeIngreso * 24 * 60 * 60 * 1000
        );

        bills.push({
            external_id: `BILL-${boletin}`,
            boletin,
            titulo: `Proyecto de ley que modifica ${Math.random() > 0.5 ? 'el código civil' : 'la ley N° ' + (Math.floor(Math.random() * 20000) + 1000)} en materia de ${tema}`,
            estado,
            camara_origen: camara,
            urgencia,
            fecha_ingreso: fechaIngreso.toISOString(),
            fecha_ultima_modificacion: fechaModificacion.toISOString(),
            etapa_actual: getEtapaActual(estado),
            iniciativa,
        });
    }

    return bills;
}

function getEtapaActual(estado: string): string {
    const etapas: Record<string, string> = {
        'ingreso': 'Primer trámite constitucional',
        'comision': 'En comisión',
        'segundo_tramite': 'Segundo trámite constitucional',
        'comision_mixta': 'Comisión mixta',
        'aprobado': 'Aprobado por ambas cámaras',
        'promulgado': 'Promulgado como ley'
    };
    return etapas[estado] || 'En tramitación';
}
