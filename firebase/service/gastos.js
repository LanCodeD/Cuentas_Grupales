import { db } from "../config";
import { collection,getDocs,getDoc,query, doc, setDoc, updateDoc, where, addDoc, serverTimestamp } from "firebase/firestore";
import { obtenerNombrePorUID } from "../authFirebase"; // Importamos la función

// 📌 **Función para añadir un gasto a un grupo**
export const agregarGasto = async (grupoID, descripcion, monto, pagadoPorUID, divididoEntreUIDs) => {
    try {
        const grupoRef = doc(db, `grupos/${grupoID}`);
        const grupoDoc = await getDoc(grupoRef);

        if (!grupoDoc.exists()) {
            console.error("❌ El grupo no existe.");
            return;
        }
        const creadorUID = grupoDoc.data().creador; // UID del creador

        // 🔹 Asegurar que el creador del grupo está en 'divididoEntreUIDs'
        if (!divididoEntreUIDs.includes(creadorUID)) {
            divididoEntreUIDs.push(creadorUID);
        }
        console.log("📌 Miembros actualizados (incluyendo creador si faltaba):", divididoEntreUIDs);

        const gastosRef = collection(db, `grupos/${grupoID}/gastos`);
        const deudasRef = collection(db, `grupos/${grupoID}/deudas`);
        const historialRef = collection(db, `grupos/${grupoID}/historialPagos`);

        // 🔹 Convertir UID a nombres antes de guardar en Firestore
        const pagadoPor = await obtenerNombrePorUID(pagadoPorUID);
        const divididoEntre = await Promise.all(divididoEntreUIDs.map(uid => obtenerNombrePorUID(uid)));

        console.log("📌 Pagado por:", pagadoPor);
        console.log("📌 Dividido entre:", divididoEntre);

        // **1️ Agregar el gasto**
        const gastoDoc = await addDoc(gastosRef, {
            descripcion,
            monto,
            pagadoPor,
            fecha: serverTimestamp(),
            divididoEntre
        });

        console.log("✅ Gasto agregado:", gastoDoc.id);

        // **2️ Registrar cada deuda**
        const montoPorPersona = monto / divididoEntre.length;
        console.log("💰 Monto por persona:", montoPorPersona);

        for (const deudor of divididoEntre) {
            if (deudor !== pagadoPor) {
                const deudaDoc = await addDoc(deudasRef, {
                    deudor,
                    acreedor: pagadoPor,
                    monto: montoPorPersona
                });
                console.log("✅ Deuda registrada:", deudaDoc.id, "Deudor:", deudor);
            }
        }
        // **3️ Agregar al historial de pagos**
        for (const deudor of divididoEntre) {
            if (deudor !== pagadoPor) {
                const historialDoc = await addDoc(historialRef, {
                    pagador: pagadoPor,
                    receptor: deudor,
                    monto: montoPorPersona,
                    fecha: serverTimestamp(),
                    tipo: "Gasto" // 🔥 Identificador para mostrarlo correctamente
                });
                console.log("✅ Historial actualizado:", historialDoc.id);
            }
        }

    } catch (error) {
        console.error("❌ Error al agregar gasto:", error);
    }
};


export const pagarDeuda = async (grupoID, deudor, acreedor, monto) => {
    try {
        const deudasRef = collection(db, `grupos/${grupoID}/deudas`);
        const historialRef = collection(db, `grupos/${grupoID}/historialPagos`);

        // Buscar la deuda específica
        const q = query(deudasRef, where("deudor", "==", deudor), where("acreedor", "==", acreedor), where("monto", "==", monto));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (docDeuda) => {
                const deudaRef = doc(db, `grupos/${grupoID}/deudas`, docDeuda.id);

                // Restar el monto en lugar de eliminar la deuda
                await updateDoc(deudaRef, { monto: 0 });

                console.log(`✅ Deuda de ${deudor} a ${acreedor} actualizada a 0`);
            });

            // Agregar al historial que la deuda se pagó
            await addDoc(historialRef, {
                pagador: deudor,
                receptor: acreedor,
                monto,
                fecha: serverTimestamp(),
                tipo: "Pago de deuda" // 🔹 Identificador para el historial
            });

            console.log("✅ Historial de pago registrado");
        } else {
            console.log("❌ No se encontró la deuda");
        }
    } catch (error) {
        console.error("❌ Error al pagar deuda:", error);
    }
};




