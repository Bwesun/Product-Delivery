import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonSpinner,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { homeOutline, personOutline, statsChartOutline } from "ionicons/icons";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import Login from "./pages/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { Logs, Package } from "lucide-react";
import Deliveries from "./pages/Deliveries";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

setupIonicReact();

const AppContent: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    const setStatusBar = async () => {
      try {
        await StatusBar.setBackgroundColor({ color: "#2563eb" });
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Default });
      } catch (error) {
        console.error("Error setting status bar:", error);
      }
    };

    setStatusBar();
  }, []);

  if (isLoading) {
    return (
      <IonApp>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <IonSpinner />
        </div>
      </IonApp>
    );
  }

  if (!isAuthenticated) {
    return (
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
            <Route>
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    );
  }

  // Role-based rendering
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home" component={Home} />
            <Route exact path="/profile" component={Profile} />

            {/* User routes */}
            {user?.role === "user" && (
              <Route exact path="/orders" component={Orders} />
            )}

            {/* Dispatcher routes */}
            {user?.role === "dispatcher" && (
              <Route exact path="/deliveries" component={Deliveries} />
            )}

            {/* Admin routes */}
            {user?.role === "admin" && (
              <>
                <Route exact path="/admin" component={AdminDashboard} />
                <Route exact path="/orders" component={Orders} />
                <Route exact path="/deliveries" component={Deliveries} />
              </>
            )}

            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom" className="floating-tab-bar">
            <IonTabButton tab="home" href="/home">
              <IonIcon aria-hidden="true" icon={homeOutline} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>

            {user?.role === "user" && (
              <IonTabButton tab="orders" href="/orders">
                <Logs size={24} />
                <IonLabel>Orders</IonLabel>
              </IonTabButton>
            )}

            {user?.role === "dispatcher" && (
              <IonTabButton tab="deliveries" href="/deliveries">
                <Package size={24} />
                <IonLabel>Deliveries</IonLabel>
              </IonTabButton>
            )}

            {user?.role === "admin" && (
              <>
                <IonTabButton tab="admin" href="/admin">
                  <IonIcon aria-hidden="true" icon={statsChartOutline} />
                  <IonLabel>Dashboard</IonLabel>
                </IonTabButton>
                <IonTabButton tab="orders" href="/orders">
                  <Logs size={24} />
                  <IonLabel>Orders</IonLabel>
                </IonTabButton>
                <IonTabButton tab="deliveries" href="/deliveries">
                  <Package size={24} />
                  <IonLabel>Deliveries</IonLabel>
                </IonTabButton>
              </>
            )}

            <IonTabButton tab="profile" href="/profile">
              <IonIcon aria-hidden="true" icon={personOutline} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
