import { useRef, useEffect, useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButtons, 
  IonMenuButton, 
  IonButton, 
  IonIcon,
  IonFab,
  IonFabButton,
  useIonLoading
} from '@ionic/react';
import {  locate } from 'ionicons/icons'
import { 
  getVenue, 
  showVenue,
  E_BLUEDOT_EVENT,
  E_BLUEDOT_STATE,  
  E_BLUEDOT_STATE_REASON,
  PositionUpdater, 
  Mappedin,
  MapView,
  E_SDK_EVENT,
  
} from '@mappedin/mappedin-js'
import { venueData } from '../utils/mapData';

type TPosition = {
  latitude: number,
  longitude: number
}

const Map: React.FC = () => {

  const [loading, setLoading] = useState<boolean>();
  const [present, dismiss] = useIonLoading();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const refVenue = useRef<Mappedin>();
  const refMapview = useRef<MapView>();
  const [position, setPosition] = useState<TPosition>({latitude:0, longitude: 0});


  const getRandomPosition = () => {
    const staticPositionUpdater = new PositionUpdater();
    setInterval(() => {
      
      staticPositionUpdater.update({
        timestamp: Date.now(),
        coords: {...position, accuracy: 5, floorLevel: 0}
          
        
      })
    }, 1000);

    refMapview.current?.BlueDot.enable({
      positionUpdater: staticPositionUpdater
    });

    refMapview.current?.BlueDot.on(E_BLUEDOT_EVENT.POSITION_UPDATE, update => {
      console.info(JSON.stringify(update.position, null, 2))
    })
  
    refMapview.current?.BlueDot.on(E_BLUEDOT_EVENT.STATE_CHANGE, state => {
      const stateWithNames = {
        state: E_BLUEDOT_STATE[state.name],
        reason: state.reason && E_BLUEDOT_STATE_REASON[state.reason],
      }
      console.info(JSON.stringify(stateWithNames, null, 2))
    })
  };


  useEffect(() => {
    (async () => {
      
      present('Loading map', 2000, 'dots');
      
      const venue = await getVenue(venueData);
      refVenue.current = venue;
      const mapview = await showVenue(mapContainerRef.current as HTMLDivElement, venue);
      refMapview.current = mapview;
      await dismiss();

      mapview.addInteractivePolygonsForAllLocations();
      mapview.labelAllLocations({flatLabels: true});


      mapview.on(E_SDK_EVENT.CLICK, (payload) => {
        console.log(payload);
        setPosition(payload.position);
      });
      
    })();
  }, []);

  return (
    <IonPage>
      <IonToolbar>
      <IonButtons slot="start">
        <IonMenuButton autoHide={false} />
      </IonButtons>
      <IonTitle>Map</IonTitle>
    </IonToolbar>      
    <div ref={mapContainerRef} />
    
    <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={getRandomPosition}>
            <IonIcon icon={locate} />
          </IonFabButton>
        </IonFab>
    </IonPage>
  );
};

export default Map;