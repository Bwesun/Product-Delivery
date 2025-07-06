import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonIcon,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from "@ionic/react";
import {
  cubeOutline,
  checkmarkCircleOutline,
  timeOutline,
  addCircleOutline,
  statsChartOutline,
  peopleOutline,
  ellipsisHorizontalCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";

import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

interface OrdersResponse {
  orders: RecentItem[]; // or `Order[]` if you use a different shape
}

interface DeliveriesResponse {
  deliveries: RecentItem[];
}

interface AdminDashboardStats {
  overview: {
    totalOrders: number;
    todayOrders: number;
  };
  statusDistribution: {
    orders: {
      _id: string;
      count: number;
    }[];
  };
  recentActivities: {
    orders: RecentItem[];
  };
}

interface AdminResponse {
  stats: AdminDashboardStats;
}


interface Stats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  today: number;
}

interface RecentItem {
  _id: string;
  product: string;
  status: string;
  createdAt: string;
  customerName?: string;
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
    today: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (user.role === "user") {
        // Load user's orders
        const ordersResponse = await apiService.getOrders() as OrdersResponse;
        const orders = ordersResponse.orders || [];

        setStats({
          total: orders.length,
          pending: orders.filter((o: any) => o.status === "Pending").length,
          inTransit: orders.filter((o: any) => o.status === "In Transit")
            .length,
          delivered: orders.filter((o: any) => o.status === "Delivered").length,
          today: orders.filter(
            (o: any) =>
              new Date(o.createdAt).toDateString() ===
              new Date().toDateString(),
          ).length,
        });

        setRecentItems(orders.slice(0, 5));
      } else if (user.role === "dispatcher") {
        // Load dispatcher's deliveries
        const deliveriesResponse = await apiService.getDeliveries() as DeliveriesResponse;
        const deliveries = deliveriesResponse.deliveries || [];

        setStats({
          total: deliveries.length,
          pending: deliveries.filter((d: any) => d.status === "Pending").length,
          inTransit: deliveries.filter((d: any) => d.status === "In Transit")
            .length,
          delivered: deliveries.filter((d: any) => d.status === "Delivered")
            .length,
          today: deliveries.filter(
            (d: any) =>
              new Date(d.createdAt).toDateString() ===
              new Date().toDateString(),
          ).length,
        });

        setRecentItems(deliveries.slice(0, 5));
      } else if (user.role === "admin") {
        // Load admin dashboard stats
        const adminResponse = await apiService.getAdminDashboardStats() as AdminResponse;
        const adminStats = adminResponse.stats;

        setStats({
          total: adminStats.overview.totalOrders,
          pending:
            adminStats.statusDistribution.orders.find(
              (s: any) => s._id === "Pending",
            )?.count || 0,
          inTransit:
            adminStats.statusDistribution.orders.find(
              (s: any) => s._id === "In Transit",
            )?.count || 0,
          delivered:
            adminStats.statusDistribution.orders.find(
              (s: any) => s._id === "Delivered",
            )?.count || 0,
          today: adminStats.overview.todayOrders,
        });

        setRecentItems(adminStats.recentActivities.orders.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadDashboardData();
    event.detail.complete();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "#4846a6",
      Confirmed: "#3880ff",
      Assigned: "#3880ff",
      "In Transit": "#ffc409",
      Delivered: "#2dd55b",
      Cancelled: "#eb445a",
    };
    return colors[status] || "#4846a6";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      Pending: ellipsisHorizontalCircleOutline,
      Confirmed: checkmarkCircleOutline,
      Assigned: checkmarkCircleOutline,
      "In Transit": timeOutline,
      Delivered: checkmarkCircleOutline,
      Cancelled: ellipsisHorizontalCircleOutline,
    };
    return icons[status] || ellipsisHorizontalCircleOutline;
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
    return `${greeting}, ${user?.name}!`;
  };

  const getQuickActions = () => {
    if (user?.role === "user") {
      return [
        {
          title: "Create Order",
          icon: addCircleOutline,
          action: () => history.push("/orders"),
          color: "primary",
        },
        {
          title: "Track Orders",
          icon: cubeOutline,
          action: () => history.push("/orders"),
          color: "secondary",
        },
      ];
    } else if (user?.role === "dispatcher") {
      return [
        {
          title: "View Deliveries",
          icon: cubeOutline,
          action: () => history.push("/deliveries"),
          color: "primary",
        },
        {
          title: "Update Status",
          icon: checkmarkCircleOutline,
          action: () => history.push("/deliveries"),
          color: "secondary",
        },
      ];
    } else if (user?.role === "admin") {
      return [
        {
          title: "Admin Dashboard",
          icon: statsChartOutline,
          action: () => history.push("/admin"),
          color: "primary",
        },
        {
          title: "Manage Users",
          icon: peopleOutline,
          action: () => history.push("/admin"),
          color: "secondary",
        },
        {
          title: "View Orders",
          icon: cubeOutline,
          action: () => history.push("/orders"),
          color: "success",
        },
      ];
    }
    return [];
  };

  if (!user) {
    return (
      <IonPage>
        <IonContent>
          <IonSpinner name="crescent" color={"primary"} /> Loading...</IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <Header
        title="Dashboard"
        bg="light"
        color="light"
        button="primary"
        textColor="dark"
        backButton={false}
      />
      <IonContent fullscreen className="light-bg">
        <IonRefresher color="primary" slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent color="light"></IonRefresherContent>
        </IonRefresher>

        <div className="ion-padding">
          {/* Welcome Section */}
          <IonCard
            style={{
              background: "linear-gradient(135deg, #4846a6 0%, #3880ff 100%)",
              color: "white",
              marginBottom: 20,
            }}
          >
            <IonCardContent style={{ padding: 20 }}>
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}>
                {getWelcomeMessage()}
              </h2>
              <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
                {user.role === "user" && "Manage your delivery orders"}
                {user.role === "dispatcher" && "Track and update deliveries"}
                {user.role === "admin" && "Monitor system performance"}
              </p>
            </IonCardContent>
          </IonCard>

          {/* Stats Overview */}
          <IonGrid style={{ padding: 0 }}>
            <IonRow>
              <IonCol size="6">
                <IonCard style={{ margin: 0, textAlign: "center", background: 'var(--ion-color-primary-tint)' }}>
                  <IonCardContent style={{ padding: 16 }}>
                    <IonIcon
                      icon={cubeOutline}
                      style={{
                        fontSize: 32,
                        color: "var(--ion-color-light)",
                        marginBottom: 8,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "var(--ion-color-light)",
                      }}
                    >
                      {stats.total}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--ion-color-light)" }}>
                      Total{" "}
                      {user.role === "user"
                        ? "Orders"
                        : user.role === "dispatcher"
                          ? "Deliveries"
                          : "Orders"}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="6">
                <IonCard style={{ margin: 0, textAlign: "center", background: 'var(--ion-color-secondary)' }}>
                  <IonCardContent style={{ padding: 16 }}>
                    <IonIcon
                      icon={timeOutline}
                      style={{
                        fontSize: 32,
                        color: "var(--ion-color-dark)",
                        marginBottom: 8,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "var(--ion-color-dark)",
                      }}
                    >
                      {stats.pending}
                    </div>
                    <div style={{ fontSize: 14, color: "#666" }}>Pending</div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="6">
                <IonCard style={{ margin: 0, textAlign: "center", background: '#3880ff' }}>
                  <IonCardContent style={{ padding: 16 }}>
                    <IonIcon
                      icon={timeOutline}
                      style={{
                        fontSize: 32,
                        color: "var(--ion-color-light)",
                        marginBottom: 8,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "var(--ion-color-light)",
                      }}
                    >
                      {stats.inTransit}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--ion-color-light)" }}>
                      In Transit
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="6">
                <IonCard style={{ margin: 0, textAlign: "center", background: '#2dd55b' }}>
                  <IonCardContent style={{ padding: 16 }}>
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      style={{
                        fontSize: 32,
                        color: "var(--ion-color-light)",
                        marginBottom: 8,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "var(--ion-color-light)",
                      }}
                    >
                      {stats.delivered}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--ion-color-light)" }}>Completed</div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Quick Actions */}
          <div className="mt-2 flex justify-center flex-col">
            <IonCardHeader>
              <IonCardTitle className="ion-padding" style={{ color: "var(--ion-color-primary)", fontSize: "1.2rem" }}>
                Quick Actions
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid style={{ padding: 0 }}>
                <IonRow>
                  {getQuickActions().map((action, index) => (
                    <IonCol className="mx-2 mb-2" size="5.5" key={index}>
                      <IonButton
                        expand="block"
                        color={action.color}
                        style={{
                          height: 80,
                          flexDirection: "column",
                          borderColor: action.color,
                        }}
                        onClick={action.action}
                      >
                        <IonIcon
                          icon={action.icon}
                          style={{
                            fontSize: 24,
                            marginBottom: 4,
                          }}
                          slot="start"
                        />
                        <span style={{ fontSize: 12 }}>
                          {action.title}
                        </span>
                      </IonButton>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </div>

          {/* Recent Activity */}
          {recentItems.length > 0 && (
            <div style={{
                marginBottom: '5rem',
              }} 
              className="ion-padding">
              <IonCardHeader>
                <IonCardTitle style={{ color: "#4846a6", fontSize: "1.2rem" }}>
                  Recent{" "}
                  {user.role === "user"
                    ? "Orders"
                    : user.role === "dispatcher"
                      ? "Deliveries"
                      : "Activity"}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                  {recentItems.map((item) => (
                    <IonItem key={item._id} lines="none">
                      <IonIcon
                        icon={getStatusIcon(item.status)}
                        slot="start"
                        style={{ color: getStatusColor(item.status) }}
                      />
                      <IonLabel>
                        <h3 style={{ color: "#4846a6", fontWeight: 600 }}>
                          {item.product}
                        </h3>
                        <p style={{ color: "#666" }}>
                          {item.customerName &&
                            `Customer: ${item.customerName} • `}
                          <span
                            style={{
                              color: getStatusColor(item.status),
                              fontWeight: 600,
                            }}
                          >
                            {item.status}
                          </span>
                        </p>
                        <p style={{ color: "#999", fontSize: "0.85rem" }}>
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </IonLabel>
                    </IonItem>
                  ))}
                  
              </IonCardContent>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
