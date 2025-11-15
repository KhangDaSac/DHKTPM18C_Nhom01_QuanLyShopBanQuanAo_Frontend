
export const API_ENDPOINTS = {
    // ==================== AUTHENTICATION ====================
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        INTROSPECT: '/auth/introspect',
        CURRENT_USER: '/auth/me',
    },

    // ==================== USERS ====================
    USERS: {
        BASE: '/users',
        BY_ID: (id: string) => `/users/${id}`,
        REGISTER: '/users',
    },

    // ==================== PRODUCTS ====================
    PRODUCTS: {
        BASE: '/products',
        BY_ID: (id: number) => `/products/${id}`,
        SEARCH: '/products/search',
        BY_CATEGORY: (categoryId: number) => `/products/category/${categoryId}`,
        BY_BRAND: (brandId: number) => `/products/brand/${brandId}`,
    },

    // ==================== CATEGORIES ====================
    CATEGORIES: {
        BASE: '/categories',
        BY_ID: (id: number) => `/categories/${id}`,
        ALL: '/categories/all',
    },

    // ==================== BRANDS ====================
    BRANDS: {
        BASE: '/brands',
        BY_ID: (id: number) => `/brands/${id}`,
    },

    // ==================== CART ====================
    CART: {
        BY_CUSTOMER: (customerId: string) => `/carts/customer/${customerId}`,
        ADD_ITEM: '/carts/add',
        REMOVE_ITEM: (variantId: number) => `/carts/remove/${variantId}`,
        REMOVE_COMPLETE: (variantId: number) => `/carts/remove/${variantId}/complete`,
        CLEAR: '/carts/clear',
    },

    // ==================== ORDERS ====================
    ORDERS: {
        BASE: '/orders',
        BY_ID: (id: number) => `/orders/${id}`,
        BY_CUSTOMER: (customerId: string) => `/orders/customer/${customerId}`,
    },

    // ==================== PROMOTIONS ====================
    PROMOTIONS: {
        PERCENTAGE: {
            BASE: '/percentage-promotions',
            BY_ID: (id: number) => `/percentage-promotions/${id}`,
            ACTIVE: '/percentage-promotions/active',
        },
        AMOUNT: {
            BASE: '/amount-promotions',
            BY_ID: (id: number) => `/amount-promotions/${id}`,
            ACTIVE: '/amount-promotions/active',
        },
    },

    // ==================== FAVORITES ====================
    FAVORITES: {
        BASE: '/favorites',
        BY_CUSTOMER: (customerId: string) => `/favorites/customer/${customerId}`,
        ADD: '/favorites/add',
        REMOVE: (productId: number) => `/favorites/remove/${productId}`,
    },

    // ==================== ADDRESSES ====================
    ADDRESSES: {
        BASE: '/addresses',
        BY_ID: (id: number) => `/addresses/${id}`,
        BY_CUSTOMER: (customerId: string) => `/addresses/customer/${customerId}`,
    },
    // ==================== CHECKOUT ====================
    CHECKOUT: {
        PROCESS: '/checkout',
        AVAILABLE_PROMOTIONS: (customerId: string) => `/checkout/promotions?customerId=${customerId}`,
    },

    // ==================== CUSTOMERS ====================
    CUSTOMERS: {
        BASE: '/customers',
        BY_ID: (userId: string) => `/customers/${userId}`,
    },

    // ==================== CHAT ====================
    CHAT: {
        GET_CONVERSATION: (userId: string) => `/chat/conversation/${userId}`,
        GET_HISTORY: (conversationId: number) => `/chat/history/${conversationId}`,
        SEND_MESSAGE_AI: `/chat/sendMessage/ai`, // POST - Send message to AI
        WEBSOCKET_ENDPOINT: '/ws', // WebSocket connection endpoint (not used for AI)
        WEBSOCKET_SEND_AI: '/app/sendMessage/ai', // STOMP destination for AI
        WEBSOCKET_SEND_SHOP: '/app/sendMessage/shop', // STOMP destination for Shop
        WEBSOCKET_TOPIC_AI: '/topic/messages/ai', // STOMP subscription for AI
        WEBSOCKET_TOPIC_SHOP: '/topic/messages/shop', // STOMP subscription for Shop
    },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;