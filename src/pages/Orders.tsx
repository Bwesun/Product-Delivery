import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
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
  IonMenu
} from "@ionic/react";
import { cubeOutline, addCircleOutline, closeOutline, timeOutline, checkmarkCircleOutline, ellipsisHorizontalCircleOutline } from "ionicons/icons";
import Header from "../components/Header";

const initialOrders = [
  {
    id: 1,
    product: "Bluetooth Speaker",
    status: "In Transit",
    date: "2025-07-02"
  },
  {
    id: 2,
    product: "Laptop",
    status: "Delivered",
    date: "2025-06-30"
  },
  {
    id: 3,
    product: "Books",
    status: "Pending",
    date: "2025-07-03"
  }
];

const statusColors: Record<string, string> = {
  "In Transit": "#4846a6",
  "Delivered": "#ffb900",
  "Pending": "#aaa"
};

const statusIcons: Record<string, string> = {
  "In Transit": timeOutline,
  "Delivered": checkmarkCircleOutline,
  "Pending": ellipsisHorizontalCircleOutline
};

const statusOptions = ["All", "Pending", "In Transit", "Delivered"];

const Orders: React.FC = () => {
  const [deliveries, setDeliveries] = useState(initialOrders);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    product: "",
    status: "Pending",
    details: ""
  });
  const [formError, setFormError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleInput = (e: any) => {
  const target = e.target as HTMLInputElement & { name?: string };
  const name = target.name;
  const value = e.detail?.value ?? target.value;
  setForm((prev) => ({ ...prev, [name]: value }));
  setFormError("");
};

  const handleAddDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product.trim()) {
      setFormError("Product name is required.");
      return;
    }
    setDeliveries([
      {
        id: deliveries.length + 1,
        product: form.product,
        status: form.status,
        date: new Date().toISOString().slice(0, 10)
      },
      ...deliveries
    ]);
    setShowModal(false);
    setForm({ product: "", status: "Pending", details: "" });
    setFormError("");
  };

  // Filter and search logic
  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesStatus = filterStatus === "All" || delivery.status === filterStatus;
    const matchesSearch =
      delivery.product.toLowerCase().includes(searchText.toLowerCase()) ||
      delivery.status.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <IonPage>
        <Header title="Orders" bg="light" color="light" button='primary' textColor="dark" backButton={true} />
      <IonContent fullscreen className="light-bg">
        <div className="ion-padding">
          <IonButton
            expand="block"
            color="secondary"
            style={{
              borderRadius: 12,
              fontWeight: 700,
              background: "#ffb900",
              color: "#4846a6",
              marginBottom: 24
            }}
            onClick={() => setShowModal(true)}
          >
            <IonIcon icon={addCircleOutline} slot="start" />
            Add Delivery Request
          </IonButton>

          {/* Search and Filter */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <IonSearchbar
            color={'light'}
              value={searchText}
              onIonInput={e => setSearchText(e.detail.value ?? "")}
              placeholder="Search deliveries"
              style={{ flex: 2, background: "#fff", borderRadius: '1rem', minWidth: 0 }}
            />
            <IonSelect
              value={filterStatus}
              onIonChange={e => setFilterStatus(e.detail.value)}
              style={{ flex: 1, minWidth: 120, background: "#fff", borderRadius: 8 }}
              interface="popover"
            >
              {statusOptions.map(status => (
                <IonSelectOption key={status} value={status}>
                  {status}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

            {filteredDeliveries.length === 0 && (
              <IonItem lines="none">
                <IonLabel>
                  <IonText color="medium">No orders found.</IonText>
                </IonLabel>
              </IonItem>
            )}
            {filteredDeliveries.map((delivery) => (
              <IonItem
                className="mb-4"
                key={delivery.id}
                button
                onClick={() => {
                  setSelectedOrder(delivery);
                  setShowDetailsModal(true);
                }}
              >
                <IonIcon
                  icon={cubeOutline}
                  slot="start"
                  style={{
                    fontSize: 28,
                    color: "#4846a6",
                    marginRight: 8
                  }}
                />
                <IonLabel>
                  <div style={{ fontWeight: 600, color: "#4846a6" }}>{delivery.product}</div>
                  <IonText color="medium" style={{ fontSize: 13 }}>
                    <IonIcon
                      icon={statusIcons[delivery.status]}
                      style={{
                        fontSize: 15,
                        verticalAlign: "middle",
                        marginRight: 4,
                        color: statusColors[delivery.status]
                      }}
                    />
                    {delivery.date} &nbsp;|&nbsp;
                    <span style={{ color: statusColors[delivery.status], fontWeight: 600 }}>
                      {delivery.status}
                    </span>
                  </IonText>
                </IonLabel>
              </IonItem>
            ))}
        </div>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
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
            <IonContent color={"light"}>
          <form onSubmit={handleAddDelivery}>
              <div className="ion-padding">
                <IonInput
                  label="Product Name"
                  labelPlacement="floating"
                  placeholder="Enter product name"
                  name="product"
                  value={form.product}
                  onIonInput={handleInput}
                  required
                  color={'primary'}
                />
                <IonSelect
                  label="Status"
                  labelPlacement="floating"
                  name="status"
                  value={form.status}
                  onIonChange={handleInput}
                  style={{ marginBottom: 16, background: "#fff", borderRadius: 8 }}
                >
                  <IonSelectOption value="Pending">Pending</IonSelectOption>
                  <IonSelectOption value="In Transit">In Transit</IonSelectOption>
                  <IonSelectOption value="Delivered">Delivered</IonSelectOption>
                </IonSelect>
                <IonTextarea
                  label="Details"
                  labelPlacement="floating"
                  placeholder="Additional details (optional)"
                  name="details"
                  value={form.details}
                  onIonInput={handleInput}
                  style={{ marginBottom: 16, background: "#fff", borderRadius: 8 }}
                />
                {formError && (
                  <IonText color="danger" style={{ fontSize: 14 }}>
                    {formError}
                  </IonText>
                )}
                <IonButton
                  expand="block"
                  type="submit"
                  color="secondary"
                  style={{
                    borderRadius: 12,
                    fontWeight: 700,
                    background: "#ffb900",
                    color: "#4846a6",
                    marginTop: 12
                  }}
                >
                  Submit Request
                </IonButton>
              </div>
          </form>
            </IonContent>
        </IonModal>

        <IonModal isOpen={showDetailsModal} onDidDismiss={() => setShowDetailsModal(false)}>
  <IonHeader>
    <IonToolbar color={"primary"}>
      <IonTitle className="ion-padding" color={"secondary"}>Order Details</IonTitle>
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
  <IonContent color={"light"}>
    <div className="ion-padding">
      {selectedOrder && (
        <>
          <h2 style={{ color: "#4846a6", fontWeight: 700 }}>{selectedOrder.product}</h2>
          <p>
            <IonIcon
              icon={statusIcons[selectedOrder.status]}
              style={{
                fontSize: 18,
                verticalAlign: "middle",
                marginRight: 4,
                color: statusColors[selectedOrder.status]
              }}
            />
            <span style={{ color: statusColors[selectedOrder.status], fontWeight: 600 }}>
              {selectedOrder.status}
            </span>
          </p>
          <p>
            <strong>Date:</strong> {selectedOrder.date}
          </p>
          {selectedOrder.details && (
            <p>
              <strong>Details:</strong> {selectedOrder.details}
            </p>
          )}
        </>
      )}
    </div>
  </IonContent>
</IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Orders;