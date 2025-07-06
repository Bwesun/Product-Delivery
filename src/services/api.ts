const API_BASE_URL = "http://localhost:4000/api";

class ApiService {
  private getAuthHeaders(token?: string): HeadersInit {
    const authToken = token || localStorage.getItem("firebaseToken");
    return {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
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
  async createOrUpdateProfile(
    userData: {
      uid: string;
      name: string;
      email: string;
      role?: string;
      phone?: string;
      address?: string;
      avatar?: string;
    },
    token: string,
  ) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async getUserProfile(uid: string) {
    const response = await fetch(`${API_BASE_URL}/auth/profile/${uid}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProfile(
    uid: string,
    userData: {
      name?: string;
      phone?: string;
      address?: string;
      avatar?: string;
    },
  ) {
    const response = await fetch(`${API_BASE_URL}/auth/profile/${uid}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  // Orders (for users)
  async getOrders(
    uid: string,
    params?: {
      status?: string;
      search?: string;
    },
  ) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/orders/${uid}?${queryParams}`,
      {
        headers: this.getAuthHeaders(),
      },
    );
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
    customerId: string;
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

  async getDeliveryStats(uid: string) {
    const response = await fetch(`${API_BASE_URL}/deliveries/stats/${uid}`, {
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

  async updateUser(uid: string, userData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${uid}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async deleteUser(uid: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${uid}`, {
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
