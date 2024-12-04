export const Routes = Object.freeze({
    HOME: '/',
    LOGIN: '/',
    START: '/aeropuerto',
    QR_GEN: '/qr',
    AIRPORT: {
        HOME: '/aeropuerto',
        ZI: '/aeropuerto/zi',
        ZI_SCL: '/aeropuerto/zi/scl',
        ZI_ANF: '/aeropuerto/zi/anf',
        ZI_CJC: '/aeropuerto/zi/cjc',
    }
})

export const HeaderLinks = [
    {
        label: 'Control Flota',
        href: Routes.START
    },
    {
        label: 'Orders',
        href: '#'
    },
    {
        label: 'Products',
        href: '#'
    },
]

export const NavbarLinks = [
    {
        label: 'Inicio',
        href: Routes.HOME
    },
    {
        label: 'Código QR',
        href: Routes.QR_GEN
    },
];