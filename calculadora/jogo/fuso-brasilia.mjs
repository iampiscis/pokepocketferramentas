















export const FUSO_BRASILIA_MS = 3 * 60 * 60_000;








export const emBrasilia = (t) => new Date(Number(t) - FUSO_BRASILIA_MS);
