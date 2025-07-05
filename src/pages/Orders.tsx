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
import { callOutline as callIcon } from "ionicons/icons";

import Header from "../components/Header";

type Delivery = {
  id: number;
  product: string;
  status: string;
  date: string;
  details: string;
  pickupAddress: string;
  pickupPhone: string;
  deliveryAddress: string;
  deliveryPhone: string;
};

const initialOrders: Delivery[] = [
  {
    id: 1,
    product: "Bluetooth Speaker",
    status: "In Transit",
    date: "2025-07-02",
    details: "Handle with care.",
    pickupAddress: "123 Main St, Lagos",
    pickupPhone: "+2348012345678",
    deliveryAddress: "456 Market Rd, Abuja",
    deliveryPhone: "+2348098765432"
  },
  {
    id: 2,
    product: "Laptop",
    status: "Delivered",
    date: "2025-06-30",
    details: "Deliver before noon.",
    pickupAddress: "Tech Plaza, Ikeja",
    pickupPhone: "+2348023456789",
    deliveryAddress: "University Rd, Ibadan",
    deliveryPhone: "+2348087654321"
  },
  {
    id: 3,
    product: "Books",
    status: "Pending",
    date: "2025-07-03",
    details: "Fragile items.",
    pickupAddress: "Bookshop Ave, Enugu",
    pickupPhone: "+2348034567890",
    deliveryAddress: "Library Lane, Port Harcourt",
    deliveryPhone: "+2348076543210"
  }
];
// ...existing

const statusColors: Record<string, string> = {
  "In Transit": "#ffc409",
  "Delivered": "#2dd55b",
  "Pending": "#4846a6"
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
    details: "",
    pickupAddress: "",
    pickupPhone: "",
    deliveryAddress: "",
    deliveryPhone: ""
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
        date: new Date().toISOString().slice(0, 10),
        details: form.details,
        pickupAddress: form.pickupAddress,
        pickupPhone: form.pickupPhone,
        deliveryAddress: form.deliveryAddress,
        deliveryPhone: form.deliveryPhone
      },
      ...deliveries
    ]);
    setShowModal(false);
    setForm({
      product: "",
      status: "Pending",
      details: "",
      pickupAddress: "",
      pickupPhone: "",
      deliveryAddress: "",
      deliveryPhone: ""
    });
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
            color={'primary'}
              value={searchText}
              onIonInput={e => setSearchText(e.detail.value ?? "")}
              placeholder="Search deliveries"
              style={{ flex: 3, borderRadius: '1rem', minWidth: 0 }}
            />
            <IonSelect
              value={filterStatus}
              onIonChange={e => setFilterStatus(e.detail.value)}
              style={{ flex: 1, display: 'flex' }}
            >
                <div slot="label" className="">
                    <IonText color={'medium'}>Filter:</IonText> 
                </div>
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
                    color: `${delivery.status === "Pending" ? "var(--ion-color-primary)" : 
                    delivery.status === "In Transit" ? "var(--ion-color-warning)" : "var(--ion-color-success)"}`,
                    marginRight: 8
                  }}
                />
                <IonLabel color={"primary"}>
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
        
        {/* ADD DELIVERY REQUEST MODAL */}
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
                <IonInput
                  label="Pickup Address"
                  labelPlacement="floating"
                  placeholder="Enter pickup address"
                  name="pickupAddress"
                  value={form.pickupAddress}
                  onIonInput={handleInput}
                  style={{ marginBottom: 16, background: "#fff", borderRadius: 8 }}
                />
                <IonInput
                  label="Pickup Phone Number"
                  labelPlacement="floating"
                  placeholder="Enter pickup phone number"
                  name="pickupPhone"
                  value={form.pickupPhone}
                  onIonInput={handleInput}
                  style={{ marginBottom: 16, background: "#fff", borderRadius: 8 }}
                  type="tel"
                />
                <IonInput
                  label="Delivery Address"
                  labelPlacement="floating"
                  placeholder="Enter delivery address"
                  name="deliveryAddress"
                  value={form.deliveryAddress}
                  onIonInput={handleInput}
                  style={{ marginBottom: 16, background: "#fff", borderRadius: 8 }}
                />
                <IonInput
                  label="Delivery Phone Number"
                  labelPlacement="floating"
                  placeholder="Enter delivery phone number"
                  name="deliveryPhone"
                  value={form.deliveryPhone}
                  onIonInput={handleInput}
                  style={{ marginBottom: 16, background: "#fff", borderRadius: 8 }}
                  type="tel"
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
        
        {/* ORDER DETAILS MODAL */}
        <IonModal isOpen={showDetailsModal} onDidDismiss={() => setShowDetailsModal(false)}>
            <IonHeader>
                <IonToolbar color={"primary"}>
                <IonTitle className="ion-padding" color={"secondary"}>
                    <IonIcon icon={cubeOutline} style={{ marginRight: 8, verticalAlign: "middle" }} />
                    Order Details
                </IonTitle>
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
                <div
                className="ion-padding"
                style={{
                    maxWidth: 420,
                    margin: "24px auto",
                    background: "#fff",
                    borderRadius: 18,
                    boxShadow: "0 4px 24px rgba(72,70,166,0.08)",
                    padding: 24,
                }}
                >
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
                            <strong>Date:</strong> {selectedOrder.date}
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
                        <IonIcon icon={callIcon} style={{ marginRight: 8, color: "#4846a6" }} />
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
                        <IonIcon icon={callIcon} style={{ marginRight: 8, color: "#4846a6" }} />
                        <span>
                            <strong>Delivery Phone:</strong> {selectedOrder.deliveryPhone}
                        </span>
                        </div>
                    </div>
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