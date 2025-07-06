const API_BASE_URL = "http://localhost:3001/api";

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }
    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    address?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProfile(userData: {
    name?: string;
    phone?: string;
    address?: string;
    avatar?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  // Orders (for users)
  async getOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/orders?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createOrder(orderData: {
    product: string;
    pickupAddress: string;
    pickupPhone: string;
    deliveryAddress: string;
    deliveryPhone: string;
    details?: string;
    priority?: string;
    requestedDeliveryDate?: string;
    specialInstructions?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return this.handleResponse(response);
  }

  async updateOrder(orderId: string, orderData: any) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return this.handleResponse(response);
  }

  async cancelOrder(orderId: string) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getOrderTracking(orderId: string) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/tracking`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Deliveries (for dispatchers)
  async getDeliveries(params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/deliveries?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateDeliveryStatus(
    deliveryId: string,
    status: string,
    notes?: string,
  ) {
    const response = await fetch(
      `${API_BASE_URL}/deliveries/${deliveryId}/status`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, notes }),
      },
    );
    return this.handleResponse(response);
  }

  async getDeliveryStats() {
    const response = await fetch(`${API_BASE_URL}/deliveries/stats/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Admin routes
  async getAdminDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAnalyticsCharts(period: string = "7d") {
    const response = await fetch(
      `${API_BASE_URL}/admin/analytics/charts?period=${period}`,
      {
        headers: this.getAuthHeaders(),
      },
    );
    return this.handleResponse(response);
  }

  async getRecentActivities(limit: number = 20) {
    const response = await fetch(
      `${API_BASE_URL}/admin/activities/recent?limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      },
    );
    return this.handleResponse(response);
  }

  async getPerformanceMetrics() {
    const response = await fetch(`${API_BASE_URL}/admin/performance/metrics`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAlerts() {
    const response = await fetch(`${API_BASE_URL}/admin/alerts`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // User management (admin only)
  async getUsers(params?: {
    role?: string;
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUser(userId: string, userData: any) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return this.handleResponse(response);
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getDispatchers() {
    const response = await fetch(`${API_BASE_URL}/users/role/dispatchers`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async assignDelivery(deliveryId: string, dispatcherId: string) {
    const response = await fetch(
      `${API_BASE_URL}/deliveries/${deliveryId}/assign`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ dispatcherId }),
      },
    );
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
