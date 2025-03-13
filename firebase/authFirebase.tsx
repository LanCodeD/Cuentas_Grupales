import { auth,db } from "./config"; // Asegúrate de importar desde donde tienes tu configuración de Firebase
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { registrarUsuario } from "./service/firestore";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

// Función para registrar usuario en Authentication y Firestore
export const registerUser = async (nombre: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Llamamos a la función que ya creaste en `firestore.js`
    await registrarUsuario(user.uid, nombre, email);

    return user;
  } catch (error) {
    throw error;
  }
};

// Función para iniciar sesión
export const loginUser = async (email:string, password:string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Función para cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

//Para recuperar información adicional del usuario en la base de datos
export const getUserData = async (uid: string) => {
  try {
    const userRef = doc(db, "usuarios", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data(); // Devuelve los datos del usuario en Firestore
    } else {
      console.log("No se encontró el usuario en Firestore");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return null;
  }
};

export const obtenerGruposDelUsuario = async (uid: string) => {
  try {
    const gruposRef = collection(db, "grupos");
    const q = query(gruposRef, where("miembros", "array-contains", uid));
    const querySnapshot = await getDocs(q);

    const grupos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nombre: doc.data().nombre || "Grupo sin nombre", // Asegurar que tenga nombre
      codigoInvitacion: doc.data().codigoInvitacion,
      ...doc.data(),
    }));

    return grupos;
  } catch (error) {
    console.error("Error al obtener los grupos del usuario:", error);
    return [];
  }
};

export const obtenerNombrePorUID = async (uid: string): Promise<string> => {
  if (!uid) return "Usuario desconocido";
  try {
      const usuarioRef = doc(db, "usuarios", uid);
      const usuarioSnap = await getDoc(usuarioRef);

      if (usuarioSnap.exists()) {
          return usuarioSnap.data().nombre; // Retorna el nombre del usuario
      } else {
          console.warn(`⚠️ Usuario con UID ${uid} no encontrado`);
          return "Usuario desconocido";
      }
  } catch (error) {
      console.error("❌ Error obteniendo nombre por UID:", error);
      return "Error al obtener usuario";
  }
};

export const obtenerUIDPorNombre = async (nombreUsuario: string) => {
  if (!nombreUsuario) return null;
  try {
      const q = query(collection(db, "usuarios"), where("nombre", "==", nombreUsuario));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
          return querySnapshot.docs[0].id; // Retorna el UID del primer resultado
      } else {
          console.warn(`⚠️ Usuario con nombre "${nombreUsuario}" no encontrado`);
          return null;
      }
  } catch (error) {
      console.error("❌ Error obteniendo UID por nombre:", error);
      return null;
  }
};

export const obtenerNombreUsuario = async () => {
  try {
    const usuarioUID = auth.currentUser?.uid; // Obtenemos el UID del usuario autenticado
    if (!usuarioUID) return null;

    const usuarioRef = doc(db, "usuarios", usuarioUID);
    const usuarioSnap = await getDoc(usuarioRef);

    if (usuarioSnap.exists()) {
      return usuarioSnap.data().nombre; // Retornamos el nombre del usuario
    } else {
      console.warn("⚠️ Usuario no encontrado en la base de datos");
      return null;
    }
  } catch (error) {
    console.error("❌ Error obteniendo el nombre del usuario:", error);
    return null;
  }
};