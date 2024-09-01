export async function getAccesToken(): Promise<string> {
    const access = useCookie("access-token", {
        sameSite: "strict",
        maxAge: 60 * 5
    })
    const refresh = useCookie("refresh-token")

    if(refresh.value === undefined || 
        refresh.value === null) {
        destroyTokens()
    }

    if(!isTokenValid() && 
        refresh.value !== null && refresh.value !== undefined) {
        const data = await refreshTokens(refresh.value)
        access.value = data?.accessToken ?? null
    }

    if(access.value === null) {
        destroyTokens()
    }
    return Promise.resolve(access.value ?? "")
}

async function refreshTokens(refreshToken: string): Promise<any> {
    const config = useRuntimeConfig()

    return fetch(`${config.public.baseURL}/auth/refresh-token?token=${refreshToken}`, {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json()
                }
            }).then((data) => {
                return data
            })
}

export async function initTokens(username: string, password: string): Promise<void> {
    const config = useRuntimeConfig()
    const access = useCookie("access-token", {
                        sameSite: "strict",
                        maxAge: 60 * 5
                    })
    const refresh = useCookie("refresh-token", {
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7
    })
    return fetch(`${config.public.baseURL}/auth/authenticate`, {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json()
                }
                    access.value = null
                    refresh.value = null
                    throw new Error("Username or password is wrong")
                }).then((data) => {
                    access.value = data.accessToken
                    refresh.value = data.refreshToken
            }).catch(e => {
                alert(e)
            })
}

export function setTokens(accessToken: string, refreshToken: string):void {
     const access = useCookie("access-token")
    const refresh = useCookie("refresh-token")
    if(accessToken !== undefined) access.value = accessToken
    if(refreshToken !== undefined) refresh.value = refreshToken
}

export function destroyTokens(): void {
    const access = useCookie("access-token")
    const refresh = useCookie("refresh-token")
    access.value = null
    refresh.value = null
}

export function isTokenValid(): boolean {
    const expiration = new Date(parseInt(getAccesTokenClaim("exp")) * 1000).getTime()
    return Date.now() < expiration
}

export function isAdmin(): boolean {
    const role = getAccesTokenClaim("role")
    return role === "ADMIN"
}

export function getSubject(): string {
    return getAccesTokenClaim("sub")
}

export function getRole(): string {
    return getAccesTokenClaim("role")
}

function getAccesTokenClaim(claim: string): string {
    const access = useCookie("access-token")
    if(access.value === undefined || access.value === null) {
        return ""
    }
    return JSON.parse(atob(access.value.split(".")[1]))[claim]
}