import { db } from "../config"; // Asegúrate de que 'config.js' tiene la inicialización de Firebase
import { collection, query, where, doc, setDoc, getDocs, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";


// 📌 **Función para registrar un usuario en Firestore**
export const registrarUsuario = async (uid, nombre, email) => {
    try {
      const usuarioRef = doc(db, "usuarios", uid);
      await setDoc(usuarioRef, {
        nombre,
        email,
        uid,
        grupos: []
      });
      console.log("✅ Usuario registrado en Firestore:", uid);
    } catch (error) {
      console.error("❌ Error al registrar usuario:", error);
    }
  };

// 📌 **Función para crear un grupo**
export const crearGrupo = async (nombreGrupo, uidCreador) => {
  try {
    const grupoRef = doc(collection(db, "grupos")); // Genera un ID único

    await setDoc(grupoRef, {
      nombre: nombreGrupo,
      miembros: [uidCreador],
      creador: uidCreador,
      fechaCreacion: serverTimestamp(),
      codigoInvitacion: Math.random().toString(36).substring(2, 8).toUpperCase()
    });

    // Agregar el grupo al usuario creador
    const usuarioRef = doc(db, "usuarios", uidCreador);
    await updateDoc(usuarioRef, {
      grupos: arrayUnion(grupoRef.id)
    });

    console.log("Grupo creado con éxito:", grupoRef.id);
  } catch (error) {
    console.error("Error al crear el grupo:", error);
  }
};

/* // 📌 **Función para unirse a un grupo con un código de invitación**
export const unirseAGrupo = async (uid, codigo) => {
  try {
    const gruposRef = collection(db, "grupos");
    const grupoDoc = await getDoc(doc(gruposRef, codigo));

    if (grupoDoc.exists()) {
      const grupoID = grupoDoc.id;

      // Agregar el usuario a la lista de miembros
      await updateDoc(doc(db, "grupos", grupoID), {
        miembros: arrayUnion(uid)
      });

      // Agregar el grupo a la lista de grupos del usuario
      await updateDoc(doc(db, "usuarios", uid), {
        grupos: arrayUnion(grupoID)
      });

      console.log("Usuario agregado al grupo:", grupoID);
    } else {
      console.log("Código de invitación no válido");
    }
  } catch (error) {
    console.error("Error al unirse al grupo:", error);
  }
}; */

export const unirseAGrupo = async (uid, codigo) => {
  try {
    const gruposRef = collection(db, "grupos");

    // Buscar el grupo con el código de invitación
    const q = query(gruposRef, where("codigoInvitacion", "==", codigo));
    const querySnapshot = await getDocs(q);

    console.log("Esto trae query:", querySnapshot.docs.map(doc => doc.data()));

    if (!querySnapshot.empty) {
      // Obtener el primer documento que coincida
      const grupoDoc = querySnapshot.docs[0];
      const grupoID = grupoDoc.id;

      // Agregar el usuario a la lista de miembros
      await updateDoc(doc(db, "grupos", grupoID), {
        miembros: arrayUnion(uid),
      });

      // Agregar el grupo a la lista de grupos del usuario
      await updateDoc(doc(db, "usuarios", uid), {
        grupos: arrayUnion(grupoID),
      });

      console.log("Usuario agregado al grupo:", grupoID);
    } else {
      console.log("Código de invitación no válido");
    }
  } catch (error) {
    console.error("Error al unirse al grupo:", error);
  }
};
