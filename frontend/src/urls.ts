const prod = false

export const AI_ANALYZE_URL= prod? "" : "http://localhost:8001"
export const AUTH_URL= prod? "" : "http://localhost:8002"
export const NOTE_CRUD_URL= prod? "" : "http://localhost:8003"
export const VERIFY_TOKEN_URL= prod? "" : "http://localhost:8004"