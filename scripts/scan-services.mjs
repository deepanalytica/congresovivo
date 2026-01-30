
const BASE_URL = 'https://opendata.camara.cl';
const SERVICES = [
    'WSLegislativo.asmx',
    'WSProyectos.asmx',
    'WSTramitacion.asmx',
    'WSComun.asmx',
    'WSStaff.asmx',
    'WSLey.asmx'
];

async function scan() {
    console.log('Scanning Cámara OpenData services...');
    for (const service of SERVICES) {
        try {
            const url = `${BASE_URL}/${service}?WSDL`;
            const res = await fetch(url, { method: 'HEAD' });
            console.log(`${service}: ${res.status} ${res.statusText}`);
            if (res.status === 200) {
                // checks if it is maintenance page
                const body = await (await fetch(url)).text();
                // Check if it is XML/WSDL
                if (body.includes('wsdl:definitions') || body.includes('wsdl:service')) {
                    console.log(`   -> ACTIVE WSDL FOUND!`);
                } else if (body.includes('Mantención') || body.includes('Maintenance')) {
                    console.log(`   -> Maintenance Page`);
                }
            }
        } catch (e) {
            console.log(`${service}: ERROR ${e.message}`);
        }
    }
}

scan();
