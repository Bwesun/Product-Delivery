import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonText,
  IonSearchbar,
  IonLoading,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  cubeOutline,
  addCircleOutline,
  closeOutline,
  timeOutline,
  checkmarkCircleOutline,
  ellipsisHorizontalCircleOutline,
  callOutline,
} from "ionicons/icons";

import Header from "../components/Header";
import { apiService } from "../services/api";

type Order = {
  _id: string;
  product: string;
  status: string;
  pickupAddress: string;
  pickupPhone: string;
  deliveryAddress: string;
  deliveryPhone: string;
  details?: string;
  priority: string;
  createdAt: string;
};

type OrdersResponse = {
  orders: Order[];
};


const statusColors: Record<string, string> = {
  "In Transit": "#ffc409",
  Delivered: "#2dd55b",
  Pending: "#4846a6",
  Confirmed: "#3880ff",
  Cancelled: "#eb445a",
};

const statusIcons: Record<string, string> = {
  "In Transit": timeOutline,
  Delivered: checkmarkCircleOutline,
  Pending: ellipsisHorizontalCircleOutline,
  Confirmed: checkmarkCircleOutline,
  Cancelled: closeOutline,
};

const statusOptions = [
  "All",
  "Pending",
  "Confirmed",
  "In Transit",
  "Delivered",
  "Cancelled",
];

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [form, setForm] = useState({
    product: "",
    pickupAddress: "",
    pickupPhone: "",
    deliveryAddress: "",
    deliveryPhone: "",
    details: "",
    priority: "Medium",
  });
  const [formError, setFormError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrders({
        status: filterStatus !== "All" ? filterStatus : undefined,
        search: searchText || undefined,
      }) as OrdersResponse;
      setOrders(response.orders || []);
    } catch (error: any) {
      setToastMessage(error.message || "Failed to load orders");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadOrders();
    event.detail.complete();
  };

  const handleInput = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError("");
  };

  const resetForm = () => {
    setForm({
      product: "",
      pickupAddress: "",
      pickupPhone: "",
      deliveryAddress: "",
      deliveryPhone: "",
      details: "",
      priority: "Medium",
    });
    setFormError("");
  };

  const handleCreateOrder = async () => {
    if (
      !form.product.trim() ||
      !form.pickupAddress.trim() ||
      !form.deliveryAddress.trim()
    ) {
      setFormError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await apiService.createOrder(form);
      setShowModal(false);
      resetForm();
      await loadOrders();
      setToastMessage("Order created successfully!");
      setShowToast(true);
    } catch (error: any) {
      setFormError(error.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setLoading(true);
      await apiService.cancelOrder(orderId);
      setShowDetailsModal(false);
      await loadOrders();
      setToastMessage("Order cancelled successfully");
      setShowToast(true);
    } catch (error: any) {
      setToastMessage(error.message || "Failed to cancel order");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadOrders();
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    if (searchText === "") return true;
    return (
      order.product.toLowerCase().includes(searchText.toLowerCase()) ||
      order.status.toLowerCase().includes(searchText.toLowerCase()) ||
      order.pickupAddress.toLowerCase().includes(searchText.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <IonPage>
      <Header
        title="My Orders"
        bg="light"
        color="light"
        button="primary"
        textColor="dark"
        backButton={true}
      />
      <IonContent fullscreen className="light-bg">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="ion-padding">
          <IonButton
            expand="block"
            color="secondary"
            style={{
              borderRadius: 12,
              fontWeight: 700,
              background: "#ffb900",
              color: "#4846a6",
              marginBottom: 24,
            }}
            onClick={() => setShowModal(true)}
          >
            <IonIcon icon={addCircleOutline} slot="start" />
            Create New Order
          </IonButton>

          {/* Search and Filter */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <IonSearchbar
              color={"primary"}
              value={searchText}
              onIonInput={(e) => setSearchText(e.detail.value ?? "")}
              onIonChange={handleSearch}
              placeholder="Search orders"
              style={{ flex: 3, borderRadius: "1rem", minWidth: 0 }}
            />
            <IonSelect
              value={filterStatus}
              onIonChange={(e) => setFilterStatus(e.detail.value)}
              style={{ flex: 1, display: "flex" }}
            >
              <div slot="label">
                <IonText color={"medium"}>Filter:</IonText>
              </div>
              {statusOptions.map((status) => (
                <IonSelectOption key={status} value={status}>
                  {status}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {filteredOrders.length === 0 && !loading && (
            <IonItem lines="none">
              <IonLabel>
                <IonText color="medium">No orders found.</IonText>
              </IonLabel>
            </IonItem>
          )}

          {filteredOrders.map((order) => (
            <IonItem
              className="mb-4"
              key={order._id}
              button
              onClick={() => {
                setSelectedOrder(order);
                setShowDetailsModal(true);
              }}
            >
              <IonIcon
                icon={cubeOutline}
                slot="start"
                style={{
                  fontSize: 28,
                  color: statusColors[order.status] || "#4846a6",
                  marginRight: 8,
                }}
              />
              <IonLabel color={"primary"}>
                <div style={{ fontWeight: 600, color: "#4846a6" }}>
                  {order.product}
                </div>
                <IonText color="medium" style={{ fontSize: 13 }}>
                  <IonIcon
                    icon={statusIcons[order.status]}
                    style={{
                      fontSize: 15,
                      verticalAlign: "middle",
                      marginRight: 4,
                      color: statusColors[order.status],
                    }}
                  />
                  {new Date(order.createdAt).toLocaleDateString()} &nbsp;|&nbsp;
                  <span
                    style={{
                      color: statusColors[order.status],
                      fontWeight: 600,
                    }}
                  >
                    {order.status}
                  </span>
                </IonText>
              </IonLabel>
            </IonItem>
          ))}
        </div>

        {/* CREATE ORDER MODAL */}
        <IonModal color="light" isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
              <IonToolbar color={"primary"}>
                <IonTitle className="ion-padding" color={"secondary"}>New Order Request</IonTitle>
                <IonButton
                  slot="end"
                  fill="clear"
                  color="light"
                  onClick={() => setShowModal(false)}
                >
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonToolbar>
            </IonHeader>
            <IonContent className="light-bg ion-padding">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <IonInput
                    label="Product Name"
                    labelPlacement="floating"
                    placeholder="Enter product name"
                    value={form.product}
                    onIonInput={(e) => handleInput("product", e.detail.value!)}
                    style={{
                      borderRadius: 0,
                      padding: 10,
                    }}
                  />

                  <IonInput
                    label="Pickup Address"
                    labelPlacement="floating"
                    placeholder="Enter pickup address"
                    value={form.pickupAddress}
                    onIonInput={(e) =>
                      handleInput("pickupAddress", e.detail.value!)
                    }
                    style={{
                      borderRadius: 0,
                      padding: 10,
                    }}
                  />

                  <IonInput
                    label="Pickup Phone"
                    labelPlacement="floating"
                    placeholder="Enter pickup phone number"
                    value={form.pickupPhone}
                    onIonInput={(e) => handleInput("pickupPhone", e.detail.value!)}
                    style={{
                      borderRadius: 0,
                      padding: 10,
                    }}
                  />

                  <IonInput
                    label="Delivery Address"
                    labelPlacement="floating"
                    placeholder="Enter delivery address"
                    value={form.deliveryAddress}
                    onIonInput={(e) =>
                      handleInput("deliveryAddress", e.detail.value!)
                    }
                    style={{
                      borderRadius: 0,
                      padding: 10,
                    }}
                  />

                  <IonInput
                    label="Delivery Phone"
                    labelPlacement="floating"
                    placeholder="Enter delivery phone number"
                    value={form.deliveryPhone}
                    onIonInput={(e) =>
                      handleInput("deliveryPhone", e.detail.value!)
                    }
                    style={{
                      borderRadius: 0,
                      padding: 10,
                    }}
                  />

                  <IonSelect
                    label="Priority"
                    labelPlacement="floating"
                    value={form.priority}
                    onIonChange={(e) => handleInput("priority", e.detail.value)}
                    style={{
                      borderRadius: 0,
                      padding: 10,
                    }}
                  >
                    <IonSelectOption value="Low">Low</IonSelectOption>
                    <IonSelectOption value="Medium">Medium</IonSelectOption>
                    <IonSelectOption value="High">High</IonSelectOption>
                  </IonSelect>

                  <IonTextarea
                    label="Additional Details (Optional)"
                    labelPlacement="floating"
                    placeholder="Enter any additional details"
                    value={form.details}
                    onIonInput={(e) => handleInput("details", e.detail.value!)}
                    style={{
                      borderRadius: 0,
                      padding: 10,
                    }}
                    rows={3}
                  />

                  {formError && (
                    <IonText
                      color="danger"
                      style={{ fontSize: 14, textAlign: "center" }}
                    >
                      {formError}
                    </IonText>
                  )}

                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={() => setShowModal(false)}
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </IonButton>
                    <IonButton
                      expand="block"
                      onClick={handleCreateOrder}
                      style={{ flex: 1 }}
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Order"}
                    </IonButton>
                  </div>
                </div>
            </IonContent>
        </IonModal>

        {/* ORDER DETAILS MODAL */}
        <IonModal
          isOpen={showDetailsModal}
          onDidDismiss={() => setShowDetailsModal(false)}
        >
          <IonHeader>
              <IonToolbar color={"primary"}>
                <IonTitle className="ion-padding" color={"secondary"}>Delivery Request Details</IonTitle>
                <IonButton
                  slot="end"
                  fill="clear"
                  color="light"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonToolbar>
            </IonHeader>
            <IonContent className="light-bg ion-padding">

            {selectedOrder && (
              <>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                        <IonIcon
                        icon={cubeOutline}
                        style={{
                            fontSize: 36,
                            color: "#4846a6",
                            marginRight: 14,
                            background: "#f2f2fa",
                            borderRadius: "50%",
                            padding: 8,
                        }}
                        />
                        <div>
                        <h2 style={{ color: "#4846a6", fontWeight: 700, margin: 0 }}>
                            {selectedOrder.product}
                        </h2>
                        <span
                            style={{
                            display: "inline-flex",
                            alignItems: "center",
                            fontWeight: 600,
                            color: statusColors[selectedOrder.status],
                            fontSize: 15,
                            marginTop: 2,
                            }}
                        >
                            <IonIcon
                            icon={statusIcons[selectedOrder.status]}
                            style={{
                                fontSize: 18,
                                verticalAlign: "middle",
                                marginRight: 4,
                                color: statusColors[selectedOrder.status],
                            }}
                            />
                            {selectedOrder.status}
                        </span>
                        </div>
                    </div>
                    <div
                        style={{
                        borderTop: "1px solid #ececf6",
                        paddingTop: 16,
                        marginTop: 8,
                        fontSize: 15,
                        color: "#4846a6",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                        <IonIcon icon={timeOutline} style={{ marginRight: 8, color: "#4846a6" }} />
                        <span>
                            <strong>Date:</strong> {selectedOrder.createdAt}
                        </span>
                        </div>
                        {selectedOrder.details && (
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                            <IonIcon icon={ellipsisHorizontalCircleOutline} style={{ marginRight: 8, color: "#4846a6" }} />
                            <span>
                            <strong>Details:</strong> {selectedOrder.details}
                            </span>
                        </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                        <IonIcon icon={cubeOutline} style={{ marginRight: 8, color: "#4846a6" }} />
                        <span>
                            <strong>Pickup Address:</strong> {selectedOrder.pickupAddress}
                        </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                        <IonIcon icon={callOutline} style={{ marginRight: 8, color: "#4846a6" }} />
                        <span>
                            <strong>Pickup Phone:</strong> {selectedOrder.pickupPhone}
                        </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                        <IonIcon icon={cubeOutline} style={{ marginRight: 8, color: "#4846a6" }} />
                        <span>
                            <strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}
                        </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                        <IonIcon icon={callOutline} style={{ marginRight: 8, color: "#4846a6" }} />
                        <span>
                            <strong>Delivery Phone:</strong> {selectedOrder.deliveryPhone}
                        </span>
                        </div>
                    </div>
                    </>
            )}
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

export default Orders;
