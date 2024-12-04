import { createSession, setCookie } from '../auth'

function getLoginUrl() {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_ADMIN_LOGIN_ROUTE}`;
}

function getAdminIdUrl() {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_ADMIN_IDENTITY}`;
}

function isApiConfigured() {
    return process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_ADMIN_LOGIN_ROUTE;
}

function isValidCredentials(email: string, password: string) {
    return email && password;
}

function getApiHeaders() {
    return {
        "Accept": "application/json",
        "Content-Language": "es",
        "Content-Type": "application/json;charset=UTF-8",
    };
}

async function fetchLoginData(url: string, email: string, password: string) {
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: getApiHeaders(),
    });
    if (!response.ok) throw new Error('Login failed');
    return await response.json();
}

export async function fetchUserData(adminId: string) {
    const ADMIN_ID_URL = getAdminIdUrl();
    const response = await fetch(`${ADMIN_ID_URL}?admin_id=${adminId}&limit=0&offset=0`, {
        method: "GET",
        headers: getApiHeaders(),
    });
    if (!response.ok) throw new Error('User data fetch failed');
    return await response.json();
}

export const login = async (email: string, password: string) => {
    const LOGIN_URL = getLoginUrl();

    if (!isApiConfigured() || !isValidCredentials(email, password)) {
        return null
    }

    try {
        const loginResponse = await fetchLoginData(LOGIN_URL, email, password);
        if (!loginResponse) return null

        switch (loginResponse.status) {
            case 200:
                const userResponse = await fetchUserData(loginResponse.data.id);
                if (!userResponse) return

                const { user, session } = await createSession(email, loginResponse.data.access_token, userResponse.data.result[0].fullName);
                await setCookie(session);

                return {
                    status: 200,
                    user: user,
                    message: 'Login exitoso',
                }
            case 201:
                return {
                    status: 201,
                    user: null,
                    message: '¿Estás conectado a VPN?'
                }
            case 401:
                return {
                    status: 401,
                    user: null,
                    message: 'Credenciales inválidas'
                }
            default:
                return {
                    status: 500,
                    user: null,
                    message: 'Ocurrió un error. No se ha podido iniciar sesión.'
                }
        }
    } catch (error) {
        console.error('Login error:', error);
        return null
    }
}