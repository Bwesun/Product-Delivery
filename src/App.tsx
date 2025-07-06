import { Redirect, Route, Switch } from "react-router-dom";
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
import {
  homeOutline,
  personOutline,
  statsChartOutline,
} from "ionicons/icons";

/* Core and Optional Ionic CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";

/* Theme */
import "./theme/variables.css";

/* Pages */
import Login from "./pages/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Deliveries from "./pages/Deliveries";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";

/* Other */
import { Logs, Package } from "lucide-react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

setupIonicReact();

const AppContent: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    const setStatusBar = async () => {
      try {
        await StatusBar.setBackgroundColor({ color: "#4846a6" });
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
        <div className="light-bg"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <IonSpinner color={"primary"} name="crescent" />
        </div>
      </IonApp>
    );
  }

  if (!isAuthenticated) {
    return (
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Switch>
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/">
                <Redirect to="/login" />
              </Route>
              <Route>
                <Redirect to="/login" />
              </Route>
            </Switch>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Switch>
              <Route exact path="/home" component={Home} />
              <Route exact path="/profile" component={Profile} />

              {user?.role === "user" && (
                <Route exact path="/orders" component={Orders} />
              )}

              {user?.role === "dispatcher" && (
                <Route exact path="/deliveries" component={Deliveries} />
              )}

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
              <Route>
                <Redirect to="/home" />
              </Route>
            </Switch>
          </IonRouterOutlet>

          <IonTabBar slot="bottom" className="floating-tab-bar">
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={homeOutline} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>

            {user?.role === "user" && (
              <IonTabButton tab="user-orders" href="/orders">
                <Logs size={24} />
                <IonLabel>Orders</IonLabel>
              </IonTabButton>
            )}

            {user?.role === "dispatcher" && (
              <IonTabButton tab="dispatcher-deliveries" href="/deliveries">
                <Package size={24} />
                <IonLabel>Deliveries</IonLabel>
              </IonTabButton>
            )}

            {user?.role === "admin" && (
              <>
                <IonTabButton tab="admin-dashboard" href="/admin">
                  <IonIcon icon={statsChartOutline} />
                  <IonLabel>Dashboard</IonLabel>
                </IonTabButton>
                <IonTabButton tab="admin-orders" href="/orders">
                  <Logs size={24} />
                  <IonLabel>Orders</IonLabel>
                </IonTabButton>
                <IonTabButton tab="admin-deliveries" href="/deliveries">
                  <Package size={24} />
                  <IonLabel>Deliveries</IonLabel>
                </IonTabButton>
              </>
            )}

            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={personOutline} />
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
