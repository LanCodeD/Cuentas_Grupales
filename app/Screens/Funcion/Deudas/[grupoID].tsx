import { useLocalSearchParams } from "expo-router";
import { View, ScrollView, StyleSheet,Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { pagarDeuda } from "@/firebase/service/gastos";
import { auth } from "@/firebase/config"; // Importar autenticación
import { obtenerNombreUsuario } from "@/firebase/authFirebase";

export default function Deudas() {
  const { grupoID } = useLocalSearchParams();
  const [deudas, setDeudas] = useState<
    {
      id: string;
      deudor: string;
      acreedor: string;
      monto: number;
      descripcion: string;
    }[]
  >([]);

  const [nombreGrupo, setNombreGrupo] = useState("");
  const [usuarioActual, setUsuarioActual] = useState<string | null>(null);

  useEffect(() => {
    const cargarNombreUsuario = async () => {
      const nombre = await obtenerNombreUsuario();
      setUsuarioActual(nombre);
      console.log("👤 Nombre del usuario autenticado:", nombre);
    };

    cargarNombreUsuario();
  }, []);

  // Llamar esta función en useEffect para que se ejecute al cargar la pantalla
  useEffect(() => {
    obtenerNombreGrupo();
    obtenerDeudas();
  }, [grupoID]);

  const obtenerNombreGrupo = async () => {
    try {
      const grupoRef = doc(db, `grupos/${grupoID}`);
      const grupoSnap = await getDoc(grupoRef);

      if (grupoSnap.exists()) {
        setNombreGrupo(grupoSnap.data().nombre); // Aseguramos que tenga la propiedad 'nombre'
      } else {
        console.warn("⚠️ No se encontró el grupo");
      }
    } catch (error) {
      console.error("❌ Error al obtener el nombre del grupo:", error);
    }
  };

  // 🔹 Función para obtener las deudas del grupo desde Firebase
  const obtenerDeudas = async () => {
    try {
      const deudasRef = collection(db, `grupos/${grupoID}/deudas`);
      const deudasSnap = await getDocs(deudasRef);

      const gastosRef = collection(db, `grupos/${grupoID}/gastos`);
      const gastosSnap = await getDocs(gastosRef);

      // 🔹 Mapeamos los gastos con su información completa
      const gastos = gastosSnap.docs.map((doc) => {
        const data = doc.data() as {
          pagadoPor: string;
          divididoEntre: string[];
          monto: number;
          descripcion: string;
        };
        return { id: doc.id, ...data };
      });

      // 🔹 Ahora obtenemos las deudas y buscamos la descripción correcta
      const deudas = deudasSnap.docs.map((docDeuda) => {
        const deudaData = docDeuda.data() as {
          deudor: string;
          acreedor: string;
          monto: number;
        };

        // 🔹 Buscamos un gasto que coincida en pagadoPor, divididoEntre y monto
        const gastoRelacionado = gastos.find(
          (gasto) =>
            gasto.pagadoPor === deudaData.acreedor &&
            gasto.divididoEntre.includes(deudaData.deudor) &&
            gasto.monto / gasto.divididoEntre.length === deudaData.monto // 🔥 Verificación extra con el monto
        );

        return {
          id: docDeuda.id,
          deudor: deudaData.deudor,
          acreedor: deudaData.acreedor,
          monto: deudaData.monto,
          descripcion: gastoRelacionado
            ? gastoRelacionado.descripcion
            : "un gasto",
        };
      });

      setDeudas(deudas);
    } catch (error) {
      console.error("❌ Error obteniendo deudas:", error);
    }
  };

  const handlePagarDeuda = async (item: any) => {
    try {
        await pagarDeuda(grupoID, item.deudor, item.acreedor, item.monto);
        Alert.alert("Pago realizado", "Has pagado la deuda correctamente.");
        console.log("El monto es:",item.monto)
        console.log("pagardeuda",pagarDeuda)
        
        obtenerDeudas(); // 🔄 Refrescar la lista para que la UI cambie
    } catch (error) {
        console.error("❌ Error al pagar la deuda:", error);
    }
};


return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Deudas del grupo {nombreGrupo}</Text>

      <FlatList
        data={deudas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const esDeudor = usuarioActual
            ? usuarioActual.toLowerCase().trim() === item.deudor.toLowerCase().trim()
            : false;
          console.log("✅ ¿Usuario es deudor?", esDeudor);

          return (
            <View style={styles.card}>
              <Text style={styles.texto}>
                {item.deudor} debe <Text style={styles.monto}>${item.monto}</Text> a {item.acreedor} 
                por: <Text style={styles.descripcion}>{item.descripcion}</Text>
              </Text>

              {/* 🔹 Mostrar botón o estado según el usuario actual */}
              {item.monto === 0 ? (
                <Text style={styles.pagado}>✅ Deuda pagada</Text>
              ) : usuarioActual === item.deudor ? (
                <TouchableOpacity onPress={() => handlePagarDeuda(item)} style={styles.botonPagar}>
                  <Text style={styles.textoBoton}>Pagar deuda</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.pendiente}>⏳ En espera...</Text>
              )}
            </View>
          );
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8F9FA",
    flexGrow: 1, // Para que ScrollView expanda su contenido
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  texto: {
    fontSize: 16,
  },
  monto: {
    fontWeight: "bold",
    color: "#007BFF",
  },
  descripcion: {
    fontStyle: "italic",
    color: "#555",
  },
  pagado: {
    color: "green",
    fontWeight: "bold",
    marginTop: 5,
  },
  pendiente: {
    color: "orange",
    fontWeight: "bold",
    marginTop: 5,
  },
  botonPagar: {
    backgroundColor: "#007BFF",
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    alignItems: "center",
  },
  textoBoton: {
    color: "white",
    fontWeight: "bold",
  },
});