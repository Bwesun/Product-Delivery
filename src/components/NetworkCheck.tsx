import React, { useEffect, useState } from "react";
import { Network } from "@capacitor/network";
import { IonAlert } from "@ionic/react";
import { useHistory } from "react-router-dom";

const NetworkCheck: React.FC = () => {
    const [isAlertOpen, setIsAlertOpen] = useState(false)
    const history = useHistory();

    // NETWORK STATE CHANGE LISTENER
    const networkListener = Network.addListener('networkStatusChange', status => {
        console.log('Network status changed', status.connected);

        if (status.connected === false) {
                setIsAlertOpen(true)
            } else {
                setIsAlertOpen(false)
            }
        });
    
    return ( 
        <IonAlert
            isOpen={isAlertOpen}
            color="danger"
            subHeader="Network Error Detected!"
            message="Ensure your device is connected to a stable network."
            className="custom-alert"
            buttons={[
                {
                    text: 'OK',
                    cssClass: 'alert-button-confirm',
                }
            ]}
            onDidDismiss={() => setIsAlertOpen(false)}
      ></IonAlert>
     );
}

export default NetworkCheck;