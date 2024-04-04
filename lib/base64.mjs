export const toBase64 = (u8) => {
    return btoa(String.fromCharCode.apply(null, u8));
}

export const fromBase64 = (str) => {
    return atob(str).split('').map(function (c) { return c.charCodeAt(0); });
}
