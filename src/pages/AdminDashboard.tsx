import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonIcon,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonLoading,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  peopleOutline,
  cubeOutline,
  checkmarkCircleOutline,
  timeOutline,
  statsChartOutline,
  addCircleOutline,
  closeOutline,
  eyeOutline,
  createOutline,
  trashOutline,
} from "ionicons/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

import Header from "../components/Header";
import { apiService } from "../services/api";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalDeliveries: number;
    todayOrders: number;
    todayDeliveries: number;
  };
  statusDistribution: {
    orders: Array<{ _id: string; count: number }>;
    deliveries: Array<{ _id: string; count: number }>;
  };
  userRoles: Array<{ _id: string; count: number }>;
  recentActivities: {
    orders: any[];
    deliveries: any[];
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("dashboard");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    isActive: true,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedSegment === "users") {
      loadUsers();
    }
  }, [selectedSegment]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminDashboardStats();
      setStats(response.stats);
    } catch (error: any) {
      setToastMessage(error.message || "Failed to load dashboard data");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response.users || []);
    } catch (error: any) {
      setToastMessage(error.message || "Failed to load users");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    if (selectedSegment === "dashboard") {
      await loadDashboardData();
    } else if (selectedSegment === "users") {
      await loadUsers();
    }
    event.detail.complete();
  };

  const openUserModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setEditForm({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
        isActive: user.isActive,
      });
    } else {
      setSelectedUser(null);
      setEditForm({
        name: "",
        email: "",
        role: "user",
        phone: "",
        address: "",
        isActive: true,
      });
    }
    setShowUserModal(true);
  };

  const handleUserUpdate = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await apiService.updateUser(selectedUser._id, editForm);
      setShowUserModal(false);
      await loadUsers();
      setToastMessage("User updated successfully!");
      setShowToast(true);
    } catch (error: any) {
      setToastMessage(error.message || "Failed to update user");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUserDelete = async (userId: string) => {
    try {
      setLoading(true);
      await apiService.deleteUser(userId);
      await loadUsers();
      setToastMessage("User deleted successfully!");
      setShowToast(true);
    } catch (error: any) {
      setToastMessage(error.message || "Failed to delete user");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const ordersChartData = {
    labels: stats?.statusDistribution.orders.map((item) => item._id) || [],
    datasets: [
      {
        label: "Orders",
        data: stats?.statusDistribution.orders.map((item) => item.count) || [],
        backgroundColor: [
          "#4846a6",
          "#3880ff",
          "#ffc409",
          "#2dd55b",
          "#eb445a",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const deliveriesChartData = {
    labels: stats?.statusDistribution.deliveries.map((item) => item._id) || [],
    datasets: [
      {
        label: "Deliveries",
        data:
          stats?.statusDistribution.deliveries.map((item) => item.count) || [],
        backgroundColor: [
          "#4846a6",
          "#3880ff",
          "#ffc409",
          "#2dd55b",
          "#eb445a",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const userRolesChartData = {
    labels:
      stats?.userRoles.map(
        (item) => item._id.charAt(0).toUpperCase() + item._id.slice(1),
      ) || [],
    datasets: [
      {
        label: "Users by Role",
        data: stats?.userRoles.map((item) => item.count) || [],
        backgroundColor: ["#4846a6", "#3880ff", "#ffc409"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
  };

  const renderDashboard = () => (
    <div>
      {/* Overview Cards */}
      <IonGrid>
        <IonRow>
          <IonCol size="6" sizeMd="3">
            <IonCard
              style={{
                background: "linear-gradient(135deg, #4846a6 0%, #3880ff 100%)",
                color: "white",
              }}
            >
              <IonCardContent style={{ textAlign: "center", padding: 16 }}>
                <IonIcon
                  icon={peopleOutline}
                  style={{ fontSize: 32, marginBottom: 8 }}
                />
                <div style={{ fontSize: 24, fontWeight: "bold" }}>
                  {stats?.overview.totalUsers || 0}
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>Total Users</div>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="6" sizeMd="3">
            <IonCard
              style={{
                background: "linear-gradient(135deg, #ffc409 0%, #ffb900 100%)",
                color: "white",
              }}
            >
              <IonCardContent style={{ textAlign: "center", padding: 16 }}>
                <IonIcon
                  icon={cubeOutline}
                  style={{ fontSize: 32, marginBottom: 8 }}
                />
                <div style={{ fontSize: 24, fontWeight: "bold" }}>
                  {stats?.overview.totalOrders || 0}
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>Total Orders</div>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="6" sizeMd="3">
            <IonCard
              style={{
                background: "linear-gradient(135deg, #2dd55b 0%, #1bda4c 100%)",
                color: "white",
              }}
            >
              <IonCardContent style={{ textAlign: "center", padding: 16 }}>
                <IonIcon
                  icon={checkmarkCircleOutline}
                  style={{ fontSize: 32, marginBottom: 8 }}
                />
                <div style={{ fontSize: 24, fontWeight: "bold" }}>
                  {stats?.overview.totalDeliveries || 0}
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  Total Deliveries
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="6" sizeMd="3">
            <IonCard
              style={{
                background: "linear-gradient(135deg, #eb445a 0%, #dc3545 100%)",
                color: "white",
              }}
            >
              <IonCardContent style={{ textAlign: "center", padding: 16 }}>
                <IonIcon
                  icon={timeOutline}
                  style={{ fontSize: 32, marginBottom: 8 }}
                />
                <div style={{ fontSize: 24, fontWeight: "bold" }}>
                  {stats?.overview.todayOrders || 0}
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>Today's Orders</div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      {/* Charts */}
      <IonGrid>
        <IonRow>
          <IonCol size="12" sizeMd="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Order Status Distribution</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ height: 250 }}>
                  <Doughnut data={ordersChartData} options={chartOptions} />
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="12" sizeMd="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Delivery Status Distribution</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ height: 250 }}>
                  <Doughnut data={deliveriesChartData} options={chartOptions} />
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="12">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Users by Role</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ height: 300 }}>
                  <Bar data={userRolesChartData} options={chartOptions} />
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      {/* Recent Activities */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Recent Activities</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText color="medium">
            <p>
              Recent orders and deliveries will be displayed here in real-time.
            </p>
          </IonText>
        </IonCardContent>
      </IonCard>
    </div>
  );

  const renderUsers = () => (
    <div>
      <IonCard>
        <IonCardHeader
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IonCardTitle>User Management</IonCardTitle>
          <IonButton size="small" onClick={() => openUserModal()}>
            <IonIcon icon={addCircleOutline} slot="start" />
            Add User
          </IonButton>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            {users.map((user) => (
              <IonItem key={user._id}>
                <IonLabel>
                  <h2 style={{ fontWeight: 600 }}>{user.name}</h2>
                  <p>{user.email}</p>
                  <IonText
                    color={
                      user.role === "admin"
                        ? "danger"
                        : user.role === "dispatcher"
                          ? "warning"
                          : "primary"
                    }
                  >
                    <strong>{user.role.toUpperCase()}</strong>
                  </IonText>
                  {!user.isActive && (
                    <IonText color="medium"> • Inactive</IonText>
                  )}
                </IonLabel>
                <div slot="end" style={{ display: "flex", gap: 8 }}>
                  <IonButton
                    size="small"
                    fill="outline"
                    onClick={() => openUserModal(user)}
                  >
                    <IonIcon icon={createOutline} />
                  </IonButton>
                  <IonButton
                    size="small"
                    fill="outline"
                    color="danger"
                    onClick={() => handleUserDelete(user._id)}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </div>
              </IonItem>
            ))}
          </IonList>
        </IonCardContent>
      </IonCard>
    </div>
  );

  return (
    <IonPage>
      <Header
        title="Admin Dashboard"
        bg="light"
        color="light"
        button="primary"
        textColor="dark"
        backButton={false}
      />
      <IonContent fullscreen className="light-bg">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="ion-padding">
          <IonSegment
            value={selectedSegment}
            onIonChange={(e) => setSelectedSegment(e.detail.value as string)}
          >
            <IonSegmentButton value="dashboard">
              <IonIcon icon={statsChartOutline} />
              <IonLabel>Dashboard</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="users">
              <IonIcon icon={peopleOutline} />
              <IonLabel>Users</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <div style={{ marginTop: 20 }}>
            {selectedSegment === "dashboard" && renderDashboard()}
            {selectedSegment === "users" && renderUsers()}
          </div>
        </div>

        {/* User Modal */}
        <IonModal
          isOpen={showUserModal}
          onDidDismiss={() => setShowUserModal(false)}
        >
          <div style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2 style={{ margin: 0, color: "#4846a6" }}>
                {selectedUser ? "Edit User" : "Add User"}
              </h2>
              <IonButton fill="clear" onClick={() => setShowUserModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <IonInput
                label="Name"
                labelPlacement="floating"
                value={editForm.name}
                onIonInput={(e) =>
                  setEditForm({ ...editForm, name: e.detail.value! })
                }
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 10,
                }}
              />
              <IonInput
                label="Email"
                labelPlacement="floating"
                value={editForm.email}
                onIonInput={(e) =>
                  setEditForm({ ...editForm, email: e.detail.value! })
                }
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 10,
                }}
              />
              <IonInput
                label="Phone"
                labelPlacement="floating"
                value={editForm.phone}
                onIonInput={(e) =>
                  setEditForm({ ...editForm, phone: e.detail.value! })
                }
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 10,
                }}
              />
              <IonInput
                label="Address"
                labelPlacement="floating"
                value={editForm.address}
                onIonInput={(e) =>
                  setEditForm({ ...editForm, address: e.detail.value! })
                }
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 10,
                }}
              />
              <IonSelect
                label="Role"
                labelPlacement="floating"
                value={editForm.role}
                onIonChange={(e) =>
                  setEditForm({ ...editForm, role: e.detail.value })
                }
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                <IonSelectOption value="user">User</IonSelectOption>
                <IonSelectOption value="dispatcher">Dispatcher</IonSelectOption>
                <IonSelectOption value="admin">Admin</IonSelectOption>
              </IonSelect>
              <IonSelect
                label="Status"
                labelPlacement="floating"
                value={editForm.isActive}
                onIonChange={(e) =>
                  setEditForm({ ...editForm, isActive: e.detail.value })
                }
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                <IonSelectOption value={true}>Active</IonSelectOption>
                <IonSelectOption value={false}>Inactive</IonSelectOption>
              </IonSelect>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={() => setShowUserModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </IonButton>
                <IonButton
                  expand="block"
                  onClick={handleUserUpdate}
                  style={{ flex: 1 }}
                  disabled={loading || !selectedUser}
                >
                  {loading ? "Updating..." : "Update User"}
                </IonButton>
              </div>
            </div>
          </div>
        </IonModal>

        <IonLoading isOpen={loading} message="Please wait..." />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastMessage.includes("success") ? "success" : "danger"}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;
