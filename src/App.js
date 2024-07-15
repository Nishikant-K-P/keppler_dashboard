import React, { useEffect, useState } from 'react';
import keplerGlReducer from "kepler.gl/reducers";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { taskMiddleware } from "react-palm/tasks";
import { Provider, useDispatch } from "react-redux";
import KeplerGl from "kepler.gl";
import { addDataToMap, updateMap } from "kepler.gl/actions";

import Papa from 'papaparse';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import mapconfig from './conifg-all.json'
const reducers = combineReducers({
  keplerGl: keplerGlReducer
});

const store = createStore(reducers, {}, applyMiddleware(taskMiddleware));

export default function App() {
  return (
    <Provider store={store}>
      <Map />
    </Provider>
  );
}

function Map() {
  const dispatch = useDispatch();

  const [alamrsmData, setalamrsmData] = useState(null);
  const [squatterPred, setsquatterPred] = useState(null);
  const [daysPred, setdaysPred] = useState(null);


  useEffect(() => {
    // Fetch and parse the CSV file
    fetch('/Alarms_vacant_home.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            setalamrsmData
              (results.data);
          }
        });
      });
    fetch('/squatter_prediction_on_vacant_home_days_July_1_2024.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            setdaysPred
              (results.data);
          }
        });
      });
    fetch('/squatter_prediction_on_vacant_home_July_1_2024.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            setsquatterPred
              (results.data);
          }
        });
      });
  }, []);


  // const { data } = useSwr("covid", async () => {
  //   const response = await fetch(
  //     "https://gist.githubusercontent.com/leighhalliday/a994915d8050e90d413515e97babd3b3/raw/a3eaaadcc784168e3845a98931780bd60afb362f/covid19.json"
  //   );
  //   const data = await response.json();
  //   return data;
  // });

  React.useEffect(() => {
    if (alamrsmData && squatterPred && daysPred) {
      console.log(alamrsmData)

      const dataset = {
        fields: Object.keys(alamrsmData[0]).map(name => ({name, format: '', type: typeof alamrsmData
          [0][name]
        })),
        rows: alamrsmData
          .map(row => Object.values(row))
      };

      const squatterDataset = {
        fields: Object.keys(squatterPred[0]).map(name => ({ name, format: '', type: typeof squatterPred[0][name] })),
        rows: squatterPred.map(row => Object.values(row))

      }

      const daysDataset = {
        fields: Object.keys(daysPred[0]).map(name => ({ name, format: '', type: typeof daysPred[0][name] })),
        rows: daysPred.map(row => Object.values(row))

      }
      console.log(daysDataset)





      dispatch(
        addDataToMap({
          datasets: [
            //   {
            //   info: {
            //     label: "COVID-19",
            //     id: "covid19"
            //   },
            //   data
            // },
            {
              info: {
                label: "Vacant Homes",
                id: "vacantHomes"
              },
              data: dataset
            },
            {
              info: {
                label: "Squatter Targets",
                id: "squatterTargets"
              },
              data: squatterDataset
            },
            {
              info: {
                label: "Days",
                id: "days"
              },
              data: daysDataset
            }


          ],
          option: {
            centerMap: false,
            readOnly: false,
            zoom: 10
          },
          config: mapconfig
        })
      );

      dispatch(
        updateMap({
          latitude: 39.8283,
          longitude: -98.5795,
          zoom: 3.5
        })
      );
    }
  }, [dispatch, alamrsmData, squatterPred, daysPred]);

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', minHeight: '70vh' }}>
      <AutoSizer>
        {({ height, width }) => (
          <KeplerGl
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_API}
            id="map"
            width={width}
            height={height}
          />
        )}
      </AutoSizer>
    </div>

    // <KeplerGl
    //   id="covid"
    //   mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_API}
    //   width={window.innerWidth}
    //   height={window.innerHeight}
    // />
  );
}
