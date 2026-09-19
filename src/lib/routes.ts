/**
 * Centralized Route Map & Canonical Navigation Helper
 */
export const routes = {
  home: "/",
  products: {
    list: "/products",
    detail: (slug: string) => `/products/${slug}`,
  },
  category: (slug: string) => `/category/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  payment: "/payment",
  orderConfirmation: (orderId: string) => `/order-confirmation/${orderId}`,

  // Canonical Customer Account Domain Routes
  account: {
    root: "/account",
    orders: {
      list: "/account/orders",
      detail: (orderId: string) => `/account/orders/${orderId}`,
      return: (orderId: string) => `/account/orders/${orderId}/return`,
    },
    returns: {
      list: "/account/returns",
      detail: (returnId: string) => `/account/returns/${returnId}`,
    },
    support: {
      list: (tab?: "tickets" | "faqs" | "guides") =>
        tab ? `/account/support?tab=${tab}` : "/account/support",
      new: (params?: { orderId?: string; returnId?: string; category?: string }) => {
        if (!params) return "/account/support/new";
        const search = new URLSearchParams();
        if (params.orderId) search.set("orderId", params.orderId);
        if (params.returnId) search.set("returnId", params.returnId);
        if (params.category) search.set("category", params.category);
        const str = search.toString();
        return str ? `/account/support/new?${str}` : "/account/support/new";
      },
      detail: (ticketId: string) => `/account/support/${ticketId}`,
    },
    wishlist: "/account/wishlist",
    addresses: "/account/addresses",
    profile: "/account/profile",
  },

  // Blog Storefront Routes
  blog: {
    list: "/blog",
    detail: (slug: string) => `/blog/${slug}`,
    category: (slug: string) => `/blog?category=${slug}`,
    tag: (slug: string) => `/blog?tag=${slug}`,
  },

  // Public Informational Pages
  public: {
    blog: "/blog",
    contact: "/contact",
    terms: "/terms",
    privacy: "/privacy",
    returnsPolicy: "/returns",
  },

  // Admin Management Routes
  admin: {
    dashboard: "/admin/dashboard",
    blog: "/admin/blog",
    blogNew: "/admin/blog/new",
    blogEdit: (id: string) => `/admin/blog/${id}/edit`,
    products: "/admin/products",
    productNew: "/admin/products/new",
    productDetail: (id: string) => `/admin/products/${id}`,
    orders: "/admin/orders",
    returns: "/admin/returns",
    returnsDetail: (id: string) => `/admin/returns/${id}`,
    discounts: "/admin/discounts",
    shipping: "/admin/shipping",
    inventory: "/admin/inventory",
    support: "/admin/support",
    supportDetail: (id: string) => `/admin/support/${id}`,
    customers: "/admin/customers",
    customerDetail: (id: string) => `/admin/customers/${id}`,
    users: "/admin/users",
    settings: "/admin/settings",
    login: "/admin/login",
  },
} as const;
