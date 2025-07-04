import {
  IonPage,
  IonContent,
  IonAvatar,
  IonText,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from "@ionic/react";
import {
  pencilOutline,
  mailOutline,
  callOutline,
  locationOutline,
  logOutOutline,
  cubeOutline,
  addCircleOutline,
  timeOutline
} from "ionicons/icons";
import React from "react";

const user = {
  name: "Jane Doe",
  email: "jane.doe@email.com",
  phone: "+1 234 567 8901",
  address: "123 Main Street, City, Country",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg"
};

const deliveries = [
  {
    id: 1,
    status: "In Transit",
    product: "Wireless Headphones",
    date: "2025-07-01",
    icon: cubeOutline,
    color: "#4846a6"
  },
  {
    id: 2,
    status: "Delivered",
    product: "Smart Watch",
    date: "2025-06-28",
    icon: cubeOutline,
    color: "#ffb900"
  }
];

const Profile: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen className="light-bg">
        <IonGrid className="ion-padding">
          <IonRow className="ion-justify-content-center ion-margin-top">
            <IonCol size="12" className="ion-text-center">
              <IonAvatar style={{
                width: 110,
                height: 110,
                margin: "0 auto",
                boxShadow: "0 4px 24px rgba(72,70,166,0.15)",
                border: "4px solid var(--ion-color-secondary)"
              }}>
                <img src={user.avatar} alt="Profile" />
              </IonAvatar>
              <IonText color={"light"} style={{ fontSize: "1.7rem", fontWeight: 700, marginTop: 16, display: "block" }}>
                {user.name}
              </IonText>
              <IonButton
                color="primary"
                size="small"
                style={{ marginTop: 12, borderRadius: 20, fontWeight: 600 }}
                fill="outline"
              >
                <IonIcon icon={pencilOutline} slot="start" />
                Edit Profile
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
                <IonItem lines='none' style={{ marginTop: 24, borderRadius: 16, boxShadow: "0 2px 12px rgba(72,70,166,0.06)" }}>
                  <IonIcon icon={mailOutline} slot="start" color="primary" style={{ fontSize: 22}} />
                  <IonLabel>
                    <IonText color="medium" style={{ fontSize: 13 }}>Email</IonText>
                    <div style={{ fontWeight: 600}}>{user.email}</div>
                  </IonLabel>
                </IonItem>
                <IonItem lines='none' style={{ marginTop: 24, borderRadius: 16, boxShadow: "0 2px 12px rgba(72,70,166,0.06)" }}>
                  <IonIcon icon={callOutline} slot="start" color="primary" style={{ fontSize: 22 }} />
                  <IonLabel>
                    <IonText color="medium" style={{ fontSize: 13 }}>Phone</IonText>
                    <div style={{ fontWeight: 600 }}>{user.phone}</div>
                  </IonLabel>
                </IonItem>
                <IonItem lines='none' style={{ marginTop: 24, borderRadius: 16, boxShadow: "0 2px 12px rgba(72,70,166,0.06)" }}>
                  <IonIcon icon={locationOutline} slot="start" color="primary" style={{ fontSize: 22 }} />
                  <IonLabel>
                    <IonText color="medium" style={{ fontSize: 13 }}>Address</IonText>
                    <div style={{ fontWeight: 600 }}>{user.address}</div>
                  </IonLabel>
                </IonItem>

              {/* Delivery Features */}
              <IonCard style={{ marginTop: 32, borderRadius: 16, boxShadow: "0 2px 12px rgba(72,70,166,0.06)" }}>
                <IonCardHeader>
                  <IonCardTitle className="ion-padding" color={"primary"} style={{ fontWeight: 700, fontSize: "1.2rem" }}>
                    My Deliveries
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {deliveries.map((delivery) => (
                    <IonItem lines='none' style={{ marginTop: 24, borderRadius: 16, boxShadow: "0 2px 12px rgba(72,70,166,0.06)" }} key={delivery.id}>
                      <IonIcon
                        icon={delivery.icon}
                        slot="start"
                        style={{
                          fontSize: 28,
                          color: delivery.color,
                          marginRight: 8
                        }}
                      />
                      <IonLabel>
                        <div style={{ fontWeight: 600, color: "#4846a6" }}>{delivery.product}</div>
                        <IonText color="medium" style={{ fontSize: 13 }}>
                          <IonIcon icon={timeOutline} style={{ fontSize: 15, verticalAlign: "middle", marginRight: 4 }} />
                          {delivery.date} &nbsp;|&nbsp;
                          <span style={{ color: delivery.color, fontWeight: 600 }}>{delivery.status}</span>
                        </IonText>
                      </IonLabel>
                    </IonItem>
                  ))}
                  <IonButton
                    expand="block"
                    color="secondary"
                    style={{
                      marginTop: 18,
                      borderRadius: 12,
                      fontWeight: 600,
                    }}
                    shape="round"
                  >
                    <IonIcon icon={addCircleOutline} slot="start" />
                    New Delivery Request
                  </IonButton>
                </IonCardContent>
              </IonCard>

              <IonButton
                expand="block"
                color="danger"
                style={{
                  marginTop: 32,
                  borderRadius: 16,
                  fontWeight: 700,
                  background: "#ffb900",
                  color: "#4846a6"
                }}
              >
                <IonIcon icon={logOutOutline} slot="start" />
                Logout
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Profile;