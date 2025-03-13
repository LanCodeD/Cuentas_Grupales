// Importa las funciones necesarias de Firebase
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  browserLocalPersistence, 
  initializeAuth, 
  inMemoryPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 📌 Necesario para móvil


const firebaseConfig = {
  apiKey: "AIzaSyBoxRQYgzw9qwwpyiaP_3K5viLIxuthCNI",
  authDomain: "cuentasgrupal09.firebaseapp.com",
  projectId: "cuentasgrupal09",
  storageBucket: "cuentasgrupal09.firebasestorage.app",
  messagingSenderId: "127119811227",
  appId: "1:127119811227:web:84d6f692927b29b14edc3e",
  measurementId: "G-68WG7VXBG6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Detectar si es React Native o Web
const isReactNative = typeof navigator === "undefined" || navigator.product === "ReactNative";

// Configurar autenticación
let auth: Auth;

if (isReactNative) {
  // 🚀 En móvil usamos `inMemoryPersistence` porque Firebase 11 eliminó soporte nativo
  auth = initializeAuth(app, { persistence: inMemoryPersistence });
} else {
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence); // Web usa LocalStorage
}

const db = getFirestore(app);

export { app, auth, db };

/*@react-native-async-storage/async-storage: Se usa para que Firebase Auth recuerde la sesión.
getReactNativePersistence(AsyncStorage): Esto indica que la sesión se guardará en AsyncStorage, 
evitando que los usuarios tengan que iniciar sesión cada vez que abran la app.
getFirestore(app): Se exporta Firestore (db) para facilitar su uso en otras partes de la app.
*/




