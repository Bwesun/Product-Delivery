const API_BASE_URL = "http://localhost:4000/api";

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
        .catch(() => ({ error: "Network error" }));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
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
  async getOrders(params?: { status?: string; search?: string }) {
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
    const response = await fetch(`${API_BASE_URL}/orders/tracking/${orderId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Deliveries (for dispatchers)
  async getDeliveries(params?: {
    status?: string;
    search?: string;
    dispatcherId?: string;
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

  async getDeliveryStats() {
    const response = await fetch(`${API_BASE_URL}/deliveries/stats`, {
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

  async getAnalyticsData(period: string = "7d") {
    const response = await fetch(
      `${API_BASE_URL}/admin/analytics?period=${period}`,
      {
        headers: this.getAuthHeaders(),
      },
    );
    return this.handleResponse(response);
  }

  // User management (admin only)
  async getUsers(params?: {
    role?: string;
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

    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUser(userId: string, userData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getDispatchers() {
    const response = await fetch(`${API_BASE_URL}/admin/dispatchers`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
