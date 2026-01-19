import './App.css';
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import Nav from "./layout/nav";
import "./styles/Main.scss";
import { useRef, useEffect } from "react";
import { useAppDispatch } from './app/hooks';
import { useSelector } from "react-redux";
import { RootState } from "./app/store";
// import { RootState } from "./app/store";
// import { useSelector } from "react-redux";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';

// Screen
// import Login from './modules/login/Login';
import RealTimeMonitor from './modules/real-time-monitor/RealTimeMonitor';
import SearchPlateWithCondition from './modules/search-plate-with-condition/SearchPlateWithCondition';
// import SearchPlateBeforeAfter from './modules/search-plate-before-after/SearchPlateBeforeAfter';
// import SearchSuspectPerson from './modules/search-suspect-person/SearchSuspectPerson';
import ManageUser from './modules/manage-user/ManageUser';
import AddEditUser from './modules/add-edit-user/AddEditUser';
import SpecialPlateScreen from './modules/special-plate/SpecialPlate';
// import UserInfo from './modules/user-info/UserInfo';
import Setting from './modules/setting/Setting';
// import SuspectPeople from './modules/suspect-people/SuspectPeople';
// import ManageLog from './modules/manage-log/ManageLog';
// import UsageStatisticsGraph from './modules/usage-statistics-graph/UsageStatisticsGraph';
// import EndUser from './modules/end-user/EndUser';
// import CameraInstallationPoints from './modules/camera-installation-points/CameraInstallationPoints';
// import CameraStatus from './modules/camera-status/CameraStatus';
import ManageCheckpointCameras from './modules/manage-checkpoint-cameras/ManageCheckpointCameras';

// API
import { clearError } from './features/auth/authSlice';
import { 
  fetchAreasThunk,
  fetchProvincesThunk,
  fetchStationsThunk,
  fetchVehicleColorsThunk,
  fetchVehicleMakesThunk,
  fetchDepartmentsThunk,
  fetchOfficerPositionsThunk,
  fetchPrefixThunk,
  fetchStatusThunk,
  fetchPersonTypesThunk,
  fetchPlateTypesThunk,
  fetchRegionsThunk,
  fetchUserGroupsThunk,
  fetchGeoRegionsThunk,
  fetchStreamEncodesThunk,
  fetchVehicleBodyTypesThunk,
  fetchVehicleModelThunk,
  fetchCheckpointsThunk,
} from './features/dropdown/dropdownSlice';
import {
  fetchSpecialPlatesThunk,
} from "./features/special-plate/specialPlateSlice";
import {
  upsertRealtimeData,
  addToastMessage,
} from './features/realtime-data/realtimeDataSlice';
import { triggerCameraRefresh, triggerRequestDeleteCamera } from './features/refresh/refreshSlice';

// Components
// import AuthListener from './components/auth-listener/AuthListener';
import UpdateAlertPopup from './components/update-alert-popup/UpdateAlertPopup';
import RequestDeleteCameraAlert from './components/request-delete-camera-alert/RequestDeleteCameraAlert';

// Config
import { getUrls } from './config/runtimeConfig';

// utils
import { settingWebsocketService, kafkaWebsocketService } from './utils/websocketService';
import { getPlateTypeColor } from './utils/commonFunction'

// Types
import { Checkpoint, SpecialPlate } from "./features/types";

// i18n
import { useTranslation } from 'react-i18next';

const PrivateRoute = ({ children }: { children: React.JSX.Element }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const { authData } = useSelector((state: RootState) => state.auth);

  const sliceSpecialPlate = useSelector(
    (state: RootState) => state.specialPlateData
  )

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  )

  const { CENTER_KAFKA_URL, CENTER_SETTING_WEBSOCKET_URL, CENTER_SETTING_WEBSOCKET_TOKEN } = getUrls();

  // i18n
  const { t } = useTranslation();

  const location = useLocation();

  // useEffect(() => {
  //   dispatch(clearError())
  //   if (authData && !authData.token) {
  //     navigate('/login', { replace: true })
  //   }
  //   else {
  //     dispatch(fetchAreasThunk());
  //     dispatch(fetchProvincesThunk());
  //     dispatch(fetchStationsThunk());
  //     dispatch(fetchCheckpointsThunk());
  //     dispatch(fetchVehicleColorsThunk());
  //     dispatch(fetchVehicleMakesThunk());
  //     dispatch(fetchDepartmentsThunk());
  //     dispatch(fetchOfficerPositionsThunk());
  //     dispatch(fetchPrefixThunk());
  //     dispatch(fetchStatusThunk());
  //     dispatch(fetchUserRolesThunk());
  //     dispatch(fetchPersonTypesThunk());
  //     dispatch(fetchPlateTypesThunk());
  //     dispatch(fetchCamerasThunk());
  //   }
  // }, [dispatch, navigate, authData])
  useEffect(() => {
    dispatch(clearError())
    dispatch(fetchAreasThunk());
    dispatch(fetchProvincesThunk(
      {
        orderBy: "name_en.asc",
        limit: "100"
      }
    ));
    dispatch(fetchStationsThunk());
    dispatch(fetchVehicleColorsThunk(
      {
        orderBy: "id.asc",
        limit: "500"
      }
    ));
    dispatch(fetchVehicleMakesThunk(
      {
        orderBy: "id.asc",
        limit: "500"
      }
    ));
    dispatch(fetchVehicleBodyTypesThunk(
      {
        orderBy: "id.asc",
        limit: "500"
      }
    ));
    dispatch(fetchVehicleModelThunk(
      {
        orderBy: "id.asc",
        limit: "500"
      }
    ));
    dispatch(fetchDepartmentsThunk());
    dispatch(fetchOfficerPositionsThunk());
    dispatch(fetchPrefixThunk(
      {
        orderBy: "title_group.asc, title_en.asc",
        limit: "100"
      }
    ));
    dispatch(fetchStatusThunk());
    dispatch(fetchPersonTypesThunk());
    dispatch(fetchPlateTypesThunk());
    dispatch(fetchRegionsThunk(
      {
        orderBy: "name_en.asc",
        limit: "100"
      }
    ));
    dispatch(fetchGeoRegionsThunk(
      {
        orderBy: "id.asc",
        limit: "100"
      }
    ));
    dispatch(fetchUserGroupsThunk(
      {
        orderBy: "id.asc",
        limit: "100"
      }
    ));
    dispatch(fetchSpecialPlatesThunk(
      {
        filter: "deleted=0",
        limit: "1000"
      }
    ));
    dispatch(fetchStreamEncodesThunk());
    dispatch(fetchCheckpointsThunk({
      limit: "100"
    }));

    const handleRealtimeMessage = async (message: string) => {
      const data = JSON.parse(message);

      dispatch(
        upsertRealtimeData({
          ...data,
          color: "white",
          feedBackgroundColor: "#161817",
          plate_class_name: "-",
          feedTextColor: "white",
        })
      );

      const specialPlateData = await checkSpecialPlate(data.plate_prefix, data.plate_number, data.province);
      
      if (!specialPlateData) return;
      
      const { backgroundColor, title, pinBackgroundColor, showAlert, feedBackgroundColor, color } = await getPlateTypeColor(specialPlateData.plate_class_id);
      
      if (!showAlert) return; 

      const plateClassName = getPlateClassName(specialPlateData.plate_class_id);

      const updatedData = {
        ...data,
        plate_class_name: plateClassName,
        special_plate_remark: specialPlateData.behavior,
        special_plate_owner_name: specialPlateData.case_owner_name,
        special_plate_owner_agency: specialPlateData.case_owner_agency,
        title_name: title,
        color: backgroundColor,
        pin_background_color: pinBackgroundColor,
        feedBackgroundColor: feedBackgroundColor,
        feedTextColor: color,
      }
      dispatch(addToastMessage(updatedData));
      dispatch(upsertRealtimeData(updatedData));
    };

    const handleCheckpointDataMessage = (message: Checkpoint) => {
      toast(
        (props) => (
          <UpdateAlertPopup
            {...props}
            data={{
              title: t('alert.new-checkpoint-update'),
              content: t('alert.new-checkpoint-update-content', { checkpointName: message.checkpoint_name || "-" }),
              onUpdate: () => dispatch(triggerCameraRefresh()),
              updateVisible: false,
            }}
          />
        ),
        {
          ariaLabel: t('alert.new-checkpoint-update'),
          autoClose: false,
          theme: 'dark',
        }
      );
    };

    const handleCameraDataMessage = (message: any) => {
      toast(
        (props) => (
          <UpdateAlertPopup
            {...props}
            data={{
              title: t('alert.new-camera-update'),
              content: t('alert.new-camera-update-content', { cameraName: message.camera_name || "-" }),
              onUpdate: () => dispatch(triggerCameraRefresh()),
              updateVisible: true,
            }}
          />
        ),
        {
          ariaLabel: t('alert.new-camera-update'),
          autoClose: false,
          theme: 'dark',
        }
      );
    };

    const listener = (message: any) => {
      if (message.event !== "delete-camera-request") return;

      const isUpdatePage = location.pathname.includes('/manage-checkpoint-cameras');

      toast(
        (props) => (
          <RequestDeleteCameraAlert
            {...props}
            data={{
              content: t('alert.request-delete-camera-content', { number: message.data.all_request_count + 1 }),
              onUpdate: () => {
                if (isUpdatePage) {
                  dispatch(triggerRequestDeleteCamera())
                }
                else {
                  navigate('/center/manage-checkpoint-cameras', { replace: true })
                }
              },
              updateVisible: true,
            }}
          />
        ),
        {
          autoClose: false,
          theme: 'light',
        }
      );
    }

    kafkaWebsocketService.connect(CENTER_KAFKA_URL);
    kafkaWebsocketService.subscribe("lpr-data", handleRealtimeMessage);
    kafkaWebsocketService.subscribe("checkpoint-data", handleCheckpointDataMessage);
    kafkaWebsocketService.subscribe("camera-data", handleCameraDataMessage);

    settingWebsocketService.connect(CENTER_SETTING_WEBSOCKET_URL, CENTER_SETTING_WEBSOCKET_TOKEN);

    settingWebsocketService.onMessage(listener);

    return () => {
      kafkaWebsocketService.unsubscribe("lpr-data", handleRealtimeMessage);
      kafkaWebsocketService.unsubscribe("checkpoint-data", handleCheckpointDataMessage);
      kafkaWebsocketService.unsubscribe("camera-data", handleCameraDataMessage);
    };
  }, [dispatch, navigate])

  useEffect(() => {
    const bc = new BroadcastChannel("specialPlateChannel");
    bc.onmessage = (event) => {
      if (event.data === "reload") {
        dispatch(fetchSpecialPlatesThunk({ filter: "deleted=0", limit: "1000" }));
      }
    };
    return () => bc.close();
  }, [dispatch]);

  const checkSpecialPlate = (platePrefix: string, plateNumber: string, region: string): SpecialPlate | undefined => {
    const specialPlate = sliceSpecialPlate.specialPlates?.data.find(sp => sp.plate_prefix === platePrefix && sp.plate_number === plateNumber && sp.province === region && sp.deleted === 0 && sp.active === 1);
    return specialPlate
  };

  const getPlateClassName = (classId: number) => {
    const plateType = sliceDropdown.plateTypes?.data.find(type => type.id === classId);
    return plateType?.title_en || "-";
  }

  return children
}

function Layout() {
  return (
    <>
      <ToastContainer newestOnTop={true}/>
      <Nav />
      <Outlet />
    </>
  )
}

function App() {
  const constraintsRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={constraintsRef} className='min-h-screen min-w-screen'>
      {/* <AuthListener /> */}
      {/* <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
          }
        >
          <Route path='center/real-time-monitor' element={<RealTimeMonitor />} />
          <Route path='center/search-plate-before-after' element={<SearchPlateBeforeAfter />}></Route>
          <Route path='center/search-plate-with-condition' element={<SearchPlateWithCondition />}></Route>
          <Route path='center/search-suspect-person' element={<SearchSuspectPerson />}></Route>
          <Route path='center/manage-user' element={<ManageUser />}></Route>
          <Route path='center/special-plate' element={<SpecialPlate />}></Route>
          <Route path='center/suspect-people' element={<SuspectPeople />}></Route>
          <Route path='center/manage-user/add-edit-user' element={<AddEditUser />}></Route>
          <Route path='center/chart/log' element={<ManageLog />}></Route>
          <Route path='center/chart/graph' element={<UsageStatisticsGraph />}></Route>
          <Route path='center/chart/end-user' element={<EndUser />}></Route>
          <Route path='center/chart/camera-installation-points' element={<CameraInstallationPoints />}></Route>
          <Route path='center/chart/camera-status' element={<CameraStatus />}></Route>
        </Route>
      </Routes> */}
      <Routes>
        <Route
          path="/*"
          element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
          }
        >
          <Route path='center/real-time-monitor' element={<RealTimeMonitor />} />
          <Route path='center/search-plate-with-condition' element={<SearchPlateWithCondition />}></Route>
          <Route path='center/manage-user' element={<ManageUser />}></Route>
          <Route path='center/special-plate' element={<SpecialPlateScreen />}></Route>
          <Route path='center/manage-user/add-edit-user' element={<AddEditUser />}></Route>
          {/* <Route path='center/user-info' element={<UserInfo />}></Route> */}
          <Route path='center/setting' element={<Setting />}></Route>
          <Route path='center/manage-checkpoint-cameras' element={<ManageCheckpointCameras />}></Route>
          {/* <Route path='center/chart/log' element={<ManageLog />}></Route>
          <Route path='center/chart/graph' element={<UsageStatisticsGraph />}></Route>
          <Route path='center/chart/end-user' element={<EndUser />}></Route>
          <Route path='center/chart/camera-installation-points' element={<CameraInstallationPoints />}></Route>
          <Route path='center/chart/camera-status' element={<CameraStatus />}></Route> */}
        </Route>
      </Routes>
      {/* <Routes>
        <Route
          path="/*"
          element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
          }
        >
          <Route path='center/real-time-monitor' element={<RealTimeMonitor />} />
          <Route path='center/search-plate-before-after' element={<SearchPlateBeforeAfter />}></Route>
          <Route path='center/search-plate-with-condition' element={<SearchPlateWithCondition />}></Route>
          <Route path='center/search-suspect-person' element={<SearchSuspectPerson />}></Route>
          <Route path='center/manage-user' element={<ManageUser />}></Route>
          <Route path='center/special-plate' element={<SpecialPlate />}></Route>
          <Route path='center/suspect-people' element={<SuspectPeople />}></Route>
          <Route path='center/manage-user/add-edit-user' element={<AddEditUser />}></Route>
          <Route path='center/chart/log' element={<ManageLog />}></Route>
          <Route path='center/chart/graph' element={<UsageStatisticsGraph />}></Route>
          <Route path='center/chart/end-user' element={<EndUser />}></Route>
          <Route path='center/chart/camera-installation-points' element={<CameraInstallationPoints />}></Route>
          <Route path='center/chart/camera-status' element={<CameraStatus />}></Route>
        </Route>
      </Routes> */}
    </div>
  )
}

export default App
