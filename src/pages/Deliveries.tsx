import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonText,
  IonSearchbar,
  IonLoading,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonButton,
  IonTextarea,
} from "@ionic/react";
import {
  cubeOutline,
  closeOutline,
  timeOutline,
  checkmarkCircleOutline,
  ellipsisHorizontalCircleOutline,
} from "ionicons/icons";
import { callOutline as callIcon } from "ionicons/icons";

import Header from "../components/Header";
import { apiService } from "../services/api";

type Delivery = {
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
  customerName: string;
  dispatcherName: string;
  trackingNumber: string;
};

const statusColors: Record<string, string> = {
  "In Transit": "#ffc409",
  Delivered: "#2dd55b",
  Pending: "#4846a6",
  Assigned: "#3880ff",
  Cancelled: "#eb445a",
};

const statusIcons: Record<string, string> = {
  "In Transit": timeOutline,
  Delivered: checkmarkCircleOutline,
  Pending: ellipsisHorizontalCircleOutline,
  Assigned: checkmarkCircleOutline,
  Cancelled: closeOutline,
};

const statusOptions = [
  "All",
  "Pending",
  "Assigned",
  "In Transit",
  "Delivered",
  "Cancelled",
];

type DeliveryResponse = {
  deliveries: Delivery[];
};

const Deliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadDeliveries();
  }, [filterStatus]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDeliveries({
        status: filterStatus !== "All" ? filterStatus : undefined,
        search: searchText || undefined,
      }) as DeliveryResponse;;
      setDeliveries(response.deliveries || []);
    } catch (error: any) {
      setToastMessage(error.message || "Failed to load deliveries");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadDeliveries();
    event.detail.complete();
  };

  const handleSearch = () => {
    loadDeliveries();
  };

  const handleUpdateStatus = async () => {
    if (!selectedDelivery || !newStatus) return;

    try {
      setLoading(true);
      await apiService.updateDeliveryStatus(
        selectedDelivery._id,
        newStatus,
        notes,
      );
      setShowDetailsModal(false);
      setNotes("");
      setNewStatus("");
      await loadDeliveries();
      setToastMessage("Delivery status updated successfully!");
      setShowToast(true);
    } catch (error: any) {
      setToastMessage(error.message || "Failed to update status");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const openDeliveryDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setNewStatus(delivery.status);
    setShowDetailsModal(true);
  };

  // Filter deliveries based on search
  const filteredDeliveries = deliveries.filter((delivery) => {
    if (searchText === "") return true;
    return (
      delivery.product.toLowerCase().includes(searchText.toLowerCase()) ||
      delivery.status.toLowerCase().includes(searchText.toLowerCase()) ||
      delivery.pickupAddress.toLowerCase().includes(searchText.toLowerCase()) ||
      delivery.deliveryAddress
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <IonPage>
      <Header
        title="Deliveries"
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
              placeholder="Search deliveries"
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

          {filteredDeliveries.length === 0 && !loading && (
            <IonItem lines="none">
              <IonLabel>
                <IonText color="medium">No deliveries found.</IonText>
              </IonLabel>
            </IonItem>
          )}

          {filteredDeliveries.map((delivery) => (
            <IonItem
              className="mb-4"
              key={delivery._id}
              button
              onClick={() => openDeliveryDetails(delivery)}
            >
              <IonIcon
                icon={cubeOutline}
                slot="start"
                style={{
                  fontSize: 28,
                  color: statusColors[delivery.status] || "#4846a6",
                  marginRight: 8,
                }}
              />
              <IonLabel color={"primary"}>
                <div style={{ fontWeight: 600, color: "#4846a6" }}>
                  {delivery.product}
                </div>
                <IonText color="medium" style={{ fontSize: 13 }}>
                  Customer: {delivery.customerName}
                </IonText>
                <IonText
                  color="medium"
                  style={{ fontSize: 13, display: "block" }}
                >
                  <IonIcon
                    icon={statusIcons[delivery.status]}
                    style={{
                      fontSize: 15,
                      verticalAlign: "middle",
                      marginRight: 4,
                      color: statusColors[delivery.status],
                    }}
                  />
                  {new Date(delivery.createdAt).toLocaleDateString()}{" "}
                  &nbsp;|&nbsp;
                  <span
                    style={{
                      color: statusColors[delivery.status],
                      fontWeight: 600,
                    }}
                  >
                    {delivery.status}
                  </span>
                </IonText>
                {delivery.trackingNumber && (
                  <IonText color="medium" style={{ fontSize: 12 }}>
                    Tracking: {delivery.trackingNumber}
                  </IonText>
                )}
              </IonLabel>
            </IonItem>
          ))}
        </div>

        {/* DELIVERY DETAILS MODAL */}
        <IonModal
          isOpen={showDetailsModal}
          onDidDismiss={() => setShowDetailsModal(false)}
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
              <h2 style={{ margin: 0, color: "#4846a6" }}>Delivery Details</h2>
              <IonButton
                fill="clear"
                onClick={() => setShowDetailsModal(false)}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            {selectedDelivery && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: 16,
                    borderRadius: 8,
                  }}
                >
                  <h3 style={{ margin: "0 0 10px 0", color: "#4846a6" }}>
                    {selectedDelivery.product}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <IonIcon
                      icon={statusIcons[selectedDelivery.status]}
                      style={{ color: statusColors[selectedDelivery.status] }}
                    />
                    <span
                      style={{
                        color: statusColors[selectedDelivery.status],
                        fontWeight: 600,
                      }}
                    >
                      {selectedDelivery.status}
                    </span>
                  </div>
                  {selectedDelivery.trackingNumber && (
                    <div style={{ fontSize: 14, color: "#666" }}>
                      Tracking: {selectedDelivery.trackingNumber}
                    </div>
                  )}
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div>
                    <strong>Customer:</strong> {selectedDelivery.customerName}
                  </div>
                  <div>
                    <strong>Created:</strong>{" "}
                    {new Date(selectedDelivery.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <strong>Priority:</strong> {selectedDelivery.priority}
                  </div>
                  {selectedDelivery.details && (
                    <div>
                      <strong>Details:</strong> {selectedDelivery.details}
                    </div>
                  )}
                  <div>
                    <strong>Pickup Address:</strong>{" "}
                    {selectedDelivery.pickupAddress}
                  </div>
                  <div>
                    <strong>Pickup Phone:</strong>{" "}
                    {selectedDelivery.pickupPhone}
                  </div>
                  <div>
                    <strong>Delivery Address:</strong>{" "}
                    {selectedDelivery.deliveryAddress}
                  </div>
                  <div>
                    <strong>Delivery Phone:</strong>{" "}
                    {selectedDelivery.deliveryPhone}
                  </div>
                </div>

                {/* Status Update Section */}
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                  }}
                >
                  <h4 style={{ margin: "0 0 15px 0", color: "#4846a6" }}>
                    Update Status
                  </h4>

                  <IonSelect
                    label="New Status"
                    labelPlacement="floating"
                    value={newStatus}
                    onIonChange={(e) => setNewStatus(e.detail.value)}
                    style={{
                      marginBottom: 15,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      padding: 10,
                    }}
                  >
                    <IonSelectOption value="Pending">Pending</IonSelectOption>
                    <IonSelectOption value="Assigned">Assigned</IonSelectOption>
                    <IonSelectOption value="In Transit">
                      In Transit
                    </IonSelectOption>
                    <IonSelectOption value="Delivered">
                      Delivered
                    </IonSelectOption>
                    <IonSelectOption value="Cancelled">
                      Cancelled
                    </IonSelectOption>
                  </IonSelect>

                  <IonTextarea
                    label="Notes (Optional)"
                    labelPlacement="floating"
                    placeholder="Add any notes about this status update"
                    value={notes}
                    onIonInput={(e) => setNotes(e.detail.value!)}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      padding: 10,
                    }}
                    rows={3}
                  />

                  <IonButton
                    expand="block"
                    onClick={handleUpdateStatus}
                    disabled={
                      loading ||
                      !newStatus ||
                      newStatus === selectedDelivery.status
                    }
                    style={{ marginTop: 15 }}
                  >
                    {loading ? "Updating..." : "Update Status"}
                  </IonButton>
                </div>
              </div>
            )}
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

export default Deliveries;
