import {
  IonPage,
  IonContent,
  IonAvatar,
  IonText,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonModal,
  IonInput,
  IonLoading,
  IonToast,
  IonHeader,
  IonToolbar,
} from "@ionic/react";
import {
  pencilOutline,
  mailOutline,
  callOutline,
  locationOutline,
  logOutOutline,
  cubeOutline,
  timeOutline,
  closeOutline,
  personOutline,
} from "ionicons/icons";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

interface RecentOrder {
  _id: string;
  product: string;
  status: string;
  createdAt: string;
}

interface OrdersResponse {
  orders: RecentOrder[];
}

const Profile: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const history = useHistory();
  const [showEditModal, setShowEditModal] = useState(false);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    avatar: "",
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar || "",
      });
      loadRecentOrders();
    }
  }, [user]);

  const loadRecentOrders = async () => {
    if (user?.role !== "user") return;

    try {
      const response = await apiService.getOrders() as OrdersResponse;
      setRecentOrders((response.orders || []).slice(0, 3));
    } catch (error: any) {
      console.error("Failed to load recent orders:", error);
    }
  };

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await updateProfile(editForm);
      setShowEditModal(false);
      setToastMessage("Profile updated successfully!");
      setShowToast(true);
    } catch (error: any) {
      setToastMessage(error.message || "Failed to update profile");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "#4846a6",
      Confirmed: "#3880ff",
      "In Transit": "#ffc409",
      Delivered: "#2dd55b",
      Cancelled: "#eb445a",
    };
    return colors[status] || "#4846a6";
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      user: "Customer",
      dispatcher: "Dispatcher",
      admin: "Administrator",
    };
    return roleNames[role] || role;
  };

  if (!user) {
    return (
      <IonPage>
        <IonContent>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <IonText>Loading...</IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <Header bg="light" title="Profile" color="light" backButton={true} />
      <IonContent fullscreen className="light-bg">
        <IonGrid className="ion-padding">
          <IonRow className="ion-justify-content-center ion-margin-top">
            <IonCol size="12" className="ion-text-center">
              <IonAvatar
                style={{
                  width: 110,
                  height: 110,
                  margin: "0 auto",
                  boxShadow: "0 4px 24px rgba(72,70,166,0.15)",
                  border: "4px solid var(--ion-color-secondary)",
                }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" />
                ) : (
                  <IonIcon
                    icon={personOutline}
                    style={{ fontSize: 60, color: "#4846a6" }}
                  />
                )}
              </IonAvatar>
              <IonText
                color={"dark"}
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  marginTop: 16,
                  display: "block",
                }}
              >
                {user.name}
              </IonText>
              <IonText
                color="medium"
                style={{ fontSize: "1rem", display: "block", marginTop: 4 }}
              >
                {getRoleDisplayName(user.role)}
              </IonText>
              <IonButton
                color="primary"
                size="small"
                style={{ marginTop: 12, borderRadius: 20, fontWeight: 600 }}
                fill="outline"
                onClick={() => setShowEditModal(true)}
              >
                <IonIcon icon={pencilOutline} slot="start" />
                Edit Profile
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <IonItem
                lines="none"
                style={{
                  marginTop: 24,
                  borderRadius: 16,
                  boxShadow: "0 2px 12px rgba(72,70,166,0.06)",
                }}
              >
                <IonIcon
                  icon={mailOutline}
                  slot="start"
                  color="primary"
                  style={{ fontSize: 22 }}
                />
                <IonLabel>
                  <IonText color="medium" style={{ fontSize: 13 }}>
                    Email
                  </IonText>
                  <div style={{ fontWeight: 600 }}>{user.email}</div>
                </IonLabel>
              </IonItem>

              {user.phone && (
                <IonItem
                  lines="none"
                  style={{
                    marginTop: 24,
                    borderRadius: 16,
                    boxShadow: "0 2px 12px rgba(72,70,166,0.06)",
                  }}
                >
                  <IonIcon
                    icon={callOutline}
                    slot="start"
                    color="primary"
                    style={{ fontSize: 22 }}
                  />
                  <IonLabel>
                    <IonText color="medium" style={{ fontSize: 13 }}>
                      Phone
                    </IonText>
                    <div style={{ fontWeight: 600 }}>{user.phone}</div>
                  </IonLabel>
                </IonItem>
              )}

              {user.address && (
                <IonItem
                  lines="none"
                  style={{
                    marginTop: 24,
                    borderRadius: 16,
                    boxShadow: "0 2px 12px rgba(72,70,166,0.06)",
                  }}
                >
                  <IonIcon
                    icon={locationOutline}
                    slot="start"
                    color="primary"
                    style={{ fontSize: 22 }}
                  />
                  <IonLabel>
                    <IonText color="medium" style={{ fontSize: 13 }}>
                      Address
                    </IonText>
                    <div style={{ fontWeight: 600 }}>{user.address}</div>
                  </IonLabel>
                </IonItem>
              )}

              {/* Recent Orders for Users */}
              {user.role === "user" && recentOrders.length > 0 && (
                <IonCard
                  style={{
                    marginTop: 32,
                    borderRadius: 16,
                    boxShadow: "0 2px 12px rgba(72,70,166,0.06)",
                  }}
                >
                  <IonCardHeader>
                    <IonCardTitle
                      className="ion-padding"
                      color={"primary"}
                      style={{ fontWeight: 700, fontSize: "1.2rem" }}
                    >
                      Recent Orders
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {recentOrders.map((order) => (
                      <IonItem
                        lines="none"
                        style={{
                          marginTop: 16,
                          borderRadius: 16,
                          boxShadow: "0 2px 12px rgba(72,70,166,0.06)",
                        }}
                        key={order._id}
                      >
                        <IonIcon
                          icon={cubeOutline}
                          slot="start"
                          style={{
                            fontSize: 28,
                            color: getStatusColor(order.status),
                            marginRight: 8,
                          }}
                        />
                        <IonLabel>
                          <div style={{ fontWeight: 600, color: "#4846a6" }}>
                            {order.product}
                          </div>
                          <IonText color="medium" style={{ fontSize: 13 }}>
                            <IonIcon
                              icon={timeOutline}
                              style={{
                                fontSize: 15,
                                verticalAlign: "middle",
                                marginRight: 4,
                              }}
                            />
                            {new Date(order.createdAt).toLocaleDateString()}{" "}
                            &nbsp;|&nbsp;
                            <span
                              style={{
                                color: getStatusColor(order.status),
                                fontWeight: 600,
                              }}
                            >
                              {order.status}
                            </span>
                          </IonText>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonCardContent>
                </IonCard>
              )}

              <IonButton
                expand="block"
                color="danger"
                style={{
                  marginTop: 32,
                  borderRadius: 16,
                  fontWeight: 700,
                }}
                onClick={handleLogout}
              >
                <IonIcon icon={logOutOutline} slot="start" />
                Logout
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Edit Profile Modal */}
        <IonModal
          isOpen={showEditModal}
          onDidDismiss={() => setShowEditModal(false)}
        >
            <IonHeader>
              <IonToolbar color={'primary'}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <IonText className="ion-padding-start" color={"secondary"}>
                    <h2>Edit Profile</h2>
                  </IonText>
                  <IonButton fill="clear" onClick={() => setShowEditModal(false)}>
                    <IonIcon color="secondary" icon={closeOutline} />
                  </IonButton>
                </div>
              </IonToolbar>
            </IonHeader>

          <IonContent className="light-bg ion-padding">
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
              <IonInput
                label="Avatar URL"
                labelPlacement="floating"
                value={editForm.avatar}
                onIonInput={(e) =>
                  setEditForm({ ...editForm, avatar: e.detail.value! })
                }
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 10,
                }}
              />

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={() => setShowEditModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </IonButton>
                <IonButton
                  expand="block"
                  onClick={handleUpdateProfile}
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </IonButton>
              </div>
            </div>
          </IonContent>
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

export default Profile;
