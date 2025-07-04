import {
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonImg
} from "@ionic/react";
import { logInOutline } from "ionicons/icons";
import React from "react";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  return (
    <IonPage>
      
      <IonContent
        fullscreen
        color={"primary"}
      >
        <div
          className="flex flex-col gap-8 justify-center items-center min-h-[100%] max-h[120vh] mx-6"
        >
          <div className="mb-6 text-center">
            <IonImg src="/assets/images/dispatcher.png" alt="Dispatcher" style={{
              width: "8rem",
              height: "8rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: "1rem"
            }} />
            <IonText
            color={"secondary"}
              style={{
                fontSize: "2.5rem",
                fontWeight: 900,
              }}
            >
              Delivery Made Easy
            </IonText>
            <p
              style={{
                color: "#fff",
                marginTop: ".2rem",
                fontWeight: 500,
                width: '70%', display: 'flex', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto'
              }}
            >
              Fast, reliable, and secure delivery at your fingertips.
            </p>
          </div>
          <div className="w-full flex flex-col gap-4 max-w-md">
            <IonInput
              placeholder="Email"
              inputMode="email"
              className="ion-padding"
            />
            <IonInput
              type="password"
              placeholder="Password"
              className="ion-padding"
            />
            <IonButton
              expand="block"
              shape="round"
              color={"secondary"}
            >
              Sign In
            </IonButton>
            <IonText
              style={{
                color: "#fff",
                textAlign: "center",
                marginTop: "1rem"
              }}
            >
              New here? <Link to={'/register'} style={{  fontWeight: 600, cursor: "pointer", color: 'var(--ion-color-secondary)' }}>Create an account</Link>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;