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
  IonIcon,
  IonText,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton
} from "@ionic/react";
import { cubeOutline, personOutline, listOutline, logOutOutline, person } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import React from "react";
import { c } from "vitest/dist/reporters-5f784f42";
import Header from "../components/Header";

const cardData = [
  {
    title: "Orders",
    icon: listOutline,
    color: "#ffb900",
    bg: "#4846a6",
    link: "/orders",
    textColor: "#fff",
    desc: "Check your order history"
  },
  {
    title: "Deliveries",
    icon: cubeOutline,
    color: "#ffb900",
    link: "/deliveries",
    bg: "#4846a6",
    textColor: "#fff",
    desc: "View and manage your deliveries"
  },
  {
    title: "Profile",
    icon: personOutline,
    color: "#4846a6",
    link: "/profile",
    desc: "Edit your profile and settings"
  },
  
  {
    title: "Logout",
    icon: logOutOutline,
    color: "#ffb900",
    link: "/logout",
    bg: "#4846a6",
    textColor: "#fff",
    desc: "Sign out of your account"
  }
];

const Home: React.FC = () => {
  const history = useHistory();

  const handleCardClick = (link: string) => {
    history.push(link);
  };

  return (
    <IonPage>
        <Header title="Home" bg="light" color="light" textColor="dark" backButton={false} button="primary" />
      <IonContent fullscreen className="light-bg">
        <IonGrid className="ion-padding">
          <IonRow>
            <IonCol size="12" className="" style={{ marginBottom: 24 }}>
              <IonText style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4846a6" }}>
                <small>Welcome,</small> Matur Innocent 
              </IonText>
            </IonCol>
          </IonRow>
          <IonRow>
            {cardData.map((card, idx) => (
              <IonCol size="12" className="" sizeMd="6" key={idx}>
                <IonCard
                  className="ion-padding"
                  button
                  onClick={() => handleCardClick(card.link)}
                  style={{
                    borderRadius: 16,
                    boxShadow: "0 4px 16px rgba(72,70,166,0.08)",
                    background: `${card.bg || "var(--ion-color-secondary)"}`,
                    marginBottom: 24
                  }}
                >
                  <IonCardHeader className="ion-text-center">
                    <IonIcon
                      icon={card.icon}
                      style={{
                        fontSize: 48,
                        color: card.color,
                        marginBottom: 8,
                        display: "block",
                        marginLeft: "auto",
                        marginRight: "auto", 
                      }}
                    />
                    <IonCardTitle style={{ color: card.color, fontWeight: 700 }}>
                      {card.title}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent className="ion-text-center" style={{ color: card.textColor || "#4846a6", }}>
                    {card.desc}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;