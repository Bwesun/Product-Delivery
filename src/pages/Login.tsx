import {
  IonContent,
  IonInput,
  IonPage,
  IonText,
  IonButton,
  IonImg,
  IonLoading,
  IonToast,
} from "@ionic/react";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { login } = useAuth();
  const history = useHistory();

  const handleLogin = async () => {
    if (!email || !password) {
      setToastMessage("Please fill in all fields");
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      history.push("/home");
    } catch (error: any) {
      setToastMessage(error.message || "Login failed");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen color={"primary"}>
        <div className="flex flex-col gap-8 justify-center items-center min-h-[100%] max-h[120vh] mx-6">
          <div className="mb-6 text-center">
            <IonImg
              src="/assets/images/dispatcher.png"
              alt="Dispatcher"
              style={{
                width: "8rem",
                height: "8rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: "auto",
                marginRight: "auto",
                marginBottom: "1rem",
              }}
            />
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
                width: "70%",
                display: "flex",
                justifyContent: "center",
                marginLeft: "auto",
                marginRight: "auto",
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
              value={email}
              onIonInput={(e) => setEmail(e.detail.value!)}
            />
            <IonInput
              type="password"
              placeholder="Password"
              className="ion-padding"
              value={password}
              onIonInput={(e) => setPassword(e.detail.value!)}
            />
            <IonButton
              expand="block"
              shape="round"
              color={"secondary"}
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </IonButton>
            <IonText
              style={{
                color: "#fff",
                textAlign: "center",
                marginTop: "1rem",
              }}
            >
              New here?{" "}
              <Link
                to={"/register"}
                style={{
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--ion-color-secondary)",
                }}
              >
                Create an account
              </Link>
            </IonText>
          </div>
        </div>

        <IonLoading isOpen={isLoading} message="Signing in..." />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
