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
  IonText
} from "@ionic/react";
import { cubeOutline, personOutline, listOutline, logOutOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import React from "react";

const cardData = [
  {
    title: "Deliveries",
    icon: cubeOutline,
    color: "#4846a6",
    link: "/deliveries",
    desc: "View and manage your deliveries"
  },
  {
    title: "Profile",
    icon: personOutline,
    color: "#ffb900",
    link: "/profile",
    desc: "Edit your profile and settings"
  },
  {
    title: "Orders",
    icon: listOutline,
    color: "#4846a6",
    link: "/orders",
    desc: "Check your order history"
  },
  {
    title: "Logout",
    icon: logOutOutline,
    color: "#ffb900",
    link: "/logout",
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
      <IonContent fullscreen className="light-bg">
        <IonGrid className="ion-padding">
          <IonRow>
            <IonCol size="12" className="ion-text-center" style={{ marginBottom: 24 }}>
              <IonText style={{ fontSize: "2rem", fontWeight: 800, color: "#4846a6" }}>
                Welcome to DeliveryX
              </IonText>
            </IonCol>
          </IonRow>
          <IonRow>
            {cardData.map((card, idx) => (
              <IonCol size="12" className="" sizeMd="6" key={idx}>
                <IonCard
                  button
                  onClick={() => handleCardClick(card.link)}
                  style={{
                    borderRadius: 16,
                    boxShadow: "0 4px 16px rgba(72,70,166,0.08)",
                    background: "#fff",
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
                  <IonCardContent className="ion-text-center" style={{ color: "#4846a6" }}>
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