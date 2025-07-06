import {
  IonContent,
  IonInput,
  IonPage,
  IonText,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonLoading,
  IonToast,
} from "@ionic/react";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    role: "user",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { register } = useAuth();
  const history = useHistory();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      return "Please fill in all required fields";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const handleRegister = async () => {
    const error = validateForm();
    if (error) {
      setToastMessage(error);
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      history.push("/home");
    } catch (error: any) {
      setToastMessage(error.message || "Registration failed");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

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
                width: "70%",
                display: "flex",
                justifyContent: "center",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Join us for fast, reliable, and secure delivery at your
              fingertips.
            </p>
          </div>
          <div className="w-full flex flex-col gap-4 max-w-md">
            <IonInput
              placeholder="Full Name"
              inputMode="text"
              className="ion-padding"
              value={formData.name}
              onIonInput={(e) => handleInputChange("name", e.detail.value!)}
            />
            <IonInput
              placeholder="Email"
              inputMode="email"
              className="ion-padding"
              value={formData.email}
              onIonInput={(e) => handleInputChange("email", e.detail.value!)}
            />
            <IonInput
              placeholder="Phone (Optional)"
              inputMode="tel"
              className="ion-padding"
              value={formData.phone}
              onIonInput={(e) => handleInputChange("phone", e.detail.value!)}
            />
            <IonInput
              placeholder="Address (Optional)"
              className="ion-padding"
              value={formData.address}
              onIonInput={(e) => handleInputChange("address", e.detail.value!)}
            />
            <IonSelect
              placeholder="Select Role"
              value={formData.role}
              onIonChange={(e) => handleInputChange("role", e.detail.value)}
              className="ion-padding"
            >
              <IonSelectOption value="user">User</IonSelectOption>
              <IonSelectOption value="dispatcher">Dispatcher</IonSelectOption>
            </IonSelect>
            <IonInput
              type="password"
              placeholder="Password"
              className="ion-padding"
              value={formData.password}
              onIonInput={(e) => handleInputChange("password", e.detail.value!)}
            />
            <IonInput
              type="password"
              placeholder="Confirm Password"
              className="ion-padding"
              value={formData.confirmPassword}
              onIonInput={(e) =>
                handleInputChange("confirmPassword", e.detail.value!)
              }
            />
            <IonButton
              expand="block"
              shape="round"
              color={"secondary"}
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Register"}
            </IonButton>
            <IonText
              style={{
                color: "#fff",
                textAlign: "center",
                marginTop: "1rem",
              }}
            >
              Already have an account?{" "}
              <Link
                to={"/login"}
                style={{
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--ion-color-secondary)",
                }}
              >
                Sign In
              </Link>
            </IonText>
          </div>
        </div>

        <IonLoading isOpen={isLoading} message="Creating your account..." />
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

export default Register;
