import {
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon
} from "@ionic/react";
import { personAddOutline } from "ionicons/icons";
import React from "react";
import { Link } from "react-router-dom";

const Register: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen color={"primary"}>
        <div className="flex flex-col gap-8 justify-center items-center min-h-[100%] max-h-[120vh] mx-6">
          <div className="mb-8 text-center">
            <IonText
              color={"secondary"}
              style={{
                fontSize: "2.5rem",
                fontWeight: 900,
              }}
            >
              Create Your Account
            </IonText>
            <p
              style={{
                color: "#fff",
                marginTop: ".2rem",
                fontWeight: 500,
                width: '70%',
                display: 'flex',
                justifyContent: 'center',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              Join us for fast, reliable, and secure delivery at your fingertips.
            </p>
          </div>
          <div className="w-full flex flex-col gap-4 max-w-md">
            <IonInput
              placeholder="Full Name"
              inputMode="text"
              className="ion-padding"
            />
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
            <IonInput
              type="password"
              placeholder="Confirm Password"
              className="ion-padding"
            />
            <IonButton
              expand="block"
              shape="round"
              color={"secondary"}
            >
              Register
            </IonButton>
            <IonText
              style={{
                color: "#fff",
                textAlign: "center",
                marginTop: "1rem"
              }}
            >
              Already have an account?{" "}
              <Link
                to={"/"}
                style={{
                  fontWeight: 600,
                  cursor: "pointer",
                  color: 'var(--ion-color-secondary)'
                }}
              >
                Sign In
              </Link>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;