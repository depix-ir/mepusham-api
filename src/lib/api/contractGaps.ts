/**
 * OpenAPI Contract Gaps Registry
 *
 * This file records all UI domain operations present in Customer Account and Admin Panel
 * that currently lack valid endpoints in the backend OpenAPI 3.0 specification (`openAPI.yml`).
 *
 * Per requirements:
 * 1. Operations without backend OpenAPI endpoints must NOT fabricate endpoints or simulate success without server verification.
 * 2. They are explicitly registered here as incomplete backend capabilities.
 */

export interface ContractGap {
  domain: string;
  feature: string;
  uiLocation: string;
  missingEndpoint: string;
  httpMethod: string;
  status: "unsupported_by_contract";
  description: string;
}

export const OPENAPI_CONTRACT_GAPS: ContractGap[] = [
  // 1. PRODUCTS & VARIANT MANAGEMENT (ADMIN)
  {
    domain: "Admin Products",
    feature: "List Admin Products",
    uiLocation: "/admin/products",
    missingEndpoint: "/admin/products",
    httpMethod: "GET",
    status: "unsupported_by_contract",
    description: "openAPI.yml does not define a endpoint for querying or listing admin products.",
  },
  {
    domain: "Admin Products",
    feature: "Create / Edit / Delete Product",
    uiLocation: "/admin/products/new, /admin/products/[id]",
    missingEndpoint: "/admin/products",
    httpMethod: "POST / PUT / DELETE",
    status: "unsupported_by_contract",
    description: "openAPI.yml does not define CRUD endpoints for product entity creation, modification, or deletion.",
  },

  // 2. ORDERS MANAGEMENT (ADMIN & CUSTOMER)
  {
    domain: "Admin Orders",
    feature: "List & View Admin Orders & Change Status",
    uiLocation: "/admin/orders",
    missingEndpoint: "/admin/orders",
    httpMethod: "GET / PATCH",
    status: "unsupported_by_contract",
    description: "openAPI.yml does not define endpoints for listing admin orders or changing order statuses.",
  },
  {
    domain: "Customer Orders",
    feature: "Get Customer Order History & Order Details",
    uiLocation: "/account/orders",
    missingEndpoint: "/store/customers/me/orders",
    httpMethod: "GET",
    status: "unsupported_by_contract",
    description: "openAPI.yml does not define customer order history retrieval endpoints.",
  },

  // 3. CUSTOMER PROFILE & ADDRESSES
  {
    domain: "Customer Profile",
    feature: "Get & Update Customer Profile",
    uiLocation: "/account",
    missingEndpoint: "/store/customers/me",
    httpMethod: "GET / PATCH",
    status: "unsupported_by_contract",
    description: "openAPI.yml only defines /auth/phone/verify for auth; it lacks customer profile endpoints.",
  },
  {
    domain: "Customer Addresses",
    feature: "Customer Address Book Management",
    uiLocation: "/account/addresses",
    missingEndpoint: "/store/customers/me/addresses",
    httpMethod: "GET / POST / PUT / DELETE",
    status: "unsupported_by_contract",
    description: "openAPI.yml defines store shipping addresses (/admin/settings/addresses) but lacks customer personal address book endpoints.",
  },

  // 4. USERS & PERMISSIONS
  {
    domain: "Admin Users",
    feature: "Admin Users & Role Permissions Management",
    uiLocation: "/admin/users",
    missingEndpoint: "/admin/users",
    httpMethod: "GET / POST / PUT / DELETE",
    status: "unsupported_by_contract",
    description: "openAPI.yml does not define admin user management endpoints.",
  },

  // 5. DISCOUNTS & PROMOTIONS
  {
    domain: "Admin Discounts",
    feature: "Promotions, Coupons, and Campaigns Management",
    uiLocation: "/admin/discounts",
    missingEndpoint: "/admin/discounts",
    httpMethod: "GET / POST / PUT / DELETE",
    status: "unsupported_by_contract",
    description: "openAPI.yml does not define discount or promotion management endpoints.",
  },

  // 6. RETURNS & REFUNDS
  {
    domain: "Returns & Exchanges",
    feature: "Customer Return Requests & Admin Return Approval",
    uiLocation: "/account/returns, /admin/returns",
    missingEndpoint: "/store/returns, /admin/returns",
    httpMethod: "GET / POST / PATCH",
    status: "unsupported_by_contract",
    description: "openAPI.yml defines return window settings (/admin/settings) but lacks return request endpoints.",
  },

  // 7. WISHLIST
  {
    domain: "Customer Wishlist",
    feature: "Customer Favorites & Wishlist Management",
    uiLocation: "/account/wishlist",
    missingEndpoint: "/store/wishlist",
    httpMethod: "GET / POST / DELETE",
    status: "unsupported_by_contract",
    description: "openAPI.yml does not define customer wishlist endpoints.",
  },

  // 8. BLOG & CMS
  {
    domain: "Blog",
    feature: "Blog Articles & CMS Content Management",
    uiLocation: "/admin/blog, /blog",
    missingEndpoint: "/admin/blog",
    httpMethod: "GET / POST / PUT / DELETE",
    status: "unsupported_by_contract",
    description: "openAPI.yml does not define blog or content management endpoints.",
  },

  // 9. SUPPORT TICKET MESSAGES & ADMIN TICKET UPDATES
  {
    domain: "Support Tickets",
    feature: "Ticket Message Thread & Admin Status Updates",
    uiLocation: "/account/support/[id], /admin/support/[id]",
    missingEndpoint: "/store/tickets/{id}/messages, /admin/tickets/{id}",
    httpMethod: "GET / POST / PATCH",
    status: "unsupported_by_contract",
    description: "openAPI.yml defines /store/tickets (GET/POST) and /admin/tickets (GET), but lacks endpoints for ticket message thread history and updating ticket status.",
  },

  // 10. REVIEWS & COMMENTS TEXT SUBMISSION
  {
    domain: "Product Reviews",
    feature: "Review Comment & Rating Text Submission",
    uiLocation: "/account/orders",
    missingEndpoint: "/store/reviews",
    httpMethod: "POST",
    status: "unsupported_by_contract",
    description: "openAPI.yml defines /store/reviews/media for image uploads, but lacks an endpoint for submitting review comment text and rating score.",
  },

  // 11. SALES & DASHBOARD ANALYTICS REPORTS
  {
    domain: "Admin Reports",
    feature: "Sales Analytics & Revenue Charts",
    uiLocation: "/admin/dashboard",
    missingEndpoint: "/admin/reports/sales",
    httpMethod: "GET",
    status: "unsupported_by_contract",
    description: "openAPI.yml defines /admin/reports/margin for margin analysis, but lacks general sales analytics or daily revenue chart endpoints.",
  },
];
