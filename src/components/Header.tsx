import { IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonBackButton } from "@ionic/react";
import { person, logOutOutline, arrowBackOutline } from "ionicons/icons";
import { useHistory } from "react-router";

interface HeaderProps {
    bg?: string;
    color?: string;
    title?: string;
    button?: string;
    textColor?: string;
    backButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({bg, color, button, title, backButton}) => {
    const history = useHistory();
    return ( 
        <IonHeader className="ion-no-border">
                    <IonToolbar color={bg} >
                        <IonTitle className="ion-padding">
                            <div className="flex items-center justify-between">
                                <div>
                                    {backButton && <IonButton slot="start" onClick={() => history.goBack()} color={button} fill="clear">
                                        <IonIcon icon={arrowBackOutline} slot="icon-only" color={button}></IonIcon>
                                    </IonButton>}
                                    <IonButton shape="round" color={"primary"} onClick={() => history.push("/profile")}>
                                        <IonIcon icon={person} slot="icon-only" color={color}></IonIcon>
                                    </IonButton>
                                </div>
                                <span style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4846a6", marginLeft: 8 }}>
                                    {title ? title : "DeliveryX"}
                                </span>
                                <IonButton shape="round" color={button} onClick={() => history.push("/logout")}>
                                    <IonIcon icon={logOutOutline} slot="icon-only" color={color}></IonIcon>
                                </IonButton>
                            </div>
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>
     );
}
 
export default Header;