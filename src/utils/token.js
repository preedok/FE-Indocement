// token.js
export const setAuth = (token) => {
    localStorage.setItem("token", token);
};

export const clearAuth = () => {
    localStorage.removeItem("token");
};

export const isTokenExpired = (token) => {
    if (!token) {
        return true;
    }

    const decodedToken = jwtDecode(token);
    if (!decodedToken || !decodedToken.exp) {
        return true;
    }

    const expirationTime = decodedToken.exp * 1000;
    return Date.now() >= expirationTime;
};

export const isAuth = () => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
        clearAuth();
        return null;
    }

    return jwtDecode(token);
};